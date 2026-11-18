import * as crypto from 'crypto';
import {
  CsvMappingConfig,
  ImportRowError,
  IStatementParser,
  NormalizedImportTransaction,
  ParseResult,
} from './statement-parser.interface';
import { isValidDate, parseStrictAmount } from './parser-utils';

export class CsvStatementParser implements IStatementParser {
  readonly supportedFormat = 'CSV' as const;

  // Dictionnaire de normalisation basique des commerçants pour le P1
  private static readonly KNOWN_MERCHANTS: Array<{ pattern: RegExp; name: string; category?: string }> = [
    { pattern: /\bMONOPRIX\b/i, name: 'Monoprix', category: 'ALIMENTATION' },
    { pattern: /\bCARREFOUR\b/i, name: 'Carrefour', category: 'ALIMENTATION' },
    { pattern: /\bAUCHAN\b/i, name: 'Auchan', category: 'ALIMENTATION' },
    { pattern: /\bLIDL\b/i, name: 'Lidl', category: 'ALIMENTATION' },
    { pattern: /\bEDF\b/i, name: 'EDF', category: 'ENERGIE' },
    { pattern: /\bENGIE\b/i, name: 'Engie', category: 'ENERGIE' },
    { pattern: /\bTOTAL\b/i, name: 'TotalEnergies', category: 'ENERGIE' },
    { pattern: /\bSPOTIFY\b/i, name: 'Spotify', category: 'ABONNEMENT' },
    { pattern: /\bNETFLIX\b/i, name: 'Netflix', category: 'ABONNEMENT' },
    { pattern: /\bAMAZON\b/i, name: 'Amazon', category: 'SHOPPING' },
    { pattern: /\bSNCF\b/i, name: 'SNCF', category: 'TRANSPORT' },
    { pattern: /\bSALAIRE\b/i, name: 'Salaire', category: 'REVENU' },
    { pattern: /\bPHARMACIE\b/i, name: 'Pharmacie', category: 'SANTE' },
  ];

  parse(content: string, config?: CsvMappingConfig): ParseResult {
    const rawLines = content.split(/\r?\n/);
    const transactions: NormalizedImportTransaction[] = [];
    const errors: ImportRowError[] = [];

    // Détection du délimiteur si non spécifié
    const delimiter = config?.delimiter ?? this.detectDelimiter(rawLines);
    const hasHeaderConfig = config?.hasHeader;

    // Détermination de l'index des colonnes
    let dateCol = typeof config?.dateColumn === 'number' ? config.dateColumn : -1;
    let descCol = typeof config?.descriptionColumn === 'number' ? config.descriptionColumn : -1;
    let amountCol = typeof config?.amountColumn === 'number' ? config.amountColumn : -1;

    let startIndex = 0;
    const firstLine = rawLines[0]?.trim();

    // Analyse de l'en-tête et détection sans devinette ni perte silencieuse
    if (firstLine && firstLine.length > 0) {
      const headerCols = this.parseCsvLine(firstLine, delimiter).map((col) => col.toLowerCase().trim());

      let stringHeadersMatched = false;
      if (typeof config?.dateColumn === 'string') {
        dateCol = headerCols.indexOf(config.dateColumn.toLowerCase().trim());
      }
      if (typeof config?.descriptionColumn === 'string') {
        descCol = headerCols.indexOf(config.descriptionColumn.toLowerCase().trim());
      }
      if (typeof config?.amountColumn === 'string') {
        amountCol = headerCols.indexOf(config.amountColumn.toLowerCase().trim());
      }

      if (
        typeof config?.dateColumn === 'string' &&
        typeof config?.descriptionColumn === 'string' &&
        typeof config?.amountColumn === 'string' &&
        dateCol !== -1 &&
        descCol !== -1 &&
        amountCol !== -1
      ) {
        stringHeadersMatched = true;
      }

      const detected = this.detectColumnsFromHeader(headerCols);
      if (detected) {
        if (dateCol === -1) dateCol = detected.dateCol;
        if (descCol === -1) descCol = detected.descCol;
        if (amountCol === -1) amountCol = detected.amountCol;
      }

      // Un en-tête n'est formellement reconnu par son texte QUE si :
      // 1. Les mots-clés textuels ont matché (date, libelle, montant)
      // 2. Ou les noms de colonnes explicitement fournis ont tous été trouvés
      // (Attention : un mapping par index numérique seul ne prouve PAS que la ligne 1 est un en-tête textuel !)
      const hasRecognizedHeaderText = detected !== null || stringHeadersMatched;

      // Vérifier si la première ligne est en réalité une ligne de transaction valide
      const candidateCols = this.parseCsvLine(firstLine, delimiter);
      const testDateCol = dateCol !== -1 ? dateCol : 0;
      const testAmountCol = amountCol !== -1 ? amountCol : 2;
      const looksLikeData = this.looksLikeValidTransaction(candidateCols, testDateCol, testAmountCol);

      if (hasHeaderConfig === false) {
        // Pas d'en-tête explicitement déclaré
        startIndex = 0;
      } else if (hasRecognizedHeaderText) {
        // En-tête textuel formellement reconnu
        startIndex = 1;
      } else if (looksLikeData) {
        // Pas d'en-tête reconnu, mais la ligne 1 est une transaction valide :
        // Elle ne doit pas être sautée (aucune perte silencieuse même avec mapping par index)
        startIndex = 0;
      } else {
        // Ligne 1 ni reconnue en en-tête ni en transaction valide :
        // C'est un en-tête non reconnu (ex: date;libelle;debit;credit).
        // Bloquant (Revue Victor Point 1) : arrêt immédiat de l'analyse, AUCUNE colonne devinée.
        errors.push({
          lineNumber: 1,
          rawContent: firstLine,
          field: 'format',
          reason: `En-tête CSV non reconnu : colonnes date, libellé ou montant introuvables. Analyse interrompue pour éviter toute importation corrompue.`,
        });

        const fileFingerprint = crypto
          .createHash('sha256')
          .update(content.trim())
          .digest('hex');

        return {
          totalRows: 1,
          validCount: 0,
          errorCount: 1,
          transactions: [],
          errors,
          fileFingerprint,
        };
      }
    }

    if (dateCol === -1) dateCol = 0;
    if (descCol === -1) descCol = 1;
    if (amountCol === -1) amountCol = 2;

    // Suivi des occurrences pour distinguer deux transactions jumelles du même relevé
    // Clé: `date|amount|rawDescription` -> compteur
    const occurrenceTracker = new Map<string, number>();

    for (let i = startIndex; i < rawLines.length; i++) {
      const lineNumber = i + 1; // 1-based pour l'utilisateur
      const line = rawLines[i].trim();

      // Ignorer les lignes totalement vides
      if (line.length === 0) {
        continue;
      }

      const columns = this.parseCsvLine(line, delimiter);

      // Vérifier le nombre de colonnes minimum
      const minCol = Math.max(dateCol, descCol, amountCol);
      if (columns.length <= minCol) {
        errors.push({
          lineNumber,
          rawContent: line,
          field: 'format',
          reason: `Nombre de colonnes insuffisant (${columns.length} trouvée(s), attendu au moins ${minCol + 1}) avec le délimiteur '${delimiter}'`,
        });
        continue;
      }

      const rawDate = columns[dateCol]?.trim() ?? '';
      const rawDesc = columns[descCol]?.trim() ?? '';
      const rawAmount = columns[amountCol]?.trim() ?? '';

      // 1. Validation stricte de la date
      const normalizedDate = this.normalizeDate(rawDate, config?.dateFormat);
      if (!normalizedDate) {
        errors.push({
          lineNumber,
          rawContent: line,
          field: 'date',
          reason: `Date invalide ou format non reconnu: "${rawDate}"`,
        });
        continue;
      }

      // 2. Validation de la description
      if (rawDesc.length === 0) {
        errors.push({
          lineNumber,
          rawContent: line,
          field: 'description',
          reason: 'Libellé de transaction manquant ou vide',
        });
        continue;
      }

      // 3. Validation stricte du montant (rejet des caractères parasites, >2 décimales, etc.)
      const normalizedAmount = this.normalizeAmount(rawAmount);
      if (normalizedAmount === null || isNaN(normalizedAmount)) {
        errors.push({
          lineNumber,
          rawContent: line,
          field: 'amount',
          reason: `Montant numérique invalide: "${rawAmount}"`,
        });
        continue;
      }

      // 4. Calcul de l'occurrence pour distinguer les transactions légitimes jumelles
      const rawKey = `${normalizedDate}|${normalizedAmount}|${rawDesc.toUpperCase()}`;
      const occurrence = (occurrenceTracker.get(rawKey) ?? 0) + 1;
      occurrenceTracker.set(rawKey, occurrence);

      // 5. Calcul de l'empreinte déterministe de la transaction
      const fingerprint = this.computeTransactionFingerprint(
        normalizedDate,
        rawDesc,
        normalizedAmount,
        occurrence,
      );

      // 6. Normalisation du commerçant (P1)
      const { cleanedDescription, category } = this.cleanMerchant(rawDesc);

      transactions.push({
        lineNumber,
        date: normalizedDate,
        rawDescription: rawDesc,
        cleanedDescription,
        category,
        amount: normalizedAmount,
        currency: config?.currency ?? 'EUR',
        fingerprint,
      });
    }

    // Empreinte globale du fichier
    const fileFingerprint = crypto
      .createHash('sha256')
      .update(content.trim())
      .digest('hex');

    return {
      totalRows: transactions.length + errors.length,
      validCount: transactions.length,
      errorCount: errors.length,
      transactions,
      errors,
      fileFingerprint,
    };
  }

  /**
   * Parse une ligne CSV en gérant les guillemets et les échappements
   */
  private parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  /**
   * Auto-détection du délimiteur (;, ,, \t, |)
   */
  private detectDelimiter(lines: string[]): string {
    const candidates = [';', ',', '\t', '|'];
    const counts = new Map<string, number>();

    const sample = lines.slice(0, 5).join('\n');
    for (const d of candidates) {
      const matches = sample.split(d).length - 1;
      counts.set(d, matches);
    }

    let best = ';';
    let max = -1;
    for (const [delim, count] of counts.entries()) {
      if (count > max) {
        max = count;
        best = delim;
      }
    }
    return best;
  }

  /**
   * Détecte les index des colonnes depuis les libellés d'en-tête.
   * Exclut formellement 'solde', 'balance' et 'valeur' pour éviter de confondre
   * une colonne de solde avec le montant du mouvement.
   */
  private detectColumnsFromHeader(headerCols: string[]): {
    dateCol: number;
    descCol: number;
    amountCol: number;
  } | null {
    let dateCol = -1;
    let descCol = -1;
    let amountCol = -1;

    for (let i = 0; i < headerCols.length; i++) {
      const col = headerCols[i];
      if (/date|jour/i.test(col) && dateCol === -1) {
        dateCol = i;
      } else if (/libell[eé]|desc|label|nom|motif/i.test(col) && descCol === -1) {
        descCol = i;
      } else if (
        /(montant|amount)/i.test(col) &&
        !/solde|balance|valeur/i.test(col) &&
        amountCol === -1
      ) {
        amountCol = i;
      }
    }

    if (dateCol !== -1 && descCol !== -1 && amountCol !== -1) {
      return { dateCol, descCol, amountCol };
    }
    return null;
  }

  /**
   * Vérifie si une ligne ressemble à une transaction valide (date valide + montant valide)
   */
  private looksLikeValidTransaction(
    cols: string[],
    dateCol = 0,
    amountCol = 2,
  ): boolean {
    if (cols.length < 2) return false;

    // 1. Tester la colonne date indiquée
    const d = this.normalizeDate(cols[dateCol]?.trim() ?? '');
    if (d) {
      if (amountCol < cols.length && this.normalizeAmount(cols[amountCol]?.trim() ?? '') !== null) {
        return true;
      }
      for (let i = 0; i < cols.length; i++) {
        if (i !== dateCol && this.normalizeAmount(cols[i]?.trim() ?? '') !== null) {
          return true;
        }
      }
    }

    // 2. Si non concluant, tester si col 0 est date
    const d0 = this.normalizeDate(cols[0]?.trim() ?? '');
    if (d0) {
      for (let i = 1; i < cols.length; i++) {
        if (this.normalizeAmount(cols[i]?.trim() ?? '') !== null) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Normalisation de date vers format ISO 'YYYY-MM-DD'
   */
  private normalizeDate(dateStr: string, forcedFormat?: string): string | null {
    const cleaned = dateStr.trim();
    if (!cleaned) return null;

    // Cas 1: YYYY-MM-DD ou YYYY/MM/DD
    const isoMatch = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10);
      const day = parseInt(isoMatch[3], 10);
      if (isValidDate(year, month, day)) {
        return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }

    // Cas 2: DD/MM/YYYY ou DD-MM-YYYY
    const frMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (frMatch) {
      const day = parseInt(frMatch[1], 10);
      const month = parseInt(frMatch[2], 10);
      const year = parseInt(frMatch[3], 10);
      if (isValidDate(year, month, day)) {
        return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }

    return null;
  }

  /**
   * Normalisation de montant vers un nombre décimal en euros
   */
  private normalizeAmount(amountStr: string): number | null {
    return parseStrictAmount(amountStr);
  }

  /**
   * Calcule une empreinte déterministe pour une transaction
   */
  private computeTransactionFingerprint(
    date: string,
    rawDesc: string,
    amount: number,
    occurrence: number,
  ): string {
    const raw = `${date}#${rawDesc.trim()}#${amount.toFixed(2)}#${occurrence}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
  }

  /**
   * Nettoie le libellé et identifie les commerçants connus (P1)
   */
  private cleanMerchant(rawDesc: string): { cleanedDescription: string; category?: string } {
    let cleaned = rawDesc.replace(/\s+/g, ' ').trim();
    let category: string | undefined = undefined;

    for (const merchant of CsvStatementParser.KNOWN_MERCHANTS) {
      if (merchant.pattern.test(rawDesc)) {
        cleaned = merchant.name;
        category = merchant.category;
        break;
      }
    }

    return { cleanedDescription: cleaned, category };
  }
}
