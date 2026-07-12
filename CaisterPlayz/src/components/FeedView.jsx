import { useState, useMemo } from 'react';
import { SafeGridCard, SafeDeckCard } from './SafetyPostCard';
import ExpandedBroadcast from './PostCard';

function Radar({ users, currentUserId }) {
  return (
    <div className="radar">
      {users.slice(0, 15).map(u => (
        <div key={u.id} className="radar-dot">
          <div className={`radar-ring${u.id === currentUserId ? ' idle' : ''}`}>
            <div className="radar-inner">
              {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : (u.displayName || '?')[0].toUpperCase()}
            </div>
            {u.id !== currentUserId && <div className="radar-ping" />}
          </div>
          <span className="radar-tag">{(u.displayName || 'Player').split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="skel-card">
          <div className="skel" style={{ width: '40%', height: 10, marginBottom: 8 }} />
          <div className="skel" style={{ width: '100%', height: 10, marginBottom: 4 }} />
          <div className="skel" style={{ width: '70%', height: 10 }} />
        </div>
      ))}
    </div>
  );
}

export default function FeedView({
  posts,
  newPostsQueue = [],
  flushNewPosts,
  loading,
  users,
  currentUserId,
  onProfileClick,
  onHashtagClick
}) {
  const [expandedPost, setExpandedPost] = useState(null);

  const primeSignals = useMemo(() => {
    const realCount = (arr, authorId) => (arr || []).filter(id => id !== authorId).length;
    return [...posts]
      .sort((a, b) => {
        const pa = realCount(a.likedBy, a.userId) + realCount(a.repostedBy, a.userId) + realCount(a.viewedBy, a.userId);
        const pb = realCount(b.likedBy, b.userId) + realCount(b.repostedBy, b.userId) + realCount(b.viewedBy, b.userId);
        return pb - pa;
      })
      .slice(0, 10);
  }, [posts]);

  const signalDrops = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.created) - new Date(a.created));
  }, [posts]);

  if (loading) {
    return (
      <>
        <Radar users={[]} currentUserId={currentUserId} />
        <SkeletonGrid />
      </>
    );
  }

  return (
    <div>
      <Radar users={users} currentUserId={currentUserId} />

      <div className="feed-header">
        <h2 className="feed-title">Global Core</h2>
      </div>

      {newPostsQueue.length > 0 && (
        <button
          onClick={() => {
            flushNewPosts?.();
            window.scrollTo(0, 0);
          }}
          className="w-full bg-dark-card border border-brand-primary text-brand-primary font-bold py-3 mb-4 rounded hover:bg-brand-primary hover:text-black transition-colors"
        >
          SHOW {newPostsQueue.length} NEW POST{newPostsQueue.length !== 1 ? 'S' : ''}
        </button>
      )}

      {posts.length === 0 ? (
        <div className="empty">
          <div className="brand-empty-mark">
            <svg width="40" height="40" viewBox="0 0 512 512" fill="none">
              <text x="256" y="390" textAnchor="middle" fontFamily="'Arial Black','Impact',sans-serif" fontWeight="900" fontSize="340" fill="white" letterSpacing="-20">CP</text>
            </svg>
          </div>
          <h3>The Island is empty</h3>
          <p>Drop the first post about your latest workout or Gaming Win!</p>
        </div>
      ) : (
        <>
          {primeSignals.length > 0 && (
            <>
              <div className="sec">
                <span className="sec-label">Top PRs & Wins</span>
                <span className="sec-badge">{primeSignals.length}</span>
              </div>
              <div className="deck">
                {primeSignals.map(p => (
                  <SafeDeckCard key={p.id} post={p} users={users} currentUserId={currentUserId} onClick={setExpandedPost} />
                ))}
              </div>
            </>
          )}

          <div className="sec">
            <span className="sec-label">Latest Posts</span>
            <span className="sec-badge">{signalDrops.length}</span>
          </div>
          <div className="grid">
            {signalDrops.map(p => (
              <SafeGridCard
                key={p.id}
                post={p}
                users={users}
                currentUserId={currentUserId}
                onClick={setExpandedPost}
                onProfileClick={onProfileClick}
                onHashtagClick={onHashtagClick}
              />
            ))}
          </div>
        </>
      )}

      {expandedPost && (
        <ExpandedBroadcast
          post={expandedPost}
          currentUserId={currentUserId}
          users={users}
          onClose={() => setExpandedPost(null)}
          onProfileClick={onProfileClick}
          onHashtagClick={onHashtagClick}
        />
      )}
    </div>
  );
}
