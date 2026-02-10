import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import StartMatchSidebar from '../components/StartMatchSidebar';
import { supabase } from '../lib/supabase';
import { Target, Users, Radio, Loader2, AlertCircle } from 'lucide-react';
import { useNotification } from '../components/NotificationContext';
import { SPORTS } from '../constants';

const Radar: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { showNotification } = useNotification();

    // Fallback sports if user has none
    const allSportIds = SPORTS.map(s => s.id);
    const displaySports = user?.sports && user.sports.length > 0 ? user.sports : allSportIds;

    const [selectedSport, setSelectedSport] = useState<string>('');
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [challenging, setChallenging] = useState<string | null>(null);

    // 1. Handle Sport Selection Default
    useEffect(() => {
        if (!selectedSport && displaySports.length > 0) {
            setSelectedSport(displaySports[0]);
        }
    }, [user, selectedSport, displaySports]);

    // 2. Fetch Radar Data (RPC)
    const fetchRadar = async () => {
        if (!user || !selectedSport) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: rpcError } = await supabase.rpc(
                'get_radar_matches',
                {
                    current_user_id: user.id,
                    selected_sport: selectedSport
                }
            );

            if (rpcError) throw rpcError;
            setPlayers(data || []);
        } catch (err: any) {
            console.error('Radar Fetch Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. Trigger Fetch on Sport Change
    useEffect(() => {
        if (selectedSport) {
            fetchRadar();
        }
    }, [selectedSport, user?.id]);

    // 4. Realtime Listener
    useEffect(() => {
        if (!selectedSport) return;

        const channel = supabase
            .channel('radar-refresh')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'match_requests' },
                () => fetchRadar()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedSport, user?.id]);

    // 5. Challenge Function
    const handleChallenge = async (opponentId: string) => {
        if (!user || !selectedSport) return;

        setChallenging(opponentId);

        try {
            const { error: insertError } = await supabase
                .from('match_requests')
                .insert({
                    user_id: user.id,
                    opponent_id: opponentId,
                    sport: selectedSport,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            showNotification('Challenge Broadcaster! 📡', 'success');
            fetchRadar();
        } catch (err: any) {
            console.error('Challenge Error:', err);
            showNotification('Failed to send challenge: ' + err.message, 'error');
        } finally {
            setChallenging(null);
        }
    };

    if (!user && authLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={32} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Calibrating Radar...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: Radar Feed */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Header & Sport Selector */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <Target className="text-blue-500" size={24} />
                                    The Radar
                                </h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    Live Scanning Local Sector
                                </p>
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] absolute -top-2 left-3 px-1 bg-zinc-900 z-10">
                                    Target Sport
                                </label>
                                <select
                                    value={selectedSport}
                                    onChange={e => setSelectedSport(e.target.value)}
                                    className="bg-black border-2 border-white/10 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm focus:border-blue-600 text-white outline-none transition-all appearance-none pr-12 group-hover:border-white/20 min-w-[200px]"
                                >
                                    {displaySports.map((sportId: string) => (
                                        <option key={sportId} value={sportId}>
                                            {SPORTS.find(s => s.id === sportId)?.name || sportId}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* States */}
                        {loading && !players.length ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin text-blue-500" size={48} />
                                <p className="text-gray-500 font-black italic uppercase tracking-widest">Scanning Waves...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-3xl text-center space-y-4">
                                <AlertCircle className="text-red-500 mx-auto" size={48} />
                                <h4 className="text-xl font-bold text-white">Interference Detected</h4>
                                <p className="text-gray-400 max-w-xs mx-auto text-sm">{error}</p>
                                <button
                                    onClick={fetchRadar}
                                    className="px-8 py-3 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all"
                                >
                                    Retry Scan
                                </button>
                            </div>
                        ) : !players.length ? (
                            <div className="bg-zinc-900/30 border-2 border-dashed border-white/5 rounded-[2rem] p-16 text-center space-y-6">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                    <Radio className="text-gray-600" size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-gray-300">Sector Clear</h4>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                                        No active signals in your current ELO range for <span className="text-white font-bold">{selectedSport}</span>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Player Grid */
                            <div className="grid md:grid-cols-2 gap-4">
                                {players.map((player) => (
                                    <div
                                        key={player.id}
                                        className="group bg-zinc-900/80 border border-white/10 hover:border-blue-500/50 p-6 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
                                    >
                                        {/* Match Quality Badge */}
                                        <div className="absolute top-4 right-6 text-[10px] font-black bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                            {Math.round(player.match_quality * 100)}% Match
                                        </div>

                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="relative">
                                                <img
                                                    src={player.profile_photo || '/avatar-placeholder.png'}
                                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-blue-500/50 transition-colors duration-500 shadow-xl"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full shadow-lg"></div>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{player.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">ELO:</span>
                                                    <span className="text-sm font-black italic text-blue-500">{player.elo}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reliability</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{ width: `${player.reliability_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-white italic">{player.reliability_score}%</span>
                                                </div>
                                            </div>

                                            <button
                                                disabled={challenging === player.id}
                                                onClick={() => handleChallenge(player.id)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-600/20"
                                            >
                                                {challenging === player.id ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="animate-spin" size={14} />
                                                        Sending...
                                                    </span>
                                                ) : 'Challenge'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sidebar */}
                    <div className="lg:col-span-4 space-y-8 sticky top-24">
                        <StartMatchSidebar />

                        {/* Radar Intelligence Tip */}
                        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-blue-500">
                                <Users size={20} />
                                <h4 className="text-sm font-black uppercase tracking-widest italic">Sector Intel</h4>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Our <span className="text-white font-bold">Shadow-Calibrated Radar</span> calculates match quality based on ELO proximity, reliability history, and play frequency.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default Radar;
