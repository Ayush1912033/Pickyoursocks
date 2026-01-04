
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 lg:px-12 py-4 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 relative z-50">
          <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center font-black text-white italic">P</div>
          <span className="text-xl font-black tracking-tighter uppercase italic">PickYourSocks</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-widest text-gray-400">
          <a href="#how-it-works" className="hover:text-blue-500 transition-colors">How It Works</a>
          <a href="#sports" className="hover:text-blue-500 transition-colors">Sports</a>
          <a href="#community" className="hover:text-blue-500 transition-colors">Community</a>
        </div>

        <div className="flex items-center gap-4 relative z-50">
          <button
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-white text-black text-xs md:text-sm font-black uppercase tracking-widest px-6 md:px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] overflow-hidden hidden md:block"
          >
            <span className="relative z-10 group-hover:text-blue-600 transition-colors">Join Waitlist</span>
            <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-transform duration-500 md:hidden flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-500 transition-colors">How It Works</a>
        <a href="#sports" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-500 transition-colors">Sports</a>
        <a href="#community" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black italic uppercase tracking-tighter hover:text-blue-500 transition-colors">Community</a>
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-8 bg-blue-600 text-white text-lg font-black uppercase tracking-widest px-10 py-4 rounded-full shadow-lg shadow-blue-600/30"
        >
          Join Waitlist
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
