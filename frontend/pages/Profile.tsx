
import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';

import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { uploadProfilePhoto } from '../lib/r2';
import { useNotification } from '../components/NotificationContext';
import { SPORTS } from '../constants';
import MatchHistory from '../components/MatchHistory';

const Profile: React.FC = () => {
  const { showNotification } = useNotification();
  const { user: currentUser, updateUser, logout } = useAuth();
  const { userId } = useParams();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const isOwnProfile = !userId || (currentUser && currentUser.id === userId);

  // If no userId param, show current user. If userId param, fetch that user.
  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(currentUser);
      setIsLoadingProfile(false);
    } else {
      setIsLoadingProfile(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setProfileUser(data);
          } else {
            console.error("Error fetching profile:", error);
          }
          setIsLoadingProfile(false);
        });
    }
  }, [userId, currentUser, isOwnProfile]);


  const [posts, setPosts] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /* =========================
     FORM STATE
  ========================= */
  const [isEditing, setIsEditing] = useState(false); // NEW: Inline editing state

  const [username, setUsername] = useState('');
  const [name, setName] = useState(''); // NEW: Full name state
  const [bio, setBio] = useState('');
  const [level, setLevel] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('Singles');
  const [experience, setExperience] = useState(0);
  const [availableDays, setAvailableDays] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [achievements, setAchievements] = useState('');
  const [region, setRegion] = useState('');
  const [sports, setSports] = useState<string[]>([]); // NEW: Sports state
  const [selectedSport, setSelectedSport] = useState<string | null>(null); // NEW: Selected sport for viewing stats

  /* =========================
     LOAD POSTS
  ========================= */
  useEffect(() => {
    const targetUserId = profileUser?.id;
    if (!targetUserId) return;

    supabase
      .from('posts')
      .select('id, media_url, media_type')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, [profileUser?.id]);

  /* =========================
     SYNC USER → FORM
  ========================= */
  const syncFormWithUser = () => {
    if (!profileUser) return;
    setUsername(profileUser.username || '');
    setName(profileUser.name || '');
    setBio(profileUser.bio || '');
    setLevel(profileUser.level || '');
    setPreferredFormat(profileUser.preferred_format || 'Singles');
    setExperience(profileUser.experience_years || 0);
    setAvailableDays((profileUser.available_days || []).join(', '));
    setTimeSlots((profileUser.time_slots || []).join(', '));
    setAchievements((profileUser.achievements || []).join('\n'));
    setRegion(profileUser.region || '');
    setSports(profileUser.sports || []); // NEW: Sync sports
    if (!selectedSport && profileUser.sports?.length > 0) {
      setSelectedSport(profileUser.sports[0]);
    }
  };

  useEffect(() => {
    syncFormWithUser();
  }, [profileUser]);

  if (!currentUser && !userId) return <Navigate to="/auth" replace />;
  if (isLoadingProfile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (!profileUser && !isLoadingProfile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">User not found</div>;

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    if (!username.trim()) {
      showNotification('Username is required', 'error');
      return;
    }

    try {
      await updateUser({
        username: username.trim(),
        name: name.trim(),
        bio,
        level,
        preferred_format: preferredFormat,
        experience_years: experience,
        available_days: availableDays
          .split(',')
          .map(d => d.trim())
          .filter(Boolean),
        time_slots: timeSlots
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        achievements: achievements
          .split('\n')
          .map(a => a.trim())
          .filter(Boolean),
        region,
        sports, // NEW: Include sports in update
      });

      showNotification('Profile updated successfully', 'success');
      setIsEditing(false); // Exit edit mode
    } catch (err: any) {
      console.error('SAVE ERROR:', err);
      showNotification(err.message || 'Failed to save profile', 'error');
    }
  };

  const handleCancel = () => {
    syncFormWithUser(); // Revert changes
    setIsEditing(false);
  };


  /* =========================
     PROFILE PHOTO UPLOAD
  ========================= */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow if it's the current user
    if (!e.target.files || !currentUser || !isOwnProfile) return;

    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const url = await uploadProfilePhoto(file, currentUser.id);
      await updateUser({ profile_photo: url });
    } catch (err) {
      showNotification('Photo upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to render label + value/input
  const RenderField = ({ label, value, onChange, placeholder, isTextArea = false }: any) => (
    <div>
      <span className="text-gray-400 block text-sm mb-1">{label}:</span>
      {isEditing ? (
        isTextArea ? (
          <textarea
            className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )
      ) : (
        <p className="font-medium">{value || <span className="text-gray-600 italic">Not set</span>}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="relative">
            <img
              src={profileUser.profile_photo || '/avatar-placeholder.png'}
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-600"
            />
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition">
                <Camera size={16} />
                <input type="file" hidden onChange={handlePhotoChange} />
              </label>
            )}
          </div>

          <h1 className="text-3xl font-bold mt-4">{profileUser.name}</h1>
          <p className="text-gray-400">@{profileUser.username}</p>
          {profileUser.bio && <p className="mt-3 max-w-md text-gray-300">{profileUser.bio}</p>}
        </div>

        {/* ================= STATS ================= */}
        <div className="flex justify-center mb-6 gap-2">
          {profileUser.sports?.map((s: string) => (
            <button
              key={s}
              onClick={() => setSelectedSport(s)}
              className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedSport === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                }`}
            >
              {SPORTS.find(sp => sp.id === s)?.name || s}
            </button>
          ))}
          {(!profileUser.sports || profileUser.sports.length === 0) && (
            <span className="text-gray-500 text-sm italic">No sports selected</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-zinc-900 p-6 rounded-xl text-center border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">
              {selectedSport ? (SPORTS.find(s => s.id === selectedSport)?.name || selectedSport) : 'General'} ELO
            </p>
            <p className="text-3xl font-black italic text-white/90">
              {selectedSport
                ? (profileUser.elo_ratings?.[selectedSport] ?? profileUser.elo ?? 800)
                : (profileUser.elo ?? 1200)}
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Exp</p>
            <p className="text-3xl font-black italic">{profileUser.experience_years ?? 0}<span className="text-base not-italic text-gray-500 ml-1">yrs</span></p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Posts</p>
            <p className="text-3xl font-black italic">{posts.length}</p>
          </div>
        </div>

        {/* ================= DETAILS (EDITABLE) ================= */}
        <div className="bg-zinc-900 rounded-3xl p-8 space-y-6 mb-12 border border-white/5 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Profile Details</h2>
            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 border border-blue-500/30 px-4 py-2 rounded-full hover:bg-blue-500/10 transition"
              >
                Edit Details
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Fields */}
            <div className="md:col-span-2">
              <span className="text-gray-400 block text-sm mb-1">Full Name:</span>
              {isEditing && !profileUser.name ? (
                <input
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xl text-white">{name || 'User'}</p>
                  {isEditing && <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold px-2 py-0.5 bg-zinc-800 rounded">Locked</span>}
                </div>
              )}
            </div>

            <div>
              <span className="text-gray-400 block text-sm mb-1">Username:</span>
              {isEditing && !profileUser.username ? (
                <input
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-medium">@{username}</p>
                  {isEditing && <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold px-2 py-0.5 bg-zinc-800 rounded">Locked</span>}
                </div>
              )}
            </div>

            <div>
              <span className="text-gray-400 block text-sm mb-1">Location:</span>
              {isEditing ? (
                <input
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              ) : (
                <p className="font-medium">{region || 'Not set'}</p>
              )}
            </div>

            <RenderField label="Skill Level" value={level} onChange={setLevel} placeholder="e.g. Intermediate" />
            <RenderField label="Preferred Format" value={preferredFormat} onChange={setPreferredFormat} placeholder="e.g. Singles, Doubles" />

            <div>
              <span className="text-gray-400 block text-sm mb-1">Experience (Years):</span>
              {isEditing ? (
                <input
                  type="number"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                />
              ) : (
                <p className="font-medium">{experience} years</p>
              )}
            </div>

            <RenderField label="Available Days" value={availableDays} onChange={setAvailableDays} placeholder="e.g. Mon, Wed, Sat" />
            <RenderField label="Time Slots" value={timeSlots} onChange={setTimeSlots} placeholder="e.g. 6-8 PM" />

            {/* Sports Selection */}
            <div className="md:col-span-2">
              <span className="text-gray-400 block text-sm mb-2">Sports:</span>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (sports.includes(s.id)) {
                          setSports(sports.filter((id) => id !== s.id));
                        } else {
                          setSports([...sports, s.id]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${sports.includes(s.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-zinc-800 text-gray-400 border-white/5 hover:border-white/20'
                        } border`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sports.length > 0 ? (
                    sports.map((sid) => {
                      const s = SPORTS.find((x) => x.id === sid);
                      return (
                        <span
                          key={sid}
                          className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-xs font-bold border border-blue-600/20"
                        >
                          {s?.name || sid}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-600 italic">No sports selected</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <span className="text-gray-400 block text-sm mb-1">Bio:</span>
            {isEditing ? (
              <textarea
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{bio || <span className="text-gray-600 italic">No bio added</span>}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <span className="text-gray-400 block text-sm mb-1">Achievements:</span>
            {isEditing ? (
              <textarea
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:border-blue-600 outline-none"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows={4}
                placeholder="List achievements, one per line"
              />
            ) : (
              achievements ? (
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {achievements.split('\n').filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              ) : <span className="text-gray-600 italic">None added</span>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-white/10">
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2 bg-blue-600 rounded-lg font-bold text-white uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* ================= MATCH HISTORY ================= */}
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Match History</h2>
        <MatchHistory userId={profileUser.id} />

        {/* ================= POSTS ================= */}
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Posts</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map(post => (
              <div key={post.id} className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-zinc-900">
                {post.media_type === 'image' ? (
                  <img src={post.media_url} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                ) : (
                  <video src={post.media_url} controls className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-500">No posts yet</p>
          </div>
        )}
        {/* ================= LOGOUT ================= */}
        {isOwnProfile && (
          <div className="mt-12 text-center pb-8 border-t border-white/10 pt-12">
            <button
              onClick={logout}
              className="text-red-500 font-bold uppercase tracking-widest text-sm hover:text-red-400 border border-red-500/30 px-8 py-3 rounded-xl hover:bg-red-500/10 transition-all hover:scale-105"
            >
              Log Out
            </button>
            <p className="text-gray-600 text-xs mt-4">Pickyoursocks v1.0</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
