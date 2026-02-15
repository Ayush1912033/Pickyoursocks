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
  profileError: string | null; // ADDED

  /* -----------------------
     Fetch profile (WITH RETRY & TIMEOUT)
  ----------------------- */
  const fetchProfileSafe = async (userId: string, retries = 3, delay = 1000): Promise<any> => {
    setProfileError(null);
    for (let i = 0; i < retries; i++) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );

        const fetchPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
        const { data, error } = result || {};

        if (error) {
          console.warn(`PROFILE FETCH ATTEMPT ${i + 1} ERROR:`, error.message || error);
          if (i === retries - 1) {
            setProfileError(`Failed to load profile: ${error.message || 'Unknown error'}`);
            return null;
          }
          await new Promise(res => setTimeout(res, delay * (i + 1)));
          continue;
        }

        if (data) {
          console.log('Profile fetch success:', data?.username);
          return data;
        }

        // No data but no error: retry if attempts remain
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, delay * (i + 1)));
          continue;
        }

        return null;
      } catch (err: any) {
        console.warn(`PROFILE FETCH ATTEMPT ${i + 1} FAILED:`, err.message || err);
        if (i === retries - 1) {
          setProfileError(`Failed to load profile: ${err.message || 'Unknown error'}`);
          return null;
        }
        await new Promise(res => setTimeout(res, delay * (i + 1)));
      }
    }
    return null;
  };
        if (data) {
          console.log('Profile fetch success:', data?.username);
          return data;
        }

        // No data but no error: retry if attempts remain
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, delay * (i + 1)));
          continue;
        }

        return null;
      } catch (err: any) {
        console.warn(`PROFILE FETCH ATTEMPT ${i + 1} FAILED:`, err.message || err);
        if (i === retries - 1) {
          setProfileError(`Failed to load profile: ${err.message || 'Unknown error'}`);
          return null;
        }
        await new Promise(res => setTimeout(res, delay * (i + 1)));
      }
    }
    return null;
  };
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
        profileError, // EXPOSE ERROR
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
