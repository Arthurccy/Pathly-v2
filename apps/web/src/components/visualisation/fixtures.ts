/**
 * Fixtures fictives et déterministes des composants de visualisation.
 * Aucune donnée réelle. Montants en euros, `currency: 'EUR'`.
 */
import type { CashflowSummaryView, NetWorthData, VisualState } from './contracts';

export const FIXTURE_LABEL = 'Données fictives';

// --- Patrimoine ---------------------------------------------------------------

/** Exemple de référence CONTRATS_SEANCE_2 §3 : 2 000 + 5 000 + 10 000 − 3 000 = 14 000 €. */
export const netWorthHealthy: VisualState<NetWorthData> = {
  status: 'ready',
  data: {
    liquidCash: 2000,
    investedAssets: 5000,
    tangibleAssets: 10000,
    totalAssets: 17000,
    totalDebt: 3000,
    totalLiabilities: 3000,
    netWorth: 14000,
    monthlyDebtPayment: 250,
    debtToIncomeRatio: null,
  },
};

/** Situation tendue : dettes supérieures aux actifs → patrimoine net négatif (−2 700 €). */
export const netWorthTight: VisualState<NetWorthData> = {
  status: 'ready',
  data: {
    liquidCash: 300,
    investedAssets: 1000,
    tangibleAssets: 8000,
    totalAssets: 9300,
    totalDebt: 12000,
    totalLiabilities: 12000,
    netWorth: -2700,
    monthlyDebtPayment: 640,
    debtToIncomeRatio: null,
  },
};

/** Synthèse incohérente (totaux faux) : le composant doit le signaler sans corriger. */
export const netWorthIncoherent: VisualState<NetWorthData> = {
  status: 'ready',
  data: {
    liquidCash: 2000,
    investedAssets: 5000,
    tangibleAssets: 10000,
    totalAssets: 18000, // ≠ 2 000 + 5 000 + 10 000
    totalDebt: 3000,
    totalLiabilities: 3000,
    netWorth: 16000, // ≠ 18 000 − 3 000
    monthlyDebtPayment: 250,
    debtToIncomeRatio: null,
  },
};

export const netWorthEmpty: VisualState<NetWorthData> = { status: 'empty' };
export const netWorthLoading: VisualState<NetWorthData> = { status: 'loading' };
export const netWorthError: VisualState<NetWorthData> = {
  status: 'error',
  message: 'Synthèse patrimoniale indisponible (erreur réseau simulée).',
};

// --- Santé financière ---------------------------------------------------------

/** Exemple de référence : 1 500 − 800 − 200 = 500 € disponibles sur la période. */
export const healthHealthy: VisualState<CashflowSummaryView> = {
  status: 'ready',
  data: {
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: 500,
    status: 'AVAILABLE',
    currency: 'EUR',
    inputs: { availableBalance: 1500, remainingCommittedExpenses: 800, savingsReserve: 200 },
  },
};

/** Situation tendue : 900 − 800 − 200 = −100 € (déficit non ramené à zéro). */
export const healthTight: VisualState<CashflowSummaryView> = {
  status: 'ready',
  data: {
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: -100,
    status: 'SHORTFALL',
    currency: 'EUR',
    inputs: { availableBalance: 900, remainingCommittedExpenses: 800, savingsReserve: 200 },
  },
};

/** Donnée requise manquante (charges) → INCOMPLETE, montant null. */
export const healthIncomplete: VisualState<CashflowSummaryView> = {
  status: 'ready',
  data: {
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: null,
    status: 'INCOMPLETE',
    currency: 'EUR',
    inputs: { availableBalance: 1500, remainingCommittedExpenses: null, savingsReserve: 200 },
  },
};

/**
 * Réponse INCOMPLETE au format exact de l'API de Victor (sans `inputs`) :
 * aucun compte courant → raison AVAILABLE_BALANCE_MISSING.
 */
export const healthApiIncomplete: VisualState<CashflowSummaryView> = {
  status: 'ready',
  data: {
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: null,
    status: 'INCOMPLETE',
    currency: 'EUR',
    incompleteReasons: ['AVAILABLE_BALANCE_MISSING'],
  },
};

/** Exemple exact de docs/architecture/CONTRAT_CASHFLOW_S2.md (réponse de l'API, sans `inputs`). */
export const healthResultOnly: VisualState<CashflowSummaryView> = {
  status: 'ready',
  data: {
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: 500,
    status: 'AVAILABLE',
    currency: 'EUR',
  },
};

export const healthEmpty: VisualState<CashflowSummaryView> = { status: 'empty' };
export const healthLoading: VisualState<CashflowSummaryView> = { status: 'loading' };
export const healthError: VisualState<CashflowSummaryView> = {
  status: 'error',
  message: 'Estimation de trésorerie indisponible (erreur réseau simulée).',
};
