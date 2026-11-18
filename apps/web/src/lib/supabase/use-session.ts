'use client';

import { useEffect, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from './browser';

export function useSession() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const version = useRef(0);

  useEffect(() => {
    let active = true;
    let supabase: SupabaseClient;
    try {
      supabase = createSupabaseBrowserClient();
      setClient(supabase);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'La configuration de connexion est invalide.');
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (active && event !== 'INITIAL_SESSION') {
        version.current += 1;
        setSession(nextSession);
        setError(null);
        setLoading(false);
      }
    });

    const initialVersion = version.current;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active || version.current !== initialVersion) return;
      if (error) {
        setError(error.message);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    }).catch((error: unknown) => {
      if (active && version.current === initialVersion) {
        setError(error instanceof Error ? error.message : 'Impossible de vérifier la session.');
        setLoading(false);
      }
    });

    return () => {
      active = false;
      version.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  return { client, session, loading, error, version };
}
