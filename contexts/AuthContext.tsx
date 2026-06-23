/**
 * Global authentication and profile state.
 *
 * Wraps Supabase session lifecycle and derives routing status:
 * loading → unauthenticated → needs_onboarding → authenticated.
 * Root _layout reads status to redirect between auth, onboarding, and tabs.
 */
import { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

type AuthStatus = 'loading' | 'unauthenticated' | 'needs_onboarding' | 'authenticated';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  status: AuthStatus;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** True when every field required for meal generation is present on the profile. */
function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  return (
    profile.goal != null &&
    profile.gender != null &&
    profile.age != null &&
    profile.weight_kg != null &&
    profile.height_cm != null &&
    profile.activity_level != null &&
    profile.diet_type != null &&
    profile.budget_weekly_eur != null &&
    profile.country != null &&
    profile.city != null
  );
}

/**
 * Provides session, profile, and derived auth status to the app tree.
 *
 * State: session from Supabase, profile from fetchProfile, loading until
 * initial getSession resolves. Subscribes to onAuthStateChange for sign-in/out.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(session.user.id);
    setProfile(p);
  }, [session?.user.id]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to get session:', error);
        setSession(null);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }
    void refreshProfile();
  }, [session?.user.id, refreshProfile]);

  const status: AuthStatus = useMemo(() => {
    if (loading) return 'loading';
    if (!session) return 'unauthenticated';
    if (!isProfileComplete(profile)) return 'needs_onboarding';
    return 'authenticated';
  }, [loading, session, profile]);

  const value = useMemo(
    () => ({ session, profile, status, refreshProfile }),
    [session, profile, status, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to read auth context. Must be used inside AuthProvider.
 *
 * @returns session, profile, status, and refreshProfile callback.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
