import { useMemo } from 'react';
import { Users, Flame } from 'lucide-react';
import PostCard from './PostCard';
import Composer from './Composer';
import { EmptyState, PostSkeleton } from './Shared';

export default function HomeTab({
  subTab, setSubTab, posts, postsLoading, currentUserId,
  profile, users, followingIds, onProfileClick, onNavigate
}) {
  // For You: all posts, sorted chronologically
  const forYouPosts = useMemo(() => posts, [posts]);

  // Following: posts by followed users AND the user's own posts
  const followingPosts = useMemo(() =>
    posts.filter(p => followingIds.includes(p.userId) || p.userId === currentUserId),
    [posts, followingIds, currentUserId]
  );

  const displayPosts = subTab === 'foryou' ? forYouPosts : followingPosts;

  const trends = useMemo(() => {
    const allTrends = [
      "🔥 #RobloxGhosts Specter Entity update drops at midnight!",
      "🏆 Zero Build ranked modes are back in #Fortnite",
      "👻 Top 10 hiding spots in Phasmophobia map - #LFG",
      "💧 Sweat detected: new movement tech in Fortnite Chapter 5",
      "🎯 #Fortnite Snipe of the day: 250m noscope!",
      "💰 Loot Goblin spotted in Tilted Towers",
      "💀 Don't open the basement door... #RobloxGhosts",
      "🏆 Victory Royale! Share your best endgame clips",
      "🔥 Squad up: Need 1 for #LFG Trios Cup",
      "👻 The Ghost is hunting... hide now!",
      "💧 Need a carry in Fortnite Ranked? Post your stats in #LFG",
      "🎯 Headshot only! New #Fortnite sniper meta"
    ];
    return [...allTrends, ...allTrends]; // Duplicate to guarantee smooth infinite scroll
  }, []);

  return (
    <div>
      {/* Sub-navigation */}
      <div className="flex border-b border-dark-border sticky top-[53px] z-30 bg-dark-bg/95 backdrop-blur-xl">
        <button
          onClick={() => setSubTab('foryou')}
          className={`flex-1 flex justify-center text-sm font-bold transition-colors hover:bg-dark-hover/50 ${
            subTab === 'foryou' ? 'text-dark-text' : 'text-dark-muted'
          }`}
        >
          <div className="relative py-4">
            For you
            {subTab === 'foryou' && (
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-brand-primary rounded-full" />
            )}
          </div>
        </button>
        <button
          onClick={() => setSubTab('following')}
          className={`flex-1 flex justify-center text-sm font-bold transition-colors hover:bg-dark-hover/50 ${
            subTab === 'following' ? 'text-dark-text' : 'text-dark-muted'
          }`}
        >
          <div className="relative py-4">
            Following
            {subTab === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-brand-primary rounded-full" />
            )}
          </div>
        </button>
      </div>

      {/* Trending Bar (Marquee) */}
      <div className="bg-brand-primary/10 border-b border-brand-primary/30 py-2 px-4 overflow-hidden flex items-center gap-2">
        <Flame className="w-4 h-4 text-brand-accent flex-shrink-0 animate-pulse" />
        <div className="flex-1 overflow-hidden relative h-5">
          <div className="absolute whitespace-nowrap text-xs font-bold text-brand-primary animate-marquee flex gap-12">
            {trends.map((trend, i) => (
              <span key={i}>{trend}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Composer */}
      <Composer currentUserId={currentUserId} profile={profile} />

      {/* Posts Feed */}
      {postsLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : displayPosts.length > 0 ? (
        displayPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            users={users}
            onProfileClick={onProfileClick}
          />
        ))
      ) : subTab === 'following' && followingIds.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No posts to show"
          subtitle="Follow some people to see their posts here."
          action="Discover Users"
          onAction={() => onNavigate('explore')}
        />
      ) : (
        <EmptyState
          title="Nothing here yet"
          subtitle={subTab === 'foryou' ? 'Be the first to post!' : 'Follow users to see their posts.'}
        />
      )}
    </div>
  );
}
