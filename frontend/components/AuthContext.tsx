

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';

/* =======================
   Types
======================= */

export interface User {
  id: string;
  email: string;

  name?: string;
  username?: string;
  profile_photo?: string;

  sports?: string[];
  region?: string;
  locality?: string;

  dob?: string;
  gender?: string;

  level?: string;
  elo?: number;
  elo_ratings?: Record<string, number>; // Per-sport Elo ratings
  preferred_format?: string;
  experience_years?: number;

  available_days?: string[];
  time_slots?: string[];

  bio?: string;
  achievements?: string[];

  connections?: number;
  reliability_score?: number;
  calibration_games_remaining?: number;
  rating_deviation?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (
    userData: Pick<User, 'email' | 'name' | 'sports' | 'reliability_score' | 'calibration_games_remaining' | 'rating_deviation' | 'elo' | 'elo_ratings' | 'region'>,
    password: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/* =======================
   Context
======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   Provider
======================= */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* -----------------------
     Fetch profile (WITH TIMEOUT)
  ----------------------- */
  const fetchProfileSafe = async (userId: string) => {
    try {
      // Set a 5 second timeout for profile fetch
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]) as any;

      if (error) {
        console.warn('PROFILE FETCH ERROR:', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.warn('PROFILE FETCH EXCEPTION:', err);
      return null;
    }
  };

  /* -----------------------
     Init Auth (REFRESH SAFE)
  ----------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Check active session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;

        if (session?.user) {
          console.log('SESSION FOUND:', session.user.email);

          // ⚡ profile is optional — never block auth
          const profile = await fetchProfileSafe(session.user.id);

          if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              ...(profile || { elo: 1200 }),
            });
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('AUTH INIT FAILED:', err);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('AUTH INIT DONE - LOADING FALSE');
          setIsLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AUTH EVENT:', _event);

      if (!mounted) return;

      if (session?.user) {
        const sbUser = session.user;
        const profile = await fetchProfileSafe(sbUser.id);

        if (mounted) {
          setUser({
            id: sbUser.id,
            email: sbUser.email!,
            ...(profile || { elo: 1200 }),
          });
        }
      } else {
        if (mounted) setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* -----------------------
     Email Login
  ----------------------- */
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  /* -----------------------
     Signup
  ----------------------- */
  const signup = async (
    userData: Pick<User, 'email' | 'name' | 'sports' | 'reliability_score' | 'calibration_games_remaining' | 'rating_deviation' | 'elo' | 'elo_ratings' | 'region'>,
    password: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: { name: userData.name },
      },
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: userData.name,
        sports: userData.sports ?? [],
        elo: userData.elo ?? 800, // Default to 800 if not provided
        reliability_score: userData.reliability_score ?? 100,
        calibration_games_remaining: userData.calibration_games_remaining ?? 5,
        rating_deviation: userData.rating_deviation ?? 350,
        elo_ratings: userData.elo_ratings ?? { [userData.sports?.[0] || 'general']: userData.elo ?? 800 },
        region: userData.region, // NEW: Save region
      });
    }
  };

  /* -----------------------
     Google OAuth
  ----------------------- */
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/feed`,
      },
    });
    if (error) throw error;
  };

  /* -----------------------
     Logout
  ----------------------- */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /* -----------------------
     Update Profile
  ----------------------- */
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    setUser(prev => (prev ? { ...prev, ...updates } : prev));
  };

  /* -----------------------
     Refresh Profile
  ----------------------- */
  const refreshProfile = async () => {
    if (!user) return;

    const profile = await fetchProfileSafe(user.id);

    if (profile) {
      setUser(prev => (prev ? { ...prev, ...profile } : prev));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =======================
   Hook
======================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};