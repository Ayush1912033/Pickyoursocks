import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { SPORTS } from '../constants';
import { ChevronLeft, ChevronRight, User as UserIcon, Check, MapPin, Calendar, Trophy, ChevronDown } from 'lucide-react';

// Mock Location Data
const LOCATIONS: Record<string, Record<string, string[]>> = {
  "India": {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"]
  },
  "USA": {
    "New York": ["New York City", "Buffalo", "Rochester"],
    "California": ["Los Angeles", "San Francisco", "San Diego"],
    "Texas": ["Houston", "Austin", "Dallas"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Liverpool"],
    "Scotland": ["Edinburgh", "Glasgow"]
  }
};

const COUNTRIES = Object.keys(LOCATIONS);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuth();

  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Profile
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const [gender, setGender] = useState('');
  const [level, setLevel] = useState('');

  // Step 3: Sports
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Reset dependent location fields
  useEffect(() => {
    setState('');
    setCity('');
  }, [country]);

  useEffect(() => {
    setCity('');
  }, [state]);

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev =>
      prev.includes(sportId)
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
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

  const validateStep1 = () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!country || !state || !city || !dobDay || !dobMonth || !dobYear || !gender || !level) {
      setError('Please complete your profile');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSignup = async () => {
    if (selectedSports.length === 0) {
      setError('Please select at least one sport');
      return;
    }

    try {
      await signup({
        name,
        email,
        region: `${city}, ${state}, ${country}`,
        dob: `${dobDay} ${dobMonth} ${dobYear}`,
        gender,
        level,
        sports: selectedSports
      }, password);
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  if (isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black italic mb-2">Welcome Back</h2>
            <p className="text-gray-400">Enter your details to access your account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="font-bold">!</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
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

          <p className="text-center text-gray-500 mt-8">
            Don't have an account?{' '}
            <button onClick={() => setIsLogin(false)} className="text-white font-bold hover:text-blue-400 transition-colors">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 transition-all duration-500">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Create Account</h2>
            <div className="flex items-center gap-2 mt-2 text-sm font-bold text-gray-500">
              <span className={step >= 1 ? 'text-blue-500' : ''}>1. Account</span>
              <span className="text-gray-700">/</span>
              <span className={step >= 2 ? 'text-blue-500' : ''}>2. Profile</span>
              <span className="text-gray-700">/</span>
              <span className={step >= 3 ? 'text-blue-500' : ''}>3. Sports</span>
            </div>
          </div>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="p-3 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
              <ChevronLeft size={24} />
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-3 rounded-2xl mb-8 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Account Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-11 pr-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={handleNext}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Next Step <ChevronRight size={18} />
              </button>
              <p className="text-center text-gray-500 mt-6 text-sm">
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-white font-bold hover:text-blue-500 transition-colors">
                  Login here
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Profile Info */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">

            {/* Location Dropdowns */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Location</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Country */}
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white appearance-none cursor-pointer"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>

                {/* State */}
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={!country}
                  >
                    <option value="">State</option>
                    {country && LOCATIONS[country] && Object.keys(LOCATIONS[country]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>

                {/* City */}
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!state}
                  >
                    <option value="">City</option>
                    {country && state && LOCATIONS[country][state] && LOCATIONS[country][state].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Custom Date Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Date of Birth</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white appearance-none cursor-pointer"
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                  >
                    <option value="">Day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white appearance-none cursor-pointer"
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value)}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white appearance-none cursor-pointer"
                    value={dobYear}
                    onChange={(e) => setDobYear(e.target.value)}
                  >
                    <option value="">Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Gender</label>
              <div className="relative">
                <select
                  className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-black/80 transition-all text-white appearance-none cursor-pointer"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Highest Competition Level</label>
              <div className="grid grid-cols-2 gap-3">
                {['Recreational', 'Regional', 'State', 'National', 'International'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${level === lvl
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNext}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Choose Sports <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sports Selection */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <p className="text-gray-400 text-sm">Select all the sports you are interested in.</p>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {SPORTS.map((sport) => {
                const isSelected = selectedSports.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    className={`relative aspect-square rounded-2xl overflow-hidden group border transition-all ${isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                      }`}
                  >
                    <img src={sport.image} alt={sport.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-black/60 transition-colors ${isSelected ? 'bg-blue-900/40' : ''}`} />

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                        <Check size={12} className="text-white" />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 w-full p-3 text-center">
                      <span className="text-xs font-bold uppercase tracking-tighter text-white shadow-black drop-shadow-md">
                        {sport.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                {isLoading ? 'Creating Account...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Auth;
