import React from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, MapPin, Trophy, Mail, Calendar, Activity } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MATCH_RESULTS } from '../constants';

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
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    // Form State
    const [username, setUsername] = React.useState(user?.username || '');
    const [bio, setBio] = React.useState(user?.bio || '');
    const [country, setCountry] = React.useState(user?.region?.split(', ')[2] || '');
    const [state, setState] = React.useState(user?.region?.split(', ')[1] || '');
    const [city, setCity] = React.useState(user?.region?.split(', ')[0] || '');
    const [locality, setLocality] = React.useState(user?.locality || '');
    const [level, setLevel] = React.useState(user?.level || '');
    const [preferredFormat, setPreferredFormat] = React.useState(user?.preferred_format || 'Singles');
    const [experience, setExperience] = React.useState(user?.experience_years || 0);
    const [availableDays, setAvailableDays] = React.useState<string[]>(user?.available_days || []); // Use array for checkbox toggle
    const [timeSlots, setTimeSlots] = React.useState(user?.time_slots?.join(', ') || '');
    const [achievements, setAchievements] = React.useState(user?.achievements?.join('\n') || '');

    // Update state when modal opens
    React.useEffect(() => {
        if (isEditModalOpen && user) {
            setUsername(user.username || '');
            setBio(user.bio || '');
            const parts = user.region?.split(', ') || [];
            if (parts.length === 3) {
                setCity(parts[0]);
                setState(parts[1]);
                setCountry(parts[2]);
            }
            setLocality(user.locality || '');
            setLevel(user.level || '');
            setPreferredFormat(user.preferred_format || 'Singles');
            setExperience(user.experience_years || 0);
            setAvailableDays(user.available_days || []);
            setTimeSlots(user.time_slots?.join(', ') || '');
            setAchievements(user.achievements?.join('\n') || '');
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
            username,
            bio,
            region: `${city}, ${state}, ${country}`,
            locality,
            level,
            preferred_format: preferredFormat,
            experience_years: Number(experience),
            available_days: availableDays,
            time_slots: timeSlots.split(',').map(s => s.trim()).filter(Boolean),
            achievements: achievements.split('\n').filter(Boolean)
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
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                        {/* Large Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/30 transform hover:scale-105 transition-transform duration-500 overflow-hidden border-4 border-black">
                            {user.profile_photo ? (
                                <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-6xl font-black italic text-white">
                                    {user.name ? user.name[0].toUpperCase() : 'U'}
                                </span>
                            )}
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
                                {user.name || 'User'}
                            </h1>
                            <p className="text-xl text-gray-500 font-bold italic mb-4">@{user.username || 'username'}</p>

                            <p className="text-gray-300 max-w-xl mb-6 leading-relaxed">
                                {user.bio || "No bio yet. Ready to compete!"}
                            </p>

                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></span>
                                    <span className="text-sm font-bold uppercase tracking-widest text-gray-300">Active Member</span>
                                </div>
                                {user.locality && (
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400">
                                        <MapPin size={14} className="mr-2" />
                                        <span className="text-sm font-bold uppercase tracking-widest">{user.locality}, {user.region?.split(',')[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">ELO Rating</p>
                            <p className="text-3xl font-black italic text-white">{user.elo || '1200'}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Connections</p>
                            <p className="text-3xl font-black italic text-white">{user.connections || '0'}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Experience</p>
                            <p className="text-3xl font-black italic text-white">{user.experience_years || '0'} <span className="text-sm not-italic text-gray-600">Yrs</span></p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Format</p>
                            <p className="text-xl font-black italic text-white uppercase">{user.preferred_format || 'Singles'}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Availability</p>
                            <p className="text-xl font-black italic text-white uppercase">{user.available_days?.length ? `${user.available_days.length} Days` : 'Flexible'}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* About & Availability Card */}
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <User size={24} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-wider">About & Availability</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gender</span>
                                        <p className="text-lg font-medium capitalize">{user.gender || 'Not provided'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">DOB</span>
                                        <p className="text-lg font-medium">{user.dob || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</span>
                                    <p className="text-lg font-medium truncate">{user.email}</p>
                                </div>
                                <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={14} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Available Days</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {user.available_days && user.available_days.length > 0 ? (
                                            user.available_days.map(day => (
                                                <span key={day} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold uppercase">{day}</span>
                                            ))
                                        ) : <p className="text-gray-500 italic">Not specified</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time Slots</span>
                                    <p className="text-sm font-medium text-gray-300">{user.time_slots?.join(', ') || 'Flexible'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sports & Achievements Card */}
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-purple-600/10 rounded-xl text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Trophy size={24} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-wider">Sports & Stats</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</span>
                                    </div>
                                    <p className="text-lg font-medium">
                                        {user.locality ? `${user.locality}, ` : ''}{user.region || 'Global'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Activity size={14} className="text-gray-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sports</span>
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

                                {user.achievements && user.achievements.length > 0 && (
                                    <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Achievements</span>
                                        <div className="space-y-2">
                                            {user.achievements.map((ach, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-yellow-500/90">
                                                    <Trophy size={12} />
                                                    <span>{ach}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Match History Section */}
                    <div className="mb-24 mt-24">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                            <span className="w-12 h-1 bg-white/20 rounded-full"></span>
                            Match History
                        </h3>

                        <div className="space-y-4">
                            {MATCH_RESULTS.map((match) => {
                                // Mock logic: Assume "You" are the winner for demo purposes if ID is odd, else loser.
                                const isWin = parseInt(match.id.replace('m', '')) % 2 !== 0;
                                const opponent = isWin ? match.loser : match.winner;
                                const eloDiff = isWin ? `+${match.eloChange}` : `-${match.eloChange}`;

                                return (
                                    <div key={match.id} className="group bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-zinc-900 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black italic ${isWin ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {isWin ? 'W' : 'L'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">vs {opponent}</h4>
                                                <p className="text-gray-500 text-sm font-medium">{match.score}</p>
                                            </div>
                                        </div>
                                        <div className={`text-right ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                                            <span className="text-xl font-black italic tracking-tighter block">{eloDiff} RP</span>
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Ranked</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Posts Section */}
                    <div className="mt-24 mb-24">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                            <span className="w-12 h-1 bg-white/20 rounded-full"></span>
                            Recent Posts
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Mock Posts */}
                            <div className="aspect-square bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center group overflow-hidden relative cursor-pointer">
                                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                    <span className="font-bold uppercase tracking-widest text-sm">View</span>
                                </div>
                                <span className="text-gray-600 font-black italic text-4xl group-hover:scale-110 transition-transform duration-500">#1</span>
                            </div>
                            <div className="aspect-square bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center group overflow-hidden relative cursor-pointer">
                                <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                    <span className="font-bold uppercase tracking-widest text-sm">View</span>
                                </div>
                                <span className="text-gray-600 font-black italic text-4xl group-hover:scale-110 transition-transform duration-500">#2</span>
                            </div>
                            <div className="aspect-square bg-zinc-900/50 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-gray-500 gap-2 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer">
                                <div className="p-3 rounded-full bg-white/5">
                                    <span className="text-2xl">+</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Add Post</span>
                            </div>
                        </div>
                    </div>

                    {/* Logout Section */}
                    <div className="mt-24 mb-12 flex justify-center">
                        <button
                            onClick={async () => {
                                await logout();
                                navigate('/');
                            }}
                            className="text-red-500 font-bold uppercase tracking-widest text-sm hover:text-red-400 hover:underline transition-all"
                        >
                            Logout
                        </button>
                    </div>

                    {(!user.region || !user.level) && (
                        <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl border border-white/5 text-center">
                            {/* ... existing content ... */}
                        </div>
                    )}

                </div>
            </main>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />

                    <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 shadow-2xl flex flex-col max-h-[85vh]">

                        {/* Header */}
                        <div className="p-8 border-b border-white/5">
                            <h2 className="text-2xl font-black italic uppercase">Edit Profile</h2>
                            <p className="text-gray-400 text-sm">Update your stats and availability.</p>
                        </div>

                        {/* Scrollable Form */}
                        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

                            {/* Identity */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                                        <input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 outline-none text-white"
                                            placeholder="unique_username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Locality</label>
                                        <input
                                            value={locality}
                                            onChange={(e) => setLocality(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 outline-none text-white"
                                            placeholder="e.g. Indiranagar"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 outline-none text-white resize-none h-24"
                                        placeholder="Tell us about your play style..."
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Location</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <select
                                        value={country}
                                        onChange={(e) => { setCountry(e.target.value); setState(''); setCity(''); }}
                                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none text-white appearance-none"
                                    >
                                        <option value="">Country</option>
                                        {Object.keys(LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select
                                        value={state}
                                        onChange={(e) => { setState(e.target.value); setCity(''); }}
                                        disabled={!country}
                                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none text-white appearance-none disabled:opacity-50"
                                    >
                                        <option value="">State</option>
                                        {country && LOCATIONS[country] && Object.keys(LOCATIONS[country]).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        disabled={!state}
                                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none text-white appearance-none disabled:opacity-50"
                                    >
                                        <option value="">City</option>
                                        {country && state && LOCATIONS[country][state]?.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Sports Stats */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Sports Stats</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Level</label>
                                        <select
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none text-white appearance-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="Recreational">Recreational</option>
                                            <option value="State">State</option>
                                            <option value="National">National</option>
                                            <option value="International">International</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Experience (Yrs)</label>
                                        <input
                                            type="number"
                                            value={experience}
                                            onChange={(e) => setExperience(Number(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 outline-none text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Format</label>
                                        <select
                                            value={preferredFormat}
                                            onChange={(e) => setPreferredFormat(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none text-white appearance-none"
                                        >
                                            <option value="Singles">Singles</option>
                                            <option value="Doubles">Doubles</option>
                                            <option value="Team">Team</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Availability</h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                            const isSelected = availableDays.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => setAvailableDays(prev =>
                                                        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                                    )}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSelected
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Time Slots</label>
                                    <input
                                        value={timeSlots}
                                        onChange={(e) => setTimeSlots(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 outline-none text-white"
                                        placeholder="e.g. 6-8 PM, Weekends Morning"
                                    />
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Achievements</h3>
                                <textarea
                                    value={achievements}
                                    onChange={(e) => setAchievements(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 outline-none text-white resize-none h-24"
                                    placeholder="List your achievements (one per line)..."
                                />
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-zinc-900 rounded-b-3xl flex gap-4">
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
