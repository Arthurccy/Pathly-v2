'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { NetWorthData, VisualCommonProps, VisualState } from './contracts';
import { computeNetWorthView, formatEur } from './compute';
import { toneClasses, useStaticRendering } from './parts';
import { buildSceneBars, isWebGLAvailable } from './three/scene-model';

/** La bibliothèque 3D n'est téléchargée qu'au clic, jamais rendue côté serveur. */
const NetWorthScene = dynamic(() => import('./three/NetWorthScene').then((m) => m.NetWorthScene), {
  ssr: false,
  loading: () => (
    <p role="status" className="flex h-full items-center justify-center text-sm">
      Chargement de la vue 3D…
    </p>
  ),
});

const browserCanvas = (): HTMLCanvasElement => document.createElement('canvas');

export interface NetWorth3DProps extends Omit<VisualCommonProps, 'frame'> {
  state: VisualState<NetWorthData>;
  /** Détection WebGL injectable (tests, simulation d'absence). Par défaut : canvas du navigateur. */
  detectWebGL?: () => boolean;
}

type Phase = 'idle' | 'shown' | 'unavailable';

/**
 * Vue 3D optionnelle de la répartition patrimoniale (P1). Complète la vue 2D `NetWorthBreakdown`,
 * qui reste la version de référence lisible et accessible.
 */
export function NetWorth3D({
  state,
  tone = 'light',
  motion = 'auto',
  detectWebGL = () => isWebGLAvailable(browserCanvas),
}: NetWorth3DProps): React.JSX.Element | null {
  const [phase, setPhase] = useState<Phase>('idle');
  const isStatic = useStaticRendering(motion);
  const t = toneClasses(tone);
  const view = useMemo(() => (state.status === 'ready' ? computeNetWorthView(state.data) : null), [state]);
  const bars = useMemo(() => (view ? buildSceneBars(view) : []), [view]);

  if (!view || bars.length === 0) return null;

  const show = (): void => setPhase(detectWebGL() ? 'shown' : 'unavailable');

  return (
    <div className="mt-3">
      {phase === 'idle' && (
        <button
          type="button"
          onClick={show}
          className="rounded-lg border border-slate-400 px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          Afficher la vue 3D
        </button>
      )}
      {phase === 'unavailable' && (
        <p role="status" className={`text-sm ${t.muted}`}>
          Vue 3D indisponible : WebGL n’est pas pris en charge par ce navigateur. La vue 2D reste affichée.
        </p>
      )}
      {phase === 'shown' && (
        <figure>
          <div className={`h-80 w-full rounded-xl ${t.track}`}>
            <NetWorthScene bars={bars} rotate={!isStatic} />
          </div>
          <figcaption className={`mt-2 text-xs ${t.muted}`}>
            Vue 3D décorative : une colonne d’actifs empilés ({bars
              .filter((b) => b.key !== 'debts')
              .map((b) => b.label.toLowerCase())
              .join(', ')}) et une colonne de dettes séparée, en rouge. Valeurs détaillées dans la vue 2D (patrimoine net{' '}
            {formatEur(view.netWorthCents)}).
          </figcaption>
          <button
            type="button"
            onClick={() => setPhase('idle')}
            className="mt-2 rounded-lg border border-slate-400 px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            Masquer la vue 3D
          </button>
        </figure>
      )}
    </div>
  );
}
