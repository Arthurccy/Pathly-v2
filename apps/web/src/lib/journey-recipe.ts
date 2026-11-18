/**
 * Recette isolée du parcours S2 : import, consultation, calcul, erreur.
 * Doublure de vérification. Elle ne remplace pas l'import de Rémy, le calcul de Victor
 * ni le dashboard de Loris. Le rapprochement transaction / trésorerie n'est pas fait :
 * les deux jeux du contrat restent indépendants.
 *
 * Montants : euros en nombre, arrondi au centime le plus proche (demi-centime supérieur
 * via Math.round) avant soustraction. Une donnée requise absente reste indisponible,
 * elle ne devient pas zéro.
 */

export interface NormalizedOperation {
  date: string;
  label: string;
  amount: number;
}

export interface ImportLineError {
  line: number;
  cause: string;
}

export interface ImportPreview {
  operations: NormalizedOperation[];
  errors: ImportLineError[];
}

export interface RecipeAccount {
  id: string;
  name: string;
  currentBalance: number;
  currency: 'EUR';
}

export interface RecipeTransaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  rawDescription: string;
}

export type ConsultationChannel<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export interface ConsultationSource {
  accounts: ConsultationChannel<RecipeAccount[]>;
  transactions: ConsultationChannel<RecipeTransaction[]>;
}

export type ConsultationView =
  | { status: 'ready'; accounts: RecipeAccount[]; transactions: RecipeTransaction[] }
  | { status: 'empty'; accounts: RecipeAccount[]; transactions: [] }
  | { status: 'unavailable'; code: string; message: string };

export interface CashflowInput {
  month: string;
  asOfDate: string;
  availableBalance: number | null;
  remainingCommittedExpenses: number | null;
  savingsReserve: number | null;
  currency: 'EUR';
}

export interface CashflowEstimate {
  month: string;
  asOfDate: string;
  safeToSpendPeriod: number | null;
  status: 'AVAILABLE' | 'SHORTFALL' | 'INCOMPLETE';
  currency: 'EUR';
}

export interface JourneyReport {
  importPreview: ImportPreview;
  consultation: ConsultationView;
  cashflow: CashflowEstimate;
  note: string;
}

const IMPORT_HEADER = 'date;libelle;montant';

export const REFERENCE_CSV = `date;libelle;montant
2026-10-12;CB MONOPRIX PARIS;-42,50
2026-10-13;SALAIRE;2100,00
`;

export const REFERENCE_ACCOUNT: RecipeAccount = {
  id: 'A',
  name: 'Compte fictif A',
  currentBalance: 1500,
  currency: 'EUR',
};

export const REFERENCE_TRANSACTION: RecipeTransaction = {
  id: 'A1',
  accountId: 'A',
  date: '2026-10-12',
  amount: -42.5,
  rawDescription: 'CB MONOPRIX PARIS',
};

export const REFERENCE_CASHFLOW: CashflowInput = {
  month: '2026-10',
  asOfDate: '2026-10-15',
  availableBalance: 1500,
  remainingCommittedExpenses: 800,
  savingsReserve: 200,
  currency: 'EUR',
};

export function previewImport(csv: string): ImportPreview {
  const lines = normalizeLines(csv);
  const operations: NormalizedOperation[] = [];
  const errors: ImportLineError[] = [];

  if (lines.length === 0 || lines[0].trim() !== IMPORT_HEADER) {
    errors.push({ line: 1, cause: 'en-tête attendu : date;libelle;montant' });
    return { operations, errors };
  }

  for (let index = 1; index < lines.length; index += 1) {
    const raw = lines[index];
    const line = index + 1;
    if (raw.trim() === '') {
      errors.push({ line, cause: 'ligne vide' });
      continue;
    }

    const parts = raw.split(';');
    if (parts.length !== 3) {
      errors.push({ line, cause: 'trois colonnes attendues (date;libelle;montant)' });
      continue;
    }

    const [date, label, amountRaw] = parts;
    if (!isIsoDate(date)) {
      errors.push({ line, cause: 'date invalide' });
      continue;
    }

    const amount = parseFrenchAmount(amountRaw);
    if (amount === null) {
      errors.push({ line, cause: 'montant invalide' });
      continue;
    }

    operations.push({ date, label, amount });
  }

  return { operations, errors };
}

export function readConsultation(source: ConsultationSource): ConsultationView {
  if (!source.accounts.ok) {
    return { status: 'unavailable', code: source.accounts.code, message: source.accounts.message };
  }
  if (!source.transactions.ok) {
    return {
      status: 'unavailable',
      code: source.transactions.code,
      message: source.transactions.message,
    };
  }
  if (source.transactions.data.length === 0) {
    return { status: 'empty', accounts: source.accounts.data, transactions: [] };
  }
  return {
    status: 'ready',
    accounts: source.accounts.data,
    transactions: source.transactions.data,
  };
}

export function estimateSafeToSpend(input: CashflowInput): CashflowEstimate {
  const base = {
    month: input.month,
    asOfDate: input.asOfDate,
    currency: 'EUR' as const,
  };

  if (
    input.availableBalance === null ||
    input.remainingCommittedExpenses === null ||
    input.savingsReserve === null
  ) {
    return { ...base, safeToSpendPeriod: null, status: 'INCOMPLETE' };
  }

  const balance = toCents(input.availableBalance);
  const expenses = toCents(input.remainingCommittedExpenses);
  const reserve = toCents(input.savingsReserve);
  if (balance === null || expenses === null || reserve === null) {
    return { ...base, safeToSpendPeriod: null, status: 'INCOMPLETE' };
  }

  const cents = balance - expenses - reserve;
  return {
    ...base,
    safeToSpendPeriod: cents / 100,
    status: cents < 0 ? 'SHORTFALL' : 'AVAILABLE',
  };
}

export function runReferenceJourney(): JourneyReport {
  const importPreview = previewImport(REFERENCE_CSV);
  const consultation = readConsultation({
    accounts: { ok: true, data: [REFERENCE_ACCOUNT] },
    transactions: { ok: true, data: [REFERENCE_TRANSACTION] },
  });
  const cashflow = estimateSafeToSpend(REFERENCE_CASHFLOW);

  return {
    importPreview,
    consultation,
    cashflow,
    note: 'Le calcul 1 500 − 800 − 200 est indépendant de la transaction −42,50 €. Aucun rapprochement n’est appliqué.',
  };
}

function normalizeLines(csv: string): string[] {
  const text = csv.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Profil fictif séparé par des points-virgules, décimales avec une virgule. Un point est invalide. */
function parseFrenchAmount(raw: string): number | null {
  const match = /^(-?)(\d{1,3}(?: \d{3})*|\d+)(?:,(\d{1,2}))?$/.exec(raw.trim());
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : 1;
  const whole = Number(match[2].replace(/ /g, ''));
  const fraction = Number((match[3] ?? '').padEnd(2, '0') || '0');
  if (!Number.isInteger(whole) || !Number.isInteger(fraction)) return null;
  return (sign * (whole * 100 + fraction)) / 100;
}

function toCents(euros: number): number | null {
  if (!Number.isFinite(euros)) return null;
  return Math.round(euros * 100);
}
