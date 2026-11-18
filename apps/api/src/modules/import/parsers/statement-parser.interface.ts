export interface NormalizedImportTransaction {
  lineNumber: number;
  date: string; // YYYY-MM-DD
  rawDescription: string;
  cleanedDescription?: string | null;
  amount: number; // Centimes ou décimal (négatif pour dépense, positif pour revenu)
  currency: string;
  category?: string | null;
  fingerprint: string; // Signature déterministe de la ligne (ex: hash sha256 date+description+montant+index)
}

export interface ImportRowError {
  lineNumber: number;
  rawContent: string;
  field?: 'date' | 'amount' | 'description' | 'format';
  reason: string;
}

export interface ParseResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  transactions: NormalizedImportTransaction[];
  errors: ImportRowError[];
  fileFingerprint: string;
}

export interface CsvMappingConfig {
  hasHeader?: boolean;
  delimiter?: ';' | ',' | '\t' | '|';
  dateColumn?: number | string; // index 0-based ou nom de colonne
  descriptionColumn?: number | string;
  amountColumn?: number | string;
  debitColumn?: number | string; // Si débit/crédit séparés
  creditColumn?: number | string;
  dateFormat?: string; // e.g. 'YYYY-MM-DD', 'DD/MM/YYYY'
  currency?: string;
}

export interface IStatementParser {
  readonly supportedFormat: 'CSV' | 'OFX';
  parse(content: string, config?: CsvMappingConfig): ParseResult;
}
