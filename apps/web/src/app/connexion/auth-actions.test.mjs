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
    getMe: async () => ({ success: true, data: { id: "user-a" } }),
    getAccounts: async () => ({ success: true, data: [] }),
    ...overrides,
  };
}

test("Connexion — Une session valide réussit indépendamment de l’API comptes", async () => {
  const result = await signIn(
    createAuth(),
    { email: "yann@example.test", password: "correct-password" },
  );

  assert.deepEqual(result, { success: true });
});

test("Connexion — Les identifiants refusés sont remontés sans créer de session", async () => {
  const result = await signIn(
    createAuth({
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      }),
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
    { email: "yann@example.test", password: "correct-password" },
  );

  assert.equal(result.success, false);
});

test("Comptes — Le token de session est transmis et les données sont conservées", async () => {
  const calls = [];
  const accounts = [{ id: "account-a", name: "Compte fictif" }];
  const result = await loadAccounts(
    createAccountsApi({
      getMe: async (token) => {
        calls.push(["me", token]);
        return { success: true, data: { id: "user-a" } };
      },
      getAccounts: async (token) => {
        calls.push(["accounts", token]);
        return { success: true, data: accounts };
      },
    }),
    "test-access-token",
  );
  assert.deepEqual(calls, [
    ["me", "test-access-token"],
    ["accounts", "test-access-token"],
  ]);
  assert.deepEqual(result, { success: true, accounts });
});

test("Comptes — Une réponse incomplète n’est pas présentée comme une liste vide", async () => {
  const result = await loadAccounts(
    createAccountsApi({ getAccounts: async () => ({ success: true }) }),
    "test-access-token",
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

test("Profil — Un échec de création empêche la lecture des comptes", async () => {
  let accountsCalled = false;
  const result = await loadAccounts(
    createAccountsApi({
      getMe: async () => ({
        success: false,
        error: { code: "PROFILE_EMAIL_CONFLICT", message: "Profil en conflit" },
      }),
      getAccounts: async () => {
        accountsCalled = true;
        return { success: true, data: [] };
      },
    }),
    "test-access-token",
  );
  assert.deepEqual(result, { success: false, message: "Profil en conflit" });
  assert.equal(accountsCalled, false);
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
