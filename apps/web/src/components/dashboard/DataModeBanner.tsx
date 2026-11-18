import React from 'react';
import { Info } from 'lucide-react';
import type { DataSourceChoice } from '@/lib/dashboard/types';

export function DataModeBanner({ source }: { source: DataSourceChoice }): React.JSX.Element {
  const isDemo = source !== 'api';
  return (
    <div
      role="note"
      data-mode={isDemo ? 'demo' : 'api'}
      className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
      <p className="leading-relaxed">
        {isDemo ? (
          <>
            <strong>Données de démonstration fictives.</strong> Les comptes et opérations affichés ne proviennent d’aucune
            banque ni d’aucun import ; ils servent à valider l’interface.
          </>
        ) : (
          <>
            <strong>Source API.</strong> Les comptes et opérations sont lus via l’API de l’utilisateur connecté.
            Sans session valide, une erreur explicite est affichée.
          </>
        )}
      </p>
    </div>
  );
}
