

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
  refreshProfile: () => Promise<User | null>;
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
  const navigate = useNavigate();

  /* -----------------------
     Fetch profile (WITH TIMEOUT)
  ----------------------- */
  /* -----------------------
     Fetch profile (WITH TIMEOUT & CACHE)
  ----------------------- */
  const fetchProfileSafe = async (userId: string) => {
    try {
      // 1. Try to load from cache first for immediate display
      const cachedProfile = localStorage.getItem(`pys_profile_${userId}`);
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile);
          // Verify it has sports, otherwise treat as stale if we want strictness, 
          // but for now, returning cached is better than nothing.
          // We return this immediately if network fails? No, we return it if network fails.
        } catch (e) {
          console.warn('CACHE PARSE FAIL', e);
          localStorage.removeItem(`pys_profile_${userId}`);
        }
      }

      // Set a 10 second timeout for profile fetch
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
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
        // Fallback to cache if network error
        if (cachedProfile) return JSON.parse(cachedProfile);
        return null;
      }

      if (data) {
        // Update cache
        localStorage.setItem(`pys_profile_${userId}`, JSON.stringify(data));
      }

      return data;
    } catch (err) {
      console.warn('PROFILE FETCH EXCEPTION:', err);
      // Fallback to cache if exception
      const cachedProfile = localStorage.getItem(`pys_profile_${userId}`);
      if (cachedProfile) return JSON.parse(cachedProfile);
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
          setUser(prev => {
            // 1. If we got a valid profile, use it
            if (profile) {
              return {
                id: sbUser.id,
                email: sbUser.email!,
                ...profile,
              };
            }

            // 2. If fetch failed (null) but we already have this user loaded with sports, KEEP IT!
            // This prevents "flickering" to onboarding on transient network errors during tab switches
            if (prev && prev.id === sbUser.id && prev.sports && prev.sports.length > 0) {
              console.warn('Profile fetch failed, preserving existing user state to prevent redirect loop.');
              return prev;
            }

            // 3. If no previous state and fetch failed, we have to fallback to default (which might trigger onboarding, but correctly so)
            return {
              id: sbUser.id,
              email: sbUser.email!,
              elo: 1200, // Default
            };
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
    // Generate a unique username to prevent trigger failures on collision
    const emailPrefix = userData.email.split('@')[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    const uniqueUsername = `${emailPrefix}${randomSuffix}`;

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: {
          name: userData.name,
          full_name: userData.name, // Trigger expects full_name
          username: uniqueUsername, // Trigger expects username or defaults to email prefix (collision prone)
          sports: userData.sports,
          elo: userData.elo,
          reliability_score: userData.reliability_score,
          calibration_games_remaining: userData.calibration_games_remaining,
          rating_deviation: userData.rating_deviation,
          elo_ratings: userData.elo_ratings,
          region: userData.region,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const newProfile = {
        name: userData.name,
        username: uniqueUsername, // Save the generated username
        sports: userData.sports ?? [],
        elo: userData.elo ?? 800, // Default to 800 if not provided
        reliability_score: userData.reliability_score ?? 100,
        calibration_games_remaining: userData.calibration_games_remaining ?? 5,
        rating_deviation: userData.rating_deviation ?? 350,
        elo_ratings: userData.elo_ratings ?? { [userData.sports?.[0] || 'tennis']: userData.elo ?? 800 },
        region: userData.region, // NEW: Save region
      };

      await supabase.from('profiles').upsert({
        id: data.user.id,
        ...newProfile
      });

      // FIX: Immediately set user state to avoid race condition with fetchProfileSafe
      setUser({
        id: data.user.id,
        email: data.user.email!,
        ...newProfile
      });

      // Update Cache
      localStorage.setItem(`pys_profile_${data.user.id}`, JSON.stringify(newProfile));
    }
  };

  /* -----------------------
     Google OAuth
  ----------------------- */
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  /* -----------------------
     Logout
  ----------------------- */
  const logout = async () => {
    setIsLoading(true);
    try {
      // 1. Navigate AWAY from protected routes first
      navigate('/landing');

      // 2. Clear Supabase session
      await supabase.auth.signOut();

      // 3. Update local state (triggers re-render)
      setUser(null);
    } finally {
      setIsLoading(false);
    }
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

    if (error) {
      console.error('UPDATE USER FAILED:', error);
      throw error;
    }

    setUser(prev => {
      const newState = prev ? { ...prev, ...updates } : prev;
      if (newState) {
        localStorage.setItem(`pys_profile_${user.id}`, JSON.stringify(newState));
      }
      return newState;
    });
  };

  /* -----------------------
     Refresh Profile
  ----------------------- */
  const refreshProfile = async (): Promise<User | null> => {
    if (!user) return null;

    const profile = await fetchProfileSafe(user.id);

    if (profile) {
      setUser(prev => (prev ? { ...prev, ...profile } : prev));

      // Ensure chat keys exist
      if (!profile.public_key && !localStorage.getItem('pys_chat_private_key')) {
        const { generateAndStoreKeys } = await import('../lib/chat');
        generateAndStoreKeys(user.id).catch(console.error);
      }

      // Return the merged user object for immediate checking
      return { ...user, ...profile };
    }
    return null;
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