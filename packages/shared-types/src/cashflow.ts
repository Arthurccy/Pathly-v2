// ==========================================
// PATHLY V2 - CONTRAT TRÉSORERIE (SAFE-TO-SPEND) — S2
// Producteur : Victor · Consommateurs : Loris, Jeremy
// Référence : docs/architecture/CONTRAT_CASHFLOW_S2.md
// ==========================================

/**
 * AVAILABLE  : estimation >= 0
 * SHORTFALL  : estimation < 0 (le déficit n'est jamais ramené à zéro)
 * INCOMPLETE : une donnée requise manque ; `safeToSpendPeriod` vaut alors `null`
 */
export type SafeToSpendStatus = 'AVAILABLE' | 'SHORTFALL' | 'INCOMPLETE';

export type CashflowIncompleteReason =
  | 'AVAILABLE_BALANCE_MISSING'
  | 'REMAINING_COMMITTED_EXPENSES_MISSING'
  | 'SAVINGS_RESERVE_MISSING'
  | 'UNSUPPORTED_CURRENCY';

/**
 * Entrée du calcul pur. Montants en euros, 2 décimales maximum.
 * `null` signifie « donnée indisponible », jamais zéro.
 */
export interface CashflowSummaryInput {
  month: string; // YYYY-MM
  asOfDate: string; // YYYY-MM-DD
  availableBalance: number | null;
  remainingCommittedExpenses: number | null; // charges restant à débiter sur la période, >= 0
  savingsReserve: number | null; // réserve d'épargne à préserver, >= 0
  currency: 'EUR';
}

/**
 * Réponse de GET /api/v1/cashflow/summary (enveloppée dans ApiResponse<CashflowSummaryDto>).
 * Règle S2 : solde disponible − charges restantes − réserve.
 * Pas d'équivalent journalier en S2.
 */
export interface CashflowSummaryDto {
  month: string; // YYYY-MM
  asOfDate: string; // YYYY-MM-DD
  safeToSpendPeriod: number | null;
  status: SafeToSpendStatus;
  currency: 'EUR';
  /** Présent uniquement si status === 'INCOMPLETE'. */
  incompleteReasons?: CashflowIncompleteReason[];
}
