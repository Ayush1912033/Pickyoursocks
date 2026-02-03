import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import UserProfileSidebar from '../components/UserProfileSidebar';
import ErrorState from '../components/ErrorState';
import { supabase } from '../lib/supabase';
import { Filter, MessageSquare, Heart, Clock } from 'lucide-react';

interface FeedPost {
  id: string;
  caption: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'text';
  sport: string;
  created_at: string;
  author?: {
    username?: string;
    profile_photo?: string | null;
  };
}

const Feed: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------
     FETCH POSTS
  ------------------------- */
  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          caption,
          media_url,
          media_type,
          sport,
          created_at,
          author:profiles (
            username,
            profile_photo
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error('Feed fetch failed:', err);
      setError('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------
     INIT
  ------------------------- */
  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  if (!user) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* LEFT */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <UserProfileSidebar
              elo={user.elo ?? 1200}
              trend="+12 this week"
              streak={4}
              scoutViewCount={2}
            />
          </div>

          {/* FEED */}
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
                {posts.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                    <Filter className="mx-auto mb-2 text-gray-500" size={16} />
                    <p className="text-gray-500 text-sm">
                      No posts yet
                    </p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div
                      key={post.id}
                      className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden"
                    >
                      {/* HEADER */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author?.profile_photo || '/avatar.png'}
                            alt="author"
                            className="w-8 h-8 rounded-full bg-zinc-700 object-cover"
                          />
                          <div>
                            <p className="font-bold text-sm">
                              @{post.author?.username || 'unknown'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* BODY */}
                      <div className="px-4 pb-4">
                        <p className="text-gray-300 mb-3">{post.caption}</p>

                        {post.media_url && (
                          <div className="rounded-xl overflow-hidden mb-4">
                            {post.media_type === 'image' ? (
                              <img
                                src={post.media_url}
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed;
