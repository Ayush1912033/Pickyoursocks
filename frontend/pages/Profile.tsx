import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Camera, User, Users, History, Layout, Settings, Save, X, MapPin, LogOut } from 'lucide-react';

import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { uploadProfilePhoto } from '../lib/r2';
import { useNotification } from '../components/NotificationContext';
import { SPORTS } from '../constants';
import MatchHistory from '../components/MatchHistory';
import ChatWidget from '../components/ChatWidget';
import { generateAndStoreKeys } from '../lib/chat';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user: currentUser, updateUser, logout } = useAuth();
  const { userId } = useParams();

  const isOwnProfile = !userId || (currentUser && currentUser.id === userId);

  /* =========================
     STATE
  ========================= */
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Friend System State
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [isLoadingFriend, setIsLoadingFriend] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

  // Social State
  const [mutualFriends, setMutualFriends] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'friends' | 'followers' | 'history' | 'posts'>('friends');

  const [posts, setPosts] = useState<any[]>([]);
  const [activeChatFriend, setActiveChatFriend] = useState<any>(null);

  /* =========================
     FORM STATE
  ========================= */
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [region, setRegion] = useState('');
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('Singles');
  const [experience, setExperience] = useState(0);
  const [availableDays, setAvailableDays] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [achievements, setAchievements] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  /* =========================
     FETCH DATA
  ========================= */
  const loadData = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      let targetUserId = userId;
      if (!userId) {
        if (currentUser) targetUserId = currentUser.id;
        else return;
      }
      if (!targetUserId) return;

      // 1. Fetch Profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      if (profile) {
        setProfileUser(profile);
        if (profile.sports?.length > 0) setSelectedSport(profile.sports[0]);
      }

      // 2. Fetch Posts
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id, media_url, media_type, created_at')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (userPosts) setPosts(userPosts);

      // 3. Friend Status with Current User
      if (currentUser && targetUserId !== currentUser.id) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('*')
          .or(`and(requester_id.eq.${currentUser.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${currentUser.id})`)
          .maybeSingle();

        if (friendship) {
          setFriendshipId(friendship.id);
          if (friendship.status === 'accepted') setFriendStatus('accepted');
          else if (friendship.requester_id === currentUser.id) setFriendStatus('pending_sent');
          else setFriendStatus('pending_received');
        } else {
          setFriendStatus('none');
          setFriendshipId(null);
        }
      }

      // 4. Social Lists
      const { data: allAccepted } = await supabase
        .from('friendships')
        .select('*, requester:profiles!requester_id(*), receiver:profiles!receiver_id(*)')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`);

      if (allAccepted) {
        const profilesList = allAccepted.map(f => f.requester_id === targetUserId ? f.receiver : f.requester);
        setMutualFriends(profilesList);
        setFollowers(profilesList);
      }

      // 5. Pending (Own only)
      if (currentUser && (targetUserId === currentUser.id || isOwnProfile)) {
        const { data: inReq } = await supabase
          .from('friendships')
          .select('*, requester:profiles!requester_id(*)')
          .eq('receiver_id', currentUser.id)
          .eq('status', 'pending');
        if (inReq) setIncomingRequests(inReq);

        const { data: outReq } = await supabase
          .from('friendships')
          .select('*, receiver:profiles!receiver_id(*)')
          .eq('requester_id', currentUser.id)
          .eq('status', 'pending');
        if (outReq) setOutgoingRequests(outReq);
      }

      // 6. Chat Keys
      if (isOwnProfile && currentUser && !profileUser?.public_key) {
        if (!localStorage.getItem('pys_chat_private_key')) {
          generateAndStoreKeys(currentUser.id).catch(console.error);
        }
      }

    } catch (err) {
      console.error('PROFILE LOAD ERROR:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [userId, currentUser, isOwnProfile]);

  useEffect(() => { loadData(); }, [loadData]);

  /* =========================
     FORM SYNC & SAVE
  ========================= */
  const syncFormWithUser = useCallback(() => {
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
    setSports(profileUser.sports || []);
    setLat(profileUser.lat || null);
    setLng(profileUser.lng || null);
  }, [profileUser]);

  useEffect(() => { syncFormWithUser(); }, [syncFormWithUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const updates = {
        name,
        username,
        bio,
        level,
        preferred_format: preferredFormat,
        experience_years: experience,
        available_days: availableDays.split(',').map(d => d.trim()).filter(Boolean),
        time_slots: timeSlots.split(',').map(s => s.trim()).filter(Boolean),
        achievements: achievements.split('\n').map(a => a.trim()).filter(Boolean),
        region,
        lat,
        lng,
        updated_at: new Date().toISOString(),
      };

      await updateUser(updates);
      setProfileUser({ ...profileUser, ...updates });
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update profile', 'error');
    }
  };

  const detectLocation = async () => {
    const fallbackToIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.city) {
          setRegion(data.city);
        }
      } catch (err) {
        console.error('IP detection failed:', err);
        showNotification('Could not detect location automatically.', 'error');
      } finally {
        setIsDetectingLocation(false);
      }
    };

    if (!navigator.geolocation) {
      await fallbackToIP();
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          if (data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || addr.city_district || addr.county || addr.state;
            if (city) setRegion(city);
            else setRegion(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            setLat(latitude);
            setLng(longitude);
          }
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
          setRegion(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      async (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          await fallbackToIP();
        } else {
          setIsDetectingLocation(false);
          showNotification('Location detection failed. Try again.', 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* =========================
     FRIEND ACTIONS
  ========================= */
  const handleSendRequest = async () => {
    if (!currentUser || !profileUser) return;
    setIsLoadingFriend(true);
    try {
      const { data, error } = await supabase.from('friendships').insert({ requester_id: currentUser.id, receiver_id: profileUser.id, status: 'pending' }).select().single();
      if (error) throw error;
      setFriendStatus('pending_sent');
      setFriendshipId(data.id);
      showNotification('Friend request sent!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to send request', 'error');
    } finally {
      setIsLoadingFriend(false);
    }
  };

  const handleAcceptRequest = async (id?: string) => {
    const targetId = id || friendshipId;
    if (!targetId) return;
    setIsLoadingFriend(true);
    try {
      const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', targetId);
      if (error) throw error;
      if (id) setIncomingRequests(prev => prev.filter(r => r.id !== id));
      else setFriendStatus('accepted');
      loadData();
      showNotification('Friend request accepted!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to accept request', 'error');
    } finally {
      setIsLoadingFriend(false);
    }
  };

  const handleDeleteFriendship = async (id?: string) => {
    const targetId = id || friendshipId;
    if (!targetId) return;
    if (!id && !confirm('Are you sure you want to remove this connection?')) return;
    setIsLoadingFriend(true);
    try {
      const { error } = await supabase.from('friendships').delete().eq('id', targetId);
      if (error) throw error;
      if (id) {
        setIncomingRequests(prev => prev.filter(r => r.id !== id));
        setOutgoingRequests(prev => prev.filter(r => r.id !== id));
      } else {
        setFriendStatus('none');
        setFriendshipId(null);
      }
      loadData();
      showNotification('Connection removed', 'info');
    } catch (err: any) {
      showNotification(err.message || 'Failed...', 'error');
    } finally {
      setIsLoadingFriend(false);
    }
  };

  if (!currentUser && !userId) return <Navigate to="/auth" replace />;
  if (isLoadingProfile) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!profileUser) return <div className="min-h-screen bg-black text-white flex items-center justify-center">User not found</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="relative group">
            <img
              src={profileUser.profile_photo || '/avatar-placeholder.png'}
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-transform group-hover:scale-105"
            />
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition shadow-lg">
                <Camera size={16} />
                <input type="file" hidden onChange={async (e) => {
                  if (!e.target.files) return;
                  const url = await uploadProfilePhoto(e.target.files[0], currentUser.id);
                  updateUser({ profile_photo: url });
                }} />
              </label>
            )}
          </div>
          <h1 className="text-3xl font-bold mt-4 tracking-tight">{profileUser.name || profileUser.username}</h1>
          <p className="text-gray-400">@{profileUser.username}</p>

          {isOwnProfile && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`py-2 px-6 rounded-full font-bold flex items-center gap-2 transition-all ${isEditing
                  ? 'bg-zinc-800 text-white border border-white/10'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                  }`}
              >
                {isEditing ? <X size={18} /> : <Settings size={18} />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-500 py-2 px-6 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-600/20"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              )}

            </div>
          )}

          {!isOwnProfile && currentUser && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {friendStatus === 'none' && <button onClick={handleSendRequest} className="bg-blue-600 hover:bg-blue-500 py-2.5 px-8 rounded-full font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"><User size={18} /> Add Friend</button>}
              {friendStatus === 'pending_sent' && <button onClick={() => handleDeleteFriendship()} className="bg-zinc-800 text-gray-400 py-2.5 px-8 rounded-full border border-white/10 flex items-center gap-2">Requested <span className="text-red-500 text-xs ml-2 hover:underline">(Cancel)</span></button>}
              {friendStatus === 'pending_received' && <div className="flex gap-2"><button onClick={() => handleAcceptRequest()} className="bg-green-600 py-2.5 px-8 rounded-full font-bold">Accept</button><button onClick={() => handleDeleteFriendship()} className="bg-zinc-800 py-2.5 px-8 rounded-full border border-white/10">Decline</button></div>}
              {friendStatus === 'accepted' && <button className="bg-white text-black py-2.5 px-8 rounded-full font-bold cursor-default">Friends</button>}

              <button
                onClick={() => setActiveChatFriend(profileUser)}
                className="bg-zinc-900 border border-white/10 hover:border-blue-500 py-2.5 px-8 rounded-full font-bold flex items-center gap-2 transition-all"
              >
                Message
              </button>
            </div>
          )}
          {profileUser.bio && !isEditing && <p className="mt-4 max-w-md text-gray-300 leading-relaxed italic">"{profileUser.bio}"</p>}
        </div>

        {isEditing && (
          <div className="mb-12 bg-zinc-900/50 border border-blue-500/20 p-8 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-2">
              <Settings className="text-blue-500" size={20} />
              Customize Profile
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all h-24 resize-none"
                    placeholder="Tell your story..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Location / Region</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-24 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. Mumbai, India"
                    />
                    <button
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600/30 transition-all disabled:opacity-50"
                    >
                      {isDetectingLocation ? (
                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MapPin size={12} />
                      )}
                      Detect
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Play Level</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Format</label>
                    <select
                      value={preferredFormat}
                      onChange={(e) => setPreferredFormat(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="Singles">Singles</option>
                      <option value="Doubles">Doubles</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Experience (Years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-500 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Confirm & Save
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-8 gap-3 flex-wrap">
          {profileUser.sports?.map((s: string) => (
            <button key={s} onClick={() => setSelectedSport(s)} className={`px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${selectedSport === s ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-black border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'}`}>{SPORTS.find(sp => sp.id === s)?.name || s}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-zinc-900 p-6 rounded-2xl text-center border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">ELO</p>
            <p className="text-4xl font-black italic">{selectedSport ? (profileUser.elo_ratings?.[selectedSport] ?? profileUser.elo ?? 800) : (profileUser.elo ?? 1200)}</p>
          </div>

          <div
            onClick={() => setViewMode('posts')}
            className={`p-6 rounded-2xl text-center cursor-pointer transition-all border group ${viewMode === 'posts' ? 'bg-zinc-800 border-blue-500 shadow-xl' : 'bg-zinc-900 border-white/5 hover:bg-zinc-800/80'}`}
          >
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-400 transition-colors">Posts</p>
            <p className="text-4xl font-black italic">{posts.length}</p>
          </div>

          <div
            onClick={() => setViewMode('friends')}
            className={`p-6 rounded-2xl text-center cursor-pointer transition-all border group ${viewMode === 'friends' ? 'bg-zinc-800 border-blue-500 shadow-xl' : 'bg-zinc-900 border-white/5 hover:bg-zinc-800/80'}`}
          >
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-400 transition-colors">Friends</p>
            <p className="text-4xl font-black italic">{mutualFriends.length}</p>
          </div>

          <div
            onClick={() => setViewMode('followers')}
            className={`p-6 rounded-2xl text-center cursor-pointer transition-all border group ${viewMode === 'followers' ? 'bg-zinc-800 border-blue-500 shadow-xl' : 'bg-zinc-900 border-white/5 hover:bg-zinc-800/80'}`}
          >
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-400 transition-colors">Followers</p>
            <p className="text-4xl font-black italic">{followers.length}</p>
          </div>
        </div>

        <div className="min-h-[400px]">
          {viewMode === 'friends' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600/10 rounded-xl">
                  <Users className="text-blue-500" size={24} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">My Friends</h2>
              </div>
              {mutualFriends.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mutualFriends.map(friend => (
                    <div key={friend.id} onClick={() => navigate(`/profile/${friend.id}`)} className="bg-zinc-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-zinc-800/80 transition-all group">
                      <div className="relative">
                        <img src={friend.profile_photo || '/avatar-placeholder.png'} className="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-sm truncate max-w-[120px]">{friend.name || friend.username}</p>
                        <p className="text-[10px] text-gray-500">@{friend.username}</p>
                        {isOwnProfile && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveChatFriend(friend);
                            }}
                            className="mt-2 w-full py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                          >
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                  <p className="text-gray-500 italic">No friends connected yet.</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'posts' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-600/10 rounded-xl">
                  <Layout className="text-green-500" size={24} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Posts</h2>
              </div>
              {posts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {posts.map(post => (
                    <div key={post.id} className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group relative cursor-pointer">
                      <img src={post.media_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold text-sm">View Post</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                  <p className="text-gray-500 italic">No posts shared yet.</p>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8 mt-16">
                <div className="p-3 bg-yellow-600/10 rounded-xl">
                  <History className="text-yellow-500" size={24} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Match History</h2>
              </div>
              <MatchHistory userId={profileUser.id} />
            </div>
          )}

          {viewMode === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-yellow-600/10 rounded-xl">
                  <History className="text-yellow-500" size={24} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Match History</h2>
              </div>
              <MatchHistory userId={profileUser.id} />
            </div>
          )}
        </div>

        {isOwnProfile && incomingRequests.length > 0 && (
          <div className="mt-12 bg-zinc-900/40 p-8 rounded-3xl border border-yellow-500/10">
            <h3 className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-6 opacity-80">Pending Requests</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {incomingRequests.map(req => (
                <div key={req.id} className="bg-zinc-900 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={req.requester?.profile_photo || '/avatar-placeholder.png'} className="w-10 h-10 rounded-full object-cover" />
                    <p className="font-bold text-sm">@{req.requester?.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptRequest(req.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors">Accept</button>
                    <button onClick={() => handleDeleteFriendship(req.id)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors border border-white/5">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT WIDGET */}
        {activeChatFriend && (
          <ChatWidget
            friend={activeChatFriend}
            onClose={() => setActiveChatFriend(null)}
          />
        )}

        {isOwnProfile && (
          <div className="mt-16 flex justify-center pb-8 border-t border-white/5 pt-8">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs hover:text-red-400 transition-colors opacity-50 hover:opacity-100"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
