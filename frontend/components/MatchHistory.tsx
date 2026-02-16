import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Trophy, Frown, Users } from 'lucide-react';

interface MatchHistoryProps {
    userId: string;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ userId }) => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, [userId]);

    const fetchMatches = async () => {
        try {
            const data = await api.getMatchHistory(userId);
            setMatches(data);


        } catch (error) {
            console.error('Error fetching match history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading history...</div>;
    if (matches.length === 0) return <div className="text-gray-500 italic mb-8">No completed matches yet.</div>;

    return (
        <div className="grid gap-4 mb-12">
            {matches.map((match) => {
                const isCreator = userId === match.user_id;
                const partner = isCreator ? (match.acceptor || match.opponent) : match.challenger;

                // Handle result being potentially an array or object
                const resultData = Array.isArray(match.result) ? match.result[0] : match.result;

                // FILTER: Only show if completed OR (accepted + has result)
                if (match.status === 'accepted' && !resultData) return null;

                const isVerified = resultData?.is_verified;
                // If not verified, we can still show it as "Pending" or "Reviewing"
                // But for "History", we usually want finished games.
                // The issue user reported is likely they don't see games they finished but aren't "verified" by system yet.
                // So we show them, but maybe with a different icon or styling if unverified?

                const amIWinner = resultData?.winner_id === userId;
                const isPending = !isVerified;

                return (
                    <div key={match.id} className={`bg-zinc-900 border-2 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${isPending ? 'border-yellow-500/20' : (amIWinner ? 'border-green-500/20' : 'border-red-500/20')
                        }`}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img
                                    src={partner?.profile_photo || '/avatar-placeholder.png'}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${isPending ? 'bg-yellow-500 text-black' : (amIWinner ? 'bg-green-500 text-black' : 'bg-red-500 text-white')
                                    }`}>
                                    {isPending ? <Users size={10} /> : (amIWinner ? <Trophy size={10} /> : <Frown size={10} />)}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{match.sport} vs {partner?.name}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{new Date(match.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className={`text-xl font-black italic ${isPending ? 'text-yellow-500' : (amIWinner ? 'text-green-500' : 'text-red-500')}`}>
                                {isPending ? 'PENDING' : (amIWinner ? 'VICTORY' : 'DEFEAT')}
                            </span>
                            <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                                {resultData?.score || 'N/A'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MatchHistory;
