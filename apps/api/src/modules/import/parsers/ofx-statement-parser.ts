import * as crypto from 'crypto';
import {
  CsvMappingConfig,
  ImportRowError,
  IStatementParser,
  NormalizedImportTransaction,
  ParseResult,
} from './statement-parser.interface';

export class OfxStatementParser implements IStatementParser {
  readonly supportedFormat = 'OFX' as const;

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
      const lineNumber = index + 1;
      const cleanBlock = block.split(/<\/STMTTRN>/i)[0];

      // Extraction des champs DTPOSTED, TRNAMT, NAME / MEMO
      const dtMatch = cleanBlock.match(/<DTPOSTED>([^<\r\n]+)/i);
      const amtMatch = cleanBlock.match(/<TRNAMT>([^<\r\n]+)/i);
      const nameMatch = cleanBlock.match(/<NAME>([^<\r\n]+)/i);
      const memoMatch = cleanBlock.match(/<MEMO>([^<\r\n]+)/i);

      const rawDate = dtMatch ? dtMatch[1].trim() : '';
      const rawAmt = amtMatch ? amtMatch[1].trim() : '';
      const rawDesc = (nameMatch ? nameMatch[1].trim() : (memoMatch ? memoMatch[1].trim() : '')).trim();

      // 1. Validation de la date (Format standard OFX: YYYYMMDD ou YYYYMMDDHHMMSS)
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

      // 3. Validation du montant
      const normalizedAmount = parseFloat(rawAmt.replace(',', '.'));
      if (isNaN(normalizedAmount)) {
        errors.push({
          lineNumber,
          rawContent: cleanBlock.trim().replace(/\s+/g, ' '),
          field: 'amount',
          reason: `Montant OFX invalide: "${rawAmt}"`,
        });
        return;
      }

      const roundedAmount = Math.round(normalizedAmount * 100) / 100;

      // 4. Occurrence & Empreinte
      const rawKey = `${normalizedDate}|${roundedAmount}|${rawDesc.toUpperCase()}`;
      const occurrence = (occurrenceTracker.get(rawKey) ?? 0) + 1;
      occurrenceTracker.set(rawKey, occurrence);

      const raw = `${normalizedDate}#${rawDesc}#${roundedAmount.toFixed(2)}#${occurrence}`;
      const fingerprint = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);

      transactions.push({
        lineNumber,
        date: normalizedDate,
        rawDescription: rawDesc,
        cleanedDescription: rawDesc,
        amount: roundedAmount,
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

  private normalizeOfxDate(dateStr: string): string | null {
    // Ex: 20261012120000 -> 2026-10-12
    const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!match) return null;

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
}
