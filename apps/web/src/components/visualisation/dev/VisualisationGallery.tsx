'use client';

import React, { useState } from 'react';
import type { MotionPreference, VisualTone } from '../contracts';
import { FinancialHealth } from '../FinancialHealth';
import { NetWorthBreakdown } from '../NetWorthBreakdown';
import * as fx from '../fixtures';

const NET_WORTH_CASES = [
  { name: 'Sain — référence 14 000 €', state: fx.netWorthHealthy },
  { name: 'Tendu — patrimoine net négatif', state: fx.netWorthTight },
  { name: 'Incohérent — totaux faux signalés', state: fx.netWorthIncoherent },
  { name: 'Données absentes', state: fx.netWorthEmpty },
  { name: 'Chargement', state: fx.netWorthLoading },
  { name: 'Erreur', state: fx.netWorthError },
];

const HEALTH_CASES = [
  { name: 'Sain — 1 500 − 800 − 200 = 500 €', state: fx.healthHealthy },
  { name: 'Tendu — déficit de 100 €', state: fx.healthTight },
  { name: 'Donnée manquante — INCOMPLETE', state: fx.healthIncomplete },
  { name: 'Réponse API — résultat seul', state: fx.healthResultOnly },
  { name: 'Réponse API — INCOMPLETE avec raison', state: fx.healthApiIncomplete },
  { name: 'Données absentes', state: fx.healthEmpty },
  { name: 'Chargement', state: fx.healthLoading },
  { name: 'Erreur', state: fx.healthError },
];

/** Page de développement isolée : tous les états des composants, sur fixtures fictives. */
export function VisualisationGallery(): React.JSX.Element {
  const [tone, setTone] = useState<VisualTone>('light');
  const [motion, setMotion] = useState<MotionPreference>('auto');
  const [replay, setReplay] = useState(0);
  const dark = tone === 'dark';

  return (
    <main className={`min-h-screen p-4 sm:p-8 ${dark ? 'bg-[#070b14] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <header className="mx-auto mb-6 max-w-6xl">
        <h1 className="text-2xl font-extrabold">Visualisations — page de développement</h1>
        <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Composants isolés alimentés par des fixtures fictives. Non indexée, hors parcours utilisateur.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTone(dark ? 'light' : 'dark')}
            aria-pressed={dark}
            className="rounded-lg border border-slate-400 px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            Thème sombre
          </button>
          <button
            type="button"
            onClick={() => setMotion(motion === 'auto' ? 'reduced' : 'auto')}
            aria-pressed={motion === 'reduced'}
            className="rounded-lg border border-slate-400 px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            Forcer sans mouvement
          </button>
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            className="rounded-lg border border-slate-400 px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            Rejouer les animations
          </button>
        </div>
      </header>

      <div key={replay} className="mx-auto max-w-6xl space-y-10">
        <section aria-labelledby="g-health">
          <h2 id="g-health" className="mb-3 text-lg font-bold">Santé financière</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {HEALTH_CASES.map((c) => (
              <div key={c.name}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">{c.name}</p>
                <FinancialHealth state={c.state} tone={tone} motion={motion} sourceLabel={fx.FIXTURE_LABEL} />
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="g-networth">
          <h2 id="g-networth" className="mb-3 text-lg font-bold">Répartition du patrimoine</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {NET_WORTH_CASES.map((c) => (
              <div key={c.name}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">{c.name}</p>
                <NetWorthBreakdown state={c.state} tone={tone} motion={motion} sourceLabel={fx.FIXTURE_LABEL} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
