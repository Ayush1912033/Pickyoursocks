import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SPORTS } from '../constants';

interface SportsGridProps {
  limit?: number;
}

const SportsGrid: React.FC<SportsGridProps> = ({ limit }) => {
  const navigate = useNavigate();
  const baseSports = limit ? SPORTS.slice(0, limit) : SPORTS;

  return (
    <section id="sports" className="py-24 bg-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Pick Your <span className="text-blue-600">Arena</span>
          </h2>
        </div>
        {limit && (
          <button
            onClick={() => navigate('/sports')}
            className="text-sm font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors"
          >
            View All Sports →
          </button>
        )}
      </div>

      {/* Manual Scroll Container */}
      <div className="relative">
        {/* Fading Edge Overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 md:px-12 pb-8">
          {baseSports.map((sport) => (
            <div
              key={sport.id}
              className="group relative w-[80vw] md:w-[450px] h-[450px] shrink-0 overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 cursor-pointer mx-3 snap-center"
              onClick={() => navigate('/signup')}
            >
              <img
                src={sport.image}
                alt={sport.name}
                className="absolute inset-0 w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 group-hover:text-blue-500 transition-colors text-white">
                  {sport.name}
                </h3>
                <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {sport.description}
                </p>
                <div className="mt-4 w-12 h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
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

export default SportsGrid;
