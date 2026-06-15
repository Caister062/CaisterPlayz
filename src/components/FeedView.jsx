import BroadcastCard, { Hex } from './PostCard';

function Radar({ users, currentUserId }) {
  return (
    <div className="radar">
      {users.slice(0, 15).map(u => (
        <div key={u.id} className="radar-dot">
          <div className={`radar-ring${u.id === currentUserId ? ' idle' : ''}`}>
            <div className="radar-inner">
              {u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} /> : (u.displayName||'?')[0].toUpperCase()}
            </div>
            {u.id !== currentUserId && <div className="radar-ping" />}
          </div>
          <span className="radar-tag">{(u.displayName||'Player').split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

function Skel() {
  return (
    <div className="skel-card">
      <div className="skel-row">
        <div className="skel skel-circle" style={{ width: 36, height: 36, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skel" style={{ width: '30%', height: 10 }} />
          <div className="skel" style={{ width: '100%', height: 10 }} />
          <div className="skel" style={{ width: '60%', height: 10 }} />
        </div>
      </div>
    </div>
  );
}

export default function FeedView({ posts, loading, users, currentUserId, onProfileClick }) {
  if (loading) {
    return <><Skel /><Skel /><Skel /><Skel /></>;
  }

  return (
    <div>
      <Radar users={users} currentUserId={currentUserId} />

      <div className="sec">
        <span className="sec-label">Live Broadcasts</span>
        <span className="sec-action">{posts.length} active</span>
      </div>

      {posts.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">📡</div>
          <h3>No broadcasts</h3>
          <p>Drop the first broadcast for the community.</p>
        </div>
      ) : (
        posts.map(p => (
          <BroadcastCard key={p.id} post={p} currentUserId={currentUserId} users={users} onProfileClick={onProfileClick} />
        ))
      )}
    </div>
  );
}
