import React from 'react';
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
   App Router
 ====================== */
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <Routes>
        {/* Protected Root Feed (Instagram Style) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/sports" element={<AllSports />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Legacy/Redirects */}
        <Route path="/feed" element={<Navigate to="/" replace />} />

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
