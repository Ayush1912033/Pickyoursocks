import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SportsGrid from './components/SportsGrid';
import Community from './components/Community';
import Waitlist from './components/Waitlist';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// 🔐 Auth Page (Login + Signup combined)
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import AllSports from './pages/AllSports';
import Rankings from './pages/Rankings';

const Home: React.FC = () => {
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
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-black italic text-red-500 mb-4">Configuration Missing</h1>
          <p className="text-gray-400 mb-6">
            The application cannot start because the Supabase configuration is missing.
          </p>

          <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-6 font-mono text-xs text-blue-400 overflow-x-auto">
            <p className="text-gray-500 mb-2"># Create a file named .env in frontend/</p>
            <p>VITE_SUPABASE_URL=your_project_url</p>
            <p>VITE_SUPABASE_ANON_KEY=your_anon_key</p>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Restart the server after adding the file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/sports" element={<AllSports />} />
      <Route path="/rankings" element={<Rankings />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
    </Routes>
  );
};

export default App;
