
import React from 'react';
import { FEATURES } from '../constants';
import * as Icons from 'lucide-react';

const Features: React.FC = () => {
    const duplicatedFeatures = [...FEATURES, ...FEATURES];

    return (
        <section id="how-it-works" className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[128px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 mb-16">
                <div className="text-center md:text-left">
                    <h2 className="text-blue-500 font-bold uppercase tracking-widest mb-4">The New Standard</h2>
                    <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight mb-8">
                        Bridges the Gap Between <br />
                        <span className="text-white/20">Playing</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 pr-12">Competing</span>
                    </h3>
                </div>
            </div>

            {/* Infinite Scroll Container */}
            <div className="relative">
                {/* Fading Edge Overlays */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                <div className="flex w-fit animate-infinite-scroll hover:pause-animation">
                    {duplicatedFeatures.map((feature, idx) => (
                        <div
                            key={`${feature.id}-${idx}`}
                            className="group relative w-[350px] md:w-[450px] shrink-0 p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] hover:bg-zinc-800 transition-all duration-500 mx-4 overflow-hidden"
                        >
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />

                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 group-hover:border-blue-500/50 transition-all duration-500 shrink-0">
                                    <div className="relative z-10 text-blue-400 group-hover:text-white transition-colors duration-300">
                                        {feature.icon === 'target' && <Icons.Target size={28} strokeWidth={1.5} />}
                                        {feature.icon === 'user-check' && <Icons.UserCheck size={28} strokeWidth={1.5} />}
                                        {feature.icon === 'map-pin' && <Icons.MapPin size={28} strokeWidth={1.5} />}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black uppercase italic mb-3 text-white group-hover:text-blue-500 transition-colors">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-400 leading-relaxed font-light group-hover:text-gray-200 transition-colors">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
