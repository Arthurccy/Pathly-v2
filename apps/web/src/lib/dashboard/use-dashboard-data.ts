'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BankAccountDto, BankTransactionDto } from '@pathly/shared-types';
import { loadApiAccounts, loadApiTransactions } from './api-source';
import { loadDemoAccounts, loadDemoTransactions } from './demo-source';
import type { DashboardData, DataResult, DataSourceChoice, DemoScenario, RemoteState } from './types';

const LOADING: RemoteState<never> = { status: 'loading' };

function toState<T>(result: DataResult<T[]>): RemoteState<T[]> {
  if (!result.ok || !result.data) {
    return {
      status: 'error',
      code: result.error?.code ?? 'UNKNOWN_ERROR',
      message: result.error?.message ?? 'Erreur inconnue.',
    };
  }
  return result.data.length === 0 ? { status: 'empty' } : { status: 'ready', data: result.data };
}

function unexpectedError<T>(): RemoteState<T> {
  return { status: 'error', code: 'UNEXPECTED_ERROR', message: 'Une erreur inattendue est survenue.' };
}

export function useDashboardData(source: DataSourceChoice): DashboardData {
  const [accounts, setAccounts] = useState<RemoteState<BankAccountDto[]>>(LOADING);
  const [transactions, setTransactions] = useState<RemoteState<BankTransactionDto[]>>(LOADING);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setAccounts(LOADING);
    setTransactions(LOADING);

    const scenario = source === 'api' ? null : (source.slice('demo:'.length) as DemoScenario);
    const accountsRequest = scenario === null ? loadApiAccounts() : loadDemoAccounts(scenario);
    const transactionsRequest =
      scenario === null ? loadApiTransactions() : loadDemoTransactions(scenario);

    accountsRequest
      .then((result) => !cancelled && setAccounts(toState(result)))
      .catch(() => !cancelled && setAccounts(unexpectedError()));
    transactionsRequest
      .then((result) => !cancelled && setTransactions(toState(result)))
      .catch(() => !cancelled && setTransactions(unexpectedError()));

    return () => {
      cancelled = true;
    };
  }, [source, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { accounts, transactions, reload };
}
