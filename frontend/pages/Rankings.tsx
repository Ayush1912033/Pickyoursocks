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
                <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter">
                            {currentRegion}
                        </h1>
                    </div>
                    <div className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white/10">
                        / Leaderboard
                    </div>
                </div>

                {/* 1. Hero Stat Card */}
                {(currentUserRanked || (user && users.length > 0)) && (
                    <div className="relative overflow-hidden rounded-[3rem] bg-zinc-900 border border-white/5 p-8 md:p-12 mb-12 shadow-2xl">
                        <div className="relative grid grid-cols-1 gap-8">
                            <div className="space-y-4 text-center">
                                <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">Next Milestone</div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-3 text-[#4ade80]">
                                        <TrendingUp size={48} />
                                        <span className="text-8xl font-black italic tracking-tighter">
                                            +{user?.elo ? (Math.ceil(user.elo / 100) * 100) - user.elo : 100} pts
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xl text-gray-400 font-medium">
                                    to reach <span className="text-white font-bold">Next Tier</span> <ArrowRight size={20} className="inline ml-2" />
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Leaderboard Table */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="bg-zinc-900/50 p-1.5 rounded-2xl flex items-center w-full max-w-sm">
                                <button
                                    onClick={() => setViewMode('local')}
                                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${viewMode === 'local' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Local
                                </button>
                                <button
                                    onClick={() => setViewMode('global')}
                                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${viewMode === 'global' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Global
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <select
                                    value={selectedSport}
                                    onChange={(e) => setSelectedSport(e.target.value)}
                                    className="bg-zinc-900/50 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-[0.2em] text-white px-8 py-4 outline-none focus:border-blue-600 transition-all text-center"
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
                                    {users.map((rankedUser, index) => (
                                        <tr
                                            key={rankedUser.id}
                                            className={`transition-colors group ${rankedUser.id === user?.id
                                                ? 'bg-blue-900/20 border-l-4 border-blue-500'
                                                : 'hover:bg-white/5 border-l-4 border-transparent'
                                                }`}
                                        >
                                            <td className={`px-8 py-8 font-black italic text-3xl tracking-tighter ${rankedUser.id === user?.id ? 'text-blue-500' : 'text-white'
                                                }`}>
                                                #{rankedUser.rank || index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={rankedUser.image || '/avatar-placeholder.png'} alt={rankedUser.name} className="w-10 h-10 rounded-full object-cover bg-zinc-800" />
                                                    <div>
                                                        <div className={`font-bold ${rankedUser.id === user?.id ? 'text-white' : 'text-white group-hover:text-blue-500 transition-colors'
                                                            }`}>
                                                            {rankedUser.id === user?.id ? 'You' : rankedUser.name}
                                                        </div>
                                                        <div className={`text-xs font-bold uppercase tracking-wider ${rankedUser.id === user?.id ? 'text-blue-400' : 'text-gray-500'
                                                            }`}>
                                                            {rankedUser.sport}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-medium ${rankedUser.id === user?.id ? 'text-gray-300' : 'text-gray-400'
                                                }`}>
                                                {rankedUser.tier || (index === 0 ? 'Elite' : index < 5 ? 'Advanced' : 'Intermediate')}
                                            </td>
                                            <td className="px-8 py-8 text-right font-black italic text-white text-4xl tracking-tighter">
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
