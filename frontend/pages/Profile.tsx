import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { uploadProfilePhoto } from '../lib/r2';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /* =========================
     FORM STATE
  ========================= */
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [level, setLevel] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('Singles');
  const [experience, setExperience] = useState(0);
  const [availableDays, setAvailableDays] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [achievements, setAchievements] = useState('');
  const [region, setRegion] = useState('');

  /* =========================
     LOAD POSTS
  ========================= */
  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from('posts')
      .select('id, media_url, media_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, [user?.id]);

  /* =========================
     SYNC USER → FORM
  ========================= */
  useEffect(() => {
    if (!user) return;

    setUsername(user.username || '');
    setBio(user.bio || '');
    setLevel(user.level || '');
    setPreferredFormat(user.preferred_format || 'Singles');
    setExperience(user.experience_years || 0);
    setAvailableDays((user.available_days || []).join(', '));
    setTimeSlots((user.time_slots || []).join(', '));
    setAchievements((user.achievements || []).join('\n'));
    setRegion(user.region || '');
  }, [user]);

  if (!user) return <Navigate to="/auth" replace />;

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
  if (!username.trim()) {
    alert('Username is required');
    return;
  }

  try {
    await updateUser({
      username: username.trim(),
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
    });

    alert('Profile updated successfully');
    setIsEditModalOpen(false);
  } catch (err: any) {
    console.error('SAVE ERROR:', err);
    alert(err.message || 'Failed to save profile');
  }
};


  /* =========================
     PROFILE PHOTO UPLOAD
  ========================= */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const url = await uploadProfilePhoto(file, user.id);
      await updateUser({ profile_photo: url });
    } catch (err) {
      alert('Photo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="relative">
            <img
              src={user.profile_photo || '/avatar-placeholder.png'}
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-600"
            />
            <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer">
              <Camera size={16} />
              <input type="file" hidden onChange={handlePhotoChange} />
            </label>
          </div>

          <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
          <p className="text-gray-400">@{user.username}</p>
          {user.bio && <p className="mt-3 max-w-md">{user.bio}</p>}
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <p className="text-gray-500">ELO</p>
            <p className="text-3xl font-bold">{user.elo ?? 1200}</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <p className="text-gray-500">Experience</p>
            <p className="text-3xl font-bold">{user.experience_years ?? 0} yrs</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <p className="text-gray-500">Posts</p>
            <p className="text-3xl font-bold">{posts.length}</p>
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="bg-zinc-900 rounded-2xl p-6 space-y-3 mb-12">
          <h2 className="text-xl font-bold mb-2">Profile Details</h2>

          <p><span className="text-gray-400">Sport(s):</span> {user.sports?.join(', ') || 'Not set'}</p>
          <p><span className="text-gray-400">Skill Level:</span> {user.level || 'Not set'}</p>
          <p><span className="text-gray-400">Preferred Format:</span> {user.preferred_format || 'Not set'}</p>
          <p><span className="text-gray-400">Location:</span> {user.region || 'Not set'}</p>
          <p><span className="text-gray-400">Available Days:</span> {user.available_days?.join(', ') || 'Not set'}</p>
          <p><span className="text-gray-400">Time Slots:</span> {user.time_slots?.join(', ') || 'Not set'}</p>

          <div>
            <p className="text-gray-400">Achievements:</p>
            {user.achievements?.length ? (
              <ul className="list-disc list-inside text-sm">
                {user.achievements.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">None added</p>
            )}
          </div>
        </div>

        {/* ================= POSTS ================= */}
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        <div className="grid grid-cols-3 gap-4">
          {posts.map(post => (
            <div key={post.id} className="aspect-square rounded-xl overflow-hidden">
              {post.media_type === 'image' ? (
                <img src={post.media_url} className="w-full h-full object-cover" />
              ) : (
                <video src={post.media_url} controls className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>

        {/* ================= EDIT BUTTON ================= */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-white text-black px-8 py-3 rounded-xl font-bold"
          >
            Edit Profile
          </button>
        </div>
      </main>

      <Footer />

      {/* ================= EDIT MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 w-full max-w-lg rounded-2xl p-6 space-y-3">
            <h2 className="text-xl font-bold mb-2">Edit Profile</h2>

            <input className="w-full p-2 bg-black rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <textarea className="w-full p-2 bg-black rounded" placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
            <input className="w-full p-2 bg-black rounded" placeholder="Skill Level" value={level} onChange={e => setLevel(e.target.value)} />
            <input className="w-full p-2 bg-black rounded" placeholder="Preferred Format" value={preferredFormat} onChange={e => setPreferredFormat(e.target.value)} />
            <input className="w-full p-2 bg-black rounded" type="number" placeholder="Experience (years)" value={experience} onChange={e => setExperience(Number(e.target.value))} />
            <input className="w-full p-2 bg-black rounded" placeholder="Available days (comma separated)" value={availableDays} onChange={e => setAvailableDays(e.target.value)} />
            <input className="w-full p-2 bg-black rounded" placeholder="Time slots (comma separated)" value={timeSlots} onChange={e => setTimeSlots(e.target.value)} />
            <input className="w-full p-2 bg-black rounded" placeholder="Location" value={region} onChange={e => setRegion(e.target.value)} />
            <textarea className="w-full p-2 bg-black rounded" placeholder="Achievements (one per line)" value={achievements} onChange={e => setAchievements(e.target.value)} />

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-zinc-700 rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
