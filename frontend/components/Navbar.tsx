import React, { useState, useEffect } from 'react';
import {
  Search,
  Home,
  Radio,
  Trophy,
  User,
  ChevronDown,
  PlusSquare,
  LogOut,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from './AuthContext';
import CreatePostModal from './CreatePostModal';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openPost, setOpenPost] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, profile_photo')
        .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(5);

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        return;
      }

      setSearchResults(data || []);
    } catch (err) {
      console.error('Search exception:', err);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  /* ======================
     Reusable Nav Item
  ====================== */
  const NavItem = ({
    title,
    to,
    children,
  }: {
    title: string;
    to?: string;
    children?: React.ReactNode;
  }) => (
    <div className="group relative h-full flex items-center">
      <Link
        to={to || '#'}
        className="text-[13px] font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors flex items-center gap-1 py-4 px-3"
      >
        {title}
        {children && (
          <ChevronDown
            size={10}
            className="text-gray-500 group-hover:text-white transition-colors"
          />
        )}
      </Link>

      {children && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 -translate-y-5 pointer-events-none transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
          <div
            className={`w-48 rounded-xl border border-white/10 overflow-hidden shadow-2xl ${scrolled ? 'bg-black/95' : 'bg-blue-600'
              }`}
          >
            <div className="py-2 flex flex-col">{children}</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ======================
          Desktop Top Navigation
      ====================== */}
      <nav
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-[max-width,background-color,border-radius,padding] duration-500 linear hidden lg:flex items-center justify-between w-full ${scrolled
          ? 'max-w-full px-6 lg:px-12 py-4 bg-black/95 backdrop-blur-md border-b border-white/10 rounded-none shadow-lg'
          : 'max-w-[76.25rem] px-8 py-4 bg-blue-600 rounded-b-3xl shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)]'
          }`}
      >
        {/* LEFT SECTION */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white text-blue-600 rounded-sm flex items-center justify-center font-black italic shadow-lg group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic text-white group-hover:opacity-90 transition-opacity">
              Pickyoursocks
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-1 border-l border-white/10 pl-8 h-8">
              <NavItem title="Home" to="/" />
              <NavItem title="Radar" to="/radar" />
              <NavItem title="Ranking" to="/rankings" />
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-6">

          {/* SEARCH COMPONENT */}
          <div className="relative" onMouseLeave={() => {
            setIsSearchOpen(false);
            setSearchResults([]);
            setSearchQuery('');
          }}>
            <div className={`flex items-center rounded-full transition-all duration-300 ease-out ${isSearchOpen ? 'w-64 px-3 py-2 bg-zinc-900 border border-white/10 shadow-lg' : 'w-8 h-8 justify-center cursor-pointer bg-transparent hover:bg-white/5'
              }`}>
              <Search
                size={isSearchOpen ? 16 : 18}
                className={`transition-colors duration-300 ${isSearchOpen ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}
                onClick={() => {
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
              />
              {isSearchOpen && (
                <input
                  autoFocus
                  className="bg-transparent border-none outline-none text-sm text-white ml-3 w-full placeholder-gray-600 font-medium"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              )}
            </div>

            {/* Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                {searchResults.map((result: any) => (
                  <div
                    key={result.id}
                    onClick={() => {
                      navigate(`/profile/${result.id}`);
                      setIsSearchOpen(false);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {result.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{result.name}</p>
                      <p className="text-xs text-gray-500">@{result.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={() => setOpenPost(true)}
              className="flex items-center gap-2 bg-white text-blue-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <PlusSquare size={14} />
              Post
            </button>
          )}

          {user ? (
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20"
            >
              {(user.name || 'U')[0].toUpperCase()}
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/auth?mode=login"
                className="text-xs font-bold uppercase tracking-widest text-white hover:text-blue-200 transition"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="bg-white text-blue-600 text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ======================
          Mobile Top Bar
      ====================== */}
      <div className="lg:hidden fixed top-0 w-full z-40 bg-black/95 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="w-8 h-8 bg-white text-blue-600 rounded flex items-center justify-center font-black italic"
        >
          P
        </Link>
        <span className="text-white font-black italic uppercase tracking-tighter">
          Pickyoursocks
        </span>
        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Search size={22} />
            </button>
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white"
            >
              {(user.name || 'U')[0].toUpperCase()}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/auth?mode=login"
              className="text-[11px] font-bold uppercase text-white/70"
            >
              Login
            </Link>
            <Link
              to="/auth?mode=signup"
              className="text-[11px] font-black uppercase bg-white text-blue-600 px-3 py-1.5 rounded-lg shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* ======================
          Mobile Bottom Nav - ONLY FOR LOGGED IN USERS
      ====================== */}
      {user && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center justify-around px-6 py-4">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-blue-500' : 'text-gray-500'
                }`}
            >
              <Home size={20} />
              {isActive('/') && (
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              )}
            </Link>

            <Link
              to="/radar"
              className={`flex flex-col items-center gap-1 ${isActive('/radar') ? 'text-blue-500' : 'text-gray-500'
                }`}
            >
              <Radio size={20} />
              {isActive('/radar') && (
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              )}
            </Link>

            <button
              onClick={() => setOpenPost(true)}
              className="flex flex-col items-center gap-1 text-blue-500"
            >
              <PlusSquare size={22} />
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            </button>

            <Link
              to="/rankings"
              className={`flex flex-col items-center gap-1 ${isActive('/rankings') ? 'text-blue-500' : 'text-gray-500'
                }`}
            >
              <Trophy size={20} />
              {isActive('/rankings') && (
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              )}
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-blue-500' : 'text-gray-500'
                }`}
            >
              <User size={20} />
              {isActive('/profile') && (
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* ======================
          Mobile Search Overlay
      ====================== */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col pt-4 px-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3 w-full">
              <Search className="text-gray-500" size={20} />
              <input
                autoFocus
                placeholder="Search for friends..."
                className="bg-transparent text-white text-lg font-bold placeholder-gray-600 outline-none w-full"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-2 bg-zinc-900 rounded-full text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronDown size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2 pb-20">
                {searchResults.map((result: any) => (
                  <div
                    key={result.id}
                    onClick={() => {
                      navigate(`/profile/${result.id}`);
                      setIsSearchOpen(false);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-2xl active:scale-95 transition-transform border border-white/5"
                  >
                    <img
                      src={result.profile_photo || '/avatar-placeholder.png'}
                      className="w-12 h-12 rounded-full object-cover bg-zinc-800 border border-white/10"
                    />
                    <div>
                      <p className="text-base font-bold text-white">{result.name}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">@{result.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 1 ? (
              <div className="text-center py-20 opacity-50">
                <Search size={48} className="mx-auto mb-4 text-zinc-800" />
                <p className="text-gray-500 font-bold uppercase tracking-widest">No users found</p>
              </div>
            ) : (
              <div className="text-center py-20 opacity-50">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Search className="text-gray-600" size={24} />
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Type to search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================
          Create Post Modal
      ====================== */}
      {openPost && <CreatePostModal onClose={() => setOpenPost(false)} />}
    </>
  );
};

export default Navbar;
