import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { DataSourceChoice } from '@/lib/dashboard/types';
import { DataSourceControl } from './DataSourceControl';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '#widgets', label: 'Synthèse' },
  { href: '#comptes', label: 'Comptes' },
  { href: '#biens', label: 'Biens' },
  { href: '#operations', label: 'Opérations' },
];

interface DashboardHeaderProps {
  source: DataSourceChoice;
  onSourceChange: (source: DataSourceChoice) => void;
}

export function DashboardHeader({ source, onSourceChange }: DashboardHeaderProps): React.JSX.Element {
  const isDemo = source !== 'api';
  return (
    <header className="z-40 border-b border-slate-200 bg-white/95 backdrop-blur sm:sticky sm:top-0 dark:border-slate-800 dark:bg-[#090e1a]/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-xl font-black text-black"
          >
            P
          </div>
          <div>
            <p className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">Pathly</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tableau de bord</p>
          </div>
        </div>

        <nav aria-label="Sections du tableau de bord" className="order-3 w-full sm:order-none sm:w-auto">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <DataSourceControl value={source} onChange={onSourceChange} />
          <ThemeToggle />
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 md:flex dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            {isDemo ? 'Profil fictif de démonstration' : 'Session utilisateur'}
          </div>
        </div>
      </div>
    </header>
  );
}
