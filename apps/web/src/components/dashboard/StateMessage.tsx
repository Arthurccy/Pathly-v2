import React from 'react';
import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react';

interface StateMessageProps {
  kind: 'loading' | 'empty' | 'error';
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function StateMessage({ kind, title, description, onRetry }: StateMessageProps): React.JSX.Element {
  const Icon = kind === 'loading' ? Loader2 : kind === 'error' ? AlertCircle : Inbox;
  const tone =
    kind === 'error'
      ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100'
      : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100';

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-busy={kind === 'loading'}
      data-state={kind}
      className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-8 text-center ${tone}`}
    >
      <Icon
        className={`h-6 w-6 ${kind === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''}`}
        aria-hidden="true"
      />
      <p className="text-sm font-bold">{title}</p>
      {description && <p className="max-w-md text-xs leading-relaxed opacity-90">{description}</p>}
      {kind === 'error' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-rose-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Réessayer
        </button>
      )}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }): React.JSX.Element {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none dark:bg-slate-800" />
      ))}
    </div>
  );
}
