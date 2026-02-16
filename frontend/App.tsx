import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import { NotificationProvider } from './components/NotificationContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SportsGrid from './components/SportsGrid';
import Community from './components/Community';
import Waitlist from './components/Waitlist';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// Pages
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Radar from './pages/Radar';
import AllSports from './pages/AllSports';
import Rankings from './pages/Rankings';
import ProtectedRoute from './components/ProtectedRoute';

/* ======================
   Home Page (PUBLIC)
====================== */
const Landing: React.FC = () => {
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
          <div className="fixed bottom-2 left-2 text-[10px] text-white/20 pointer-events-none z-[200]">
            v2.1 (Routing Fix)
          </div>
        </div>
      </main>

      <Footer />

      {/* Background static / noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
    </div>
  );
};

/* ======================
   Root Route (Smart Redirect)
   - Guests -> Landing
   - Users -> Feed
 ====================== */
const RootHandler: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/feed', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If we are here, user is null (or loading finished efficiently)
  // We render Landing for guests. 
  // If user *was* present, the useEffect above would have navigated away.
  return <Landing />;
};

/* ======================
   App Router
 ====================== */
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <Routes>
        {/* Root: Landing (or Redirect to Feed if logged in) */}
        <Route path="/" element={<RootHandler />} />

        {/* Feed: Explicitly Protected */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/sports" element={<AllSports />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Other Protected Routes */}
        <Route
          path="/radar"
          element={
            <ProtectedRoute>
              <Radar />
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
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rankings"
          element={
            <ProtectedRoute>
              <Rankings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </NotificationProvider>
  );
};

export default App;
