import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  NetworkErrorException,
  ServerRefusalError,
  applyOptimistic,
  idleState,
  settleFromApiResult,
  settleOptimistic,
} from '../src/lib/optimistic-mutation.ts';

test('une mutation acceptée confirme la valeur affichée', async () => {
  const pending = applyOptimistic(idleState<string[]>([]), ['Courses Express']);
  assert.deepEqual(pending.displayed, ['Courses Express']);
  assert.deepEqual(pending.confirmed, []);
  assert.equal(pending.phase, 'pending');

  const settled = await settleOptimistic(pending, async () => {});

  assert.equal(settled.phase, 'confirmed');
  assert.equal(settled.failure, null);
  assert.deepEqual(settled.confirmed, ['Courses Express']);
  assert.deepEqual(settled.displayed, ['Courses Express']);
});

test('un refus serveur restaure uniquement la valeur confirmée', async () => {
  const pending = applyOptimistic(idleState<string[]>(['Loyer']), ['Loyer', 'Courses Express']);

  const settled = await settleOptimistic(pending, async () => {
    throw new ServerRefusalError('HTTP_403', 'écriture refusée');
  });

  assert.equal(settled.phase, 'rolled_back');
  assert.deepEqual(settled.displayed, ['Loyer']);
  assert.deepEqual(settled.confirmed, ['Loyer']);
  assert.deepEqual(settled.failure, {
    kind: 'server_refusal',
    code: 'HTTP_403',
    message: 'écriture refusée',
  });
});

test('une erreur réseau annule la valeur optimiste', async () => {
  const pending = applyOptimistic(idleState<string[]>([]), ['Courses Express']);

  const settled = await settleOptimistic(pending, async () => {
    throw new NetworkErrorException('Impossible de joindre le serveur');
  });

  assert.equal(settled.phase, 'rolled_back');
  assert.deepEqual(settled.displayed, []);
  assert.deepEqual(settled.confirmed, []);
  assert.deepEqual(settled.failure, {
    kind: 'network_error',
    message: 'Impossible de joindre le serveur',
  });
});

test('un résultat API simulé distingue succès, refus et réseau', async () => {
  const pending = () => applyOptimistic(idleState<string[]>([]), ['Courses Express']);

  const accepted = await settleFromApiResult(pending(), async () => ({ success: true }));
  assert.equal(accepted.phase, 'confirmed');
  assert.deepEqual(accepted.displayed, ['Courses Express']);

  const refused = await settleFromApiResult(pending(), async () => ({
    success: false,
    error: { code: 'HTTP_403', message: 'écriture refusée' },
  }));
  assert.equal(refused.phase, 'rolled_back');
  assert.equal(refused.failure?.kind, 'server_refusal');
  assert.deepEqual(refused.displayed, []);

  const offline = await settleFromApiResult(pending(), async () => ({
    success: false,
    error: { code: 'NETWORK_ERROR', message: 'coupure' },
  }));
  assert.equal(offline.phase, 'rolled_back');
  assert.deepEqual(offline.failure, { kind: 'network_error', message: 'coupure' });
  assert.deepEqual(offline.displayed, []);

  const thrown = await settleFromApiResult(pending(), async () => {
    throw new Error('fetch failed');
  });
  assert.equal(thrown.failure?.kind, 'network_error');
  assert.deepEqual(thrown.displayed, []);
});

test('settleOptimistic refuse de confirmer un état qui n’est pas en cours', async () => {
  await assert.rejects(() => settleOptimistic(idleState<string[]>([]), async () => {}), /en cours/);
});
