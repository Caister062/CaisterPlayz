import PostCard from './PostCard';
import { Loader } from 'lucide-react';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/* ── Stories Row ── */
function StoriesRow({ users, currentUserId }) {
  const storyUsers = users.slice(0, 12);
  return (
    <div className="stories-row">
      {/* My Story / Add */}
      <div className="story-item">
        <div className="story-ring">
          <div className="story-avatar" style={{ background: 'var(--brand)', fontSize: 28 }}>＋</div>
        </div>
        <span className="story-name">Your Story</span>
      </div>
      {storyUsers.map(user => (
        <div key={user.id} className="story-item">
          <div className={`story-ring${user.id === currentUserId ? ' seen' : ''}`}>
            <div className="story-avatar">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.displayName} />
                : (user.displayName || '?')[0].toUpperCase()
              }
            </div>
          </div>
          <span className="story-name">{(user.displayName || 'User').split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Skeleton ── */
function PostSkeleton() {
  return (
    <div className="post-skeleton">
      <div className="skeleton-row">
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton skeleton-line" style={{ width: '100%' }} />
          <div className="skeleton skeleton-line" style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  );
}

export default function FeedView({ posts, loading, users, currentUserId, onProfileClick }) {
  return (
    <div>
      <StoriesRow users={users} currentUserId={currentUserId} />

      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎮</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something with the community!</p>
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
