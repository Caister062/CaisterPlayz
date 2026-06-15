import PostCard, { Avatar } from './PostCard';

function PulseRow({ users, currentUserId }) {
  return (
    <div className="pulse-row">
      {users.slice(0, 15).map(user => (
        <div key={user.id} className="pulse-item">
          <div className={`pulse-ring${user.id === currentUserId ? ' inactive' : ''}`}>
            <div className="pulse-avatar">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.displayName} />
                : (user.displayName || '?')[0].toUpperCase()
              }
            </div>
          </div>
          <span className="pulse-name">{(user.displayName || 'Player').split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skel-card">
      <div className="skel-row">
        <div className="skel skel-circle" style={{ width: 38, height: 38, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skel" style={{ width: '35%', height: 12 }} />
          <div className="skel" style={{ width: '100%', height: 12 }} />
          <div className="skel" style={{ width: '65%', height: 12 }} />
        </div>
      </div>
    </div>
  );
}

export default function FeedView({ posts, loading, users, currentUserId, onProfileClick }) {
  if (loading) {
    return (
      <>
        <PulseRow users={[]} currentUserId={currentUserId} />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </>
    );
  }

  return (
    <div>
      <PulseRow users={users} currentUserId={currentUserId} />

      {posts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎮</div>
          <h3>No posts yet</h3>
          <p>Be the first to drop a post in the community!</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            users={users}
            onProfileClick={onProfileClick}
          />
        ))
      )}
    </div>
  );
}
