import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { FEED_ITEMS, SPORTS } from '../constants';
import { Filter, MessageSquare, Heart, Clock, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PeopleNearYou from '../components/PeopleNearYou';

const Feed: React.FC = () => {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Logic: 
    // 1. Get user's selected sports
    // 2. Filter feed items that match user's sports match current filter
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

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
                        Your <span className="text-blue-600">Arena</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Welcome back, {user?.name || 'Athlete'}. Here's what's happening in your sports.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Feed Column */}
                    <div className="lg:col-span-8">
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
                            {filteredFeed.length > 0 ? (
                                filteredFeed.map(item => (
                                    <div key={item.id} className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors group">

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
                        </div>
                    </div>

                    {/* Sidebar Column (People Near You) */}
                    <div className="hidden lg:block lg:col-span-4 space-y-8">
                        <div className="sticky top-32">
                            <PeopleNearYou />
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default Feed;
