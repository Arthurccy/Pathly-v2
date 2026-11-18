'use client';

import React, { useId, useState } from 'react';
import type {
  CashflowSummaryView,
  MotionPreference,
  NetWorthData,
  VisualState,
  VisualTone,
} from '../contracts';
import { FinancialHealth } from '../FinancialHealth';
import { NetWorthBreakdown } from '../NetWorthBreakdown';
import * as fx from '../fixtures';

interface Case<T> {
  name: string;
  state: VisualState<T>;
}

/** Format exact de `CashflowSummaryDto` (contrat de Victor). */
const HEALTH_CONTRACT_CASES: Case<CashflowSummaryView>[] = [
  { name: 'Sain — 500 € (exemple du contrat)', state: fx.healthResultOnly },
  { name: 'Tendu — déficit de 100 €', state: fx.healthApiShortfall },
  { name: 'Données absentes — INCOMPLETE avec raison', state: fx.healthApiIncomplete },
  { name: 'Aucune estimation', state: fx.healthEmpty },
  { name: 'Chargement', state: fx.healthLoading },
  { name: 'Erreur', state: fx.healthError },
];

/** Même réponse + bloc `inputs` : proposition à valider avec Victor et Ishak. */
const HEALTH_PROPOSAL_CASES: Case<CashflowSummaryView>[] = [
  { name: 'Sain — 1 500 − 800 − 200 = 500 €', state: fx.healthHealthy },
  { name: 'Tendu — 900 − 800 − 200 = −100 €', state: fx.healthTight },
  { name: 'Données absentes — charges manquantes', state: fx.healthIncomplete },
];

const NET_WORTH_CASES: Case<NetWorthData>[] = [
  { name: 'Sain — référence 14 000 €', state: fx.netWorthHealthy },
  { name: 'Tendu — patrimoine net négatif', state: fx.netWorthTight },
  { name: 'Incohérent — totaux faux signalés', state: fx.netWorthIncoherent },
  { name: 'Données absentes', state: fx.netWorthEmpty },
  { name: 'Chargement', state: fx.netWorthLoading },
  { name: 'Erreur', state: fx.netWorthError },
];

const BUTTON =
  'rounded-lg border border-slate-400 px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500';

function CaseSelect<T>({
  label,
  cases,
  value,
  onChange,
  dark,
}: {
  label: string;
  cases: Case<T>[];
  value: number;
  onChange: (index: number) => void;
  dark: boolean;
}): React.JSX.Element {
  const id = useId();
  return (
    <div className="mb-2">
      <label htmlFor={id} className="mr-2 text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`rounded-lg border border-slate-400 px-2 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
          dark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
        }`}
      >
        {cases.map((c, i) => (
          <option key={c.name} value={i}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Grid<T>({
  cases,
  render,
}: {
  cases: Case<T>[];
  render: (state: VisualState<T>) => React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cases.map((c) => (
        <div key={c.name}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">{c.name}</p>
          {render(c.state)}
        </div>
      ))}
    </div>
  );
}

/** Page de développement isolée : tous les états des composants, sur fixtures fictives. */
export function VisualisationGallery(): React.JSX.Element {
  const [tone, setTone] = useState<VisualTone>('light');
  const [motion, setMotion] = useState<MotionPreference>('auto');
  const [replay, setReplay] = useState(0);
  const [liveHealth, setLiveHealth] = useState(0);
  const [liveNetWorth, setLiveNetWorth] = useState(0);
  const dark = tone === 'dark';
  const common = { tone, motion, sourceLabel: fx.FIXTURE_LABEL };

  return (
    <main className={`min-h-screen p-4 sm:p-8 ${dark ? 'bg-[#070b14] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <header className="mx-auto mb-6 max-w-6xl">
        <h1 className="text-2xl font-extrabold">Visualisations — page de développement</h1>
        <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Composants isolés alimentés par des fixtures fictives. Non indexée, hors parcours utilisateur.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTone(dark ? 'light' : 'dark')} aria-pressed={dark} className={BUTTON}>
            Thème sombre
          </button>
          <button
            type="button"
            onClick={() => setMotion(motion === 'auto' ? 'reduced' : 'auto')}
            aria-pressed={motion === 'reduced'}
            className={BUTTON}
          >
            Forcer sans mouvement
          </button>
          <button type="button" onClick={() => setReplay((n) => n + 1)} className={BUTTON}>
            Rejouer les animations
          </button>
        </div>
      </header>

      <div key={replay} className="mx-auto max-w-6xl space-y-10">
        <section aria-labelledby="g-live">
          <h2 id="g-live" className="mb-1 text-lg font-bold">
            Changement des données
          </h2>
          <p className="mb-3 text-sm opacity-80">
            Le même composant reçoit de nouvelles props : le rendu doit suivre la donnée sélectionnée.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <CaseSelect
                label="Santé financière :"
                cases={HEALTH_CONTRACT_CASES}
                value={liveHealth}
                onChange={setLiveHealth}
                dark={dark}
              />
              <div data-testid="live-health">
                <FinancialHealth state={HEALTH_CONTRACT_CASES[liveHealth].state} {...common} />
              </div>
            </div>
            <div>
              <CaseSelect
                label="Patrimoine :"
                cases={NET_WORTH_CASES}
                value={liveNetWorth}
                onChange={setLiveNetWorth}
                dark={dark}
              />
              <div data-testid="live-networth">
                <NetWorthBreakdown state={NET_WORTH_CASES[liveNetWorth].state} {...common} />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="g-health">
          <h2 id="g-health" className="mb-3 text-lg font-bold">
            Santé financière — contrat actuel (CashflowSummaryDto)
          </h2>
          <Grid cases={HEALTH_CONTRACT_CASES} render={(s) => <FinancialHealth state={s} {...common} />} />
        </section>

        <section aria-labelledby="g-health-proposal">
          <h2 id="g-health-proposal" className="mb-1 text-lg font-bold">
            Santé financière — proposition « inputs » (à valider avec Victor et Ishak)
          </h2>
          <p className="mb-3 text-sm opacity-80">Même réponse, avec les entrées du calcul pour afficher la cascade.</p>
          <Grid cases={HEALTH_PROPOSAL_CASES} render={(s) => <FinancialHealth state={s} {...common} />} />
        </section>

        <section aria-labelledby="g-networth">
          <h2 id="g-networth" className="mb-3 text-lg font-bold">
            Répartition du patrimoine — NetWorthSummaryDto
          </h2>
          <Grid cases={NET_WORTH_CASES} render={(s) => <NetWorthBreakdown state={s} {...common} />} />
        </section>
      </div>
    </main>
  );
}
