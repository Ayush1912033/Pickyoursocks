import React from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, MapPin, Trophy, Mail, Calendar, Activity } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Helper to format array items (like sports)
    const formatList = (items?: string[]) => {
        if (!items || items.length === 0) return 'None Selected';
        return items.join(', ');
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
                        {/* Large Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/30 transform hover:scale-105 transition-transform duration-500">
                            <span className="text-6xl font-black italic text-white">
                                {user.name ? user.name[0].toUpperCase() : 'U'}
                            </span>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
                                {user.name || 'User'}
                            </h1>
                            <p className="text-xl text-gray-400 font-medium mb-6">{user.email}</p>
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></span>
                                <span className="text-sm font-bold uppercase tracking-widest text-gray-300">Active Member</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Personal Info Card */}
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <User size={24} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-wider">Personal Info</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</span>
                                    <p className="text-lg font-medium">{user.name || 'Not provided'}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</span>
                                    <p className="text-lg font-medium">{user.email}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date of Birth</span>
                                    </div>
                                    <p className="text-lg font-medium">{user.dob || 'Not provided'}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gender</span>
                                    <p className="text-lg font-medium capitalize">{user.gender || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sports & Location Card */}
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-purple-600/10 rounded-xl text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Trophy size={24} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-wider">Interests & Loc</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Region</span>
                                    </div>
                                    <p className="text-lg font-medium">{user.region || 'Global'}</p>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Activity size={14} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Sports</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {user.sports && user.sports.length > 0 ? (
                                            user.sports.map((sport, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors">
                                                    {sport}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No sports selected</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Experience Level</span>
                                    <div className="relative pt-2">
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${user.level === 'beginner' ? 'w-1/3 bg-green-500' :
                                                        user.level === 'intermediate' ? 'w-2/3 bg-yellow-500' :
                                                            user.level === 'advanced' ? 'w-full bg-red-600' : 'w-0'
                                                    }`}
                                            />
                                        </div>
                                        <span className="text-xs font-bold uppercase mt-1 block text-right text-gray-400">{user.level || 'Unspecified'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl border border-white/5 text-center">
                        <h4 className="text-2xl font-black italic uppercase mb-2">Ready to compete?</h4>
                        <p className="text-gray-400 mb-6">Complete your profile to unlock verified tournaments and ranked matches.</p>
                        <button className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                            Edit Profile
                        </button>
                    </div>

                </div>
            </main>

            <Footer />
            {/* Background static / noise overlay for cinematic feel */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>
        </div>
    );
};

export default Profile;
