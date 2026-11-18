/**
 * Contrat de props — domaine Visualisation (Jeremy), séance 2.
 *
 * Les composants de ce dossier ne font aucun appel réseau ni Supabase :
 * ils reçoivent un état typé fourni par l'intégrateur (Loris) via ses sources de données.
 *
 * Références : docs/architecture/CONTRATS_SEANCE_2.md §1 (conventions) et §3 (exemples).
 */
import type { NetWorthSummaryDto } from '@pathly/shared-types';

/** État d'une source de données consommée par un composant de visualisation. */
export type VisualState<T> =
  | { status: 'loading' }
  /** Aucune donnée disponible (pas encore de synthèse) — distinct d'une valeur à zéro. */
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

/**
 * Thème : `light` / `dark` imposés par le parent, ou `auto` pour suivre la classe `dark`
 * du document (mode sombre du dashboard, variantes `dark:` de Tailwind).
 */
export type VisualTone = 'light' | 'dark' | 'auto';

/** `card` : cadre et titre propres ; `none` : intégré dans un conteneur qui fournit déjà cadre et titre. */
export type VisualFrame = 'card' | 'none';

/**
 * 'auto' respecte `prefers-reduced-motion` ; 'reduced' force la version sans mouvement.
 * Aucune information n'est portée uniquement par l'animation.
 */
export type MotionPreference = 'auto' | 'reduced';

export interface VisualCommonProps {
  tone?: VisualTone;
  frame?: VisualFrame;
  motion?: MotionPreference;
  /** Libellé affiché lorsque les données sont fictives (fixture ou mode démo). */
  sourceLabel?: string;
}

// --- Répartition patrimoniale -------------------------------------------------

/** Consomme le type existant `NetWorthSummaryDto` (packages/shared-types), sans le modifier. */
export type NetWorthData = NetWorthSummaryDto;

export interface NetWorthBreakdownProps extends VisualCommonProps {
  state: VisualState<NetWorthData>;
}

// --- Santé financière (reste-à-dépenser) --------------------------------------

/*
 * Les deux types ci-dessous reprennent à l'identique `SafeToSpendStatus` et
 * `CashflowIncompleteReason` de `packages/shared-types/src/cashflow.ts` (PR #2 de Victor,
 * en brouillon). À remplacer par l'import de `@pathly/shared-types` une fois cette PR fusionnée.
 */
export type CashflowStatus = 'AVAILABLE' | 'SHORTFALL' | 'INCOMPLETE';

export type CashflowIncompleteReason =
  | 'AVAILABLE_BALANCE_MISSING'
  | 'REMAINING_COMMITTED_EXPENSES_MISSING'
  | 'SAVINGS_RESERVE_MISSING'
  | 'UNSUPPORTED_CURRENCY';

/**
 * `CashflowSummaryDto` de `GET /api/v1/cashflow/summary` (docs/architecture/CONTRAT_CASHFLOW_S2.md,
 * PR #2) + bloc optionnel `inputs`. Une réponse de l'API sans `inputs` est directement compatible.
 * `safeToSpendPeriod` vaut `null` lorsque le statut est INCOMPLETE.
 */
export interface CashflowSummaryView {
  month: string; // YYYY-MM
  asOfDate: string; // YYYY-MM-DD
  safeToSpendPeriod: number | null;
  status: CashflowStatus;
  currency: 'EUR';
  /** Présent uniquement si status === 'INCOMPLETE' (contrat de Victor). */
  incompleteReasons?: CashflowIncompleteReason[];
  /**
   * PROPOSITION (à confirmer avec Victor / Ishak) : entrées du calcul, pour expliquer le résultat.
   * Avec l'API actuelle, charges restantes et réserve sont des paramètres envoyés par le dashboard ;
   * seul le solde disponible n'est pas renvoyé. Une entrée `null` = donnée manquante, jamais zéro.
   * Si ce bloc est absent, le composant affiche uniquement le résultat.
   */
  inputs?: {
    availableBalance: number | null;
    remainingCommittedExpenses: number | null;
    savingsReserve: number | null;
  };
}

export interface FinancialHealthProps extends VisualCommonProps {
  state: VisualState<CashflowSummaryView>;
}
