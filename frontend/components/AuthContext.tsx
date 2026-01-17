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

interface User {
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
  preferred_format?: string;
  experience_years?: number;
  available_days?: string[];
  time_slots?: string[];
  bio?: string;
  achievements?: string[];
  connections?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'>, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
     Map Supabase User
  ----------------------- */
  const mapSupabaseUser = (sbUser: any): User => ({
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.full_name,
    username: sbUser.user_metadata?.username,
    profile_photo: sbUser.user_metadata?.profile_photo,
    sports: sbUser.user_metadata?.sports,
    region: sbUser.user_metadata?.region,
    locality: sbUser.user_metadata?.locality,
    dob: sbUser.user_metadata?.dob,
    gender: sbUser.user_metadata?.gender,
    level: sbUser.user_metadata?.level,
    elo: sbUser.user_metadata?.elo,
    preferred_format: sbUser.user_metadata?.preferred_format,
    experience_years: sbUser.user_metadata?.experience_years,
    available_days: sbUser.user_metadata?.available_days,
    time_slots: sbUser.user_metadata?.time_slots,
    bio: sbUser.user_metadata?.bio,
    achievements: sbUser.user_metadata?.achievements,
    connections: sbUser.user_metadata?.connections,
  });

  /* -----------------------
     Load Session on Start
  ----------------------- */
  /* -----------------------
     Load Session on Start
  ----------------------- */
  useEffect(() => {
    // If Supabase is not configured, stop loading and do nothing
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setIsLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* -----------------------
     Email Login
  ----------------------- */
  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured");
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    if (error) throw error;
  };

  /* -----------------------
     Signup
  ----------------------- */
  const signup = async (userData: Omit<User, 'id'>, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured");
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: {
          full_name: userData.name,
          username: userData.username,
          profile_photo: userData.profile_photo,
          sports: userData.sports,
          region: userData.region,
          locality: userData.locality,
          dob: userData.dob,
          gender: userData.gender,
          level: userData.level,
          elo: userData.elo,
          preferred_format: userData.preferred_format,
          experience_years: userData.experience_years,
          available_days: userData.available_days,
          time_slots: userData.time_slots,
          bio: userData.bio,
          achievements: userData.achievements,
        },
      },
    });

    setIsLoading(false);
    if (error) throw error;
  };

  /* -----------------------
     Google OAuth
  ----------------------- */
  const loginWithGoogle = async () => {
    if (!supabase) throw new Error("Supabase is not configured");
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
    if (!supabase) return;
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  /* -----------------------
     Update User Profile
  ----------------------- */
  const updateUser = async (updates: Partial<User>) => {
    if (!user || !supabase) return;

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: updates.name ?? user.name,
        username: updates.username ?? user.username,
        profile_photo: updates.profile_photo ?? user.profile_photo,
        sports: updates.sports ?? user.sports,
        region: updates.region ?? user.region,
        locality: updates.locality ?? user.locality,
        dob: updates.dob ?? user.dob,
        gender: updates.gender ?? user.gender,
        level: updates.level ?? user.level,
        elo: updates.elo ?? user.elo,
        preferred_format: updates.preferred_format ?? user.preferred_format,
        experience_years: updates.experience_years ?? user.experience_years,
        available_days: updates.available_days ?? user.available_days,
        time_slots: updates.time_slots ?? user.time_slots,
        bio: updates.bio ?? user.bio,
        achievements: updates.achievements ?? user.achievements,
      },
    });

    if (error) throw error;

    // Immediately update local state
    if (data.user) {
      setUser(mapSupabaseUser(data.user));
    }
  };

  /* -----------------------
     Provider Value
  ----------------------- */
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
