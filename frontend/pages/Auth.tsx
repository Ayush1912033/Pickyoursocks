import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { SPORTS } from '../constants';
import { User as UserIcon, ChevronDown, X, Check } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuth();

  // Signup Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isSportsDropdownOpen, setIsSportsDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        return prev.filter(id => id !== sportId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, sportId];
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
      await navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (selectedSports.length === 0) {
      setError('Please select at least one sport');
      return;
    }

    try {
      await signup({
        name,
        email,
        sports: selectedSports
      }, password);
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 relative overflow-hidden py-10">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 my-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join the Club'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Enter your details to access your account' : 'Create your athlete profile'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span className="font-bold">!</span> {error}
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="max-w-md mx-auto">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white placeholder:text-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white placeholder:text-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-blue-600 text-white mt-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative col-span-2">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-11 pr-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white placeholder:text-gray-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white placeholder:text-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password (Min. 8 chars)"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white placeholder:text-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                Select Sports <span className="text-gray-600 normal-case tracking-normal">(Max 3)</span>
              </label>

              {/* Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsSportsDropdownOpen(!isSportsDropdownOpen)}
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white text-left flex items-center justify-between min-h-[60px]"
              >
                <div className="flex flex-wrap gap-2">
                  {selectedSports.length === 0 && <span className="text-gray-600">Select up to 3 sports</span>}
                  {selectedSports.map(id => {
                    const sport = SPORTS.find(s => s.id === id);
                    return (
                      <span key={id} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        {sport?.name}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSport(id);
                          }}
                          className="hover:bg-blue-700 rounded-full p-0.5 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </div>
                      </span>
                    );
                  })}
                </div>
                <ChevronDown size={20} className={`text-gray-500 transition-transform ${isSportsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isSportsDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {SPORTS.map((sport) => {
                      const isSelected = selectedSports.includes(sport.id);
                      const isDisabled = !isSelected && selectedSports.length >= 3;

                      return (
                        <button
                          key={sport.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => toggleSport(sport.id)}
                          className={`px-4 py-3 rounded-lg text-sm font-bold text-left transition-all flex items-center justify-between ${isSelected
                            ? 'bg-blue-600 text-white'
                            : isDisabled
                              ? 'opacity-30 cursor-not-allowed text-gray-500'
                              : 'hover:bg-white/5 text-gray-300 hover:text-white'
                            }`}
                        >
                          {sport.name}
                          {isSelected && <Check size={16} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-white font-bold hover:text-blue-400 transition-colors">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
