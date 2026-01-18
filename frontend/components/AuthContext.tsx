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
  signup: (
    userData: Pick<User, 'email' | 'name' | 'sports'>,
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
     Fetch profile (SAFE)
  ----------------------- */
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Profile fetch failed:', error.message);
      return null;
    }

    return data;
  };

  /* -----------------------
     Init Auth
  ----------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data?.session?.user && mounted) {
          const sbUser = data.session.user;
          const profile = await fetchProfile(sbUser.id);

          if (profile) {
            setUser({
              ...profile,
              id: sbUser.id,
              email: sbUser.email!,
            });
          } else {
            // fallback (should rarely happen)
            setUser({
              id: sbUser.id,
              email: sbUser.email!,
              elo: 1200,
            });
          }
        }
      } catch (err) {
        console.error('AUTH INIT ERROR', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const sbUser = session.user;
          const profile = await fetchProfile(sbUser.id);

          if (profile) {
            setUser({
              ...profile,
              id: sbUser.id,
              email: sbUser.email!,
            });
          } else {
            setUser({
              id: sbUser.id,
              email: sbUser.email!,
              elo: 1200,
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
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
    userData: Pick<User, 'email' | 'name' | 'sports'>,
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
        elo: 1200,
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
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    setUser(prev => (prev ? { ...prev, ...updates } : prev));
  };

  /* -----------------------
     Refresh Profile
  ----------------------- */
  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id);
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
