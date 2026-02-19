
import React from 'react';
import { FEATURES } from '../constants';
import * as Icons from 'lucide-react';

const Features: React.FC = () => {
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

            {/* Manual Scroll Container */}
            <div className="relative">
                {/* Fading Edge Overlays */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 lg:px-12 pb-12">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.id}
                            className="group relative w-[80vw] md:w-[450px] shrink-0 h-[500px] p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] hover:bg-zinc-800 transition-all duration-500 mx-4 overflow-hidden snap-center flex flex-col justify-end"
                        >
                            {/* Background Image */}
                            {feature.image && (
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                                />
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out mix-blend-overlay" />

                            <div className="flex flex-col gap-4 relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm border border-white/10 group-hover:border-blue-500/50 transition-all duration-500 shrink-0 mb-2">
                                    <div className="relative z-10 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                                        {feature.icon === 'target' && <Icons.Target size={24} strokeWidth={2} />}
                                        {feature.icon === 'user-check' && <Icons.UserCheck size={24} strokeWidth={2} />}
                                        {feature.icon === 'map-pin' && <Icons.MapPin size={24} strokeWidth={2} />}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black uppercase italic mb-3 text-white group-hover:text-blue-400 transition-colors tracking-tighter shadow-black drop-shadow-lg">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed font-medium text-sm md:text-base drop-shadow-md group-hover:text-white transition-colors">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Spacing element at the end */}
                    <div className="w-12 shrink-0 md:hidden" />
                </div>
            </div>
        </section>
    );
};

export default Features;
