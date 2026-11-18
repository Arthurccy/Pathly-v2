'use client';

import Link from 'next/link';
import React, { FormEvent, useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import {
  loadAccounts,
  signIn,
  signOut,
  SupabaseAuthPort,
} from '@/lib/supabase/auth-actions';

export default function ConnexionPage(): React.JSX.Element {
  const [authClient, setAuthClient] = useState<SupabaseAuthPort | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [accountsCount, setAccountsCount] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;

    try {
      supabase = createSupabaseBrowserClient();
      setAuthClient(supabase.auth);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'La configuration de connexion est invalide.',
      );
      setIsLoadingSession(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSessionEmail(session?.user.email ?? null);
        if (!session) {
          setAccountsCount(null);
        }
        setIsLoadingSession(false);
      }
    });

    void supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSessionEmail(data.session?.user.email ?? null);
          if (data.session) {
            const result = await loadAccounts(
              ApiClient,
              data.session.access_token,
            );
            if (!isMounted) {
              return;
            }
            if (result.success) {
              setAccountsCount(result.accounts.length);
            } else {
              setErrorMessage(result.message);
            }
          }
        }
        setIsLoadingSession(false);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de vérifier la session.',
          );
          setIsLoadingSession(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!authClient) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const result = await signIn(authClient, ApiClient, {
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setSessionEmail(result.email);
      setAccountsCount(result.accounts.length);
      setPassword('');
      setNotice(
        `Connexion réussie. ${result.accounts.length} compte(s) chargé(s).`,
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'La connexion a échoué. Réessayez.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    if (!authClient) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const result = await signOut(authClient);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setSessionEmail(null);
      setAccountsCount(null);
      setPassword('');
      setNotice('Vous êtes déconnecté.');
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'La déconnexion a échoué. Réessayez.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <section
        aria-labelledby="connexion-title"
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Pathly
        </p>
        <h1 id="connexion-title" className="text-2xl font-semibold">
          Connexion
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Accédez à votre espace financier sécurisé.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-900 bg-red-950/60 p-3 text-sm text-red-200"
          >
            {errorMessage}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-emerald-900 bg-emerald-950/60 p-3 text-sm text-emerald-200"
          >
            {notice}
          </p>
        )}

        {isLoadingSession ? (
          <p className="mt-6 text-sm text-slate-400" role="status">
            Vérification de la session…
          </p>
        ) : sessionEmail ? (
          <div className="mt-6 space-y-5">
            <p className="text-sm text-slate-300">
              Session active pour <span className="font-medium">{sessionEmail}</span>
            </p>
            {accountsCount !== null && (
              <p className="text-sm text-slate-400" role="status">
                {accountsCount} compte(s) bancaire(s) récupéré(s) depuis l’API.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="rounded-lg bg-emerald-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Retour au tableau de bord
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-700 px-4 py-3 font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Déconnexion…' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                disabled={isSubmitting || !authClient}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-60"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                disabled={isSubmitting || !authClient}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingSession || !authClient}
              className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
