import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/dashboard/format';
import type { MonthTotals } from '@/lib/dashboard/transactions-view';
import { CARD, MUTED_TEXT } from './styles';

interface MonthSummaryProps {
  periodLabel: string;
  totals: MonthTotals;
}

export function MonthSummary({ periodLabel, totals }: MonthSummaryProps): React.JSX.Element {
  const positive = totals.net >= 0;
  const items = [
    {
      label: 'Revenus',
      value: `+${formatCurrency(totals.income)}`,
      tone: 'text-emerald-700 dark:text-emerald-400',
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />,
    },
    {
      label: 'Dépenses',
      value: `-${formatCurrency(totals.expenses)}`,
      tone: 'text-rose-700 dark:text-rose-400',
      icon: <TrendingDown className="h-4 w-4 text-rose-600" aria-hidden="true" />,
    },
    {
      label: 'Solde des opérations',
      value: `${positive ? '+' : ''}${formatCurrency(totals.net)}`,
      tone: positive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400',
      icon: positive ? (
        <ArrowUpRight className="h-4 w-4 text-emerald-600" aria-hidden="true" />
      ) : (
        <ArrowDownLeft className="h-4 w-4 text-rose-600" aria-hidden="true" />
      ),
    },
  ];

  return (
    <section aria-label={`Totaux des opérations — ${periodLabel}`} className="space-y-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className={`${CARD} space-y-1 p-5`}>
            <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${MUTED_TEXT}`}>
              <span>{item.label}</span>
              {item.icon}
            </div>
            <p className={`text-2xl font-black tracking-tight ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>
      <p className={`text-xs ${MUTED_TEXT}`}>
        {periodLabel} : {totals.countedTransactions} opération(s) comptées, hors virements internes et opérations exclues.
        Information calculée sur les opérations chargées ; ce n’est pas une estimation de trésorerie.
      </p>
    </section>
  );
}
