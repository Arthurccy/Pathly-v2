/**
 * Modèle pur de la scène 3D du patrimoine (aucun import d'exécution : testable avec `node --test`).
 *
 * Reprend les largeurs de `computeNetWorthView` (échelle commune actifs/dettes) pour en faire des hauteurs :
 * une colonne d'actifs empilés et une colonne de dettes séparée, jamais mêlée aux actifs.
 */
import type { NetWorthView } from '../compute';

export const MAX_HEIGHT = 3;
const ASSETS_X = -0.8;
const DEBTS_X = 0.8;

export const BAR_COLORS = {
  liquidCash: '#10b981',
  investedAssets: '#0ea5e9',
  tangibleAssets: '#f59e0b',
  debts: '#e11d48',
} as const;

export interface SceneBar {
  key: keyof typeof BAR_COLORS;
  label: string;
  color: string;
  x: number;
  /** Centre vertical de la boîte (la base de la colonne est à y = 0). */
  y: number;
  height: number;
}

export function buildSceneBars(view: NetWorthView): SceneBar[] {
  const bars: SceneBar[] = [];
  let base = 0;
  for (const segment of view.segments) {
    const height = (segment.widthPct / 100) * MAX_HEIGHT;
    if (height <= 0) continue;
    bars.push({
      key: segment.key,
      label: segment.label,
      color: BAR_COLORS[segment.key],
      x: ASSETS_X,
      y: base + height / 2,
      height,
    });
    base += height;
  }
  const debtHeight = (view.liabilitiesWidthPct / 100) * MAX_HEIGHT;
  if (debtHeight > 0) {
    bars.push({ key: 'debts', label: 'Dettes', color: BAR_COLORS.debts, x: DEBTS_X, y: debtHeight / 2, height: debtHeight });
  }
  return bars;
}

/** Détection WebGL. La fabrique de canvas est injectable pour les tests et la simulation d'absence. */
export function isWebGLAvailable(createCanvas: () => { getContext: (id: string) => unknown }): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
