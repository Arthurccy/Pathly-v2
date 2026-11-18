import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  estimateSafeToSpend,
  previewImport,
  readConsultation,
  runReferenceJourney,
  REFERENCE_ACCOUNT,
} from '../src/lib/journey-recipe.ts';

test('le parcours de référence enchaîne import, consultation et calcul', () => {
  const report = runReferenceJourney();

  assert.deepEqual(
    report.importPreview.errors,
    [],
  );
  assert.deepEqual(report.importPreview.operations, [
    { date: '2026-10-12', label: 'CB MONOPRIX PARIS', amount: -42.5 },
    { date: '2026-10-13', label: 'SALAIRE', amount: 2100 },
  ]);

  assert.equal(report.consultation.status, 'ready');
  if (report.consultation.status !== 'ready') return;
  assert.equal(report.consultation.accounts[0]?.currentBalance, 1500);
  assert.equal(report.consultation.transactions[0]?.id, 'A1');
  assert.equal(report.consultation.transactions[0]?.amount, -42.5);
  assert.equal(report.consultation.transactions[0]?.accountId, 'A');

  assert.deepEqual(report.cashflow, {
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: 500,
    status: 'AVAILABLE',
    currency: 'EUR',
  });
});

test('une ligne invalide est signalée et n’entre pas dans les opérations', () => {
  const preview = previewImport(`date;libelle;montant
2026-10-12;CB MONOPRIX PARIS;-42,50
2026-13-01;DATE FAUSSE;-1,00
2026-10-13;SALAIRE;abc
2026-10-13;SALAIRE;2100,00
`);

  assert.deepEqual(preview.operations, [
    { date: '2026-10-12', label: 'CB MONOPRIX PARIS', amount: -42.5 },
    { date: '2026-10-13', label: 'SALAIRE', amount: 2100 },
  ]);
  assert.deepEqual(preview.errors, [
    { line: 3, cause: 'date invalide' },
    { line: 4, cause: 'montant invalide' },
  ]);
});

test('deux lignes légitimes identiques sont conservées toutes les deux', () => {
  const preview = previewImport(`date;libelle;montant
2026-10-13;SALAIRE;2100,00
2026-10-13;SALAIRE;2100,00
`);

  assert.equal(preview.errors.length, 0);
  assert.equal(preview.operations.length, 2);
});

test('une consultation en erreur ne fabrique pas un solde à zéro', () => {
  const view = readConsultation({
    accounts: { ok: false, code: 'HTTP_401', message: 'session absente' },
    transactions: { ok: true, data: [] },
  });

  assert.deepEqual(view, {
    status: 'unavailable',
    code: 'HTTP_401',
    message: 'session absente',
  });
  assert.equal('accounts' in view && Array.isArray(view.accounts), false);
});

test('une consultation vide reste vide', () => {
  const view = readConsultation({
    accounts: { ok: true, data: [REFERENCE_ACCOUNT] },
    transactions: { ok: true, data: [] },
  });

  assert.equal(view.status, 'empty');
  if (view.status !== 'empty') return;
  assert.equal(view.accounts[0]?.currentBalance, 1500);
  assert.deepEqual(view.transactions, []);
});

test('un calcul incomplet ou déficitaire n’est pas ramené à zéro', () => {
  const incomplete = estimateSafeToSpend({
    month: '2026-10',
    asOfDate: '2026-10-15',
    availableBalance: 1500,
    remainingCommittedExpenses: null,
    savingsReserve: 200,
    currency: 'EUR',
  });
  assert.equal(incomplete.status, 'INCOMPLETE');
  assert.equal(incomplete.safeToSpendPeriod, null);

  const shortfall = estimateSafeToSpend({
    month: '2026-10',
    asOfDate: '2026-10-15',
    availableBalance: 100,
    remainingCommittedExpenses: 800,
    savingsReserve: 200,
    currency: 'EUR',
  });
  assert.deepEqual(shortfall, {
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: -900,
    status: 'SHORTFALL',
    currency: 'EUR',
  });
});
