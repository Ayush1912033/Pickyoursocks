import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import RadarFeed from '../components/RadarFeed';
import StartMatchSidebar from '../components/StartMatchSidebar';
import ErrorState from '../components/ErrorState';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import { MatchOpportunity } from '../constants';

const Radar: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [matches, setMatches] = useState<MatchOpportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRadar = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch match requests joined with profiles
            const { data, error } = await supabase
                .from('match_requests')
                .select(`
                    id,
                    sport,
                    scheduled_time,
                    status,
                    created_at,
                    user_id,
                    accepted_by,
                    profiles:user_id (
                        name,
                        elo,
                        location:locality
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter and Map Supabase data
            const validMatches: MatchOpportunity[] = (data || [])
                .filter((req: any) => {
                    // Show if active
                    if (req.status === 'active') return true;
                    // Show if accepted AND user is involved
                    if (req.status === 'accepted') {
                        return user && (req.user_id === user.id || req.accepted_by === user.id);
                    }
                    return false;
                })
                .map((req: any) => ({
                    id: req.id,
                    title: `${req.profiles?.name || 'Unknown'} - ${req.sport}`,
                    sport: req.sport,
                    distance: req.profiles?.location || 'Nearby', // Fallback
                    time: new Date(req.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    requiredEloRange: [
                        (req.profiles?.elo || 1200) - 100,
                        (req.profiles?.elo || 1200) + 100
                    ],
                    status: req.status,
                    user_id: req.user_id,
                    accepted_by: req.accepted_by
                }));

            setMatches(validMatches);
        } catch (err) {
            console.error('Radar fetch failed:', err);
            setError('Failed to load radar signals.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRadar();
    }, []);

    if (!user && authLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-400">Calibrating Radar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: Matches (Radar Feed) */}
                    <div className="lg:col-span-8">
                        {error ? (
                            <ErrorState onRetry={fetchRadar} />
                        ) : isLoading ? (
                            <div className="space-y-6 animate-pulse">
                                <div className="h-40 bg-zinc-900/40 rounded-xl" />
                                <div className="h-40 bg-zinc-900/40 rounded-xl" />
                            </div>
                        ) : (
                            <RadarFeed matches={matches} user={user} />
                        )}
                    </div>

                    {/* RIGHT: Start Match Sidebar */}
                    <div className="lg:col-span-4 space-y-8 sticky top-24">
                        <StartMatchSidebar />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Radar;
