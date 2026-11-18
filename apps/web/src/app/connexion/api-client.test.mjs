import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiClient } from '../../lib/api-client.ts';

test('Client API — le profil est demandé avec le token et sans cache', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(
    JSON.stringify({
      success: true,
      data: { id: 'user-a', email: 'a@example.test', fullName: null, createdAt: '2026-10-01T10:00:00.000Z' },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ));
  const result = await ApiClient.getMe('token-fictif');
  assert.equal(result.data.id, 'user-a');
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.ok(url.endsWith('/me'));
  assert.equal(options.headers.Authorization, 'Bearer token-fictif');
  assert.equal(options.cache, 'no-store');
});

test('Client API — le conflit de profil conserve son code et son message', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(
    JSON.stringify({
      success: false,
      error: { code: 'PROFILE_EMAIL_CONFLICT', message: 'E-mail déjà associé à un profil.' },
    }),
    { status: 409, headers: { 'Content-Type': 'application/json' } },
  ));
  const result = await ApiClient.getMe('token-fictif');
  assert.equal(result.success, false);
  assert.equal(result.error.code, 'PROFILE_EMAIL_CONFLICT');
  assert.equal(result.error.message, 'E-mail déjà associé à un profil.');
  assert.equal(result.error.details.status, 409);
});
