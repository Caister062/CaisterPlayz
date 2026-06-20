import { useState, useMemo } from 'react';
import { GridCard, DeckCard } from './PostCard';
import ExpandedBroadcast from './PostCard';

function Radar({ users, currentUserId }) {
  return (
    <div className="radar">
      {users.slice(0, 15).map(u => (
        <div key={u.id} className="radar-dot">
          <div className={`radar-ring${u.id === currentUserId ? ' idle' : ''}`}>
            <div className="radar-inner">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt="" />
              ) : (
                (u.displayName || '?')[0].toUpperCase()
              )}
            </div>

            {u.id !== currentUserId && <div className="radar-ping" />}
          </div>

          <span className="radar-tag">
            {(u.displayName || 'Signal').split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

function Ticker({ notifications, users }) {
  if (!notifications || notifications.length === 0) return null;

  const MSGS = {
    like: 'boosted',
    comment: 'echoed',
    repost: 'relayed',
    follow: 'connected with'
  };

  const EMOJIS = {
    like: '⚡',
    comment: '💬',
    repost: '📡',
    follow: '🔗'
  };

  const items = notifications.slice(0, 20).map(n => {
    const s = users.find(u => u.id === n.senderId);

    return {
      id: n.id,
      name: s?.displayName || 'Someone',
      msg: MSGS[n.type] || 'triggered',
      emoji: EMOJIS[n.type] || '📡'
    };
  });

  const doubled = [...items, ...items];

  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {doubled.map((item, i) => (
          <span key={`${item.id}-${i}`} className="ticker-item">
            <span className="ticker-emoji">{item.emoji}</span>
            <strong>{item.name}</strong> {item.msg} a signal
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
  loading,
  users,
  currentUserId,
  notifications
}) {
  const [expandedPost, setExpandedPost] = useState(null);

  const primeSignals = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const rc = (arr, authorId) =>
          (arr || []).filter(id => id !== authorId).length;

        const pa =
          rc(a.likedBy, a.userId) +
          rc(a.repostedBy, a.userId) +
          rc(a.viewedBy, a.userId);

        const pb =
          rc(b.likedBy, b.userId) +
          rc(b.repostedBy, b.userId) +
          rc(b.viewedBy, b.userId);

        return pb - pa;
      })
      .slice(0, 10);
  }, [posts]);

  const signalDrops = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.created) - new Date(a.created)
    );
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
      {/* SIGNAL RADAR */}
      <Radar users={users} currentUserId={currentUserId} />

      {/* LIVE SIGNAL TICKER */}
      <Ticker notifications={notifications} users={users} />

      {posts.length === 0 ? (
        <div className="empty">
          <div className="brand-empty-mark">
            <svg width="40" height="40" viewBox="0 0 512 512" fill="none">
              <text
                x="256"
                y="390"
                textAnchor="middle"
                fontFamily="'Arial Black','Impact',sans-serif"
                fontWeight="900"
                fontSize="340"
                fill="white"
                letterSpacing="-20"
              >
                CP
              </text>
            </svg>
          </div>

          <h3>The Signal Core is quiet</h3>
          <p>Release the first signal and activate the CaisterPlayz stream.</p>
        </div>
      ) : (
        <>
          {/* PRIME SIGNALS */}
          {primeSignals.length > 0 && (
            <>
              <div className="sec">
                <span className="sec-label">⚡ Prime Signals</span>
                <span className="sec-badge">{primeSignals.length}</span>
              </div>

              <div className="deck">
                {primeSignals.map(p => (
                  <DeckCard
                    key={p.id}
                    post={p}
                    users={users}
                    onClick={setExpandedPost}
                  />
                ))}
              </div>
            </>
          )}

          {/* SIGNAL DROPS */}
          <div className="sec">
            <span className="sec-label">📡 Signal Drops</span>
            <span className="sec-badge">{signalDrops.length}</span>
          </div>

          <div className="grid">
            {signalDrops.map(p => (
              <GridCard
                key={p.id}
                post={p}
                users={users}
                onClick={setExpandedPost}
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
        />
      )}
    </div>
  );
}
