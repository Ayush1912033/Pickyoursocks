import React, { useState, useEffect } from 'react';
import { Search, Home, Radio, Trophy, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from './AuthContext';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* 1. Desktop Top Navigation & Mobile Top Logo */}
      <nav
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${scrolled
          ? 'w-full px-4 lg:px-12 py-3 lg:py-4 bg-black/95 backdrop-blur-md border-b border-white/10 rounded-none'
          : 'w-full lg:w-[95%] max-w-[1400px] px-4 lg:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent lg:bg-blue-600 lg:rounded-b-2xl lg:shadow-2xl lg:shadow-blue-600/30'
          }`}
      >
        <div className="w-full flex items-center justify-between relative">

          {/* Left Section: Logo + Desktop Nav */}
          <div className="flex items-center gap-6 xl:gap-8">
            <Link to={user ? "/feed" : "/"} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-white text-blue-600 rounded-sm flex items-center justify-center font-black italic">
                P
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-white hidden md:block">
                Pickyoursocks
              </span>
            </Link>

            {/* Desktop Primary Nav */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 border-l border-white/10 pl-6 xl:pl-8">
              <Link to="/feed" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Radar</Link>
              <Link to="/rankings" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Ranking</Link>
            </div>
          </div>

          {/* Right Section: Secondary Nav + Auth (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Search className="text-gray-300 w-4 h-4 cursor-pointer hover:text-white transition-colors" />

            {/* Auth Buttons */}
            {user ? (
              <Link
                to="/profile"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
              >
                <span className="text-base font-black italic">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <Link
                  to="/auth"
                  className="text-xs font-bold uppercase tracking-widest text-white hover:text-blue-200 transition"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="bg-white text-blue-600 text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Mobile Bottom Navigation (Thumb Zone) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center justify-between px-6 py-4">
          <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-blue-500' : 'text-gray-500'}`}>
            <Home size={20} className={isActive('/') ? 'fill-blue-500/20' : ''} />
            {isActive('/') && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
          </Link>

          <Link to="/feed" className={`flex flex-col items-center gap-1 ${isActive('/feed') ? 'text-blue-500' : 'text-gray-500'}`}>
            <Radio size={20} className={isActive('/feed') ? 'fill-blue-500/20' : ''} />
            {isActive('/feed') && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
          </Link>

          <div className="relative -top-8">
            <Link to="/feed" className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/40 border-4 border-black hover:scale-105 transition-transform">
              <span className="text-2xl font-black italic">+</span>
            </Link>
          </div>

          <Link to="/rankings" className={`flex flex-col items-center gap-1 ${isActive('/rankings') ? 'text-blue-500' : 'text-gray-500'}`}>
            <Trophy size={20} className={isActive('/rankings') ? 'fill-blue-500/20' : ''} />
            {isActive('/rankings') && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
          </Link>

          <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-blue-500' : 'text-gray-500'}`}>
            <User size={20} className={isActive('/profile') ? 'fill-blue-500/20' : ''} />
            {isActive('/profile') && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
