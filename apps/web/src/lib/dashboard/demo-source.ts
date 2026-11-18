import type { AccountType, BankAccountDto, BankTransactionDto } from '@pathly/shared-types';
import {
  MOCK_ACCOUNTS,
  MOCK_TRANSACTIONS,
  type Account,
  type Transaction,
} from '@/lib/mock-data';
import { INTERNAL_TRANSFER_CATEGORY } from './format';
import type { DataResult, DemoScenario } from './types';

/** Jeu de démonstration fictif et déterministe, exposé via les contrats partagés (BankAccountDto / BankTransactionDto). */
const ACCOUNT_TYPES: Record<Account['type'], AccountType> = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  INVESTMENT: 'INVESTMENT',
  PAYMENT: 'OTHER',
};

const DEMO_UPDATED_AT = '2026-10-27T08:00:00Z';

function toAccountDto(account: Account): BankAccountDto {
  return {
    id: account.id,
    name: account.name,
    type: ACCOUNT_TYPES[account.type],
    currentBalance: account.balance,
    currency: account.currency,
    iban: account.ibanMasked,
    institutionName: account.institution,
    institutionLogo: null,
    isFavorite: account.id === 'acc-checking',
    updatedAt: DEMO_UPDATED_AT,
  };
}

function toTransactionDto(tx: Transaction): BankTransactionDto {
  return {
    id: tx.id,
    accountId: tx.accountId,
    date: tx.date,
    amount: tx.amount,
    currency: 'EUR',
    rawDescription: tx.description,
    cleanedDescription: null,
    category: tx.isTransfer ? INTERNAL_TRANSFER_CATEGORY : tx.category,
    isPredicted: false,
    isExcluded: false,
  };
}

export const DEMO_ACCOUNTS: BankAccountDto[] = MOCK_ACCOUNTS.map(toAccountDto);
export const DEMO_TRANSACTIONS: BankTransactionDto[] = MOCK_TRANSACTIONS.map(toTransactionDto);

const DEMO_LATENCY_MS = 350;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loadDemoAccounts(scenario: DemoScenario): Promise<DataResult<BankAccountDto[]>> {
  await wait(DEMO_LATENCY_MS);
  if (scenario === 'error') {
    return {
      ok: false,
      error: { code: 'DEMO_ERROR', message: 'Erreur simulée : la liste des comptes est indisponible.' },
    };
  }
  return { ok: true, data: scenario === 'empty' ? [] : DEMO_ACCOUNTS };
}

export async function loadDemoTransactions(
  scenario: DemoScenario,
): Promise<DataResult<BankTransactionDto[]>> {
  await wait(DEMO_LATENCY_MS);
  if (scenario === 'error') {
    return {
      ok: false,
      error: { code: 'DEMO_ERROR', message: 'Erreur simulée : les opérations sont indisponibles.' },
    };
  }
  return { ok: true, data: scenario === 'empty' ? [] : DEMO_TRANSACTIONS };
}
