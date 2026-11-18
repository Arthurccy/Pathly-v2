'use client';

import Link from 'next/link';
import React, { FormEvent, useEffect, useState } from 'react';
import type { UserProfileDto } from '@pathly/shared-types';
import { ApiClient } from '@/lib/api-client';
import { useSession } from '@/lib/supabase/use-session';

export default function ParametresPage(): React.JSX.Element {
  const { session, loading, error: sessionError, version } = useSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [fullName, setFullName] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setProfile(null);
    setFullName('');
    setProfileError(null);
    setNotice(null);
    setSaving(false);
    if (!session) {
      setProfileLoading(false);
      return;
    }

    let active = true;
    const requestVersion = version.current;
    setProfileLoading(true);
    void ApiClient.getMe(session.access_token).then((result) => {
      if (!active || version.current !== requestVersion) return;
      if (!result.success || !result.data) {
        setProfileError(result.error?.message ?? 'Impossible de charger votre profil.');
      } else {
        setProfile(result.data);
        setFullName(result.data.fullName ?? '');
      }
      setProfileLoading(false);
    }).catch(() => {
      if (active && version.current === requestVersion) {
        setProfileError('Impossible de charger votre profil. Réessayez.');
        setProfileLoading(false);
      }
    });

    return () => { active = false; };
  }, [session, attempt, version]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!session || profile?.id !== session.user.id) return;
    const name = fullName.trim();
    if (!name || Array.from(name).length > 100) {
      setProfileError('Le nom doit contenir entre 1 et 100 caractères.');
      return;
    }
    const requestVersion = version.current;
    setSaving(true);
    setProfileError(null);
    setNotice(null);
    try {
      const result = await ApiClient.updateMe(session.access_token, { fullName: name });
      if (version.current !== requestVersion) return;
      if (!result.success || !result.data) {
        setProfileError(result.error?.message ?? 'Impossible de modifier votre profil.');
      } else {
        setProfile(result.data);
        setFullName(result.data.fullName ?? '');
        setNotice('Profil mis à jour.');
      }
    } catch {
      if (version.current === requestVersion) {
        setProfileError('Impossible de modifier votre profil. Réessayez.');
      }
    } finally {
      if (version.current === requestVersion) setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-semibold">Paramètres du profil</h1>
        <Link href="/connexion" className="mt-3 inline-block text-sm text-emerald-400 underline">
          Retour à la connexion
        </Link>
        {(sessionError || profileError) && (
          <p role="alert" className="mt-5 text-sm text-red-200">{sessionError || profileError}</p>
        )}
        {notice && <p role="status" className="mt-5 text-sm text-emerald-200">{notice}</p>}
        {loading || (session && profileLoading) ? (
          <p role="status" className="mt-6 text-sm text-slate-400">Chargement du profil…</p>
        ) : !session ? (
          <p className="mt-6 text-sm text-slate-300">Connectez-vous pour accéder à votre profil.</p>
        ) : profile?.id === session.user.id ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <p className="text-sm text-slate-300">E-mail du profil : {profile.email}</p>
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium">Nom</label>
              <input
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.currentTarget.value)}
                required
                disabled={saving}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 focus:border-emerald-400"
              />
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-5 text-sm text-emerald-400 underline">
            Réessayer
          </button>
        )}
      </section>
    </main>
  );
}
