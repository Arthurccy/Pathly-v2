/**
 * Tests des calculs et de l'adaptateur de visualisation — runner natif de Node, sans dépendance :
 *   node --experimental-strip-types --test apps/web/test/visualisation.test.ts
 * (depuis la racine du dépôt ; testé avec Node 22.20).
 * Les valeurs attendues proviennent des exemples de docs/architecture/CONTRATS_SEANCE_2.md,
 * calculés à la main, et non d'une recopie des formules du code.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiResponseToVisualState, DEFAULT_ERROR_MESSAGE } from '../src/components/visualisation/adapter.ts';
import { computeHealthView, computeNetWorthView, toCents } from '../src/components/visualisation/compute.ts';
import { buildSceneBars, isWebGLAvailable, MAX_HEIGHT } from '../src/components/visualisation/three/scene-model.ts';
import {
  healthApiIncomplete,
  healthApiShortfall,
  healthHealthy,
  healthIncomplete,
  healthResultOnly,
  healthTight,
  netWorthHealthy,
  netWorthIncoherent,
  netWorthTight,
} from '../src/components/visualisation/fixtures.ts';

function ready<T>(state: { status: string; data?: T }): T {
  assert.equal(state.status, 'ready');
  return (state as { data: T }).data;
}

test('toCents arrondit au centime sans erreur binaire', () => {
  assert.equal(toCents(1.005), 101);
  assert.equal(toCents(-42.5), -4250);
  assert.equal(toCents(0.1 + 0.2), 30);
});

test('patrimoine de référence : 2 000 + 5 000 + 10 000 − 3 000 = 14 000 €', () => {
  const v = computeNetWorthView(ready(netWorthHealthy));
  assert.equal(v.netWorthCents, 1_400_000);
  assert.equal(v.totalAssetsCents, 1_700_000);
  assert.equal(v.liabilitiesCents, 300_000);
  assert.deepEqual(v.issues, []);
  // Parts des actifs : 2/17, 5/17, 10/17.
  const shares = v.segments.map((s) => Math.round(s.sharePct * 10) / 10);
  assert.deepEqual(shares, [11.8, 29.4, 58.8]);
  // Échelle commune : la plus grande barre (actifs, 17 000) occupe 100 %, les dettes 3/17.
  assert.equal(Math.round(v.segments.reduce((s, x) => s + x.widthPct, 0)), 100);
  assert.equal(Math.round(v.liabilitiesWidthPct * 10) / 10, 17.6);
});

test('les dettes ne deviennent jamais une part des actifs', () => {
  const v = computeNetWorthView(ready(netWorthHealthy));
  assert.ok(v.segments.every((s) => s.key !== ('totalLiabilities' as string)));
  assert.ok(v.segments.every((s) => s.sharePct >= 0));
});

test('patrimoine net négatif : les dettes fixent l’échelle à 100 %', () => {
  const v = computeNetWorthView(ready(netWorthTight));
  assert.equal(v.netWorthCents, -270_000); // 300 + 1 000 + 8 000 − 12 000
  assert.equal(v.liabilitiesWidthPct, 100);
  assert.deepEqual(v.issues, []);
});

test('une synthèse incohérente est signalée, pas corrigée', () => {
  const v = computeNetWorthView(ready(netWorthIncoherent));
  assert.equal(v.netWorthCents, 1_600_000); // valeur reçue conservée, pas recalculée
  assert.equal(v.issues.length, 2);
  assert.match(v.issues[0], /total des actifs/);
  assert.match(v.issues[1], /patrimoine net/);
});

test('trésorerie négative : signalée et exclue de la barre', () => {
  const v = computeNetWorthView({
    totalAssets: 900,
    totalLiabilities: 0,
    netWorth: 900,
    liquidCash: -100,
    investedAssets: 1000,
    tangibleAssets: 0,
    totalDebt: 0,
    monthlyDebtPayment: 0,
  });
  assert.equal(v.segments[0].widthPct, 0);
  assert.equal(v.segments[1].widthPct, 100);
  assert.equal(v.issues.length, 1);
  assert.match(v.issues[0], /Trésorerie négative/);
});

test('tout à zéro : état « aucun actif ni dette », distinct d’une donnée absente', () => {
  const v = computeNetWorthView({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    liquidCash: 0,
    investedAssets: 0,
    tangibleAssets: 0,
    totalDebt: 0,
    monthlyDebtPayment: 0,
  });
  assert.equal(v.isAllZero, true);
  assert.deepEqual(v.issues, []);
});

test('reste à dépenser de référence : 1 500 − 800 − 200 = 500 € (AVAILABLE)', () => {
  const v = computeHealthView(ready(healthHealthy));
  assert.equal(v.kind, 'waterfall');
  if (v.kind !== 'waterfall') return;
  assert.equal(v.resultCents, 50_000);
  assert.deepEqual(v.issues, []);
  assert.deepEqual(
    v.steps.map((s) => [s.key, s.startCents, s.endCents]),
    [
      ['balance', 0, 150_000],
      ['expenses', 150_000, 70_000],
      ['reserve', 70_000, 50_000],
      ['result', 0, 50_000],
    ],
  );
  // Aucune valeur négative : l'axe zéro est à gauche, le solde occupe toute la largeur.
  assert.equal(v.zeroPct, 0);
  assert.equal(v.steps[0].widthPct, 100);
});

test('déficit : 900 − 800 − 200 = −100 € reste négatif (SHORTFALL)', () => {
  const v = computeHealthView(ready(healthTight));
  assert.equal(v.kind, 'waterfall');
  if (v.kind !== 'waterfall') return;
  assert.equal(v.resultCents, -10_000);
  assert.deepEqual(v.issues, []);
  // Domaine [−100 ; 900] : zéro à 10 % ; le résultat va de 0 vers la gauche.
  assert.equal(v.zeroPct, 10);
  const result = v.steps[3];
  assert.equal(result.leftPct, 0);
  assert.equal(result.widthPct, 10);
});

test('donnée manquante : INCOMPLETE, montant null, entrée listée', () => {
  const v = computeHealthView(ready(healthIncomplete));
  assert.equal(v.kind, 'resultOnly');
  if (v.kind !== 'resultOnly') return;
  assert.equal(v.resultCents, null);
  assert.deepEqual(v.missing, ['Charges restantes']);
  assert.deepEqual(v.issues, []);
});

test('réponse API de Victor sans entrées : 500 € affichés, aucune alerte', () => {
  const v = computeHealthView(ready(healthResultOnly));
  assert.equal(v.kind, 'resultOnly');
  if (v.kind !== 'resultOnly') return;
  assert.equal(v.resultCents, 50_000);
  assert.deepEqual(v.missing, []);
  assert.deepEqual(v.issues, []);
});

test('réponse API INCOMPLETE : raisons traduites, montant null', () => {
  const v = computeHealthView(ready(healthApiIncomplete));
  assert.equal(v.kind, 'resultOnly');
  if (v.kind !== 'resultOnly') return;
  assert.equal(v.resultCents, null);
  assert.deepEqual(v.missing, ['Solde disponible (aucun compte courant)']);
  assert.deepEqual(v.issues, []);
});

test('réponse API SHORTFALL : −100 € conservés, aucune alerte', () => {
  const v = computeHealthView(ready(healthApiShortfall));
  assert.equal(v.kind, 'resultOnly');
  if (v.kind !== 'resultOnly') return;
  assert.equal(v.resultCents, -10_000);
  assert.deepEqual(v.issues, []);
});

test('adaptateur : succès avec données → ready', () => {
  const state = apiResponseToVisualState({ success: true, data: { value: 1 } });
  assert.deepEqual(state, { status: 'ready', data: { value: 1 } });
});

test('adaptateur : succès sans données → empty (pas de zéro inventé)', () => {
  assert.deepEqual(apiResponseToVisualState({ success: true }), { status: 'empty' });
  assert.deepEqual(apiResponseToVisualState({ success: true, data: null }), { status: 'empty' });
});

test('adaptateur : échec → error avec le message reçu, ou message par défaut', () => {
  assert.deepEqual(
    apiResponseToVisualState({
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Impossible de joindre le serveur API NestJS' },
    }),
    { status: 'error', message: 'Impossible de joindre le serveur API NestJS' },
  );
  assert.deepEqual(apiResponseToVisualState({ success: false }), {
    status: 'error',
    message: DEFAULT_ERROR_MESSAGE,
  });
});

test('adaptateur : échec avec données présentes reste une erreur', () => {
  const state = apiResponseToVisualState({
    success: false,
    data: { value: 1 },
    error: { code: 'HTTP_500', message: 'Erreur serveur' },
  });
  assert.equal(state.status, 'error');
});

test('INCOMPLETE avec entrées complètes : montant null, pas de cascade', () => {
  const v = computeHealthView({
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: null,
    status: 'INCOMPLETE',
    currency: 'EUR',
    incompleteReasons: ['UNSUPPORTED_CURRENCY'],
    inputs: { availableBalance: 1500, remainingCommittedExpenses: 800, savingsReserve: 200 },
  });
  assert.equal(v.kind, 'resultOnly');
  if (v.kind !== 'resultOnly') return;
  assert.equal(v.resultCents, null);
  assert.deepEqual(v.missing, ['Devise non prise en charge (compte hors EUR)']);
});

test('INCOMPLETE sans raison ni entrées : signalé', () => {
  const v = computeHealthView({
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: null,
    status: 'INCOMPLETE',
    currency: 'EUR',
  });
  assert.ok(v.issues.some((i) => /sans raison/.test(i)));
});

test('écart entre résultat reçu et entrées : signalé', () => {
  const v = computeHealthView({
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: 600,
    status: 'AVAILABLE',
    currency: 'EUR',
    inputs: { availableBalance: 1500, remainingCommittedExpenses: 800, savingsReserve: 200 },
  });
  assert.equal(v.issues.length, 1);
  assert.match(v.issues[0], /Écart/);
});

test('statut incohérent avec le signe du montant : signalé', () => {
  const v = computeHealthView({
    month: '2026-10',
    asOfDate: '2026-10-15',
    safeToSpendPeriod: -50,
    status: 'AVAILABLE',
    currency: 'EUR',
  });
  assert.equal(v.kind, 'resultOnly');
  assert.ok(v.issues.some((i) => /AVAILABLE incohérent/.test(i)));
});

test('scène 3D : actifs empilés 2/17, 5/17, 10/17 de la hauteur max, dettes 3/17 dans une colonne séparée', () => {
  const bars = buildSceneBars(computeNetWorthView(ready(netWorthHealthy)));
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const assets = bars.filter((b) => b.key !== 'debts');
  const debts = bars.filter((b) => b.key === 'debts');
  assert.deepEqual(
    assets.map((b) => [b.key, round(b.height)]),
    [
      ['liquidCash', round((2 / 17) * MAX_HEIGHT)],
      ['investedAssets', round((5 / 17) * MAX_HEIGHT)],
      ['tangibleAssets', round((10 / 17) * MAX_HEIGHT)],
    ],
  );
  // Empilement : chaque segment commence où le précédent s'arrête ; la colonne d'actifs atteint la hauteur max.
  const top = assets.reduce((base, b) => {
    assert.equal(round(b.y - b.height / 2), round(base));
    return base + b.height;
  }, 0);
  assert.equal(round(top), MAX_HEIGHT);
  assert.equal(debts.length, 1);
  assert.equal(round(debts[0].height), round((3 / 17) * MAX_HEIGHT));
  assert.notEqual(debts[0].x, assets[0].x);
  assert.equal(round(debts[0].y - debts[0].height / 2), 0);
});

test('détection WebGL : webgl2 ou webgl → disponible ; aucun contexte ou exception → indisponible', () => {
  const canvas = (contexts: string[]) => () => ({ getContext: (id: string) => (contexts.includes(id) ? {} : null) });
  assert.equal(isWebGLAvailable(canvas(['webgl2'])), true);
  assert.equal(isWebGLAvailable(canvas(['webgl'])), true);
  assert.equal(isWebGLAvailable(canvas([])), false);
  assert.equal(
    isWebGLAvailable(() => {
      throw new Error('canvas indisponible');
    }),
    false,
  );
});
