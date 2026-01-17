import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, TrendingUp, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { NearbyUser } from '../constants';
import ErrorState from '../components/ErrorState';

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
    const [users, setUsers] = useState<NearbyUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRankings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getNearbyUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch rankings:", error);
            setError("Failed to load leaderboard.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto animate-enter">
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
                                    {users.map((user, index) => (
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
                    ) : (
                        <div className="py-20 text-center">
                            <Trophy className="mx-auto h-16 w-16 text-zinc-800 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Season Starts Soon</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">
                                The ladder is currently resetting. Check back later to see who claims the top spot.
                            </p>
                        </div>
                    )}
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default Rankings;
