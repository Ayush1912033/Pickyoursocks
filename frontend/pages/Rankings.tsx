import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, TrendingUp, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { NearbyUser, SPORTS } from '../constants';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../components/AuthContext';

const Rankings: React.FC = () => {
    const [users, setUsers] = useState<NearbyUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string>('tennis');
    const { user } = useAuth();
    const [currentUserRanked, setCurrentUserRanked] = useState<NearbyUser | null>(null);

    const [viewMode, setViewMode] = useState<'local' | 'global'>('local');

    // Default to Mumbai if user has no region set
    const [currentRegion, setCurrentRegion] = useState(user?.region || 'Mumbai');

    // Update region if user profile loads/changes
    useEffect(() => {
        if (user?.region) {
            setCurrentRegion(user.region);
        }
    }, [user]);

    const fetchRankings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // If global, pass undefined for region. If local, pass currentRegion.
            const regionToFetch = viewMode === 'global' ? undefined : currentRegion;
            const data = await api.getNearbyUsers(selectedSport === 'All' ? undefined : selectedSport, regionToFetch);
            setUsers(data);

            if (user) {
                const me = data.find(u => u.id === user.id);
                if (me) {
                    setCurrentUserRanked(me);
                } else {
                    setCurrentUserRanked(null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch rankings:", error);
            setError("Failed to load leaderboard.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, [selectedSport, currentRegion, viewMode]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto animate-enter">
                <div className="mb-8 md:mb-12 flex items-end justify-between border-b border-white/5 pb-4 md:pb-8">
                    <div>
                        <h1 className="text-2xl md:text-8xl font-black italic uppercase tracking-tighter">
                            {currentRegion}
                        </h1>
                    </div>
                    <div className="text-2xl md:text-6xl font-black italic uppercase tracking-tighter text-white/10">
                        / Leaderboard
                    </div>
                </div>

                {/* 1. Hero Stat Card */}
                {(currentUserRanked || (user && users.length > 0)) && (
                    <div className="relative overflow-hidden rounded-[3rem] p-1 mb-12 shadow-2xl group">
                        {/* Gradient Border Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-700"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

                        {/* Content Container */}
                        <div className="relative bg-zinc-950/90 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-12 border border-white/10 h-full overflow-hidden">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                            <div className="relative grid grid-cols-1 gap-8 z-10">
                                <div className="space-y-6 text-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mx-auto backdrop-blur-md">
                                        <TrendingUp size={12} className="text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Next Milestone</span>
                                    </div>

                                    <div className="flex flex-col items-center justify-center py-4 md:py-6">
                                        <div className="relative inline-block group/counter cursor-default px-4 overflow-visible">
                                            {/* Animated Counter */}
                                            <span className="block text-6xl md:text-9xl font-black italic tracking-wide text-[#4ade80] pr-10 pb-2 drop-shadow-[0_0_25px_rgba(74,222,128,0.25)] transition-all duration-300 group-hover/counter:drop-shadow-[0_0_35px_rgba(74,222,128,0.4)]">
                                                +{user?.elo ? (Math.ceil(user.elo / 100) * 100) - user.elo : 100}
                                            </span>
                                            <span className="absolute -top-2 -right-8 md:-top-4 md:-right-12 text-lg md:text-2xl font-black italic text-[#4ade80] rotate-12 opacity-80 animate-pulse">pts</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Trophy size={16} className="text-yellow-500 animate-bounce" />
                                            <p className="text-lg md:text-xl text-zinc-400 font-medium">
                                                to reach <span className="text-white font-bold border-b border-blue-500 pb-0.5 hover:text-blue-400 transition-colors cursor-pointer">Next Tier</span>
                                            </p>
                                        </div>

                                        {/* Enhanced Progress Bar */}
                                        <div className="relative max-w-[240px] md:max-w-sm mx-auto">
                                            <div className="h-3 md:h-4 bg-zinc-800/80 rounded-full overflow-hidden border border-white/5 box-inner shadow-inner">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 via-[#4ade80] to-green-400 relative overflow-hidden transition-all duration-1000 ease-out"
                                                    style={{
                                                        width: `${user?.elo ? (user.elo % 100) : 0}%`,
                                                        boxShadow: '0 0 20px rgba(74,222,128,0.3)'
                                                    }}
                                                >
                                                    {/* Shimmer Effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-shimmer"></div>
                                                </div>
                                            </div>

                                            {/* Percentage Label */}
                                            <div className="flex justify-between items-center mt-2 px-1">
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{user?.elo || 800} ELO</span>
                                                <span className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest">
                                                    {Math.round(user?.elo ? (user.elo % 100) : 0)}%
                                                </span>
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{Math.ceil((user?.elo || 800) / 100) * 100} ELO</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Leaderboard Table */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
                    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="bg-zinc-900/50 p-1 rounded-2xl flex items-center w-full md:max-w-sm">
                                <button
                                    onClick={() => setViewMode('local')}
                                    className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${viewMode === 'local' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Local
                                </button>
                                <button
                                    onClick={() => setViewMode('global')}
                                    className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${viewMode === 'global' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Global
                                </button>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <select
                                    value={selectedSport}
                                    onChange={(e) => setSelectedSport(e.target.value)}
                                    className="w-full md:w-auto bg-zinc-900/50 border border-white/10 rounded-2xl text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white px-4 md:px-8 py-3 md:py-4 outline-none focus:border-blue-600 transition-all text-center appearance-none"
                                >
                                    <option value="All">All Sports</option>
                                    {SPORTS.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="p-6">
                            <ErrorState onRetry={fetchRankings} message="Failed to load leaderboard." />
                        </div>
                    ) : isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-4 w-1/2">
                                        <div className="w-8 h-8 bg-zinc-900 rounded-lg"></div>
                                        <div className="w-10 h-10 bg-zinc-900 rounded-full"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-zinc-900 rounded w-3/4"></div>
                                            <div className="h-3 bg-zinc-900 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="w-20 h-6 bg-zinc-900 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : users.length > 0 ? (
                        <div className="overflow-x-auto pb-4">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/50 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-3 py-3 md:px-6 md:py-4">Rank</th>
                                        <th className="px-3 py-3 md:px-6 md:py-4">Athlete</th>
                                        <th className="px-3 py-3 md:px-6 md:py-4 hidden sm:table-cell">Tier</th>
                                        <th className="px-3 py-3 md:px-6 md:py-4 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((rankedUser, index) => (
                                        <tr
                                            key={rankedUser.id}
                                            className={`transition-colors group ${rankedUser.id === user?.id
                                                ? 'bg-blue-900/20 border-l-2 md:border-l-4 border-blue-500'
                                                : 'hover:bg-white/5 border-l-2 md:border-l-4 border-transparent'
                                                }`}
                                        >
                                            <td className={`px-4 py-4 md:px-8 md:py-8 font-black italic text-xl md:text-3xl tracking-tighter ${rankedUser.id === user?.id ? 'text-blue-500' : 'text-white'
                                                }`}>
                                                #{rankedUser.rank || index + 1}
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <img src={rankedUser.image || '/avatar-placeholder.png'} alt={rankedUser.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-zinc-800" />
                                                    <div>
                                                        <div className={`font-bold text-sm md:text-base ${rankedUser.id === user?.id ? 'text-white' : 'text-white group-hover:text-blue-500 transition-colors'
                                                            }`}>
                                                            {rankedUser.id === user?.id ? 'You' : rankedUser.name}
                                                        </div>
                                                        <div className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${rankedUser.id === user?.id ? 'text-blue-400' : 'text-gray-500'
                                                            }`}>
                                                            {rankedUser.sport}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`hidden sm:table-cell px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium ${rankedUser.id === user?.id ? 'text-gray-300' : 'text-gray-400'
                                                }`}>
                                                {rankedUser.tier || (index === 0 ? 'Elite' : index < 5 ? 'Advanced' : 'Intermediate')}
                                            </td>
                                            <td className="px-4 py-4 md:px-8 md:py-8 text-right font-black italic text-white text-2xl md:text-4xl tracking-tighter">
                                                {rankedUser.rating || rankedUser.points || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <Trophy className="mx-auto h-16 w-16 text-zinc-800 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Season Requires Players</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-6">
                                The leaderboard is currently empty. Be the first to claim the top spot in {currentRegion}!
                            </p>
                        </div>
                    )}
                </div>

            </main >
            <Footer />
        </div>
    );
};

export default Rankings;
