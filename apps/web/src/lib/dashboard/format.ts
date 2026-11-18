import type { BankAccountDto, BankTransactionDto } from '@pathly/shared-types';

export const INTERNAL_TRANSFER_CATEGORY = 'Virement Interne';

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
}

export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const name = MONTH_NAMES[Number(month) - 1];
  return name ? `${name} ${year}` : monthKey;
}

/** Le client n'affiche jamais un IBAN complet. Une valeur déjà masquée est conservée telle quelle. */
export function maskIban(iban: string | null | undefined): string | null {
  if (!iban) return null;
  if (iban.includes('•')) return iban;
  const compact = iban.replace(/\s+/g, '');
  if (compact.length <= 8) return '••••';
  return `${compact.slice(0, 4)} •••• •••• ${compact.slice(-4)}`;
}

/** Somme calculée en centimes entiers pour éviter les écarts d'arrondi flottant. */
export function sumAmounts(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + Math.round(amount * 100), 0) / 100;
}

export function sumBalances(accounts: BankAccountDto[]): number {
  return sumAmounts(accounts.map((account) => account.currentBalance));
}

export function isInternalTransfer(tx: BankTransactionDto): boolean {
  return tx.category === INTERNAL_TRANSFER_CATEGORY;
}
