import * as crypto from 'crypto';
import {
  CsvMappingConfig,
  ImportRowError,
  IStatementParser,
  NormalizedImportTransaction,
  ParseResult,
} from './statement-parser.interface';
import { isValidDate, parseStrictAmount } from './parser-utils';

export class OfxStatementParser implements IStatementParser {
  readonly supportedFormat = 'OFX' as const;

  /**
   * Parse le contenu d'un fichier OFX.
   * Note : lineNumber correspond au numéro d'index (1-based) du bloc de transaction <STMTTRN>.
   */
  parse(content: string, _config?: CsvMappingConfig): ParseResult {
    const transactions: NormalizedImportTransaction[] = [];
    const errors: ImportRowError[] = [];

    // Détection de la devise dans <CURDEF>
    const curdefMatch = content.match(/<CURDEF>([^<\r\n]+)/i);
    const currency = curdefMatch ? curdefMatch[1].trim().toUpperCase() : 'EUR';

    // Extraction de tous les blocs <STMTTRN>...</STMTTRN> ou non fermés <STMTTRN>...
    const trnBlocks = content.split(/<STMTTRN>/i).slice(1);

    if (trnBlocks.length === 0) {
      errors.push({
        lineNumber: 1,
        rawContent: content.substring(0, 100),
        field: 'format',
        reason: 'Aucune transaction <STMTTRN> trouvée dans le fichier OFX',
      });
    }

    const occurrenceTracker = new Map<string, number>();

    trnBlocks.forEach((block, index) => {
      const lineNumber = index + 1; // Index 1-based du bloc STMTTRN
      const cleanBlock = block.split(/<\/STMTTRN>/i)[0];

      // Extraction des champs DTPOSTED, TRNAMT, NAME / MEMO
      const dtMatch = cleanBlock.match(/<DTPOSTED>([^<\r\n]+)/i);
      const amtMatch = cleanBlock.match(/<TRNAMT>([^<\r\n]+)/i);
      const nameMatch = cleanBlock.match(/<NAME>([^<\r\n]+)/i);
      const memoMatch = cleanBlock.match(/<MEMO>([^<\r\n]+)/i);

      const rawDate = dtMatch ? dtMatch[1].trim() : '';
      const rawAmt = amtMatch ? amtMatch[1].trim() : '';
      const rawDesc = (nameMatch ? nameMatch[1].trim() : (memoMatch ? memoMatch[1].trim() : '')).trim();

      // 1. Validation stricte de la date (Format standard OFX: YYYYMMDD ou YYYYMMDDHHMMSS)
      // Empêche les dates impossibles comme le 31 février ou les années hors plage
      const normalizedDate = this.normalizeOfxDate(rawDate);
      if (!normalizedDate) {
        errors.push({
          lineNumber,
          rawContent: cleanBlock.trim().replace(/\s+/g, ' '),
          field: 'date',
          reason: `Date OFX invalide: "${rawDate}"`,
        });
        return;
      }

      // 2. Validation du libellé
      if (!rawDesc) {
        errors.push({
          lineNumber,
          rawContent: cleanBlock.trim().replace(/\s+/g, ' '),
          field: 'description',
          reason: 'Libellé de transaction manquant dans <NAME> et <MEMO>',
        });
        return;
      }

      // 3. Validation stricte du montant (aucun caractère parasite toléré, max 2 décimales)
      const normalizedAmount = parseStrictAmount(rawAmt);
      if (normalizedAmount === null || isNaN(normalizedAmount)) {
        errors.push({
          lineNumber,
          rawContent: cleanBlock.trim().replace(/\s+/g, ' '),
          field: 'amount',
          reason: `Montant OFX invalide: "${rawAmt}"`,
        });
        return;
      }

      // 4. Occurrence & Empreinte déterministe
      const rawKey = `${normalizedDate}|${normalizedAmount}|${rawDesc.toUpperCase()}`;
      const occurrence = (occurrenceTracker.get(rawKey) ?? 0) + 1;
      occurrenceTracker.set(rawKey, occurrence);

      const raw = `${normalizedDate}#${rawDesc}#${normalizedAmount.toFixed(2)}#${occurrence}`;
      const fingerprint = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);

      transactions.push({
        lineNumber,
        date: normalizedDate,
        rawDescription: rawDesc,
        cleanedDescription: rawDesc,
        amount: normalizedAmount,
        currency,
        fingerprint,
      });
    });

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
   * Normalise et valide strictement une date OFX.
   * Format attendu : YYYYMMDD (ou YYYYMMDDHHMMSS...).
   * Rejette les dates impossibles (ex: 20260231) ou années invalides (ex: 00011012).
   */
  private normalizeOfxDate(dateStr: string): string | null {
    const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!match) return null;

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    if (!isValidDate(year, month, day)) {
      return null;
    }

    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
}
