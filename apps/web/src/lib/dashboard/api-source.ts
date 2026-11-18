import type { AccountType, BankAccountDto, BankTransactionDto } from '@pathly/shared-types';
import { ApiClient } from '@/lib/api-client';
import { getAccessToken } from './session';
import type { DataResult } from './types';

export const API_TRANSACTIONS_LIMIT = 50;

const ACCOUNT_TYPES: AccountType[] = ['CHECKING', 'SAVINGS', 'LOAN', 'INVESTMENT', 'MEAL_VOUCHER', 'OTHER'];

type Raw = Record<string, unknown>;

function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** L'API renvoie les lignes Prisma brutes : les montants `Decimal` arrivent sous forme de chaîne. */
function toAmount(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toText(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

export function normalizeAccount(raw: unknown): BankAccountDto | null {
  if (!isRecord(raw)) return null;
  const id = toText(raw.id);
  const name = toText(raw.name);
  const currentBalance = toAmount(raw.currentBalance);
  if (!id || !name || currentBalance === null) return null;

  const connection = isRecord(raw.connection) ? raw.connection : {};
  const type = ACCOUNT_TYPES.find((candidate) => candidate === raw.type) ?? 'OTHER';
  return {
    id,
    name,
    type,
    currentBalance,
    currency: toText(raw.currency) ?? 'EUR',
    iban: toText(raw.iban),
    institutionName: toText(raw.institutionName) ?? toText(connection.institutionName) ?? 'Établissement inconnu',
    institutionLogo: toText(raw.institutionLogo),
    isFavorite: raw.isFavorite === true,
    updatedAt: toText(raw.updatedAt) ?? '',
  };
}

export function normalizeTransaction(raw: unknown): BankTransactionDto | null {
  if (!isRecord(raw)) return null;
  const id = toText(raw.id);
  const accountId = toText(raw.accountId);
  const date = toText(raw.date)?.slice(0, 10);
  const amount = toAmount(raw.amount);
  const rawDescription = toText(raw.rawDescription);
  if (!id || !accountId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || amount === null || !rawDescription) {
    return null;
  }
  return {
    id,
    accountId,
    date,
    amount,
    currency: toText(raw.currency) ?? 'EUR',
    rawDescription,
    cleanedDescription: toText(raw.cleanedDescription),
    category: toText(raw.category),
    isPredicted: raw.isPredicted === true,
    isExcluded: raw.isExcluded === true,
  };
}

function normalizeList<T>(
  payload: unknown,
  normalize: (raw: unknown) => T | null,
  label: string,
): DataResult<T[]> {
  if (!Array.isArray(payload)) {
    return { ok: false, error: { code: 'INVALID_RESPONSE', message: `Réponse inattendue du serveur (${label}).` } };
  }
  const items: T[] = [];
  for (const [index, raw] of payload.entries()) {
    const item = normalize(raw);
    if (!item) {
      return {
        ok: false,
        error: { code: 'INVALID_RESPONSE', message: `Entrée invalide dans la réponse (${label}, position ${index + 1}).` },
      };
    }
    items.push(item);
  }
  return { ok: true, data: items };
}

const SESSION_REQUIRED = {
  code: 'SESSION_REQUIRED',
  message: 'Connexion requise : aucune session utilisateur n’est disponible pour interroger l’API.',
};

export async function loadApiAccounts(): Promise<DataResult<BankAccountDto[]>> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: SESSION_REQUIRED };

  const response = await ApiClient.getAccounts(token);
  if (!response.success) {
    return { ok: false, error: { code: response.error?.code ?? 'API_ERROR', message: response.error?.message ?? 'Erreur API.' } };
  }
  return normalizeList(response.data, normalizeAccount, 'comptes');
}

export async function loadApiTransactions(): Promise<DataResult<BankTransactionDto[]>> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: SESSION_REQUIRED };

  const response = await ApiClient.getTransactions(token, API_TRANSACTIONS_LIMIT);
  if (!response.success) {
    return { ok: false, error: { code: response.error?.code ?? 'API_ERROR', message: response.error?.message ?? 'Erreur API.' } };
  }
  return normalizeList(response.data, normalizeTransaction, 'opérations');
}
