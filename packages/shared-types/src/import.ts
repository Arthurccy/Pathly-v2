// ==========================================
// PATHLY V2 - CONTRAT IMPORT DE RELEVÉS (CSV / OFX) — S2
// Producteur : Rémy · Consommateurs : Loris (UI d'import), Victor (transactions)
// Référence : docs/architecture/CONTRAT_IMPORT_S2.md (branche feat/back-bank-statement-parser)
//             et docs/architecture/CONTRATS_SEANCE_2.md, section « Import CSV initial »
// ==========================================
//
// Conventions :
// - Montants : nombre décimal en euros (ex. -42.5), jamais en centimes.
// - Signe : négatif pour une dépense/débit, positif pour un revenu/crédit.
// - Date métier : 'YYYY-MM-DD'.
// - Une ligne invalide n'invalide pas le fichier : elle est listée dans `errors`.
//   Aucune ligne n'est abandonnée silencieusement.

export type StatementFormat = 'CSV' | 'OFX';

export type CsvDelimiter = ';' | ',' | '\t' | '|';

/** Mapping optionnel des colonnes d'un CSV. Index 0-based ou nom de colonne. */
export interface CsvMappingDto {
  hasHeader?: boolean;
  delimiter?: CsvDelimiter;
  dateColumn?: number | string;
  descriptionColumn?: number | string;
  amountColumn?: number | string;
  /** Format des dates du fichier, ex. 'YYYY-MM-DD' ou 'DD/MM/YYYY'. */
  dateFormat?: string;
  currency?: string;
}

/** Corps de POST /api/v1/import/preview (aucune persistance, aucune session requise). */
export interface ImportPreviewRequestDto {
  /** Contenu brut du fichier (texte). */
  rawContent: string;
  /** 'CSV' par défaut. */
  format?: StatementFormat;
  /** Séparateur CSV ; auto-détecté si absent. */
  delimiter?: CsvDelimiter;
  /** true par défaut. */
  hasHeader?: boolean;
  dateFormat?: string;
  /** 'EUR' par défaut. */
  currency?: string;
  mapping?: CsvMappingDto;
}

export interface NormalizedImportTransaction {
  /** Numéro de la ligne dans le fichier brut (1-based, en-tête compris). */
  lineNumber: number;
  date: string; // YYYY-MM-DD
  /** Libellé original, non modifié. */
  rawDescription: string;
  /** Libellé normalisé du commerçant si reconnu (ex. 'Monoprix'). */
  cleanedDescription?: string | null;
  amount: number; // euros décimaux, négatif = dépense
  currency: string; // 'EUR'
  category?: string | null;
  /**
   * Empreinte déterministe : SHA-256 (16 premiers caractères hexadécimaux) de
   * date + libellé brut + montant + rang d'occurrence dans le fichier.
   * Deux lignes légitimes identiques ont des empreintes différentes.
   */
  fingerprint: string;
}

export type ImportRowErrorField = 'date' | 'amount' | 'description' | 'format';

export interface ImportRowError {
  lineNumber: number;
  rawContent: string;
  field?: ImportRowErrorField;
  /** Cause lisible par l'utilisateur. */
  reason: string;
}

/** Réponse de POST /api/v1/import/preview, enveloppée dans ApiResponse<ImportPreviewResult>. */
export interface ImportPreviewResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  /** SHA-256 complet du contenu du fichier. */
  fileFingerprint: string;
  transactions: NormalizedImportTransaction[];
  errors: ImportRowError[];
}

/**
 * Corps de POST /api/v1/import/commit (session obligatoire).
 * Le propriétaire est toujours l'utilisateur de la session, jamais un userId du navigateur.
 */
export interface ImportCommitRequestDto extends ImportPreviewRequestDto {
  /**
   * Compte cible. S'il est omis, l'API réutilise le compte d'import de l'utilisateur
   * ou le crée (connexion source FILE_IMPORT). Un compte d'un autre utilisateur → 403.
   */
  accountId?: string;
  /** Nom du compte si l'API doit le créer. */
  accountName?: string;
  /**
   * Solde connu saisi par l'utilisateur à la création du compte.
   * S'il est absent, le solde reste inconnu (null), jamais 0.
   */
  initialBalance?: number;
  /** true par défaut : les lignes déjà présentes dans le compte sont ignorées et comptées. */
  skipDuplicates?: boolean;
}

export interface ImportedTransactionSummary {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  rawDescription: string;
  cleanedDescription?: string | null;
}

/**
 * Réponse de POST /api/v1/import/commit, enveloppée dans ApiResponse<ImportCommitResult>.
 * Erreurs : 400 si aucune ligne valide, 401 sans session, 403 si le compte n'appartient pas à l'utilisateur.
 */
export interface ImportCommitResult {
  /** Compte utilisé (fourni, réutilisé ou créé) : le front le conserve pour les imports suivants. */
  accountId: string;
  totalRead: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  errorCount: number;
  errors: Array<Pick<ImportRowError, 'lineNumber' | 'reason'>>;
  transactions: ImportedTransactionSummary[];
}

/*
 * Exemple de référence (fixture du contrat) : 2 lignes valides, 1 date invalide.
 * ApiResponse<ImportPreviewResult>.data =
 * {
 *   totalRows: 3,
 *   validCount: 2,
 *   errorCount: 1,
 *   fileFingerprint: '<sha256 du fichier>',
 *   transactions: [
 *     {
 *       lineNumber: 2,
 *       date: '2026-10-12',
 *       rawDescription: 'CB MONOPRIX PARIS',
 *       cleanedDescription: 'Monoprix',
 *       amount: -42.5,
 *       currency: 'EUR',
 *       category: 'ALIMENTATION',
 *       fingerprint: '<16 caractères hex>',
 *     },
 *     {
 *       lineNumber: 3,
 *       date: '2026-10-13',
 *       rawDescription: 'SALAIRE',
 *       cleanedDescription: 'Salaire',
 *       amount: 2100,
 *       currency: 'EUR',
 *       category: 'REVENU',
 *       fingerprint: '<16 caractères hex>',
 *     },
 *   ],
 *   errors: [
 *     {
 *       lineNumber: 4,
 *       rawContent: 'date_invalide;LOYER OCTOBRE;-750,00',
 *       field: 'date',
 *       reason: 'Date invalide ou format non reconnu: "date_invalide"',
 *     },
 *   ],
 * }
 */
