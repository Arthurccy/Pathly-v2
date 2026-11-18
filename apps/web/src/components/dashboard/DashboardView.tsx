'use client';

import React, { useMemo, useState } from 'react';
import { useDashboardData } from '@/lib/dashboard/use-dashboard-data';
import { usePhysicalAssets } from '@/lib/dashboard/use-physical-assets';
import type { DataSourceChoice } from '@/lib/dashboard/types';
import { formatMonth } from '@/lib/dashboard/format';
import { ALL_MONTHS, filterTransactions, listMonths, summarizeTransactions } from '@/lib/dashboard/transactions-view';
import { API_TRANSACTIONS_LIMIT } from '@/lib/dashboard/api-source';
import { AccountsSection } from './AccountsSection';
import { DashboardHeader } from './DashboardHeader';
import { DataModeBanner } from './DataModeBanner';
import { MonthSelector } from './MonthSelector';
import { MonthSummary } from './MonthSummary';
import { PhysicalAssetsSection } from './PhysicalAssetsSection';
import { TransactionsSection } from './TransactionsSection';
import { WidgetSlot } from './WidgetSlot';
import { WIDGET_SLOTS, type DashboardWidgetContext, type DashboardWidgets } from './widget-slots';

interface DashboardViewProps {
  /** Widgets montés dans les emplacements réservés ; un emplacement sans widget affiche un repère. */
  widgets?: DashboardWidgets;
  initialSource?: DataSourceChoice;
}

export function DashboardView({ widgets = {}, initialSource = 'demo:nominal' }: DashboardViewProps): React.JSX.Element {
  const [source, setSource] = useState<DataSourceChoice>(initialSource);
  const [requestedMonth, setRequestedMonth] = useState<string | null>(null);
  const { accounts, transactions, reload } = useDashboardData(source);
  const physicalAssets = usePhysicalAssets(source);

  const transactionList = transactions.status === 'ready' ? transactions.data : [];
  const accountList = accounts.status === 'ready' ? accounts.data : [];
  const months = useMemo(() => listMonths(transactionList), [transactionList]);

  const month =
    requestedMonth === ALL_MONTHS || (requestedMonth && months.includes(requestedMonth))
      ? requestedMonth
      : (months[0] ?? ALL_MONTHS);
  const periodLabel = month === ALL_MONTHS ? 'Toutes les périodes' : formatMonth(month);

  const totals = useMemo(
    () => summarizeTransactions(filterTransactions(transactionList, { month, query: '', category: 'ALL' })),
    [transactionList, month],
  );
  const accountNames = useMemo(
    () => Object.fromEntries(accountList.map((account) => [account.id, account.name])),
    [accountList],
  );

  const widgetContext: DashboardWidgetContext = {
    month,
    isDemo: source !== 'api',
    accounts: accountList,
    transactions: transactionList,
    onDataChanged: reload,
  };

  const truncated = source === 'api' && transactionList.length >= API_TRANSACTIONS_LIMIT;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/90 text-slate-900 dark:bg-[#070b14] dark:text-slate-100">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-950"
      >
        Aller au contenu
      </a>
      <DashboardHeader source={source} onSourceChange={setSource} />

      <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-8">
        <h1 className="sr-only">Tableau de bord Pathly</h1>
        <DataModeBanner source={source} />

        {months.length > 0 && <MonthSelector months={months} selected={month} onSelect={setRequestedMonth} />}

        {transactions.status === 'ready' && <MonthSummary periodLabel={periodLabel} totals={totals} />}

        <div id="widgets" className="grid scroll-mt-28 grid-cols-1 gap-4 md:grid-cols-2">
          {WIDGET_SLOTS.map((slot) => {
            const render = widgets[slot.id];
            return (
              <WidgetSlot key={slot.id} slot={slot}>
                {render?.(widgetContext)}
              </WidgetSlot>
            );
          })}
        </div>

        <AccountsSection state={accounts} onRetry={reload} />

        <PhysicalAssetsSection
          key={source}
          state={physicalAssets.assets}
          isDemo={source !== 'api'}
          onCreate={physicalAssets.create}
          onRetry={physicalAssets.reload}
        />

        <TransactionsSection
          state={transactions}
          month={month}
          accountNames={accountNames}
          notice={truncated ? `Affichage limité aux ${API_TRANSACTIONS_LIMIT} dernières opérations (pagination non gérée).` : undefined}
          onRetry={reload}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-[#070b14] dark:text-slate-400">
        Pathly V2 — démonstrateur pédagogique. Les données de démonstration sont fictives.
      </footer>
    </div>
  );
}
