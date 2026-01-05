import React from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, MapPin, Trophy, Mail, Calendar, Activity } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const LOCATIONS: Record<string, Record<string, string[]>> = {
    "India": {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"]
    },
    "USA": {
        "New York": ["New York City", "Buffalo", "Rochester"],
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "Texas": ["Houston", "Austin", "Dallas"]
    },
    "United Kingdom": {
        "England": ["London", "Manchester", "Liverpool"],
        "Scotland": ["Edinburgh", "Glasgow"]
    }
};

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    // Form State
    const [country, setCountry] = React.useState(user?.region?.split(', ')[2] || '');
    const [state, setState] = React.useState(user?.region?.split(', ')[1] || '');
    const [city, setCity] = React.useState(user?.region?.split(', ')[0] || '');
    const [level, setLevel] = React.useState(user?.level || '');

    // Update state when modal opens
    React.useEffect(() => {
        if (isEditModalOpen && user) {
            const parts = user.region?.split(', ') || [];
            if (parts.length === 3) {
                setCity(parts[0]);
                setState(parts[1]);
                setCountry(parts[2]);
            }
            setLevel(user.level || '');
        }
    }, [isEditModalOpen, user]);

    // Reset dependent fields
    React.useEffect(() => {
        if (!LOCATIONS[country]) return;
        if (!LOCATIONS[country][state]) setState('');
    }, [country]);

    React.useEffect(() => {
        if (state && LOCATIONS[country] && !LOCATIONS[country][state]?.includes(city)) setCity('');
    }, [state]);


    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    const handleSave = async () => {
        await updateUser({
            region: `${city}, ${state}, ${country}`,
            level
        });
        setIsEditModalOpen(false);
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
                                                className={`h-full rounded-full ${user.level === 'Recreational' ? 'w-1/4 bg-green-500' :
                                                    user.level === 'State' ? 'w-1/2 bg-blue-500' :
                                                        user.level === 'National' ? 'w-3/4 bg-yellow-500' :
                                                            user.level === 'International' ? 'w-full bg-red-600' : 'w-0'
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
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>

                </div>
            </main>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />

                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase mb-6">Complete Profile</h2>

                        <div className="space-y-6">
                            {/* Location Section */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Location</label>
                                <div className="space-y-3">
                                    <select
                                        value={country}
                                        onChange={(e) => {
                                            setCountry(e.target.value);
                                            setState('');
                                            setCity('');
                                        }}
                                        className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 text-white appearance-none"
                                    >
                                        <option value="">Select Country</option>
                                        {Object.keys(LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>

                                    <select
                                        value={state}
                                        onChange={(e) => {
                                            setState(e.target.value);
                                            setCity('');
                                        }}
                                        disabled={!country}
                                        className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 text-white appearance-none disabled:opacity-50"
                                    >
                                        <option value="">Select State</option>
                                        {country && LOCATIONS[country] && Object.keys(LOCATIONS[country]).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        disabled={!state}
                                        className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 text-white appearance-none disabled:opacity-50"
                                    >
                                        <option value="">Select City</option>
                                        {country && state && LOCATIONS[country][state]?.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Level Section */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Competition Level</label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 focus:outline-none focus:border-blue-500 text-white appearance-none"
                                >
                                    <option value="">Select Level</option>
                                    <option value="Recreational">Recreational</option>
                                    <option value="State">State</option>
                                    <option value="National">National</option>
                                    <option value="International">International</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            {/* Background static / noise overlay for cinematic feel */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>
        </div>
    );
};

export default Profile;
