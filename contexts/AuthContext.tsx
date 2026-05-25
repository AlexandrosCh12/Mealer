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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
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
    if (!profile) return 'needs_onboarding';
    return 'authenticated';
  }, [loading, session, profile]);

  const value = useMemo(
    () => ({ session, profile, status, refreshProfile }),
    [session, profile, status, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
