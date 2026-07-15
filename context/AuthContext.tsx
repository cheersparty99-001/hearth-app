import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = "google" | "apple";

// Extract a query/fragment param from a redirect URL without URLSearchParams.
function urlParam(url: string, key: string): string | undefined {
  const m = url.match(new RegExp(`[?#&]${key}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signInWithProvider: (
    provider: OAuthProvider
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) return { error: error.message, needsConfirmation: false };
    // When email confirmation is required, no session is returned yet.
    return { error: null, needsConfirmation: !data.session };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    return { error: error?.message ?? null };
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    const redirectTo = Linking.createURL("auth-callback");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return { error: error.message };
    if (!data?.url) return { error: "Could not start sign-in." };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    // User dismissed the browser — treat as a silent cancel, not an error.
    if (result.type !== "success" || !result.url) return { error: null };

    // PKCE flow returns ?code=...
    const code = urlParam(result.url, "code");
    if (code) {
      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      return { error: exErr?.message ?? null };
    }
    // Implicit flow returns tokens in the URL fragment.
    const access_token = urlParam(result.url, "access_token");
    const refresh_token = urlParam(result.url, "refresh_token");
    if (access_token && refresh_token) {
      const { error: sErr } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      return { error: sErr?.message ?? null };
    }
    return { error: "Sign-in did not complete." };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      resetPassword,
      signInWithProvider,
      signOut,
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
