import { useMemo } from 'react';
import { Users } from 'lucide-react';
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
