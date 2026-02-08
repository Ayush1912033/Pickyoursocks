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
                                        ACCEPT
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
