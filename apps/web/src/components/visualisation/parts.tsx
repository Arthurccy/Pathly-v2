'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';
import type { MotionPreference, VisualTone } from './contracts';

/** true si le composant doit s'afficher sans mouvement. */
export function useStaticRendering(motion: MotionPreference = 'auto'): boolean {
  const prefersReduced = useReducedMotion();
  return motion === 'reduced' || prefersReduced === true;
}

export interface ToneClasses {
  card: string;
  title: string;
  muted: string;
  track: string;
  divider: string;
  skeleton: string;
  issue: string;
  badge: string;
}

export function toneClasses(tone: VisualTone = 'light'): ToneClasses {
  return tone === 'dark'
    ? {
        card: 'bg-slate-900/70 border-slate-700/60 text-slate-100',
        title: 'text-white',
        muted: 'text-slate-400',
        track: 'bg-slate-800',
        divider: 'border-slate-700/60',
        skeleton: 'bg-slate-800',
        issue: 'bg-amber-500/10 border-amber-500/40 text-amber-200',
        badge: 'bg-slate-800 text-slate-300 border-slate-700',
      }
    : {
        card: 'bg-white border-slate-200 text-slate-900',
        title: 'text-slate-900',
        muted: 'text-slate-500',
        track: 'bg-slate-100',
        divider: 'border-slate-200',
        skeleton: 'bg-slate-200',
        issue: 'bg-amber-50 border-amber-300 text-amber-900',
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
      };
}

/**
 * Motifs de remplissage : chaque série a une texture distincte en plus de sa couleur,
 * pour ne pas porter l'information uniquement par la couleur.
 */
export const FILL_STYLES = {
  solidEmerald: { backgroundColor: '#10b981' },
  stripesSky: {
    backgroundColor: '#0ea5e9',
    backgroundImage:
      'repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 3px, transparent 3px 7px)',
  },
  dotsAmber: {
    backgroundColor: '#f59e0b',
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.55) 1.2px, transparent 1.3px)',
    backgroundSize: '6px 6px',
  },
  hatchRose: {
    backgroundColor: '#e11d48',
    backgroundImage:
      'repeating-linear-gradient(-45deg, rgba(255,255,255,0.4) 0 2px, transparent 2px 6px)',
  },
  solidSlate: { backgroundColor: '#64748b' },
  stripesSlate: {
    backgroundColor: '#94a3b8',
    backgroundImage:
      'repeating-linear-gradient(45deg, rgba(255,255,255,0.45) 0 2px, transparent 2px 6px)',
  },
} satisfies Record<string, React.CSSProperties>;

export type FillKey = keyof typeof FILL_STYLES;

export function Swatch({ fill }: { fill: FillKey }): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 shrink-0 rounded-sm"
      style={FILL_STYLES[fill]}
    />
  );
}

interface CardProps {
  tone?: VisualTone;
  titleId: string;
  title: string;
  subtitle?: string;
  sourceLabel?: string;
  busy?: boolean;
  children: React.ReactNode;
}

export function VisualCard({
  tone,
  titleId,
  title,
  subtitle,
  sourceLabel,
  busy,
  children,
}: CardProps): React.JSX.Element {
  const t = toneClasses(tone);
  return (
    <section
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      className={`rounded-2xl border p-5 shadow-sm ${t.card}`}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={titleId} className={`text-base font-bold ${t.title}`}>
            {title}
          </h2>
          {subtitle && <p className={`text-xs ${t.muted}`}>{subtitle}</p>}
        </div>
        {sourceLabel && (
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${t.badge}`}>
            {sourceLabel}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

export function LoadingBlock({ tone, label }: { tone?: VisualTone; label: string }): React.JSX.Element {
  const t = toneClasses(tone);
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-3">
        <div className={`h-7 w-40 rounded ${t.skeleton}`} />
        <div className={`h-4 w-full rounded ${t.skeleton}`} />
        <div className={`h-4 w-3/4 rounded ${t.skeleton}`} />
      </div>
    </div>
  );
}

export function EmptyBlock({ tone, children }: { tone?: VisualTone; children: React.ReactNode }): React.JSX.Element {
  const t = toneClasses(tone);
  return <p className={`py-6 text-center text-sm ${t.muted}`}>{children}</p>;
}

export function ErrorBlock({ message }: { message: string }): React.JSX.Element {
  return (
    <p
      role="alert"
      className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800"
    >
      <span aria-hidden="true">⚠ </span>
      {message}
    </p>
  );
}

export function IssuesList({ tone, issues }: { tone?: VisualTone; issues: string[] }): React.JSX.Element | null {
  if (issues.length === 0) return null;
  const t = toneClasses(tone);
  return (
    <div role="status" className={`mt-4 rounded-lg border px-3 py-2 text-xs ${t.issue}`}>
      <p className="font-semibold">Vérification des données reçues</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}
