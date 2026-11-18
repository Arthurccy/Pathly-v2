import type { BankTransactionDto } from '@pathly/shared-types';
import { isInternalTransfer, monthOf, sumAmounts } from './format';

export const ALL_MONTHS = 'ALL';
export const ALL_CATEGORIES = 'ALL';
export const UNCATEGORIZED = 'Non catégorisé';

export interface TransactionFilters {
  month: string;
  query: string;
  category: string;
}

export interface MonthTotals {
  income: number;
  expenses: number;
  net: number;
  countedTransactions: number;
}

export function categoryOf(tx: BankTransactionDto): string {
  return tx.category?.trim() || UNCATEGORIZED;
}

export function labelOf(tx: BankTransactionDto): string {
  return tx.cleanedDescription?.trim() || tx.rawDescription;
}

export function sortByDateDesc(transactions: BankTransactionDto[]): BankTransactionDto[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

/** Mois présents dans les opérations, du plus récent au plus ancien. */
export function listMonths(transactions: BankTransactionDto[]): string[] {
  return Array.from(new Set(transactions.map((tx) => monthOf(tx.date)))).sort((a, b) =>
    b.localeCompare(a),
  );
}

export function listCategories(transactions: BankTransactionDto[]): string[] {
  return Array.from(new Set(transactions.map(categoryOf))).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function filterTransactions(
  transactions: BankTransactionDto[],
  { month, query, category }: TransactionFilters,
): BankTransactionDto[] {
  const needle = query.trim().toLowerCase();
  return transactions.filter((tx) => {
    if (month !== ALL_MONTHS && monthOf(tx.date) !== month) return false;
    if (category !== ALL_CATEGORIES && categoryOf(tx) !== category) return false;
    if (!needle) return true;
    return (
      labelOf(tx).toLowerCase().includes(needle) ||
      tx.rawDescription.toLowerCase().includes(needle) ||
      categoryOf(tx).toLowerCase().includes(needle)
    );
  });
}

/**
 * Totaux informatifs des opérations affichées. Les virements internes et les opérations exclues
 * ne sont pas comptés ; ce n'est pas une estimation de trésorerie (module Safe-to-Spend séparé).
 */
export function summarizeTransactions(transactions: BankTransactionDto[]): MonthTotals {
  const counted = transactions.filter((tx) => !tx.isExcluded && !isInternalTransfer(tx));
  const income = sumAmounts(counted.filter((tx) => tx.amount > 0).map((tx) => tx.amount));
  const expenses = sumAmounts(counted.filter((tx) => tx.amount < 0).map((tx) => -tx.amount));
  return {
    income,
    expenses,
    net: sumAmounts([income, -expenses]),
    countedTransactions: counted.length,
  };
}
