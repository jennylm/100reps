import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type AuthResult = {
  error: string | null;
  /** Sign-up succeeded but email confirmation is required before a session exists */
  needsEmailConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in.';
  }
  if (lower.includes('password') && lower.includes('least')) {
    return 'Password must be at least 6 characters.';
  }
  if (lower.includes('email') && lower.includes('invalid')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Check your .env and restart Metro.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: mapAuthError(error.message) };
      if (!data.session) {
        return { error: 'Signed in but no session was returned. Try again.' };
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed.';
      return { error: mapAuthError(message) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Check your .env and restart Metro.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: mapAuthError(error.message) };

      // Supabase returns a user with empty identities when the email is already
      // registered and "Confirm email" is enabled (anti-enumeration).
      const identities = data.user?.identities ?? [];
      if (data.user && identities.length === 0) {
        return {
          error: 'An account with this email already exists. Try signing in.',
        };
      }

      if (data.session) {
        return { error: null };
      }

      // Account created; dashboard has email confirmation enabled.
      return { error: null, needsEmailConfirmation: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed.';
      return { error: mapAuthError(message) };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [session, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
