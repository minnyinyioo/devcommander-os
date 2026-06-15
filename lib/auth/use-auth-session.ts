"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/browser-client";

type AuthActionResult = {
  ok: boolean;
  error?: string;
};

export type AuthSessionState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<AuthActionResult>;
};

export function useAuthSession(): AuthSessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setSession(null);
        setUser(null);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }

      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return {
        ok: false,
        error: "Supabase is not configured.",
      };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    setSession(null);
    setUser(null);

    return {
      ok: true,
    };
  }, []);

  return {
    user,
    session,
    loading,
    configured,
    signOut,
  };
}