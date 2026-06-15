import { useMemo } from "react";
import PostCard from "./PostCard";

export default function NexusDashboard({ posts, users, currentUserId, onProfileClick, onQuote }) {
  // Sort posts into dynamic categories to simulate a console dashboard
  const trendingPosts = useMemo(() => {
    return [...posts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 10);
  }, [posts]);

  const recentMoments = useMemo(() => {
    return posts.filter(p => p.imageUrl).slice(0, 10);
  }, [posts]);

  const freshFeed = useMemo(() => {
    return [...posts].sort(() => Math.random() - 0.5).slice(0, 15);
  }, [posts]);

  // The Hero post (most active or recent big post)
  const heroPost = trendingPosts.length > 0 ? trendingPosts[0] : null;
  const heroUser = heroPost ? users.find(u => u.id === heroPost.userId) : null;
  const heroDisplayName = heroUser?.displayName || "Unknown Gamer";
  const heroInitial = heroDisplayName.charAt(0).toUpperCase();

  return (
    <div className="pb-24 pt-4 space-y-10">
      
      {/* HERO SECTION */}
      {heroPost && (
        <section className="px-4">
          <h2 className="text-sm font-bold text-dark-muted tracking-widest uppercase mb-4 ml-2">Spotlight</h2>
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
            {heroPost.imageUrl ? (
              <img src={heroPost.imageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/40 to-purple-600/40" />
            )}
            
            {/* Glass gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 glass-strong m-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center font-bold text-white shadow-lg overflow-hidden border-2 border-white/10">
                   {heroUser?.avatarUrl ? (
                     <img src={heroUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     heroInitial
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">
                    {heroDisplayName}
                  </h3>
                  <p className="text-xs text-brand-secondary font-medium">Top Broadcast</p>
                </div>
              </div>
              <p className="text-sm text-gray-200 line-clamp-2">
                {heroPost.text || "Experience the latest from the community."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TRENDING SQUADS (Horizontal Carousel) */}
      <section>
        <div className="flex items-center justify-between px-6 mb-4">
          <h2 className="text-sm font-bold text-white tracking-wide">Trending Vault</h2>
          <button className="text-xs font-semibold text-brand-primary">View All</button>
        </div>
        <div className="carousel-row">
          {trendingPosts.slice(1).map(post => (
            <div key={post.id} className="carousel-item w-[280px]">
              <PostCard
                post={post}
                posts={posts}
                users={users}
                currentUserId={currentUserId}
                onProfileClick={onProfileClick}
                onQuote={onQuote}
                compact={true} // new prop we will add to PostCard
              />
            </div>
          ))}
          {trendingPosts.length <= 1 && (
             <div className="carousel-item px-6 text-sm text-dark-muted">More trending content will appear here.</div>
          )}
        </div>
      </section>

      {/* CAPTURED MOMENTS (Image heavy) */}
      {recentMoments.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-6 mb-4">
            <h2 className="text-sm font-bold text-white tracking-wide">Recent Captures</h2>
          </div>
          <div className="carousel-row">
            {recentMoments.map(post => (
              <div key={`moment-${post.id}`} className="carousel-item w-[200px]">
                <div className="relative h-[300px] rounded-2xl overflow-hidden card group">
                  <img src={post.imageUrl} alt="Capture" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <p className="text-xs font-medium text-white line-clamp-2">{post.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LIVE FEED (Grid or List style) */}
      <section className="px-4">
         <h2 className="text-sm font-bold text-dark-muted tracking-widest uppercase mb-4 ml-2">Global Live</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {freshFeed.map(post => (
             <PostCard
                key={`fresh-${post.id}`}
                post={post}
                posts={posts}
                users={users}
                currentUserId={currentUserId}
                onProfileClick={onProfileClick}
                onQuote={onQuote}
              />
           ))}
         </div>
      </section>

    </div>
  );
}
