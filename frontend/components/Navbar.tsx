import React, { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from './AuthContext';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
      {children}
    </a>
  );

  return (
    <nav
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${scrolled
        ? 'w-full px-6 lg:px-12 py-4 bg-black/95 backdrop-blur-md border-b border-white/10 rounded-none'
        : 'w-[95%] max-w-[1400px] px-8 py-4 bg-blue-600 shadow-2xl shadow-blue-600/30 rounded-b-2xl'
        }`}
    >
      <div className="w-full flex items-center justify-between relative">

        {/* Left Section: Logo + Primary Nav */}
        <div className="flex items-center gap-6 xl:gap-8">
          {/* Logo */}
          {/* Logo */}
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
            <NavLink href="/#events">Events</NavLink>
            <NavLink href="/#rankings">Rankings</NavLink>
            <NavLink href="/#athletes">Athletes</NavLink>
            <NavLink href="/#news">News</NavLink>
          </div>
        </div>

        {/* Right Section: Secondary Nav + Auth */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <NavLink href="/#connect">Connect</NavLink>
          <Search className="text-gray-300 w-4 h-4 cursor-pointer hover:text-white transition-colors" />

          {/* Auth Buttons */}
          {user ? (
            <div className="relative group">
              <button
                className="rounded-full transition-all group-hover:ring-2 ring-blue-600/50 outline-none"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <span className="text-base font-black italic">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu (Hover for Desktop) */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden w-48 shadow-xl">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                  </div>

                  <Link to="/profile" className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
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

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-white p-2 relative z-50 ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-transform duration-500 lg:hidden flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-500">Home</Link>
        <a href="/#events" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest hover:text-blue-500">Events</a>
        <a href="/#rankings" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest hover:text-blue-500">Rankings</a>
        <a href="/#athletes" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest hover:text-blue-500">Athletes</a>
        <a href="/#news" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest hover:text-blue-500">News</a>

        {!user && (
          <div className="flex flex-col items-center gap-6 mt-8">
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest">Login</Link>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="bg-blue-600 text-white text-lg font-black uppercase tracking-widest px-10 py-4 rounded-full">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
