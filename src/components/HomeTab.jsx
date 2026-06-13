import { useMemo } from 'react';
import {
  Users,
  Radio,
  Trophy,
  DoorOpen,
  Zap
} from 'lucide-react';

import PostCard from './PostCard';
import Composer from './Composer';
import { EmptyState, PostSkeleton, Spinner } from './Shared';

export default function HomeTab({
  subTab,
  setSubTab,
  posts = [],
  postsLoading,
  hasMore,
  loadingMore,
  currentUserId,
  profile,
  users = [],
  followingIds = [],
  onProfileClick,
  onHashtagClick,
  onQuote,
  quotedPost,
  onClearQuote,
  communities = []
}) {

  /* ───────── Derived UI Data ───────── */

  const onlineUsers = useMemo(
    () => users.slice(0, 12),
    [users]
  );

  const rooms = useMemo(
    () => communities.slice(0, 6),
    [communities]
  );

  const highlights = useMemo(
    () =>
      posts.filter(
        p => p.type === 'highlight' || p.type === 'achievement'
      ),
    [posts]
  );

  const feedPosts = useMemo(() => {
    if (subTab === 'live') return posts;

    if (subTab === 'rooms') {
      return posts.filter(p =>
        p.type === 'squad' || p.type === 'room'
      );
    }

    if (subTab === 'highlights') {
      return highlights;
    }

    // following feed
    return posts.filter(p =>
      followingIds.includes(p.userId) ||
      p.userId === currentUserId
    );
  }, [
    posts,
    highlights,
    subTab,
    followingIds,
    currentUserId
  ]);

  /* ───────── UI ───────── */

  return (
    <div>

      {/* NAV */}
      <div className="sticky top-[53px] z-30 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border">
        <div className="grid grid-cols-4">

          <NavTab
            active={subTab === 'live'}
            onClick={() => setSubTab('live')}
            icon={Radio}
            label="Live"
          />

          <NavTab
            active={subTab === 'rooms'}
            onClick={() => setSubTab('rooms')}
            icon={DoorOpen}
            label="Rooms"
          />

          <NavTab
            active={subTab === 'highlights'}
            onClick={() => setSubTab('highlights')}
            icon={Trophy}
            label="Clips"
          />

          <NavTab
            active={subTab === 'following'}
            onClick={() => setSubTab('following')}
            icon={Users}
            label="Friends"
          />

        </div>
      </div>

      {/* LIVE DASHBOARD */}
      <div className="p-4 border-b border-dark-border grid grid-cols-3 gap-3">

        <Stat label="Players" value={users.length} />
        <Stat label="Rooms" value={communities.length} />
        <Stat label="Clips" value={highlights.length} />

      </div>

      {/* ONLINE PLAYERS */}
      <div className="px-4 py-3 border-b border-dark-border">

        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-green-500" />
          <h3 className="font-bold">Active Players</h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {onlineUsers.map(user => (
            <button
              key={user.id}
              onClick={() => onProfileClick(user.id)}
              className="flex flex-col items-center min-w-[64px]"
            >
              <div className="relative">
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  className="w-14 h-14 rounded-2xl object-cover border border-dark-border"
                  alt=""
                />

                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg" />
              </div>

              <span className="text-[10px] text-dark-muted mt-1 truncate w-full">
                {user.displayName}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* ROOMS */}
      <div className="p-4 border-b border-dark-border">

        <h3 className="font-bold mb-3">Active Rooms</h3>

        <div className="space-y-2">
          {rooms.map(room => (
            <div
              key={room.id}
              className="bg-dark-card rounded-2xl p-4 border border-dark-border"
            >
              <div className="flex items-center justify-between">

                <div>
                  <div className="font-bold">{room.name}</div>
                  <div className="text-xs text-dark-muted">
                    {(room.members || []).length} players inside
                  </div>
                </div>

                <button className="px-3 py-2 rounded-xl bg-brand-primary/10 text-brand-primary text-sm">
                  Join
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* COMPOSER */}
      <Composer
        currentUserId={currentUserId}
        profile={profile}
        quotedPost={quotedPost}
        onClearQuote={onClearQuote}
        communities={communities}
        users={users}
      />

      {/* FEED */}
      {postsLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : feedPosts.length ? (
        <>
          {feedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              users={users}
              onProfileClick={onProfileClick}
              onHashtagClick={onHashtagClick}
              onQuote={onQuote}
              posts={posts}
            />
          ))}

          {loadingMore && <Spinner />}

          {!hasMore && (
            <p className="text-center py-6 text-xs text-dark-muted">
              End of radar feed
            </p>
          )}
        </>
      ) : (
        <EmptyState
          title="Nothing live right now"
          subtitle="Start a room or share a signal."
        />
      )}

    </div>
  );
}

/* ───────── Small UI Components ───────── */

function NavTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 flex flex-col items-center gap-1 text-xs transition-all ${
        active ? 'text-brand-primary' : 'text-dark-muted'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>

      {active && (
        <div className="w-8 h-1 rounded-full bg-brand-primary" />
      )}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-dark-card rounded-2xl p-4">
      <div className="text-2xl font-black text-brand-primary">
        {value}
      </div>
      <div className="text-xs text-dark-muted">{label}</div>
    </div>
  );
}
