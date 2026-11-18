'use client';

import React, { useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CashflowStatus, FinancialHealthProps } from './contracts';
import {
  STATUS_LABELS,
  computeHealthView,
  formatEur,
  formatSignedEur,
  type HealthStep,
  type HealthStepKey,
} from './compute';
import {
  EmptyBlock,
  ErrorBlock,
  FILL_STYLES,
  IssuesList,
  LoadingBlock,
  VisualCard,
  toneClasses,
  useStaticRendering,
  type FillKey,
} from './parts';

const STATUS_STYLE: Record<CashflowStatus, { icon: string; className: string }> = {
  AVAILABLE: { icon: '✓', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  SHORTFALL: { icon: '!', className: 'bg-rose-100 text-rose-800 border-rose-300' },
  INCOMPLETE: { icon: '?', className: 'bg-slate-100 text-slate-700 border-slate-300' },
};

function stepFill(key: HealthStepKey, resultCents: number): FillKey {
  if (key === 'balance') return 'solidEmerald';
  if (key === 'expenses') return 'solidSlate';
  if (key === 'reserve') return 'stripesSlate';
  return resultCents < 0 ? 'hatchRose' : 'solidEmerald';
}

function formatMonth(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month;
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function formatDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

function describe(steps: HealthStep[]): string {
  const [balance, expenses, reserve, result] = steps;
  return (
    `${balance.label} ${formatEur(balance.deltaCents)}, moins ${expenses.label.toLowerCase()} ` +
    `${formatEur(-expenses.deltaCents)}, moins ${reserve.label.toLowerCase()} ${formatEur(-reserve.deltaCents)} : ` +
    `${result.label.toLowerCase()} ${formatEur(result.deltaCents)}.`
  );
}

function StatusBadge({ status }: { status: CashflowStatus }): React.JSX.Element {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${s.className}`}>
      <span aria-hidden="true">{s.icon}</span>
      {STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Santé financière : cascade solde → charges restantes → réserve → reste à dépenser.
 * Un déficit reste négatif (jamais ramené à zéro) ; une donnée manquante n'est jamais 0.
 */
export function FinancialHealth({
  state,
  tone = 'light',
  motion: motionPref = 'auto',
  sourceLabel,
}: FinancialHealthProps): React.JSX.Element {
  const titleId = useId();
  const isStatic = useStaticRendering(motionPref);
  const t = toneClasses(tone);
  const view = useMemo(() => (state.status === 'ready' ? computeHealthView(state.data) : null), [state]);

  const title = 'Santé financière';
  const common = { tone, titleId, sourceLabel };

  if (state.status === 'loading') {
    return (
      <VisualCard {...common} title={title} busy>
        <LoadingBlock tone={tone} label="Chargement de l'estimation de trésorerie…" />
      </VisualCard>
    );
  }
  if (state.status === 'error') {
    return (
      <VisualCard {...common} title={title}>
        <ErrorBlock message={state.message} />
      </VisualCard>
    );
  }
  if (state.status === 'empty' || !view) {
    return (
      <VisualCard {...common} title={title}>
        <EmptyBlock tone={tone}>Aucune estimation de trésorerie disponible pour le moment.</EmptyBlock>
      </VisualCard>
    );
  }

  const data = state.data;
  const subtitle = `${formatMonth(data.month)} · estimation au ${formatDay(data.asOfDate)}`;
  const resultCents = view.resultCents;

  return (
    <VisualCard {...common} title={`${title} — reste à dépenser`} subtitle={subtitle}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className={`text-xs font-medium ${t.muted}`}>Reste à dépenser sur la période</p>
          <p
            className={`text-3xl font-extrabold tabular-nums ${
              resultCents === null ? t.muted : resultCents < 0 ? 'text-rose-600' : t.title
            }`}
          >
            {resultCents === null ? 'Indisponible' : formatEur(resultCents)}
          </p>
        </div>
        <StatusBadge status={view.status} />
      </div>

      {view.kind === 'waterfall' ? (
        <figure className="mt-4" role="img" aria-label={describe(view.steps)}>
          <div className="space-y-2" aria-hidden="true">
            {view.steps.map((step, index) => (
              <div
                key={step.key}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[minmax(7rem,9rem)_1fr_auto] ${
                  step.key === 'result' ? `border-t pt-2 font-semibold ${t.divider}` : ''
                }`}
              >
                <span className="truncate">{step.label}</span>
                {/* Mobile : barre sur sa propre ligne, pleine largeur, sous le libellé et la valeur. */}
                <div className={`relative order-last col-span-2 h-5 rounded sm:order-none sm:col-span-1 ${t.track}`}>
                  {view.zeroPct > 0 && (
                    <div
                      className="absolute inset-y-[-3px] w-px bg-slate-500"
                      style={{ left: `${view.zeroPct}%` }}
                    />
                  )}
                  <motion.div
                    className="absolute inset-y-0 rounded"
                    style={{
                      left: `${step.leftPct}%`,
                      width: `${Math.max(step.widthPct, step.deltaCents === 0 ? 0 : 0.5)}%`,
                      ...FILL_STYLES[stepFill(step.key, view.resultCents)],
                    }}
                    {...(isStatic
                      ? { initial: false as const }
                      : {
                          initial: { opacity: 0, x: -8 },
                          animate: { opacity: 1, x: 0 },
                          transition: { duration: 0.35, delay: index * 0.12, ease: 'easeOut' as const },
                        })}
                  />
                </div>
                <span
                  className={`w-24 text-right tabular-nums ${
                    step.key === 'result' && step.deltaCents < 0 ? 'text-rose-600' : ''
                  }`}
                >
                  {step.key === 'result' ? formatEur(step.deltaCents) : formatSignedEur(step.deltaCents)}
                </span>
              </div>
            ))}
          </div>
          {view.zeroPct > 0 && (
            <figcaption className={`mt-2 text-xs ${t.muted}`}>
              Le trait vertical marque 0 € : à gauche, le déficit.
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="mt-4 text-sm">
          {view.missing.length > 0 ? (
            <p>
              <span className="font-semibold">Données manquantes : </span>
              {view.missing.join(', ')}. Le reste à dépenser ne peut pas être calculé.
            </p>
          ) : (
            <p className={t.muted}>Détail du calcul non fourni : seul le résultat est affiché.</p>
          )}
        </div>
      )}

      <p className={`mt-4 text-xs ${t.muted}`}>
        Estimation : solde − charges restantes − réserve d&apos;épargne. Elle dépend des hypothèses saisies et ne
        garantit pas l&apos;absence de découvert.
      </p>

      <IssuesList tone={tone} issues={view.issues} />
    </VisualCard>
  );
}
