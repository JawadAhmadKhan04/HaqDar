import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  deviceId: string | null;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const ensureAnonymousSession = useCallback(async () => {
    try {
      // Check if we already have a persisted session
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (existing) {
        setSession(existing);
        setUser(existing.user);
        setReady(true);
        return;
      }

      // No session — create an anonymous one (no email/password, just a device UUID)
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data.session) {
        setSession(data.session);
        setUser(data.user);
      }
    } catch (e) {
      // Network offline — app still works locally, sync will happen when online
      console.warn("[AuthContext] anonymous sign-in failed (offline?):", e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    ensureAnonymousSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        deviceId: user?.id ?? null,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
