import React from 'react';
import { Building2 } from 'lucide-react';
import type { BankAccountDto } from '@pathly/shared-types';
import { formatCurrency, maskIban, sumBalances } from '@/lib/dashboard/format';
import { resolveInstitution } from '@/lib/institutions';
import type { RemoteState } from '@/lib/dashboard/types';
import { CARD, MUTED_TEXT } from './styles';
import { SkeletonRows, StateMessage } from './StateMessage';

const ACCOUNT_TYPE_LABELS: Record<BankAccountDto['type'], string> = {
  CHECKING: 'Compte courant',
  SAVINGS: 'Épargne',
  LOAN: 'Crédit',
  INVESTMENT: 'Investissement',
  MEAL_VOUCHER: 'Titres-restaurant',
  OTHER: 'Autre',
};

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/);
  const letters = words.length > 1 ? words.slice(0, 2).map((word) => word[0]).join('') : name.slice(0, 2);
  return letters.toUpperCase();
}

function AccountCard({ account }: { account: BankAccountDto }): React.JSX.Element {
  const institution = resolveInstitution(account.institutionName);
  const iban = maskIban(account.iban);
  const negative = account.currentBalance < 0;
  return (
    <li className={`${CARD} space-y-3 p-5`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black"
            style={{
              backgroundColor: institution?.primaryColor ?? '#475569',
              color: institution?.textColor ?? '#FFFFFF',
            }}
          >
            {initialsOf(institution?.shortName ?? account.institutionName)}
          </span>
          <span className={`truncate text-xs font-bold uppercase tracking-wider ${MUTED_TEXT}`}>
            {account.institutionName}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {ACCOUNT_TYPE_LABELS[account.type]}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{account.name}</h3>
        <p
          className={`text-2xl font-black ${negative ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}
        >
          {formatCurrency(account.currentBalance, account.currency)}
        </p>
      </div>
      {iban && <p className={`text-xs font-medium ${MUTED_TEXT}`}>{iban}</p>}
    </li>
  );
}

interface AccountsSectionProps {
  state: RemoteState<BankAccountDto[]>;
  onRetry: () => void;
}

export function AccountsSection({ state, onRetry }: AccountsSectionProps): React.JSX.Element {
  return (
    <section id="comptes" aria-labelledby="comptes-title" className="scroll-mt-28 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="comptes-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Building2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          Mes comptes
        </h2>
        {state.status === 'ready' && (
          <p className={`text-xs font-medium ${MUTED_TEXT}`}>
            Somme des soldes affichés : <strong>{formatCurrency(sumBalances(state.data))}</strong> (n’est pas un patrimoine net)
          </p>
        )}
      </div>

      {state.status === 'loading' && (
        <div role="status" aria-label="Chargement des comptes">
          <SkeletonRows rows={2} />
        </div>
      )}
      {state.status === 'empty' && (
        <StateMessage
          kind="empty"
          title="Aucun compte pour le moment"
          description="Importez un relevé pour alimenter vos comptes. Aucun solde n’est affiché tant qu’aucune donnée n’existe."
        />
      )}
      {state.status === 'error' && (
        <StateMessage kind="error" title="Impossible d’afficher les comptes" description={state.message} onRetry={onRetry} />
      )}
      {state.status === 'ready' && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {state.data.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </ul>
      )}
    </section>
  );
}
