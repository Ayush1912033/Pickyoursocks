import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { MATCH_OPPORTUNITIES, FEED_ITEMS, SPORTS } from '../constants';
import { Filter, MessageSquare, Heart, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import UserProfileSidebar from '../components/UserProfileSidebar';
import RadarFeed from '../components/RadarFeed';

const Feed: React.FC = () => {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // In a real app, these would come from the backend based on user ID
    const userElo = 1200;
    const trend = "+ 12 this week";
    const streak = 4;
    const scoutViewCount = 2;

    const userSports = user?.sports || [];

    const filteredFeed = FEED_ITEMS.filter(item => {
        // Show only items relevant to user's selected sports
        const isRelevantToUser = userSports.includes(item.sport);
        // Apply granular filter (All vs Specific Sport)
        const matchesActiveFilter = activeFilter === 'all' || item.sport === activeFilter;
        return isRelevantToUser && matchesActiveFilter;
    });

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: User Profile & Stats */}
                    <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
                        <UserProfileSidebar
                            elo={userElo}
                            trend={trend}
                            streak={streak}
                            scoutViewCount={scoutViewCount}
                        />
                    </div>

                    {/* Right Column: Hybrid Feed */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* 1. The Radar (Utility - Top 50%) */}
                        <section>
                            <RadarFeed
                                matches={MATCH_OPPORTUNITIES}
                                userElo={userElo}
                            />
                        </section>

                        {/* 2. Thus Pulse (Social - Bottom 50%) */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">
                                    The <span className="text-blue-600">Pulse</span>
                                </h3>

                                {/* Mini Filter Bar */}
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar max-w-[200px] md:max-w-none">
                                    <button
                                        onClick={() => setActiveFilter('all')}
                                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {userSports.map(sportId => {
                                        const sportDetails = SPORTS.find(s => s.id === sportId);
                                        if (!sportDetails) return null;
                                        return (
                                            <button
                                                key={sportId}
                                                onClick={() => setActiveFilter(sportId)}
                                                className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === sportId
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                                                    }`}
                                            >
                                                {sportDetails.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {filteredFeed.length > 0 ? (
                                    filteredFeed.map(item => (
                                        <div key={item.id} className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                                            {/* Header */}
                                            <div className="p-4 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.authorImage} alt={item.author} className="w-8 h-8 rounded-full object-cover bg-zinc-800" />
                                                    <div>
                                                        <h4 className="font-bold text-sm text-white">{item.author}</h4>
                                                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">{SPORTS.find(s => s.id === item.sport)?.name}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <Clock size={10} /> {item.time}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="px-4 pb-4">
                                                <h3 className="text-lg font-bold italic mb-2 text-gray-200">{item.title}</h3>
                                                <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.description}</p>
                                                {item.image && (
                                                    <div className="rounded-lg overflow-hidden mb-4 h-48">
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-xs font-medium text-gray-500">
                                                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                                                        <Heart size={14} /> {item.likes}
                                                    </button>
                                                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                                                        <MessageSquare size={14} /> {item.comments}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Filter className="text-gray-600" size={16} />
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            No recent updates for your sports.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Feed;
