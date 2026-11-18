/**
 * DOUBLURES DE TEST — données fictives et déterministes (contrats S2).
 * Aucune donnée réelle. Utilisées uniquement par les fichiers *.spec.ts ;
 * exclues du build (tsconfig.build.json).
 */
import type { BankAccountDto, BankTransactionDto } from '@pathly/shared-types';
import { AccountsRepository } from '../modules/accounts/accounts.repository';
import { TransactionPage, TransactionsRepository } from '../modules/transactions/transactions.repository';

export const USER_A = '00000000-0000-4000-8000-00000000000a';
export const USER_B = '00000000-0000-4000-8000-00000000000b';

/** Compte fictif A (contrat S2) : 1 500 € sur un compte courant. */
export const ACCOUNT_A: BankAccountDto = {
  id: '11111111-1111-4111-8111-11111111111a',
  powensAccountId: null,
  name: 'Compte courant fictif A',
  type: 'CHECKING',
  currentBalance: 1500,
  currency: 'EUR',
  iban: null,
  institutionName: 'Banque Fictive',
  institutionLogo: null,
  isFavorite: true,
  updatedAt: '2026-10-15T08:00:00.000Z',
};

/** Livret fictif de A : ne doit pas entrer dans le solde disponible. */
export const SAVINGS_A: BankAccountDto = {
  ...ACCOUNT_A,
  id: '11111111-1111-4111-8111-1111111111a2',
  name: 'Livret fictif A',
  type: 'SAVINGS',
  currentBalance: 5000,
  isFavorite: false,
};

export const ACCOUNT_B: BankAccountDto = {
  ...ACCOUNT_A,
  id: '22222222-2222-4222-8222-22222222222b',
  name: 'Compte courant fictif B',
  currentBalance: 99,
};

/** Transaction A1 (contrat S2) : −42,50 € le 2026-10-12. */
export const TX_A1: BankTransactionDto = {
  id: '33333333-3333-4333-8333-3333333333a1',
  accountId: ACCOUNT_A.id,
  powensTransactionId: null,
  date: '2026-10-12',
  amount: -42.5,
  currency: 'EUR',
  rawDescription: 'CB MONOPRIX PARIS',
  cleanedDescription: null,
  category: null,
  isPredicted: false,
  isExcluded: false,
};

export const TX_A2: BankTransactionDto = {
  ...TX_A1,
  id: '33333333-3333-4333-8333-3333333333a2',
  date: '2026-10-13',
  amount: 2100,
  rawDescription: 'SALAIRE',
};

export const TX_B1: BankTransactionDto = {
  ...TX_A1,
  id: '44444444-4444-4444-8444-4444444444b1',
  accountId: ACCOUNT_B.id,
  rawDescription: 'OPERATION DE B',
};

export class InMemoryAccountsRepository extends AccountsRepository {
  constructor(private readonly byUser: Record<string, BankAccountDto[]>) {
    super();
  }

  async findByUser(userId: string): Promise<BankAccountDto[]> {
    return [...(this.byUser[userId] ?? [])];
  }

  async findByIdForUser(userId: string, accountId: string): Promise<BankAccountDto | null> {
    return (this.byUser[userId] ?? []).find((a) => a.id === accountId) ?? null;
  }
}

export class InMemoryTransactionsRepository extends TransactionsRepository {
  constructor(private readonly byUser: Record<string, BankTransactionDto[]>) {
    super();
  }

  async findByUser(userId: string, { limit, cursor }: TransactionPage): Promise<BankTransactionDto[]> {
    const sorted = [...(this.byUser[userId] ?? [])].sort(
      (x, y) => y.date.localeCompare(x.date) || y.id.localeCompare(x.id),
    );
    const start = cursor ? sorted.findIndex((t) => t.id === cursor) : -1;
    if (cursor && start < 0) return [];
    return sorted.slice(start + 1, start + 1 + limit);
  }
}
