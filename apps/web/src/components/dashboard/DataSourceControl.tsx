import React from 'react';
import type { DataSourceChoice } from '@/lib/dashboard/types';
import { FIELD } from './styles';

export const DATA_SOURCE_OPTIONS: { value: DataSourceChoice; label: string }[] = [
  { value: 'demo:nominal', label: 'Démo — données fictives' },
  { value: 'demo:empty', label: 'Démo — aucune donnée' },
  { value: 'demo:error', label: 'Démo — erreur simulée' },
  { value: 'api', label: 'API réelle (session requise)' },
];

interface DataSourceControlProps {
  value: DataSourceChoice;
  onChange: (value: DataSourceChoice) => void;
}

export function DataSourceControl({ value, onChange }: DataSourceControlProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="data-source" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        Source
      </label>
      <select
        id="data-source"
        value={value}
        onChange={(event) => onChange(event.target.value as DataSourceChoice)}
        className={`${FIELD} max-w-[13rem] font-semibold sm:max-w-none`}
      >
        {DATA_SOURCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
