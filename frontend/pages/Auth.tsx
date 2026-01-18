import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { User as UserIcon } from 'lucide-react';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode'); // 'login' or 'signup'

  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const navigate = useNavigate();

  // ⬇️ UPDATED: include loginWithGoogle
  const { login, signup, loginWithGoogle, isLoading } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isSportsDropdownOpen, setIsSportsDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => {
      if (prev.includes(sportId)) {
        return prev.filter((id) => id !== sportId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, sportId];
    });
  };

  /* --------------------
     Login
  -------------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      // Navigation handled by useEffect
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  /* --------------------
     Signup
  -------------------- */
  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!name || !email || !password) {
    setError('Please fill in all fields');
    return;
  }

    if (selectedSports.length === 0) {
      setError('Please select at least one sport');
      return;
    }

    try {
      await signup(
        {
          name,
          email,
          sports: selectedSports,
        },
        password
      );
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  /* --------------------
     Google OAuth
  -------------------- */
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // redirect handled by Supabase
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  const toggleMode = () => {
    const newMode = !isLogin ? 'login' : 'signup';
    setIsLogin(!isLogin);
    // Optional: Update URL without reload to keep state in sync
    navigate(`/auth?mode=${newMode}`, { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 relative overflow-hidden py-10">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400">
            {isLogin
              ? 'Enter your details to access your account'
              : 'Join PickYourSocks today'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ================= LOGIN ================= */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={isLoading}
              className="w-full bg-blue-600 mt-6 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Continue with Google
            </button>
          </form>
        ) : (
          /* ================= SIGNUP ================= */
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <UserIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-11 pr-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

              <input
                type="password"
                placeholder="Password (min 8 chars)"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            

            {/* Sports Dropdown (unchanged) */}
            {/* YOUR EXISTING SPORTS CODE REMAINS AS IS */}

            <button
              disabled={isLoading}
              className="w-full bg-blue-600 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Continue with Google
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 mt-8">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={toggleMode}
            className="text-white font-bold hover:text-blue-400"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
