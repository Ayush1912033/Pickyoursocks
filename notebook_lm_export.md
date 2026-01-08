# Pickyoursocks Project Context for NotebookLM

## 1. Project Overview
Pickyoursocks is a gamified social sports application that connects athletes, tracks their ELO stats, and helps them find matches.
**Key Features:**
- **Radar Feed**: A "command center" showing actionable match opportunities based on ELO.
- **Social Feed**: A traditional social feed for community updates.
- **Rankings**: A leaderboard system with local ranks and tiers.
- **Gamification**: ELO ratings, streaks, tiers, and "scout" reports.
- **Authentication**: Custom auth flow with "Guest", "Login", and "Signup" modes, using Supabase.

## 2. Current Status (Task List)
The current focus has been on hardening the authentication flow, ensuring proper redirects for login, logout, and protected routes.

- [x] Investigate `AuthContext.tsx` for auth state management
- [x] Investigate `Login.tsx` (or equivalent) for login logic and redirection
- [x] Investigate `App.tsx` for routing and protected routes
- [x] Investigate `Feed.tsx` for protected route logic
- [x] Identify the cause of the redirect to signup
- [x] Fix the redirect issue
    - [x] Create `ProtectedRoute.tsx`
    - [x] Modify `Auth.tsx` to handle query params
    - [x] Update `Navbar.tsx` links
    - [x] Update `App.tsx` routes
- [x] Investigate `Navbar.tsx` and `index.tsx` for redirect logic
- [x] Create walkthrough for verification
- [x] Configure logout to redirect to Landing Page (`/`)
    - [x] Update `Profile.tsx` to navigate with state
    - [x] Update `App.tsx` (Home) to handle logout state

## 3. Key Implementation Files

### `frontend/App.tsx` (Routing & Logout Handler)
```tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SportsGrid from './components/SportsGrid';
import Community from './components/Community';
import Waitlist from './components/Waitlist';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { useAuth } from './components/AuthContext';

// 🔐 Auth Page (Login + Signup combined)
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import AllSports from './pages/AllSports';
import Rankings from './pages/Rankings';
import ProtectedRoute from './components/ProtectedRoute';

const Home: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (user && location.state?.fromLogout) {
      logout();
    }
  }, [user, location, logout]);

  if (isLoading) {
    return <div className="min-h-screen bg-black" />;
  }

  if (user && !location.state?.fromLogout) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main>
        <Hero />

        <div className="relative z-10 bg-black">
          <Features />
          <SportsGrid limit={4} />
          <Community />
          <Waitlist />
        </div>
      </main>

      <Footer />

      {/* Background static / noise overlay for cinematic feel */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
    </div>
  );
};

import { isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    // ... Error UI ...
    return null; 
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected Routes */}
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/sports" element={<AllSports />} />
      <Route
        path="/rankings"
        element={
          <ProtectedRoute>
            <Rankings />
          </ProtectedRoute>
        }
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
    </Routes>
  );
};

export default App;
```

### `frontend/components/ProtectedRoute.tsx` (Auth Guard)
```tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // Basic loading spinner or skeleton
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login, preserving the attempted location
        return <Navigate to={`/auth?mode=login&redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
```

### `frontend/pages/Auth.tsx` (Login/Signup Logic)
```tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { User as UserIcon } from 'lucide-react';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode'); // 'login' or 'signup'

  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const navigate = useNavigate();

  const { login, signup, loginWithGoogle, isLoading, user } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Effect: Sync state with URL param if it changes
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') setIsLogin(false);
    if (mode === 'login') setIsLogin(true);
  }, [searchParams]);

  // Effect: Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/feed', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... login logic ...
    try {
      await login(email, password);
      // Navigation handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... signup logic ...
    try {
      await signup({ name, email }, password);
      // Navigation handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  const toggleMode = () => {
    const newMode = !isLogin ? 'login' : 'signup';
    setIsLogin(!isLogin);
    navigate(`/auth?mode=${newMode}`, { replace: true });
  }

  return (
    // ... JSX ...
      <div className="... container ...">
        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin}>
             {/* ... inputs ... */}
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignup}>
             {/* ... inputs ... */}
          </form>
        )}
        <button onClick={toggleMode}>
            {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </div>
  );
};

export default Auth;
```

### `frontend/pages/Profile.tsx` (Logout Logic Snippet)
```tsx
// ... imports ...
const Profile: React.FC = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    
    // ...

    return (
        // ...
                    {/* Logout Section */}
                    <div className="mt-24 mb-12 flex justify-center">
                        <button
                            onClick={() => {
                                // Navigate to Home with 'fromLogout' state to trigger cleanup in App.tsx
                                navigate('/', { state: { fromLogout: true } });
                            }}
                            className="text-red-500 font-bold uppercase tracking-widest text-sm hover:text-red-400 hover:underline transition-all"
                        >
                            Logout
                        </button>
                    </div>
        // ...
    );
};
```

### `frontend/components/Navbar.tsx` (Navigation Links)
```tsx
// ... imports ...
const Navbar: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <nav>
       {/* ... Logo Link logic ... */}
       <Link to={user ? "/feed" : "/"} ... > ... </Link>

       {/* ... Auth Buttons ... */}
       {user ? (
          // Authenticated State: Profile Link
          <Link to="/profile"> ... </Link>
       ) : (
          // Guest State: Login/Signup Links
          <>
            <Link to="/auth?mode=login">Login</Link>
            <Link to="/auth?mode=signup">Sign Up</Link>
          </>
       )}
    </nav>
  );
};
```
