import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { prisma } from '@pathly/database';
import { CsvStatementParser } from './parsers/csv-statement-parser';
import { OfxStatementParser } from './parsers/ofx-statement-parser';
import {
  ImportCommitRequestDto,
  ImportPreviewRequestDto,
  StatementFormat,
} from './dto/import-preview.dto';
import {
  IStatementParser,
  ImportPreviewResult,
  ParseResult,
} from './parsers/statement-parser.interface';

export interface ImportCommitResult {
  accountId: string;
  totalRead: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  errorCount: number;
  errors: Array<{ lineNumber: number; reason: string }>;
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    rawDescription: string;
    cleanedDescription?: string | null;
  }>;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);
  private readonly csvParser: CsvStatementParser;
  private readonly ofxParser: OfxStatementParser;

  constructor() {
    this.csvParser = new CsvStatementParser();
    this.ofxParser = new OfxStatementParser();
  }

  /**
   * Prévisualisation autonome d'un relevé bancaire (sans persistance ni session)
   */
  preview(dto: ImportPreviewRequestDto): ImportPreviewResult {
    const parser = this.getParser(dto.format);

    return parser.parse(dto.rawContent, {
      delimiter: dto.mapping?.delimiter ?? dto.delimiter,
      hasHeader: dto.mapping?.hasHeader ?? dto.hasHeader,
      dateColumn: dto.mapping?.dateColumn,
      descriptionColumn: dto.mapping?.descriptionColumn,
      amountColumn: dto.mapping?.amountColumn,
      dateFormat: dto.mapping?.dateFormat ?? dto.dateFormat,
      currency: dto.mapping?.currency ?? dto.currency,
    });
  }

  /**
   * Enregistrement sécurisé des transactions dans le compte de l'utilisateur authentifié
   * Si aucun accountId n'est fourni, crée automatiquement la connexion et le compte d'import.
   */
  async commit(
    userId: string,
    dto: ImportCommitRequestDto,
  ): Promise<ImportCommitResult> {
    // 1. Analyse et prévisualisation du contenu
    const previewResult = this.preview(dto);

    if (previewResult.validCount === 0) {
      throw new BadRequestException({
        message: 'Aucune transaction valide n’a pu être extraite du fichier fourni.',
        errors: previewResult.errors,
      });
    }

    let targetAccountId = dto.accountId;
    let targetCurrency = dto.currency || 'EUR';

    // 2. Détermination du compte cible : existant vérifié ou auto-créé
    if (targetAccountId) {
      const account = await prisma.bankAccount.findFirst({
        where: {
          id: targetAccountId,
          connection: {
            userId,
          },
        },
        select: { id: true, currency: true },
      });

      if (!account) {
        throw new ForbiddenException(
          'Accès refusé : ce compte bancaire n’existe pas ou n’appartient pas à l’utilisateur authentifié.',
        );
      }
      targetCurrency = account.currency || targetCurrency;
    } else {
      // 2bis. Résolution ou auto-création de la connexion et du compte d'import
      let connection = await prisma.bankConnection.findFirst({
        where: {
          userId,
          institutionName: 'Relevé importé',
        },
        include: {
          accounts: true,
        },
      });

      if (!connection) {
        connection = await prisma.bankConnection.create({
          data: {
            userId,
            institutionName: 'Relevé importé',
            status: 'CONNECTED',
          },
          include: {
            accounts: true,
          },
        });
      }

      // Réutilisation du compte d'import existant pour éviter les doublons de comptes lors des réimports
      const targetName = dto.accountName || 'Compte relevé importé';
      const existingAccount =
        connection.accounts?.find((acc) => acc.name === targetName) ||
        connection.accounts?.[0];

      if (existingAccount) {
        targetAccountId = existingAccount.id;
        targetCurrency = existingAccount.currency || targetCurrency;
      } else {
        const initialBalance = dto.initialBalance !== undefined ? dto.initialBalance : 0;
        const newAccount = await prisma.bankAccount.create({
          data: {
            connectionId: connection.id,
            name: targetName,
            type: 'CHECKING',
            currentBalance: initialBalance,
            currency: targetCurrency,
          },
        });
        targetAccountId = newAccount.id;
      }
    }

    // 3. Gestion du réimport et politique anti-doublons
    const toImport: typeof previewResult.transactions = [];
    let skippedDuplicatesCount = 0;

    if (dto.skipDuplicates) {
      // Récupération des transactions existantes pour ce compte
      const existingTransactions = await prisma.bankTransaction.findMany({
        where: { accountId: targetAccountId },
        select: { date: true, amount: true, rawDescription: true },
      });

      // Suivi des occurrences en BDD pour distinguer les transactions jumelles légitimes
      const existingTracker = new Map<string, number>();
      for (const t of existingTransactions) {
        const isoDate = t.date.toISOString().slice(0, 10);
        const amt = Number(t.amount);
        const key = `${isoDate}|${amt}|${t.rawDescription.toUpperCase()}`;
        existingTracker.set(key, (existingTracker.get(key) ?? 0) + 1);
      }

      for (const t of previewResult.transactions) {
        const key = `${t.date}|${t.amount}|${t.rawDescription.toUpperCase()}`;
        const countInDb = existingTracker.get(key) ?? 0;
        if (countInDb > 0) {
          // Transaction déjà persistée en base -> on décrémente et on passe
          existingTracker.set(key, countInDb - 1);
          skippedDuplicatesCount++;
        } else {
          toImport.push(t);
        }
      }
    } else {
      toImport.push(...previewResult.transactions);
    }

    // 4. Persistance atomique des transactions valides
    const createdTransactions: ImportCommitResult['transactions'] = [];

    // Persistance séquentielle ou via transaction Prisma si supportée
    for (const t of toImport) {
      const created = await prisma.bankTransaction.create({
        data: {
          accountId: targetAccountId,
          date: new Date(t.date),
          amount: t.amount,
          currency: t.currency || targetCurrency,
          rawDescription: t.rawDescription,
          cleanedDescription: t.cleanedDescription,
          category: t.category,
        },
      });

      createdTransactions.push({
        id: created.id,
        date: created.date.toISOString().slice(0, 10),
        amount: Number(created.amount),
        currency: created.currency,
        rawDescription: created.rawDescription,
        cleanedDescription: created.cleanedDescription,
      });
    }

    this.logger.log(
      `Import terminé pour compte ${targetAccountId}: ${createdTransactions.length} importées, ${skippedDuplicatesCount} doublons ignorés, ${previewResult.errorCount} erreurs de ligne.`,
    );

    return {
      accountId: targetAccountId,
      totalRead: previewResult.totalRows,
      importedCount: createdTransactions.length,
      skippedDuplicatesCount,
      errorCount: previewResult.errorCount,
      errors: previewResult.errors.map((e) => ({
        lineNumber: e.lineNumber,
        reason: e.reason,
      })),
      transactions: createdTransactions,
    };
  }

  private getParser(format?: StatementFormat): IStatementParser {
    if (format === StatementFormat.OFX) {
      return this.ofxParser;
    }
    return this.csvParser;
  }
}
