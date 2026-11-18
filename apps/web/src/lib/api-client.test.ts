import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { ApiClient } from './api-client.ts';

type Call = { url: string; init: RequestInit };

const realFetch = globalThis.fetch;
let calls: Call[] = [];

function mockFetch(handler: (call: Call) => Response | Promise<Response>): void {
  calls = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const call = { url: String(input), init };
    calls.push(call);
    return handler(call);
  }) as typeof fetch;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('ApiClient — succès et authentification', () => {
  it('envoie le jeton Bearer et renvoie la réponse ApiResponse telle quelle', async () => {
    mockFetch(() => json(200, { success: true, data: [{ id: 'a1' }] }));
    const response = await ApiClient.getAccounts('jeton-test');

    assert.deepEqual(response, { success: true, data: [{ id: 'a1' }] });
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/accounts$/);
    assert.equal((calls[0].init.headers as Record<string, string>).Authorization, 'Bearer jeton-test');
    assert.equal(calls[0].init.method, 'GET');
  });

  it("sans jeton, n'appelle pas le serveur et renvoie SESSION_REQUIRED", async () => {
    mockFetch(() => json(200, { success: true, data: [] }));
    const response = await ApiClient.getAccounts(null);

    assert.equal(response.success, false);
    assert.equal(response.error?.code, 'SESSION_REQUIRED');
    assert.equal(calls.length, 0);
  });

  it("la prévisualisation d'import fonctionne sans session (POST JSON)", async () => {
    mockFetch(() => json(200, { success: true, data: { totalRows: 0 } }));
    const response = await ApiClient.previewImport({ rawContent: 'date;libelle;montant' });

    assert.equal(response.success, true);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.body, JSON.stringify({ rawContent: 'date;libelle;montant' }));
    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(headers['Content-Type'], 'application/json');
    assert.equal(headers.Authorization, undefined);
  });

  it('encode le curseur de pagination', async () => {
    mockFetch(() => json(200, { success: true, data: [] }));
    await ApiClient.getTransactions('jeton', 20, 'a&b=c');
    assert.match(calls[0].url, /\/transactions\?limit=20&cursor=a%26b%3Dc$/);
  });

  it('un 204 sans contenu est un succès sans données', async () => {
    mockFetch(() => new Response(null, { status: 204 }));
    const response = await ApiClient.updateMe('jeton', { fullName: 'Alex' });
    assert.deepEqual(response, { success: true });
  });
});

describe('ApiClient — erreurs HTTP explicites', () => {
  it('401 NestJS → UNAUTHORIZED avec le message serveur et le statut', async () => {
    mockFetch(() => json(401, { statusCode: 401, message: 'Session utilisateur invalide ou expirée' }));
    const response = await ApiClient.getMe('jeton-expire');

    assert.equal(response.success, false);
    assert.equal(response.error?.code, 'UNAUTHORIZED');
    assert.equal(response.error?.message, 'Session utilisateur invalide ou expirée');
    assert.equal((response.error?.details as { status: number }).status, 401);
  });

  it('403 → FORBIDDEN', async () => {
    mockFetch(() => json(403, { statusCode: 403, message: 'Accès refusé' }));
    const response = await ApiClient.commitImport('jeton', { rawContent: 'x', accountId: 'autre-compte' });
    assert.equal(response.error?.code, 'FORBIDDEN');
  });

  it("conserve le code métier d'une erreur au format du contrat (409 PROFILE_EMAIL_CONFLICT)", async () => {
    mockFetch(() =>
      json(409, { success: false, error: { code: 'PROFILE_EMAIL_CONFLICT', message: 'E-mail déjà utilisé' } }),
    );
    const response = await ApiClient.getMe('jeton');
    assert.equal(response.error?.code, 'PROFILE_EMAIL_CONFLICT');
    assert.equal(response.error?.message, 'E-mail déjà utilisé');
  });

  it('400 de validation NestJS (message en tableau) → VALIDATION_ERROR avec messages joints', async () => {
    mockFetch(() => json(400, { statusCode: 400, message: ['fullName must be a string', 'fullName too long'] }));
    const response = await ApiClient.updateMe('jeton', { fullName: '' });
    assert.equal(response.error?.code, 'VALIDATION_ERROR');
    assert.equal(response.error?.message, 'fullName must be a string ; fullName too long');
  });

  it('500 avec corps non JSON → SERVER_ERROR et message par défaut', async () => {
    mockFetch(() => new Response('<html>Bad gateway</html>', { status: 502 }));
    const response = await ApiClient.getAccounts('jeton');
    assert.equal(response.error?.code, 'SERVER_ERROR');
    assert.equal(response.error?.message, 'Erreur du serveur API.');
  });
});

describe('ApiClient — réseau et contrat', () => {
  it('serveur injoignable → NETWORK_ERROR', async () => {
    mockFetch(() => {
      throw new TypeError('fetch failed');
    });
    const response = await ApiClient.getAccounts('jeton');
    assert.equal(response.error?.code, 'NETWORK_ERROR');
    assert.equal(response.error?.message, 'fetch failed');
  });

  it('dépassement du délai → TIMEOUT_EXCEEDED', async () => {
    mockFetch(
      ({ init }) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const abort = new Error('aborted');
            abort.name = 'AbortError';
            reject(abort);
          });
        }),
    );
    const response = await ApiClient.request('/accounts', { jwtToken: 'jeton', timeoutMs: 20 });
    assert.equal(response.error?.code, 'TIMEOUT_EXCEEDED');
  });

  it('200 hors contrat ApiResponse → INVALID_RESPONSE (jamais traité comme un succès)', async () => {
    mockFetch(() => json(200, [{ id: 'a1' }]));
    const response = await ApiClient.getAccounts('jeton');
    assert.equal(response.success, false);
    assert.equal(response.error?.code, 'INVALID_RESPONSE');
  });
});
