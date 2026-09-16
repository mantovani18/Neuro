"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type AuthContextValue = {
  session: any;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;

    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error) {
      setProfile(data as Profile | null);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(currentSession);
      if (currentSession?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .maybeSingle();

        setProfile((data as Profile | null) ?? null);
      }
      setIsLoading(false);
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      if (!nextSession?.user?.id) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", nextSession.user.id)
        .maybeSingle();

      setProfile((data as Profile | null) ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, profile, isLoading, signOut, refreshProfile }),
    [session, profile, isLoading, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      session: null,
      profile: null,
      isLoading: false,
      signOut: async () => {},
      refreshProfile: async () => {},
    } satisfies AuthContextValue;
  }

  return context;
}
