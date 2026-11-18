'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRightLeft, CreditCard, Search, TrendingDown, TrendingUp } from 'lucide-react';
import type { BankTransactionDto } from '@pathly/shared-types';
import { formatCurrency, formatDate, formatMonth, isInternalTransfer } from '@/lib/dashboard/format';
import type { RemoteState } from '@/lib/dashboard/types';
import {
  ALL_CATEGORIES,
  ALL_MONTHS,
  categoryOf,
  filterTransactions,
  labelOf,
  listCategories,
  sortByDateDesc,
} from '@/lib/dashboard/transactions-view';
import { BUTTON_SECONDARY, CARD, FIELD, MUTED_TEXT } from './styles';
import { SkeletonRows, StateMessage } from './StateMessage';

function TransactionRow({
  tx,
  accountName,
}: {
  tx: BankTransactionDto;
  accountName?: string;
}): React.JSX.Element {
  const transfer = isInternalTransfer(tx);
  const positive = tx.amount > 0;
  const amountTone = transfer
    ? 'text-blue-700 dark:text-blue-400'
    : positive
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-rose-700 dark:text-rose-400';
  const Icon = transfer ? ArrowRightLeft : positive ? TrendingUp : TrendingDown;

  return (
    <li className="flex items-center justify-between gap-4 px-1 py-3.5 sm:px-3">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            transfer
              ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-400'
              : positive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'border-slate-200 bg-slate-100 text-rose-600 dark:border-slate-600 dark:bg-slate-800'
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-slate-900 sm:truncate dark:text-white" title={tx.rawDescription}>
            {labelOf(tx)}
          </p>
          <p className={`flex flex-wrap items-center gap-x-2 text-xs font-medium ${MUTED_TEXT}`}>
            <time dateTime={tx.date}>{formatDate(tx.date)}</time>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{categoryOf(tx)}</span>
            {accountName && (
              <>
                <span aria-hidden="true" className="hidden sm:inline">
                  •
                </span>
                <span className="hidden sm:inline">{accountName}</span>
              </>
            )}
            {tx.isPredicted && <span className="font-semibold text-amber-700 dark:text-amber-300">Prévue</span>}
            {tx.isExcluded && <span className="font-semibold text-amber-700 dark:text-amber-300">Exclue des totaux</span>}
          </p>
        </div>
      </div>
      <span className={`shrink-0 text-sm font-black sm:text-base ${amountTone}`}>
        {positive ? '+' : ''}
        {formatCurrency(tx.amount, tx.currency)}
      </span>
    </li>
  );
}

interface TransactionsSectionProps {
  state: RemoteState<BankTransactionDto[]>;
  month: string;
  accountNames: Record<string, string>;
  notice?: string;
  onRetry: () => void;
}

export function TransactionsSection({
  state,
  month,
  accountNames,
  notice,
  onRetry,
}: TransactionsSectionProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);

  const transactions = state.status === 'ready' ? state.data : null;
  const categories = useMemo(() => (transactions ? listCategories(transactions) : []), [transactions]);
  const visible = useMemo(
    () => (transactions ? sortByDateDesc(filterTransactions(transactions, { month, query, category })) : []),
    [transactions, month, query, category],
  );
  const hasFilters = query !== '' || category !== ALL_CATEGORIES;
  const periodLabel = month === ALL_MONTHS ? 'toutes les périodes' : formatMonth(month);

  return (
    <section id="operations" aria-labelledby="operations-title" className={`${CARD} scroll-mt-28 space-y-4 p-4 sm:p-6`}>
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h2 id="operations-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <CreditCard className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            Opérations
          </h2>
          {transactions && (
            <p className={`text-xs font-medium ${MUTED_TEXT}`} aria-live="polite">
              {visible.length} opération(s) affichée(s) — {periodLabel}
            </p>
          )}
        </div>

        {transactions && (
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative">
              <label htmlFor="tx-search" className="sr-only">
                Rechercher une opération
              </label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                id="tx-search"
                type="search"
                placeholder="Rechercher une opération…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`${FIELD} w-full pl-9 sm:w-64`}
              />
            </div>
            <div>
              <label htmlFor="tx-category" className="sr-only">
                Filtrer par catégorie
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`${FIELD} w-full font-semibold sm:w-auto`}
              >
                <option value={ALL_CATEGORIES}>Toutes catégories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {state.status === 'loading' && (
        <div role="status" aria-label="Chargement des opérations">
          <SkeletonRows rows={5} />
        </div>
      )}
      {state.status === 'empty' && (
        <StateMessage
          kind="empty"
          title="Aucune opération pour le moment"
          description="Les opérations apparaîtront ici après un import ou une synchronisation."
        />
      )}
      {state.status === 'error' && (
        <StateMessage kind="error" title="Impossible d’afficher les opérations" description={state.message} onRetry={onRetry} />
      )}
      {state.status === 'ready' && visible.length === 0 && (
        <div className="space-y-3 py-8 text-center">
          <p className={`text-sm font-medium ${MUTED_TEXT}`}>Aucune opération ne correspond à la période et aux filtres choisis.</p>
          {hasFilters && (
            <button
              type="button"
              className={BUTTON_SECONDARY}
              onClick={() => {
                setQuery('');
                setCategory(ALL_CATEGORIES);
              }}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
      {state.status === 'ready' && visible.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {visible.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} accountName={accountNames[tx.accountId]} />
          ))}
        </ul>
      )}
      {state.status === 'ready' && notice && <p className={`text-xs ${MUTED_TEXT}`}>{notice}</p>}
    </section>
  );
}
