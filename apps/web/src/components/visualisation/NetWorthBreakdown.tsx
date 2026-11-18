'use client';

import React, { useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { NetWorthBreakdownProps } from './contracts';
import { computeNetWorthView, formatEur, type AssetKey, type NetWorthView } from './compute';
import {
  EmptyBlock,
  ErrorBlock,
  FILL_STYLES,
  IssuesList,
  LoadingBlock,
  Swatch,
  VisualCard,
  toneClasses,
  useStaticRendering,
  type FillKey,
} from './parts';

const ASSET_FILLS: Record<AssetKey, FillKey> = {
  liquidCash: 'solidEmerald',
  investedAssets: 'stripesSky',
  tangibleAssets: 'dotsAmber',
};

const percent = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

function describe(view: NetWorthView): string {
  const assets = view.segments
    .map((s) => `${s.label} ${formatEur(s.cents)}${s.cents > 0 ? ` (${percent.format(s.sharePct)} %)` : ''}`)
    .join(', ');
  return (
    `Actifs ${formatEur(view.totalAssetsCents)} : ${assets}. ` +
    `Dettes ${formatEur(view.liabilitiesCents)}, présentées séparément. ` +
    `Patrimoine net ${formatEur(view.netWorthCents)}.`
  );
}

/**
 * Répartition patrimoniale : barre des actifs empilée et barre des dettes séparée,
 * sur une échelle commune. Les dettes ne sont jamais une part du total des actifs.
 */
export function NetWorthBreakdown({
  state,
  tone = 'light',
  frame = 'card',
  motion: motionPref = 'auto',
  sourceLabel,
}: NetWorthBreakdownProps): React.JSX.Element {
  const titleId = useId();
  const isStatic = useStaticRendering(motionPref);
  const t = toneClasses(tone);
  const view = useMemo(() => (state.status === 'ready' ? computeNetWorthView(state.data) : null), [state]);

  const common = { tone, frame, titleId, title: 'Répartition du patrimoine', sourceLabel };

  if (state.status === 'loading') {
    return (
      <VisualCard {...common} busy>
        <LoadingBlock tone={tone} label="Chargement de la synthèse patrimoniale…" />
      </VisualCard>
    );
  }
  if (state.status === 'error') {
    return (
      <VisualCard {...common}>
        <ErrorBlock message={state.message} />
      </VisualCard>
    );
  }
  if (state.status === 'empty' || !view) {
    return (
      <VisualCard {...common}>
        <EmptyBlock tone={tone}>Aucune synthèse patrimoniale disponible pour le moment.</EmptyBlock>
      </VisualCard>
    );
  }

  const negative = view.netWorthCents < 0;
  const grow = isStatic
    ? { initial: false as const }
    : {
        initial: { scaleX: 0 },
        animate: { scaleX: 1 },
        transition: { duration: 0.6, ease: 'easeOut' as const },
      };

  return (
    <VisualCard {...common} subtitle="Actifs et dettes sur une échelle commune">
      <p className={`text-xs font-medium ${t.muted}`}>Patrimoine net</p>
      <p className={`text-3xl font-extrabold tabular-nums ${negative ? 'text-rose-600' : t.title}`}>
        {formatEur(view.netWorthCents)}
        {negative && <span className="ml-2 align-middle text-xs font-semibold">(négatif)</span>}
      </p>

      {view.isAllZero ? (
        <EmptyBlock tone={tone}>Aucun actif ni dette enregistré (tous les montants valent 0 €).</EmptyBlock>
      ) : (
        <figure className="mt-4" role="img" aria-label={describe(view)}>
          <div className="grid grid-cols-[4.5rem_1fr] items-center gap-x-3 gap-y-2" aria-hidden="true">
            <span className={`text-xs font-semibold ${t.muted}`}>Actifs</span>
            <div className={`h-6 overflow-hidden rounded-md ${t.track}`}>
              <motion.div className="flex h-full origin-left" {...grow}>
                {view.segments.map((s) =>
                  s.widthPct > 0 ? (
                    <div
                      key={s.key}
                      className="h-full first:rounded-l-md last:rounded-r-md"
                      style={{ width: `${s.widthPct}%`, ...FILL_STYLES[ASSET_FILLS[s.key]] }}
                    />
                  ) : null,
                )}
              </motion.div>
            </div>
            <span className={`text-xs font-semibold ${t.muted}`}>Dettes</span>
            <div className={`h-6 overflow-hidden rounded-md ${t.track}`}>
              <motion.div
                className="h-full origin-left rounded-md"
                style={{ width: `${view.liabilitiesWidthPct}%`, ...FILL_STYLES.hatchRose }}
                {...grow}
              />
            </div>
          </div>
        </figure>
      )}

      <dl className="mt-4 space-y-1.5 text-sm">
        {view.segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <Swatch fill={ASSET_FILLS[s.key]} />
            <dt className="flex-1">{s.label}</dt>
            <dd className="tabular-nums font-semibold">{formatEur(s.cents)}</dd>
            <dd className={`w-12 text-right text-xs tabular-nums ${t.muted}`}>
              {s.cents > 0 ? `${percent.format(s.sharePct)} %` : '—'}
            </dd>
          </div>
        ))}
        <div className={`flex items-center gap-2 border-t pt-1.5 ${t.divider}`}>
          <span className="inline-block h-3 w-3" aria-hidden="true" />
          <dt className="flex-1 font-semibold">Total des actifs</dt>
          <dd className="tabular-nums font-semibold">{formatEur(view.totalAssetsCents)}</dd>
          <dd className="w-12" />
        </div>
        <div className="flex items-center gap-2">
          <Swatch fill="hatchRose" />
          <dt className="flex-1">Dettes</dt>
          <dd className="tabular-nums font-semibold text-rose-600">
            {/* Une valeur négative (invalide) est affichée telle quelle et signalée plus bas. */}
            {view.liabilitiesCents >= 0 ? `− ${formatEur(view.liabilitiesCents)}` : formatEur(view.liabilitiesCents)}
          </dd>
          <dd className="w-12" />
        </div>
      </dl>

      <IssuesList tone={tone} issues={view.issues} />
    </VisualCard>
  );
}
