import assert from "node:assert/strict";
import test from "node:test";
import { signIn, signOut } from "../../lib/supabase/auth-actions.ts";

function createAuth(overrides = {}) {
  return {
    signInWithPassword: async (credentials) => ({
      data: {
        user: { email: credentials.email },
        session: {},
      },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    ...overrides,
  };
}

test("Connexion — Une session valide retourne l’identité authentifiée", async () => {
  const result = await signIn(
    createAuth(),
    { email: "yann@example.test", password: "correct-password" },
  );

  assert.deepEqual(result, { success: true, email: "yann@example.test" });
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
