'use client';

import Link from 'next/link';
import React, { FormEvent, useEffect, useState } from 'react';
import type { BankAccountDto } from '@pathly/shared-types';
import { ApiClient } from '@/lib/api-client';
import { useSession } from '@/lib/supabase/use-session';
import {
  loadAccounts,
  signIn,
  signOut,
} from '@/lib/supabase/auth-actions';

export default function ConnexionPage(): React.JSX.Element {
  const { client, session, loading: isLoadingSession, error: sessionError, version: sessionVersion } = useSession();
  const [accounts, setAccounts] = useState<{ userId: string; data: BankAccountDto[] } | null>(null);
  const [accountsError, setAccountsError] = useState<{ userId: string; message: string } | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsAttempt, setAccountsAttempt] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setAccounts(null);
      setAccountsError(null);
      setAccountsLoading(false);
      return;
    }

    let active = true;
    const version = sessionVersion.current;
    setAccounts(null);
    setAccountsError(null);
    setAccountsLoading(true);
    void loadAccounts(ApiClient, session.access_token)
      .then((result) => {
        if (!active || version !== sessionVersion.current) {
          return;
        }
        if (result.success) {
          setAccounts({ userId: session.user.id, data: result.accounts });
        } else {
          setAccountsError({ userId: session.user.id, message: result.message });
        }
        setAccountsLoading(false);
      })
      .catch(() => {
        if (active && version === sessionVersion.current) {
          setAccountsError({ userId: session.user.id, message: 'Impossible de charger vos comptes. Réessayez.' });
          setAccountsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session, accountsAttempt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!client) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const result = await signIn(client.auth, {
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setPassword('');
      setNotice('Connexion réussie.');
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
    if (!client) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      const result = await signOut(client.auth);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

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

        {(sessionError || errorMessage) && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-900 bg-red-950/60 p-3 text-sm text-red-200"
          >
            {sessionError || errorMessage}
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
        ) : session ? (
          <div className="mt-6 space-y-5">
            <p className="text-sm text-slate-300">
              Session active{session.user.email && <> pour <span className="font-medium">{session.user.email}</span></>}
            </p>
            {accountsLoading && (
              <p className="text-sm text-slate-400" role="status">Chargement des comptes…</p>
            )}
            {accountsError?.userId === session.user.id && (
              <div role="alert" className="text-sm text-red-200">
                <p>Impossible de charger le profil ou les comptes : {accountsError.message}</p>
                <button
                  type="button"
                  onClick={() => setAccountsAttempt((attempt) => attempt + 1)}
                  className="mt-2 underline"
                >
                  Réessayer
                </button>
              </div>
            )}
            {accounts?.userId === session.user.id && (
              <div className="text-sm text-slate-300">
                {accounts.data.length === 0 ? (
                  <p>Aucun compte bancaire disponible.</p>
                ) : (
                  <>
                    <p>Comptes bancaires :</p>
                    <ul className="mt-2 list-inside list-disc">
                      {accounts.data.map((account) => <li key={account.id}>{account.name}</li>)}
                    </ul>
                  </>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link
                href="/parametres"
                className="rounded-lg border border-slate-700 px-4 py-3 text-center font-medium hover:bg-slate-800"
              >
                Paramètres du profil
              </Link>
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
                disabled={isSubmitting || !client}
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
                disabled={isSubmitting || !client}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingSession || !client}
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
