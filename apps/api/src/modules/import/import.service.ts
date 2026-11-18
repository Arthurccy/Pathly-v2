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
  skippedDuplicates: Array<{
    lineNumber: number;
    date: string;
    amount: number;
    rawDescription: string;
  }>;
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

  constructor(
    private readonly csvParser: CsvStatementParser = new CsvStatementParser(),
    private readonly ofxParser: OfxStatementParser = new OfxStatementParser(),
  ) {}

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
   * Enregistrement sécurisé des transactions dans le compte de l'utilisateur authentifié.
   * Si aucun accountId n'est fourni, réutilise le compte d'import existant ou l'auto-crée.
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
    const targetName = dto.accountName || 'Compte relevé importé';

    let existingConnection: any = null;
    let existingAccount: any = null;

    // 2. Résolution en LECTURE SEULE du compte cible (sans écriture anticipée en BDD)
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

      // Rejet si initialBalance est fourni alors que le compte existe déjà (Victor Amélioration 4)
      if (dto.initialBalance !== undefined) {
        throw new BadRequestException(
          'Le compte bancaire existe déjà : le paramètre initialBalance ne peut être renseigné que lors de la création d’un nouveau compte.',
        );
      }
    } else {
      existingConnection = await prisma.bankConnection.findFirst({
        where: {
          userId,
          institutionName: 'Relevé importé',
        },
        include: {
          accounts: true,
        },
      });

      // Réutilisation stricte du compte portant le MÊME nom (aucun repli sur accounts[0] - Victor Amélioration 3)
      existingAccount = existingConnection?.accounts?.find(
        (acc: any) => acc.name === targetName,
      );

      if (existingAccount) {
        targetAccountId = existingAccount.id;
        targetCurrency = existingAccount.currency || targetCurrency;

        // Rejet si initialBalance est fourni alors que le compte existe déjà
        if (dto.initialBalance !== undefined) {
          throw new BadRequestException(
            'Le compte bancaire d’import existe déjà : le paramètre initialBalance ne peut être renseigné que lors de la création d’un nouveau compte.',
          );
        }
      }
    }

    // 3. Contrôle de cohérence des devises AVANT toute écriture en BDD (Victor Amélioration 5)
    // Empêche la création d'un compte/connexion orphelin vide en cas d'erreur 400
    const mismatchedCurrency = previewResult.transactions.find(
      (t) => t.currency && t.currency !== targetCurrency,
    );
    if (mismatchedCurrency) {
      throw new BadRequestException(
        `Écart de devise détecté : le compte cible est en ${targetCurrency} mais le relevé contient des transactions en ${mismatchedCurrency.currency}. Aucune conversion implicite n'est autorisée.`,
      );
    }

    // 4. Écritures en BDD : création différée de la connexion et du compte si nécessaire
    if (!targetAccountId) {
      let connection = existingConnection;
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

    // 3. Gestion du réimport et politique anti-doublons
    const toImport: typeof previewResult.transactions = [];
    const skippedDuplicates: ImportCommitResult['skippedDuplicates'] = [];
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
          // Transaction déjà persistée en base -> décrémenter et marquer comme doublon ignoré
          existingTracker.set(key, countInDb - 1);
          skippedDuplicatesCount++;
          skippedDuplicates.push({
            lineNumber: t.lineNumber,
            date: t.date,
            amount: t.amount,
            rawDescription: t.rawDescription,
          });
        } else {
          toImport.push(t);
        }
      }
    } else {
      toImport.push(...previewResult.transactions);
    }

    // 4. Persistance des transactions valides
    // Note : La persistance tout-ou-rien via transaction globale prisma.$transaction est planifiée pour la S6
    const createdTransactions: ImportCommitResult['transactions'] = [];

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
      skippedDuplicates,
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
