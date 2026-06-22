import { useMemo } from 'react';
import {
  Users,
  Radio,
  Trophy,
  DoorOpen,
  Zap,
  Activity,
  Waves,
  Sparkles
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

  return (
    <div>

      {/* NAV */}
      <div className="sticky top-[53px] z-30 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border">
        <div className="grid grid-cols-4">

          <NavTab
            active={subTab === 'live'}
            onClick={() => setSubTab('live')}
            icon={Radio}
            label="Pulse"
          />

          <NavTab
            active={subTab === 'rooms'}
            onClick={() => setSubTab('rooms')}
            icon={DoorOpen}
            label="Portals"
          />

          <NavTab
            active={subTab === 'highlights'}
            onClick={() => setSubTab('highlights')}
            icon={Trophy}
            label="Moments"
          />

          <NavTab
            active={subTab === 'following'}
            onClick={() => setSubTab('following')}
            icon={Users}
            label="Circle"
          />

        </div>
      </div>

      {/* SIGNAL DASHBOARD */}
      <div className="p-4 border-b border-dark-border">
        <div className="rounded-3xl bg-dark-card border border-brand-primary/20 p-5 overflow-hidden relative">

          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand-primary/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-green-500/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-brand-primary" />
              <h3 className="font-black text-lg">Caister Signal Core</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Signal label="Heat" value="92%" />
              <Signal label="Echoes" value={posts.length} />
              <Signal label="Portals" value={communities.length} />
            </div>
          </div>

        </div>
      </div>

      {/* PULSE RADAR */}
      <div className="px-4 py-4 border-b border-dark-border">

        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-brand-primary" />
          <h3 className="font-bold">Signal Pulse</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">

          <PulseCard
            icon={Waves}
            title="Broadcast Heat"
            subtitle={`${users.length} signals active`}
          />

          <PulseCard
            icon={Sparkles}
            title="Creator Energy"
            subtitle={`${highlights.length} moments glowing`}
          />

        </div>

      </div>

      {/* PORTALS */}
      <div className="p-4 border-b border-dark-border">

        <h3 className="font-bold mb-3">Open Portals</h3>

        <div className="space-y-2">
          {rooms.map(room => (
            <div
              key={room.id}
              className="bg-dark-card rounded-3xl p-4 border border-dark-border"
            >
              <div className="flex items-center justify-between">

                <div>
                  <div className="font-bold">{room.name}</div>
                  <div className="text-xs text-dark-muted">
                    {(room.members || []).length} signals inside
                  </div>
                </div>

                <button className="px-3 py-2 rounded-xl bg-brand-primary/10 text-brand-primary text-sm">
                  Enter
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
              Signal stream complete
            </p>
          )}
        </>
      ) : (
        <EmptyState
          title="No signals yet"
          subtitle="Start a portal or release the first signal."
        />
      )}

    </div>
  );
}

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

function Signal({ label, value }) {
  return (
    <div className="bg-dark-bg/60 rounded-2xl p-4 border border-dark-border text-center">
      <div className="text-xl font-black text-brand-primary">
        {value}
      </div>
      <div className="text-xs text-dark-muted">{label}</div>
    </div>
  );
}

function PulseCard({ icon: Icon, title, subtitle }) {
  return (
    <div className="bg-dark-card rounded-3xl p-4 border border-dark-border">
      <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-brand-primary" />
      </div>

      <div className="font-bold">{title}</div>
      <div className="text-xs text-dark-muted mt-1">
        {subtitle}
      </div>
    </div>
  );
}
