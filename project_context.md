# Pickyoursocks Project Context

## Overview
Pickyoursocks is a gamified social sports application that connects athletes, tracks their ELO stats, and helps them find matches.
Key features:
- **Radar Feed**: A "command center" showing actionable match opportunities based on ELO.
- **Social Feed**: A traditional social feed for community updates (posts, match results).
- **Rankings**: A leaderboard system with local ranks and tiers.
- **Connect Hub**: A page to manage connection requests and discover new partners.
- **Gamification**: ELO ratings, streaks, tiers, and "scout" reports.

## Directory Structure (Key Files)
- `frontend/App.tsx`: Main routing configuration.
- `frontend/constants.tsx`: Mock data and configuration constants.
- `frontend/components/Navbar.tsx`: Global navigation.
- `frontend/pages/Feed.tsx`: The main "Radar" dashboard.
- `frontend/pages/SocialFeed.tsx`: The "Feed" page for social posts.
- `frontend/pages/Rankings.tsx`: The leaderboard page.
- `frontend/pages/Connect.tsx`: The connection management page.
- `frontend/components/RadarFeed.tsx`: Component functionality for the match finder.
- `frontend/components/UserProfileSidebar.tsx`: Profile sidebar component.

---

## File Contents

### `frontend/App.tsx`
```tsx
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
import SocialFeed from './pages/SocialFeed';
import Connect from './pages/Connect';

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

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/sports" element={<AllSports />} />
      <Route path="/rankings" element={<Rankings />} />
      <Route path="/social" element={<SocialFeed />} />
      <Route path="/connect" element={<Connect />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
    </Routes>
  );
};

export default App;
```

### `frontend/constants.tsx`
```tsx
import { Feature, SportCategory, AthleteProfile } from './types';

export const FRAME_COUNT = 2; // 0, 1, 2 = 3 images
export const SCROLL_HEIGHT_MULTIPLIER = 5;

export const FEATURES: Feature[] = [
  {
    id: 'elo',
    title: 'Fair Skill Ratings',
    description: 'Stop playing mismatched games. Our ranking algorithm finds you opponents at your exact skill level for every sport.',
    icon: 'target'
  },
  {
    id: 'recruit',
    title: 'Verified Athlete Profile',
    description: 'Your digital sports career. Track your win rates, upload highlight reels, and get discovered by local teams/scouts.',
    icon: 'user-check'
  },
  {
    id: 'venue',
    title: 'Instant Court Booking',
    description: 'No more "where are we playing?" Secure high-quality courts instantly through our network of partner venues.',
    icon: 'map-pin'
  }
];

export const SPORTS: SportCategory[] = [
  {
    id: 'tennis',
    name: 'Tennis',
    image: '/Tennis.jpg',
    description: 'Find local courts and players at your skill level.'
  },
  {
    id: 'badminton',
    name: 'Badminton',
    image: '/badminton.jpg', // Placeholder
    description: 'Smash it on the court with local players.'
  },
  {
    id: 'squash',
    name: 'Squash',
    image: '/squash.jpg', // Placeholder
    description: 'High-intensity rallies in your area.'
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    image: '/table-tennis.jpg', // Placeholder
    description: 'Fast-paced ping pong action.'
  },
  {
    id: 'pickleball',
    name: 'Pickleball',
    image: '/pickleball.jpg', // Placeholder
    description: 'The fastest growing sport in the world.'
  },
  {
    id: 'padel',
    name: 'Padel',
    image: '/padel.jpg', // Placeholder
    description: 'Social and competitive padel matches.'
  },
  {
    id: 'football',
    name: 'Football',
    image: '/cristiano_ronaldo.png',
    description: 'Organize 5-a-side matches with ELO ratings.'
  },
  {
    id: 'mma',
    name: 'MMA',
    image: '/conor_mcgregor.jpeg',
    description: 'Find sparring partners and local gyms.'
  },
  {
    id: 'fitness',
    name: 'Gym & Fitness',
    image: '/Crossfit.JPG',
    description: 'Connect with training partners for maximum gains.'
  }
];

export const ATHLETES: AthleteProfile[] = [
  {
    id: '1',
    name: 'User_7721',
    sport: 'Boxing',
    rating: 2450,
    image: '/avatar-1.png',
    bio: 'Heavyweight metrics: Top 5% punch velocity in region.'
  },
  {
    id: '2',
    name: 'User_9904',
    sport: 'Sprinting',
    rating: 2100,
    image: '/avatar-2.png',
    bio: 'Track split times verified. 98th percentile acceleration.'
  },
  {
    id: '3',
    name: 'User_3382',
    sport: 'Football',
    rating: 1850,
    image: '/avatar-3.png',
    bio: 'Midfield playmaker stats: 88% pass accuracy average.'
  }
];

export interface FeedItem {
  id: string;
  type: 'match' | 'post' | 'event';
  sport: string;
  title: string;
  description: string;
  time: string;
  author: string;
  authorImage: string;
  image?: string;
  likes: number;
  comments: number;
}

export const FEED_ITEMS: FeedItem[] = [
  {
    id: 'f1',
    type: 'match',
    sport: 'football',
    title: '5-a-side Friendly Match',
    description: 'Looking for 2 more players for a casual game this Sunday evening at Turbo Turf.',
    time: '2 hours ago',
    author: 'Rahul D.',
    authorImage: 'https://i.pravatar.cc/150?u=rahul',
    likes: 12,
    comments: 4
  },
  {
    id: 'f2',
    type: 'post',
    sport: 'tennis',
    title: 'Best courts in South Mumbai?',
    description: 'Can anyone recommend good clay courts near Colaba? Willing to travel a bit if the facility is top tier.',
    time: '4 hours ago',
    author: 'Priya S.',
    authorImage: 'https://i.pravatar.cc/150?u=priya',
    image: '/Tennis.jpg',
    likes: 45,
    comments: 23
  },
  {
    id: 'f3',
    type: 'event',
    sport: 'badminton',
    title: 'Weekend Doubles Tournament',
    description: 'Registration open for the Amateur Doubles Cup. Prizes worth ₹10k!',
    time: '1 day ago',
    author: 'Smash Club',
    authorImage: 'https://i.pravatar.cc/150?u=smash',
    image: '/badminton.jpg',
    likes: 89,
    comments: 15
  },
  {
    id: 'f4',
    type: 'match',
    sport: 'squash',
    title: 'Sparring Partner Needed (Advanced)',
    description: 'Looking for someone rated 2000+ to practice drills with on Tuesday mornings.',
    time: '5 hours ago',
    author: 'Vikram R.',
    authorImage: 'https://i.pravatar.cc/150?u=vikram',
    likes: 8,
    comments: 1
  },
  {
    id: 'f5',
    type: 'post',
    sport: 'pickleball',
    title: 'Pickleball vs Padel?',
    description: 'Just tried Pickleball for the first time and loved it! How does it compare to Padel intensity-wise?',
    time: '30 mins ago',
    author: 'Sarah J.',
    authorImage: 'https://i.pravatar.cc/150?u=sarah',
    likes: 34,
    comments: 12
  },
  {
    id: 'f6',
    type: 'match',
    sport: 'padel',
    title: 'Padel Beginners Meetup',
    description: 'Hosting a session for absolute beginners. Equipment provided. Join us!',
    time: '3 hours ago',
    author: 'Padel Pro',
    authorImage: 'https://i.pravatar.cc/150?u=padel',
    likes: 56,
    comments: 8
  }
];

export interface NearbyUser {
  id: string;
  name: string;
  sport: string;
  distance: string; // e.g., "2 miles away"
  rank: number; // For the numbered list
  image: string;
}

export const NEARBY_USERS: NearbyUser[] = [
  {
    id: 'u1',
    name: 'ALEX PEREIRA',
    sport: 'KICKBOXING',
    distance: '0.5 miles',
    rank: 1,
    image: 'https://i.pravatar.cc/150?u=alex'
  },
  {
    id: 'u2',
    name: 'ISLAM MAKHACHEV',
    sport: 'WRESTLING',
    distance: '1.2 miles',
    rank: 2,
    image: 'https://i.pravatar.cc/150?u=islam'
  },
  {
    id: 'u3',
    name: 'CHARLES OLIVEIRA',
    sport: 'BJJ',
    distance: '2.5 miles',
    rank: 3,
    image: 'https://i.pravatar.cc/150?u=charles'
  },
  {
    id: 'u4',
    name: 'ILAI TOPURIA',
    sport: 'BOXING',
    distance: '3.0 miles',
    rank: 4,
    image: 'https://i.pravatar.cc/150?u=ilia'
  },
  {
    id: 'u5',
    name: 'SEAN O\'MALLEY',
    sport: 'STRIKING',
    distance: '4.1 miles',
    rank: 5,
    image: 'https://i.pravatar.cc/150?u=sean'
  }
];

export interface MatchResult {
  id: string;
  winner: string;
  loser: string;
  winnerElo: number;
  loserElo: number;
  eloChange: number;
  score: string;
}

export const MATCH_RESULTS: MatchResult[] = [
  {
    id: 'm1',
    winner: 'Arjun',
    loser: 'Rahul',
    winnerElo: 1450,
    loserElo: 1420,
    eloChange: 15,
    score: '21-18, 21-19'
  },
  {
    id: 'm2',
    winner: 'Sarah',
    loser: 'Priya',
    winnerElo: 1200,
    loserElo: 1150,
    eloChange: 12,
    score: '6-4, 6-3'
  },
  {
    id: 'm3',
    winner: 'Vikram',
    loser: 'Dev',
    winnerElo: 1600,
    loserElo: 1580,
    eloChange: 10,
    score: '11-9, 11-8, 11-7'
  }
];

export interface MatchOpportunity {
  id: string;
  title: string;
  location: string;
  distance: string;
  requiredEloRange: [number, number];
  sport: string;
  time: string;
}

export const MATCH_OPPORTUNITIES: MatchOpportunity[] = [
  {
    id: 'mo1',
    title: '2v2 Padel Match - HSR Layout',
    location: 'HSR Layout',
    distance: '1.2km away',
    requiredEloRange: [1100, 1300],
    sport: 'padel',
    time: '7:00 PM'
  },
  {
    id: 'mo2',
    title: 'Tennis Singles - Advanced',
    location: 'Koramangala Club',
    distance: '2.5km away',
    requiredEloRange: [1400, 1600],
    sport: 'tennis',
    time: '6:30 PM'
  },
  {
    id: 'mo3',
    title: 'Badminton Doubles',
    location: 'Smash Arena',
    distance: '0.8km away',
    requiredEloRange: [1000, 1200],
    sport: 'badminton',
    time: '8:00 PM'
  }
];
```

### `frontend/components/Navbar.tsx`
```tsx
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
            <Link to="/social" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Feed</Link>
          </div>
        </div>

        {/* Right Section: Secondary Nav + Auth */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <Link to="/connect" className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Connect</Link>
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
        <Link to="/feed" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest hover:text-blue-500">Radar</Link>
        <Link to="/rankings" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest hover:text-blue-500">Ranking</Link>
        <Link to="/social" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest hover:text-blue-500">Feed</Link>

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
```

### `frontend/pages/Feed.tsx`
```tsx
import React from 'react';
import { useAuth } from '../components/AuthContext';
import { MATCH_OPPORTUNITIES } from '../constants';
import Navbar from '../components/Navbar';
import UserProfileSidebar from '../components/UserProfileSidebar';
import RadarFeed from '../components/RadarFeed';

const Feed: React.FC = () => {
    const { user } = useAuth();

    // In a real app, these would come from the backend based on user ID
    const userElo = 1200;
    const trend = "+ 12 this week";
    const streak = 4;
    const scoutViewCount = 2;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: User Profile & Stats */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <UserProfileSidebar
                            elo={userElo}
                            trend={trend}
                            streak={streak}
                            scoutViewCount={scoutViewCount}
                        />
                    </div>

                    {/* Right Column: The Radar Feed */}
                    <div className="lg:col-span-8">
                        <RadarFeed
                            matches={MATCH_OPPORTUNITIES}
                            userElo={userElo}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Feed;
```

### `frontend/pages/SocialFeed.tsx`
```tsx
import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { FEED_ITEMS, SPORTS } from '../constants';
import { Filter, MessageSquare, Heart, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SocialFeed: React.FC = () => {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Use a ref for the loader element
    const loader = React.useRef(null);

    const userSports = user?.sports || [];

    // Base filtered list (source of truth)
    const filteredFeed = React.useMemo(() => {
        return FEED_ITEMS.filter(item => {
            const isRelevantToUser = userSports.includes(item.sport);
            const matchesActiveFilter = activeFilter === 'all' || item.sport === activeFilter;
            return isRelevantToUser && matchesActiveFilter;
        });
    }, [userSports, activeFilter]);

    // Items currently displayed
    const [displayItems, setDisplayItems] = useState(filteredFeed);

    // Reset items when filter changes
    React.useEffect(() => {
        setDisplayItems(filteredFeed);
        setPage(1);
    }, [filteredFeed]);

    // Infinite scroll loader
    const handleObserver = React.useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
            setIsLoading(true);
            // Simulate network delay
            setTimeout(() => {
                const moreItems = filteredFeed.map(item => ({
                    ...item,
                    id: `${item.id}-${Date.now()}-${Math.random()}` // Ensure unique keys
                }));
                setDisplayItems(prev => [...prev, ...moreItems]);
                setPage(prev => prev + 1);
                setIsLoading(false);
            }, 1000);
        }
    }, [isLoading, filteredFeed]);

    React.useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) observer.observe(loader.current);
        
        return () => {
             if (loader.current) observer.unobserve(loader.current);
        }
    }, [handleObserver]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
                        Social <span className="text-blue-600">Feed</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        See what's happening in your community.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    {/* Filter Bar */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'all'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                                }`}
                        >
                            All Updates
                        </button>
                        {userSports.map(sportId => {
                            const sportDetails = SPORTS.find(s => s.id === sportId);
                            if (!sportDetails) return null;
                            return (
                                <button
                                    key={sportId}
                                    onClick={() => setActiveFilter(sportId)}
                                    className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === sportId
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    {sportDetails.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Feed Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {displayItems.length > 0 ? (
                            displayItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors group">
                                    {/* Header */}
                                    <div className="p-6 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={item.authorImage} alt={item.author} className="w-10 h-10 rounded-full object-cover bg-zinc-800" />
                                            <div>
                                                <h4 className="font-bold text-sm">{item.author}</h4>
                                                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">{SPORTS.find(s => s.id === item.sport)?.name}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} /> {item.time}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="px-6 pb-6">
                                        <h3 className="text-xl font-bold italic mb-2 group-hover:text-blue-500 transition-colors">{item.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.description}</p>
                                        {item.image && (
                                            <div className="rounded-xl overflow-hidden mb-4 h-48">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-sm font-medium text-gray-500">
                                            <button className="flex items-center gap-2 hover:text-white transition-colors">
                                                <Heart size={18} /> {item.likes}
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-white transition-colors">
                                                <MessageSquare size={18} /> {item.comments}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Filter className="text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-300 mb-2">No updates yet</h3>
                                <p className="text-gray-500">
                                    There seem to be no recent activities for the selected sports. <br />
                                    Try selecting other sports or check back later!
                                </p>
                            </div>
                        )}
                        
                        {/* Loading Indicator / Sentinel */}
                        {displayItems.length > 0 && (
                             <div ref={loader} className="col-span-full py-8 flex justify-center">
                                 {isLoading && (
                                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                 )}
                             </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SocialFeed;
```

### `frontend/pages/Rankings.tsx`
```tsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import { NEARBY_USERS } from '../constants';

// Mock rank data for the current user
const MY_RANK = {
    rank: 12,
    location: 'Koramangala',
    city: 'Bangalore',
    tier: 'Intermediate II',
    nextMilestone: 40,
    nextTier: 'Advanced',
    points: 1250,
};

const Rankings: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
                        Your <span className="text-blue-600">Standing</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Compete with players in your area and climb the local ladder.
                    </p>
                </div>

                {/* 1. Hero Stat Card */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 p-8 md:p-12 mb-12 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 opacity-50" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                    <div className="relative grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
                        {/* Local Rank */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Local Rank</div>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <span className="text-6xl font-black italic tracking-tighter text-white">#{MY_RANK.rank}</span>
                                <div className="text-left">
                                    <span className="block text-xs font-bold text-gray-500">IN</span>
                                    <span className="flex items-center gap-1 text-sm font-bold text-blue-400">
                                        {MY_RANK.location} <MapPin size={12} />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tier */}
                        <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Tier</div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">{MY_RANK.tier}</h2>
                            <p className="text-xs text-gray-500 font-medium">Top 15% of players in {MY_RANK.city}</p>
                        </div>

                        {/* Next Milestone */}
                        <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Next Milestone</div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-green-400">
                                <TrendingUp size={20} />
                                <span className="text-2xl font-black italic">+{MY_RANK.nextMilestone} pts</span>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                to reach <span className="text-white font-bold">{MY_RANK.nextTier}</span> <ArrowRight size={10} />
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Leaderboard Table */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
                        <h3 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={20} />
                            {MY_RANK.location} Leaderboard
                        </h3>
                        <button className="text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors">
                            View Global →
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Athlete</th>
                                    <th className="px-6 py-4">Tier</th>
                                    <th className="px-6 py-4 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {NEARBY_USERS.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-black italic text-gray-500">
                                            #{user.rank}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover bg-zinc-800" />
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-blue-500 transition-colors">{user.name}</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{user.sport}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-400">
                                            {index === 0 ? 'Elite' : index < 3 ? 'Advanced' : 'Intermediate'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black italic text-white text-lg">
                                            {2500 - (index * 150)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Mock inserting the current user at #12 */}
                                <tr className="bg-blue-900/20 border-l-4 border-blue-500">
                                    <td className="px-6 py-4 font-black italic text-blue-400">
                                        #{MY_RANK.rank}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">ME</div>
                                            <div>
                                                <div className="font-bold text-white">You</div>
                                                <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">Intermediate II</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-300">
                                        {MY_RANK.tier}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black italic text-white text-lg">
                                        {MY_RANK.points}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default Rankings;
```

### `frontend/pages/Connect.tsx`
```tsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { NEARBY_USERS } from '../constants';
import { MapPin, UserPlus, X, Check } from 'lucide-react';

// Mock connection requests
const CONNECTION_REQUESTS = [
    {
        id: 'r1',
        name: 'Michael Chang',
        sport: 'Tennis',
        image: 'https://i.pravatar.cc/150?u=michael',
        mutual: 3,
        message: "Hey! Saw you play at the club last week. Up for a hit?"
    },
    {
        id: 'r2',
        name: 'Sarah Williams',
        sport: 'Badminton',
        image: 'https://i.pravatar.cc/150?u=sarah_w',
        mutual: 1,
        message: "Looking for a doubles partner for the upcoming league."
    }
];

const Connect: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-12">
                   <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
                      Connect <span className="text-blue-600">Hub</span>
                   </h1>
                   <p className="text-gray-400 text-lg">
                      Manage your requests and expand your sports network.
                   </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column: Connection Requests */}
                    <div className="lg:col-span-8 space-y-12">
                         {/* Section 1: Requests */}
                         <section>
                             <div className="flex items-center gap-3 mb-6">
                                 <h2 className="text-2xl font-bold uppercase tracking-wide">Requests</h2>
                                 <span className="bg-blue-600 text-white text-xs font-black px-2 py-1 rounded-full">{CONNECTION_REQUESTS.length}</span>
                             </div>

                             <div className="grid gap-4">
                                 {CONNECTION_REQUESTS.map(req => (
                                     <div key={req.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 hover:border-white/10 transition-colors">
                                         <img src={req.image} alt={req.name} className="w-16 h-16 rounded-full object-cover bg-zinc-800" />
                                         
                                         <div className="flex-1 text-center sm:text-left">
                                             <h3 className="text-lg font-bold text-white">{req.name}</h3>
                                             <div className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">{req.sport} • {req.mutual} Mutual Connections</div>
                                             <p className="text-gray-400 text-sm italic">"{req.message}"</p>
                                         </div>

                                         <div className="flex items-center gap-3 w-full sm:w-auto">
                                             <button className="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-full transition-colors" title="Ignore">
                                                 <X size={20} />
                                             </button>
                                             <button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                                 <Check size={18} /> Accept
                                             </button>
                                         </div>
                                     </div>
                                 ))}
                                 
                                 {CONNECTION_REQUESTS.length === 0 && (
                                     <div className="text-gray-500 italic">No pending requests.</div>
                                 )}
                             </div>
                         </section>

                         {/* Section 2: Discover / People You Can Connect With */}
                         <section>
                             <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">Discover Athletes</h2>
                             
                             <div className="grid md:grid-cols-2 gap-6">
                                 {NEARBY_USERS.map(user => (
                                     <div key={user.id} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                         
                                         <div className="relative flex items-center gap-4">
                                             <img src={user.image} alt={user.name} className="w-14 h-14 rounded-full object-cover bg-zinc-800" />
                                             <div>
                                                 <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{user.name}</h3>
                                                 <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                     <span className="font-bold uppercase tracking-wider text-blue-500">{user.sport}</span>
                                                     <span>•</span>
                                                     <span className="flex items-center gap-1"><MapPin size={10} /> {user.distance}</span>
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="mt-6 flex items-center justify-between">
                                             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rank #{user.rank}</div>
                                             <button className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-full transition-colors border border-white/10 hover:border-white/30">
                                                 <UserPlus size={20} className="text-blue-500" />
                                             </button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </section>
                    </div>

                    {/* Right Column: Info / Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-gradient-to-br from-blue-900/50 to-blue-600/20 border border-blue-500/30 rounded-3xl p-8 sticky top-24">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-white">Why Connect?</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                                    <p className="text-sm text-gray-300">Expand your network to find games faster.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                                    <p className="text-sm text-gray-300">Challenge players with similar ELO ratings.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                                    <p className="text-sm text-gray-300">Build your local reputation and climb the leaderboard.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Connect;
```

### `frontend/components/RadarFeed.tsx`
```tsx
import React from 'react';
import { MapPin, Target, Users, Radio, Clock } from 'lucide-react';
import { MatchOpportunity } from '../constants';

interface RadarFeedProps {
    matches: MatchOpportunity[];
    userElo?: number;
}

const RadarFeed: React.FC<RadarFeedProps> = ({ matches, userElo = 1200 }) => {
    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <Target className="text-blue-500" />
                    The Radar
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest text-green-500 animate-pulse">
                    Live Scanning...
                </span>
            </div>

            {matches.length > 0 ? (
                <div className="space-y-4">
                    {matches.map((match) => {
                        const isSkillMatch = userElo >= match.requiredEloRange[0] && userElo <= match.requiredEloRange[1];

                        return (
                            <div
                                key={match.id}
                                className="group relative bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-green-500/50 rounded-2xl p-6 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold uppercase tracking-wider text-blue-400">
                                                {match.sport}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                <MapPin size={12} /> {match.distance}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                <Clock size={12} /> {match.time}
                                            </span>
                                        </div>

                                        <h4 className="text-xl font-bold text-white">{match.title}</h4>

                                        <p className={`text-sm font-medium ${isSkillMatch ? 'text-green-400' : 'text-gray-400'}`}>
                                            Looking for ELO {match.requiredEloRange[0]}-{match.requiredEloRange[1]}
                                            {isSkillMatch && <span className="ml-2 py-0.5 px-2 bg-green-500/10 rounded text-xs">PERFECT MATCH</span>}
                                        </p>
                                    </div>

                                    <button className="px-8 py-3 bg-white text-black font-black uppercase tracking-wider rounded-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 shadow-lg shadow-white/10 hover:shadow-blue-500/20">
                                        Challenge
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-zinc-900/30 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Radio className="text-gray-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-300 mb-2">Sector Clear</h4>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        No active signals in your range. Be the one to initiate contact.
                    </p>
                    <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all">
                        Cast a Signal
                    </button>
                </div>
            )}
        </div>
    );
};

export default RadarFeed;
```

### `frontend/components/UserProfileSidebar.tsx`
```tsx
import React from 'react';
import { TrendingUp, Flame, Eye, Lock, Zap } from 'lucide-react';

interface UserProfileSidebarProps {
    elo: number;
    trend: string;
    streak: number;
    scoutViewCount: number;
}

const UserProfileSidebar: React.FC<UserProfileSidebarProps> = ({ elo, trend, streak, scoutViewCount }) => {
    return (
        <div className="space-y-6 sticky top-24">
            {/* 1. Digital Trading Card */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl group transition-all duration-300 hover:border-blue-500/30">

                {/* Holographic BG */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-black to-purple-900/10 opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="relative p-6 text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full p-1 mb-4 shadow-lg shadow-blue-500/20">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                            <img src="https://i.pravatar.cc/300" alt="User" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <h2 className="text-5xl font-black italic tracking-tighter text-white mb-1">
                        {elo}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
                        <TrendingUp size={16} />
                        <span className="text-sm font-bold tracking-wide">{trend}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
                                <Flame size={18} className="fill-orange-500/20" />
                            </div>
                            <div className="text-xl font-bold text-white">{streak}</div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500">Day Streak</div>
                        </div>
                        <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-1">
                                <Zap size={18} className="fill-blue-500/20" />
                            </div>
                            <div className="text-xl font-bold text-white">Pro</div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-500">Level</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Scout Notification (Monetization Nudge) */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 p-1 group cursor-pointer hover:border-yellow-500/50 transition-colors">
                <div className="p-4 flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10">
                            <Eye size={24} className="text-gray-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-black">
                            {scoutViewCount}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Scouts viewing you</h4>
                        <p className="text-xs text-gray-400 mt-0.5">2 verified scouts visited your profile.</p>
                    </div>
                    <div className="ml-auto">
                        <Lock size={16} className="text-yellow-500" />
                    </div>
                </div>

                {/* Blurred overlay hint */}
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 opacity-50 blur-[2px] select-none my-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                        <div className="h-2 w-20 bg-gray-600 rounded"></div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold uppercase text-xs tracking-wider rounded-lg hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10">
                        Unlock Scout Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileSidebar;
```
