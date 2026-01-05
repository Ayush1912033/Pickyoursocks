import React from 'react';
import { NEARBY_USERS } from '../constants';
import { MapPin } from 'lucide-react';

const PeopleNearYou: React.FC = () => {
    return (
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8">
                People <br /> Near <span className="text-blue-600">You</span>
            </h2>

            <div className="flex flex-col gap-0">
                {NEARBY_USERS.map((user) => (
                    <div key={user.id} className="group flex items-center gap-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer first:border-t">
                        {/* Rank Number Box */}
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl text-white font-black text-2xl flex items-center justify-center transform -rotate-3 transition-transform group-hover:rotate-0">
                            <span>{user.rank}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">
                                {user.sport}
                            </h4>
                            <h3 className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-blue-500 transition-colors leading-none mb-1">
                                {user.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                <MapPin size={10} />
                                {user.distance} AWAY
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-4 bg-zinc-800 rounded-2xl text-gray-300 font-bold uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all">
                View All Athletes
            </button>
        </div>
    );
};

export default PeopleNearYou;
