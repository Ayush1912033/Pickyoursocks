import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { SPORTS } from '../constants';
import { useNotification } from '../components/NotificationContext';
import { Check } from 'lucide-react';

const Onboarding: React.FC = () => {
    const { user, updateUser, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleSport = (sportId: string) => {
        setSelectedSports(prev => {
            if (prev.includes(sportId)) {
                return prev.filter(id => id !== sportId);
            } else {
                return [...prev, sportId];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedSports.length === 0) {
            showNotification('Please select at least one sport to continue.', 'error');
            return;
        }

        setIsSubmitting(true);
        console.log('Onboarding: Submitting sports:', selectedSports);

        try {
            await updateUser({
                sports: selectedSports,
            });
            console.log('Onboarding: Update successful');

            // Force a profile refresh to ensure we have the latest data
            const updatedUser = await refreshProfile();

            // Double check if user state has sports now
            if (updatedUser && updatedUser.sports && updatedUser.sports.length > 0) {
                console.log('Onboarding: Verified sports persistence', updatedUser.sports);
                showNotification('Welcome to the club! 🚀', 'success');
                navigate('/feed');
            } else {
                console.error('Onboarding: Persistence check failed. Sports empty after save.');
                showNotification('Connection issue. Please try clicking "Continue" again.', 'error');
                // Do not navigate. User can try again.
            }

        } catch (error) {
            console.error('Onboarding error:', error);
            showNotification('Failed to save selections. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
                        What matches <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                            do you play?
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Select the sports you're interested in. We'll customize your feed and rankings based on your choices.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {SPORTS.map((sport) => {
                        const isSelected = selectedSports.includes(sport.id);
                        return (
                            <button
                                key={sport.id}
                                onClick={() => toggleSport(sport.id)}
                                className={`
                                    group relative aspect-square rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border
                                    ${isSelected
                                        ? 'bg-white text-black border-white scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                        : 'bg-zinc-900/50 text-gray-400 border-white/10 hover:border-white/30 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative">
                                    <img
                                        src={sport.image}
                                        alt={sport.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
                                    />
                                    <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-40 group-hover:opacity-0'}`} />
                                </div>
                                <span className={`font-black uppercase tracking-wider text-sm ${isSelected ? 'text-black' : 'text-gray-300'}`}>
                                    {sport.name}
                                </span>

                                {isSelected && (
                                    <div className="absolute top-3 right-3 bg-blue-500 text-white p-1 rounded-full">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-white text-black text-xl font-black italic uppercase tracking-widest px-12 py-5 rounded-full hover:scale-105 hover:bg-gray-100 transition-transform disabled:opacity-50 disabled:scale-100"
                    >
                        {isSubmitting ? 'Setting up...' : 'Continue to Feed ->'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
