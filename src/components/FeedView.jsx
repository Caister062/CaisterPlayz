import { useState, useMemo } from 'react';
import { GridCard, DeckCard, Hex } from './PostCard';
import ExpandedBroadcast from './PostCard';

function Radar({ users, currentUserId }) {
  return (
    <div className="radar">
      {users.slice(0, 15).map(u => (
        <div key={u.id} className="radar-dot">
          <div className={`radar-ring${u.id === currentUserId ? ' idle' : ''}`}>
            <div className="radar-inner">
              {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : (u.displayName||'?')[0].toUpperCase()}
            </div>
            {u.id !== currentUserId && <div className="radar-ping" />}
          </div>
          <span className="radar-tag">{(u.displayName||'P').split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

function Ticker({ notifications, users }) {
  if (!notifications || notifications.length === 0) return null;
  const MSGS = { like: 'boosted', comment: 'replied to', repost: 'echoed', follow: 'joined' };
  const EMOJIS = { like: '⚡', comment: '💬', repost: '🔥', follow: '🤝' };
  const items = notifications.slice(0, 20).map(n => {
    const s = users.find(u => u.id === n.senderId);
    return { id: n.id, name: s?.displayName || 'Someone', msg: MSGS[n.type] || 'interacted', emoji: EMOJIS[n.type] || '🔔' };
  });
  // Double for infinite scroll effect
  const doubled = [...items, ...items];
  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {doubled.map((item, i) => (
          <span key={`${item.id}-${i}`} className="ticker-item">
            <span className="ticker-emoji">{item.emoji}</span>
            <strong>{item.name}</strong> {item.msg} a broadcast
            <span className="ticker-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid">
      {[0,1,2,3].map(i => (
        <div key={i} className="skel-card">
          <div className="skel" style={{ width: '40%', height: 10, marginBottom: 8 }} />
          <div className="skel" style={{ width: '100%', height: 10, marginBottom: 4 }} />
          <div className="skel" style={{ width: '70%', height: 10 }} />
        </div>
      ))}
    </div>
  );
}

export default function FeedView({ posts, loading, users, currentUserId, notifications, onProfileClick }) {
  const [expandedPost, setExpandedPost] = useState(null);

  // Sort by engagement for "Hot" deck
  const hotPosts = useMemo(() =>
    [...posts].sort((a, b) => {
      const pa = (a.likedBy?.length || 0) + (a.repostedBy?.length || 0) + (a.viewedBy?.length || 0);
      const pb = (b.likedBy?.length || 0) + (b.repostedBy?.length || 0) + (b.viewedBy?.length || 0);
      return pb - pa;
    }).slice(0, 10), [posts]);

  // Recent for grid
  const recentPosts = useMemo(() =>
    [...posts].sort((a, b) => new Date(b.created) - new Date(a.created)), [posts]);

  // Squad-related posts for mini squad section
  const squadPosts = useMemo(() =>
    posts.filter(p => (p.text||'').toLowerCase().includes('#squad')).slice(0, 6), [posts]);

  if (loading) {
    return <><Radar users={[]} currentUserId={currentUserId} /><SkeletonGrid /></>;
  }

  return (
    <div>
      {/* Player Radar */}
      <Radar users={users} currentUserId={currentUserId} />

      {/* Activity Ticker */}
      <Ticker notifications={notifications} users={users} />

      {posts.length === 0 ? (
        <div className="empty">
          <div className="brand-empty-mark">
            <svg width="40" height="40" viewBox="0 0 512 512" fill="none"><text x="256" y="390" textAnchor="middle" fontFamily="'Arial Black','Impact',sans-serif" fontWeight="900" fontSize="340" fill="white" letterSpacing="-20">CP</text></svg>
          </div>
          <h3>The arena is quiet</h3>
          <p>Drop the first broadcast and own the CaisterPlayz feed.</p>
        </div>
      ) : (
        <>
          {/* Hot Broadcasts — horizontal deck */}
          {hotPosts.length > 0 && (
            <>
              <div className="sec">
                <span className="sec-label">🔥 Hot Right Now</span>
                <span className="sec-badge">{hotPosts.length}</span>
              </div>
              <div className="deck">
                {hotPosts.map(p => (
                  <DeckCard key={p.id} post={p} users={users} onClick={setExpandedPost} />
                ))}
              </div>
            </>
          )}

          {/* Latest Drops — 2-column grid */}
          <div className="sec">
            <span className="sec-label">📡 Latest Drops</span>
            <span className="sec-badge">{recentPosts.length}</span>
          </div>
          <div className="grid">
            {recentPosts.map(p => (
              <GridCard key={p.id} post={p} users={users} onClick={setExpandedPost} />
            ))}
          </div>
        </>
      )}

      {/* Expanded overlay */}
      {expandedPost && (
        <ExpandedBroadcast
          post={expandedPost}
          currentUserId={currentUserId}
          users={users}
          onClose={() => setExpandedPost(null)}
        />
      )}
    </div>
  );
}
