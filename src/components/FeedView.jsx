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
        <div style={{ position: 'sticky', top: 16, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none', marginBottom: -40, transform: 'translateY(-10px)' }}>
          <button
            onClick={() => {
              flushNewPosts?.();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              pointerEvents: 'auto',
              background: 'var(--cyan)',
              color: '#000',
              border: 'none',
              borderRadius: 24,
              padding: '6px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0, 229, 255, 0.4)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: 16 }}>↑</span>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {Array.from(new Set(newPostsQueue.map(p => p.userId)))
                .slice(0, 3)
                .map((uid, i) => {
                  const u = users.find(x => x.id === uid);
                  if (!u) return null;
                  return (
                    <div
                      key={uid}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        marginLeft: i > 0 ? -8 : 0,
                        border: '2px solid var(--cyan)',
                        background: u.avatarUrl ? `url(${u.avatarUrl}) center/cover` : 'var(--bg2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#fff',
                        zIndex: 3 - i,
                        overflow: 'hidden'
                      }}
                    >
                      {!u.avatarUrl && (u.displayName || '?')[0].toUpperCase()}
                    </div>
                  );
                })}
            </div>
            <span>posted</span>
          </button>
        </div>
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
