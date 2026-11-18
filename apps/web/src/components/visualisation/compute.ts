/**
 * Calculs purs des visualisations (aucun import d'exécution : testable avec `node --test`).
 *
 * Arrondi : les montants en euros du contrat sont convertis en centimes entiers
 * (arrondi au centime le plus proche) avant toute addition ou comparaison,
 * puis reconvertis uniquement pour l'affichage.
 */
import type {
  CashflowIncompleteReason,
  CashflowStatus,
  CashflowSummaryView,
  NetWorthData,
} from './contracts';

// --- Monnaie ------------------------------------------------------------------

export function toCents(euros: number): number {
  // toFixed neutralise les erreurs binaires du type 1.005 * 100 = 100.49999…
  return Math.round(Number((euros * 100).toFixed(6)));
}

const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const EUR_SIGNED = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  signDisplay: 'exceptZero',
});

export function formatEur(cents: number): string {
  return EUR.format(cents / 100);
}

export function formatSignedEur(cents: number): string {
  return EUR_SIGNED.format(cents / 100);
}

// --- Répartition patrimoniale -------------------------------------------------

export type AssetKey = 'liquidCash' | 'investedAssets' | 'tangibleAssets';

export interface AssetSegment {
  key: AssetKey;
  label: string;
  cents: number;
  /** Part dans le total des actifs positifs (0–100). 0 si la valeur est négative. */
  sharePct: number;
  /** Largeur sur l'échelle commune actifs/dettes (0–100). */
  widthPct: number;
}

export interface NetWorthView {
  segments: AssetSegment[];
  totalAssetsCents: number;
  liabilitiesCents: number;
  liabilitiesWidthPct: number;
  netWorthCents: number;
  /** Aucun actif ni dette : valeurs réelles à zéro, à distinguer d'une donnée absente. */
  isAllZero: boolean;
  /** Incohérences détectées dans la synthèse reçue ; jamais corrigées silencieusement. */
  issues: string[];
}

export const ASSET_LABELS: Record<AssetKey, string> = {
  liquidCash: 'Trésorerie',
  investedAssets: 'Investissements',
  tangibleAssets: 'Biens',
};

const ASSET_ORDER: AssetKey[] = ['liquidCash', 'investedAssets', 'tangibleAssets'];

function pct(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

export function computeNetWorthView(data: NetWorthData): NetWorthView {
  const issues: string[] = [];
  const raw = ASSET_ORDER.map((key) => ({ key, cents: toCents(data[key]) }));

  const positiveSum = raw.reduce((sum, s) => sum + Math.max(0, s.cents), 0);
  const categoriesSum = raw.reduce((sum, s) => sum + s.cents, 0);
  const totalAssetsCents = toCents(data.totalAssets);
  const liabilitiesCents = toCents(data.totalLiabilities);
  const netWorthCents = toCents(data.netWorth);

  for (const s of raw) {
    if (s.cents < 0) {
      issues.push(
        `${ASSET_LABELS[s.key]} négative (${formatEur(s.cents)}) : non représentée dans la barre des actifs.`,
      );
    }
  }
  if (liabilitiesCents < 0) {
    issues.push(`Dettes négatives (${formatEur(liabilitiesCents)}) : valeur invalide, non représentée.`);
  }
  if (categoriesSum !== totalAssetsCents) {
    issues.push(
      `Le total des actifs reçu (${formatEur(totalAssetsCents)}) diffère de la somme des catégories (${formatEur(categoriesSum)}).`,
    );
  }
  if (totalAssetsCents - liabilitiesCents !== netWorthCents) {
    issues.push(
      `Le patrimoine net reçu (${formatEur(netWorthCents)}) diffère de actifs − dettes (${formatEur(totalAssetsCents - liabilitiesCents)}).`,
    );
  }

  const shownLiabilities = Math.max(0, liabilitiesCents);
  // Échelle commune : les deux barres sont comparables visuellement.
  const scale = Math.max(positiveSum, shownLiabilities);

  const segments: AssetSegment[] = raw.map((s) => ({
    key: s.key,
    label: ASSET_LABELS[s.key],
    cents: s.cents,
    sharePct: pct(Math.max(0, s.cents), positiveSum),
    widthPct: pct(Math.max(0, s.cents), scale),
  }));

  return {
    segments,
    totalAssetsCents,
    liabilitiesCents,
    liabilitiesWidthPct: pct(shownLiabilities, scale),
    netWorthCents,
    isAllZero: positiveSum === 0 && shownLiabilities === 0 && raw.every((s) => s.cents === 0),
    issues,
  };
}

// --- Santé financière (cascade du reste-à-dépenser) ---------------------------

export type HealthStepKey = 'balance' | 'expenses' | 'reserve' | 'result';

export interface HealthStep {
  key: HealthStepKey;
  label: string;
  /** Variation affichée : positive pour le solde, négative pour les déductions. */
  deltaCents: number;
  startCents: number;
  endCents: number;
  leftPct: number;
  widthPct: number;
}

export type HealthView =
  | {
      kind: 'waterfall';
      steps: HealthStep[];
      zeroPct: number;
      resultCents: number;
      status: CashflowStatus;
      issues: string[];
    }
  | {
      kind: 'resultOnly';
      resultCents: number | null;
      status: CashflowStatus;
      /** Données manquantes : entrées `null` du bloc `inputs`, sinon `incompleteReasons` reçues. */
      missing: string[];
      issues: string[];
    };

export const HEALTH_LABELS: Record<HealthStepKey, string> = {
  balance: 'Solde disponible',
  expenses: 'Charges restantes',
  reserve: "Réserve d'épargne",
  result: 'Reste à dépenser',
};

export const STATUS_LABELS: Record<CashflowStatus, string> = {
  AVAILABLE: 'Disponible',
  SHORTFALL: 'Déficit estimé',
  INCOMPLETE: 'Données incomplètes',
};

export const INCOMPLETE_REASON_LABELS: Record<CashflowIncompleteReason, string> = {
  AVAILABLE_BALANCE_MISSING: 'Solde disponible (aucun compte courant)',
  REMAINING_COMMITTED_EXPENSES_MISSING: 'Charges restantes',
  SAVINGS_RESERVE_MISSING: "Réserve d'épargne",
  UNSUPPORTED_CURRENCY: 'Devise non prise en charge (compte hors EUR)',
};

/** Libellés des raisons reçues ; un code inconnu est affiché tel quel plutôt qu'ignoré. */
function reasonLabels(reasons: CashflowIncompleteReason[] | undefined): string[] {
  return (reasons ?? []).map((r) => INCOMPLETE_REASON_LABELS[r] ?? r);
}

function statusIssues(status: CashflowStatus, resultCents: number | null): string[] {
  const issues: string[] = [];
  if (status === 'INCOMPLETE' && resultCents !== null) {
    issues.push('Statut INCOMPLETE reçu avec un montant : le montant est ignoré.');
  }
  if (status !== 'INCOMPLETE' && resultCents === null) {
    issues.push(`Statut ${status} reçu sans montant.`);
  }
  if (status === 'AVAILABLE' && resultCents !== null && resultCents < 0) {
    issues.push('Statut AVAILABLE incohérent avec un montant négatif.');
  }
  if (status === 'SHORTFALL' && resultCents !== null && resultCents >= 0) {
    issues.push('Statut SHORTFALL incohérent avec un montant positif ou nul.');
  }
  return issues;
}

export function computeHealthView(view: CashflowSummaryView): HealthView {
  const received = view.safeToSpendPeriod === null ? null : toCents(view.safeToSpendPeriod);
  const issues = statusIssues(view.status, received);
  const resultForStatus = view.status === 'INCOMPLETE' ? null : received;

  if (view.status === 'INCOMPLETE' && (view.incompleteReasons ?? []).length === 0 && !view.inputs) {
    issues.push('Statut INCOMPLETE reçu sans raison (incompleteReasons).');
  }

  const inputs = view.inputs;
  if (!inputs) {
    return {
      kind: 'resultOnly',
      resultCents: resultForStatus,
      status: view.status,
      missing: reasonLabels(view.incompleteReasons),
      issues,
    };
  }

  const missing: string[] = [];
  if (inputs.availableBalance === null) missing.push(HEALTH_LABELS.balance);
  if (inputs.remainingCommittedExpenses === null) missing.push(HEALTH_LABELS.expenses);
  if (inputs.savingsReserve === null) missing.push(HEALTH_LABELS.reserve);

  if (
    view.status === 'INCOMPLETE' ||
    inputs.availableBalance === null ||
    inputs.remainingCommittedExpenses === null ||
    inputs.savingsReserve === null
  ) {
    // Contrat : INCOMPLETE → montant null, même si toutes les entrées sont fournies.
    if (missing.length === 0) missing.push(...reasonLabels(view.incompleteReasons));
    if (view.status !== 'INCOMPLETE') {
      issues.push(`Entrées manquantes alors que le statut est ${view.status}.`);
    }
    return { kind: 'resultOnly', resultCents: resultForStatus, status: view.status, missing, issues };
  }

  // Règle S2 : solde − charges restantes − réserve.
  const balance = toCents(inputs.availableBalance);
  const expenses = toCents(inputs.remainingCommittedExpenses);
  const reserve = toCents(inputs.savingsReserve);
  const afterExpenses = balance - expenses;
  const computed = afterExpenses - reserve;

  if (received !== null && received !== computed) {
    issues.push(
      `Écart entre le résultat reçu (${formatEur(received)}) et le calcul des entrées (${formatEur(computed)}).`,
    );
  }

  const raw: Array<Omit<HealthStep, 'leftPct' | 'widthPct'>> = [
    { key: 'balance', label: HEALTH_LABELS.balance, deltaCents: balance, startCents: 0, endCents: balance },
    { key: 'expenses', label: HEALTH_LABELS.expenses, deltaCents: -expenses, startCents: balance, endCents: afterExpenses },
    { key: 'reserve', label: HEALTH_LABELS.reserve, deltaCents: -reserve, startCents: afterExpenses, endCents: computed },
    { key: 'result', label: HEALTH_LABELS.result, deltaCents: computed, startCents: 0, endCents: computed },
  ];

  const bounds = raw.flatMap((s) => [s.startCents, s.endCents]);
  const min = Math.min(0, ...bounds);
  const max = Math.max(0, ...bounds);
  const span = max - min || 1;
  const position = (cents: number): number => ((cents - min) / span) * 100;

  const steps: HealthStep[] = raw.map((s) => {
    const a = position(s.startCents);
    const b = position(s.endCents);
    return { ...s, leftPct: Math.min(a, b), widthPct: Math.abs(b - a) };
  });

  return { kind: 'waterfall', steps, zeroPct: position(0), resultCents: computed, status: view.status, issues };
}
