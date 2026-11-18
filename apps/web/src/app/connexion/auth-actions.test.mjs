import assert from "node:assert/strict";
import test from "node:test";
import {
  loadAccounts,
  signIn,
  signOut,
} from "../../lib/supabase/auth-actions.ts";

function createAuth(overrides = {}) {
  return {
    signInWithPassword: async (credentials) => ({
      data: {
        user: { email: credentials.email },
        session: { access_token: "test-access-token" },
      },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    ...overrides,
  };
}

function createAccountsApi(overrides = {}) {
  return {
    getAccounts: async () => ({ success: true, data: [] }),
    ...overrides,
  };
}

test("Connexion — Une session valide retourne l’identité authentifiée", async () => {
  let receivedToken;
  const result = await signIn(
    createAuth(),
    createAccountsApi({
      getAccounts: async (token) => {
        receivedToken = token;
        return { success: true, data: [] };
      },
    }),
    { email: "yann@example.test", password: "correct-password" },
  );

  assert.deepEqual(result, {
    success: true,
    email: "yann@example.test",
    accounts: [],
  });
  assert.equal(receivedToken, "test-access-token");
});

test("Connexion — Les identifiants refusés sont remontés sans créer de session", async () => {
  const result = await signIn(
    createAuth({
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      }),
    }),
    createAccountsApi({
      getAccounts: async () => {
        throw new Error("Accounts must not be loaded before authentication");
      },
    }),
    { email: "yann@example.test", password: "wrong-password" },
  );

  assert.deepEqual(result, {
    success: false,
    message: "Invalid login credentials",
  });
});

test("Connexion — Une réponse sans session n’est pas considérée comme authentifiée", async () => {
  const result = await signIn(
    createAuth({
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: null,
      }),
    }),
    createAccountsApi({
      getAccounts: async () => {
        throw new Error("Accounts must not be loaded without a session");
      },
    }),
    { email: "yann@example.test", password: "correct-password" },
  );

  assert.equal(result.success, false);
});

test("Comptes — Un refus API est signalé sans masquer l’erreur", async () => {
  const result = await loadAccounts(
    createAccountsApi({
      getAccounts: async () => ({
        success: false,
        error: { code: "HTTP_401", message: "Unauthorized" },
      }),
    }),
    "test-access-token",
  );

  assert.deepEqual(result, { success: false, message: "Unauthorized" });
});

test("Déconnexion — Le succès et les erreurs Supabase sont préservés", async () => {
  assert.deepEqual(await signOut(createAuth()), {
    success: true,
  });
  assert.deepEqual(
    await signOut(
      createAuth({
        signOut: async () => ({
          error: { message: "Unable to revoke session" },
        }),
      }),
    ),
    { success: false, message: "Unable to revoke session" },
  );
});
