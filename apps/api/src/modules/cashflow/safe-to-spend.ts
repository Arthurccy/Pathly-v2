import type {
  CashflowIncompleteReason,
  CashflowSummaryDto,
  CashflowSummaryInput,
} from '@pathly/shared-types';

/**
 * Calcul pur du reste-à-dépenser sur la période (règle S2).
 *
 *   safeToSpendPeriod = availableBalance − remainingCommittedExpenses − savingsReserve
 *
 * - Calcul en centimes entiers pour éviter les erreurs de flottants, conversion en euros à la sortie.
 * - Les charges déjà débitées sont déjà dans le solde : l'appelant ne fournit que les charges RESTANTES.
 * - Une donnée manquante (null) donne INCOMPLETE et un montant null, jamais 0.
 * - Un résultat négatif donne SHORTFALL avec le déficit réel, jamais ramené à 0.
 * - Une entrée invalide (non finie, > 2 décimales, charge/réserve négative) lève InvalidCashflowInputError.
 */

export class InvalidCashflowInputError extends Error {
  constructor(
    public readonly field: keyof CashflowSummaryInput,
    message: string,
  ) {
    super(message);
    this.name = 'InvalidCashflowInputError';
  }
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function toCents(
  field: keyof CashflowSummaryInput,
  value: number,
  { allowNegative }: { allowNegative: boolean },
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidCashflowInputError(field, `${field} doit être un nombre fini`);
  }
  const scaled = value * 100;
  const cents = Math.round(scaled);
  // Tolérance pour les représentations binaires (ex. 0.1 * 100 = 10.000000000000002)
  if (Math.abs(scaled - cents) > 1e-6) {
    throw new InvalidCashflowInputError(field, `${field} accepte au plus 2 décimales`);
  }
  if (!allowNegative && cents < 0) {
    throw new InvalidCashflowInputError(field, `${field} doit être positif ou nul`);
  }
  return cents;
}

export function computeSafeToSpend(input: CashflowSummaryInput): CashflowSummaryDto {
  if (!MONTH_RE.test(input.month)) {
    throw new InvalidCashflowInputError('month', 'month doit être au format YYYY-MM');
  }
  if (!DATE_RE.test(input.asOfDate)) {
    throw new InvalidCashflowInputError('asOfDate', 'asOfDate doit être au format YYYY-MM-DD');
  }
  if (!input.asOfDate.startsWith(`${input.month}-`)) {
    throw new InvalidCashflowInputError('asOfDate', 'asOfDate doit appartenir au mois demandé');
  }
  if (input.currency !== 'EUR') {
    throw new InvalidCashflowInputError('currency', 'Seule la devise EUR est prise en charge en S2');
  }

  const base = { month: input.month, asOfDate: input.asOfDate, currency: 'EUR' as const };

  // Valider d'abord toutes les valeurs fournies, même si une autre manque.
  const balance =
    input.availableBalance === null
      ? null
      : toCents('availableBalance', input.availableBalance, { allowNegative: true });
  const charges =
    input.remainingCommittedExpenses === null
      ? null
      : toCents('remainingCommittedExpenses', input.remainingCommittedExpenses, {
          allowNegative: false,
        });
  const reserve =
    input.savingsReserve === null
      ? null
      : toCents('savingsReserve', input.savingsReserve, { allowNegative: false });

  const incompleteReasons: CashflowIncompleteReason[] = [];
  if (balance === null) incompleteReasons.push('AVAILABLE_BALANCE_MISSING');
  if (charges === null) incompleteReasons.push('REMAINING_COMMITTED_EXPENSES_MISSING');
  if (reserve === null) incompleteReasons.push('SAVINGS_RESERVE_MISSING');

  if (balance === null || charges === null || reserve === null) {
    return { ...base, safeToSpendPeriod: null, status: 'INCOMPLETE', incompleteReasons };
  }

  const resultCents = balance - charges - reserve;
  return {
    ...base,
    // `+ 0` normalise un éventuel -0 en 0
    safeToSpendPeriod: resultCents / 100 + 0,
    status: resultCents < 0 ? 'SHORTFALL' : 'AVAILABLE',
  };
}
