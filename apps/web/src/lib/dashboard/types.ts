import type { BankAccountDto, BankTransactionDto } from '@pathly/shared-types';

/** Un état de chargement explicite : une erreur n'est jamais convertie en liste vide ni en zéro. */
export type RemoteState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; code: string; message: string }
  | { status: 'ready'; data: T };

export type DemoScenario = 'nominal' | 'empty' | 'error';

export type DataSourceChoice = `demo:${DemoScenario}` | 'api';

export interface DashboardData {
  accounts: RemoteState<BankAccountDto[]>;
  transactions: RemoteState<BankTransactionDto[]>;
  reload: () => void;
}

export interface DataResult<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}
