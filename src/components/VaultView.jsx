import PostCard from './PostCard';

export default function VaultView({ posts, currentUserId, users, onProfileClick }) {
  const bookmarked = posts.filter(p => (p.favoritedBy || []).includes(currentUserId));

  return (
    <div>
      <div className="vault-header">
        <div className="vault-title">Your Vault</div>
        <div className="vault-subtitle">
          {bookmarked.length} saved post{bookmarked.length !== 1 ? 's' : ''}
        </div>
      </div>

      {bookmarked.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔒</div>
          <h3>Vault is empty</h3>
          <p>Bookmark posts to save them here for later.</p>
        </div>
      ) : (
        bookmarked.map(post => (
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
