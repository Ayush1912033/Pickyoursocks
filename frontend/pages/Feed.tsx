import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import UserProfileSidebar from '../components/UserProfileSidebar';
import ErrorState from '../components/ErrorState';
import { SPORTS } from '../constants';
import { supabase } from '../lib/supabase';
import { Filter, MessageSquare, Heart, Clock } from 'lucide-react';

/* ======================
   Types
====================== */
interface FeedPost {
  id: string;
  caption: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'text';
  sport: string;
  created_at: string;
  author: {
    username: string;
    profile_photo: string | null;
  };
}

const Feed: React.FC = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------------------
     Fetch Feed Posts
  -------------------- */
  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          media_url,
          media_type,
          sport,
          created_at,
          author:profiles!posts_user_id_fkey (
            username,
            profile_photo
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const safeData: FeedPost[] =
        data?.map((post: any) => ({
          id: post.id,
          caption: post.caption,
          media_url: post.media_url,
          media_type: post.media_type ?? 'text',
          sport: post.sport,
          created_at: post.created_at,
          author: {
            username: post.author?.username ?? 'unknown',
            profile_photo: post.author?.profile_photo ?? null,
          },
        })) ?? [];

      setPosts(safeData);
    } catch (err) {
      console.error('Feed error:', err);
      setError('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (!user) return null;

  const userSports = user.sports || [];

  const filteredPosts = posts.filter(post => {
    const relevantToUser = userSports.includes(post.sport);
    const matchesFilter =
      activeFilter === 'all' || post.sport === activeFilter;
    return relevantToUser && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <UserProfileSidebar
              elo={user.elo ?? 1200}
              trend="+12 this week"
              streak={4}
              scoutViewCount={2}
            />
          </div>

          {/* RIGHT FEED */}
          <div className="lg:col-span-8 space-y-8">

            {error ? (
              <ErrorState onRetry={fetchFeed} />
            ) : isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-56 bg-zinc-900/40 rounded-xl" />
                <div className="h-56 bg-zinc-900/40 rounded-xl" />
              </div>
            ) : (
              <>
                {/* FILTER BAR */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                    }`}
                  >
                    All
                  </button>

                  {userSports.map(sportId => {
                    const sportName = SPORTS.find(s => s.id === sportId)?.name;
                    if (!sportName) return null;

                    return (
                      <button
                        key={sportId}
                        onClick={() => setActiveFilter(sportId)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          activeFilter === sportId
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
                        }`}
                      >
                        {sportName}
                      </button>
                    );
                  })}
                </div>

                {/* POSTS */}
                <div className="space-y-6">
                  {filteredPosts.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                      <Filter className="mx-auto mb-2 text-gray-500" size={16} />
                      <p className="text-gray-500 text-sm">
                        No posts yet for your sports
                      </p>
                    </div>
                  ) : (
                    filteredPosts.map(post => (
                      <div
                        key={post.id}
                        className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden"
                      >
                        {/* HEADER */}
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.author.profile_photo || '/avatar.png'}
                              alt="author"
                              className="w-8 h-8 rounded-full bg-zinc-700 object-cover"
                            />
                            <div>
                              <p className="font-bold text-sm">
                                @{post.author.username}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                                {SPORTS.find(s => s.id === post.sport)?.name}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <div className="px-4 pb-4">
                          <p className="text-gray-300 mb-3">{post.caption}</p>

                          {post.media_url && (
                            <div className="rounded-xl overflow-hidden mb-4">
                              {post.media_type === 'image' ? (
                                <img
                                  src={post.media_url}
                                  alt="post"
                                  className="w-full max-h-[420px] object-cover"
                                />
                              ) : (
                                <video
                                  src={post.media_url}
                                  controls
                                  className="w-full max-h-[420px]"
                                />
                              )}
                            </div>
                          )}

                          {/* ACTIONS */}
                          <div className="flex gap-6 text-xs text-gray-500">
                            <button className="flex items-center gap-2 hover:text-white">
                              <Heart size={14} /> Like
                            </button>
                            <button className="flex items-center gap-2 hover:text-white">
                              <MessageSquare size={14} /> Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed;
