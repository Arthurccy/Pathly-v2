'use client';

import React, { type ReactNode } from 'react';
import { LayoutGrid } from 'lucide-react';
import type { WidgetSlotDefinition } from './widget-slots';
import { CARD } from './styles';

class WidgetErrorBoundary extends React.Component<
  { title: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          Le widget « {this.props.title} » a rencontré une erreur d’affichage. Le reste du dashboard reste utilisable.
        </p>
      );
    }
    return this.props.children;
  }
}

interface WidgetSlotProps {
  slot: WidgetSlotDefinition;
  children?: ReactNode;
}

/** Point de montage d'un widget ; sans widget fourni, affiche un emplacement réservé identifié. */
export function WidgetSlot({ slot, children }: WidgetSlotProps): React.JSX.Element {
  const headingId = `slot-${slot.id}-title`;
  return (
    <section
      aria-labelledby={headingId}
      data-widget-slot={slot.id}
      className={`${CARD} p-5 space-y-2`}
    >
      <h2 id={headingId} className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
        <LayoutGrid className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        {slot.title}
      </h2>
      {children ? (
        <WidgetErrorBoundary title={slot.title}>{children}</WidgetErrorBoundary>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-600 dark:text-slate-300">
          <p className="font-semibold">Emplacement réservé — pas encore raccordé ({slot.owner}).</p>
          <p>{slot.expected}</p>
        </div>
      )}
    </section>
  );
}
