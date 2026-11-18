import React from 'react';
import { Calendar } from 'lucide-react';
import { formatMonth } from '@/lib/dashboard/format';
import { ALL_MONTHS } from '@/lib/dashboard/transactions-view';
import { FOCUS_RING } from './styles';

interface MonthSelectorProps {
  months: string[];
  selected: string;
  onSelect: (month: string) => void;
}

export function MonthSelector({ months, selected, onSelect }: MonthSelectorProps): React.JSX.Element {
  const options = [...months.map((month) => ({ key: month, label: formatMonth(month) })), { key: ALL_MONTHS, label: 'Toutes les périodes' }];
  return (
    <div role="group" aria-label="Période affichée" className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        <Calendar className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        Mois
      </span>
      {options.map((option) => {
        const isSelected = option.key === selected;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.key)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${FOCUS_RING} ${
              isSelected
                ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
