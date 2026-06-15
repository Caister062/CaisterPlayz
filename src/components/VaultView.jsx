import BroadcastCard from './PostCard';

export default function VaultView({ posts, currentUserId, users, onProfileClick }) {
  const pinned = posts.filter(p => (p.favoritedBy || []).includes(currentUserId));
  return (
    <div>
      <div className="vault-head">
        <div className="vault-title">🔒 Vault</div>
        <div className="vault-sub">{pinned.length} pinned broadcast{pinned.length !== 1 ? 's' : ''}</div>
      </div>
      {pinned.length === 0 ? (
        <div className="empty"><div className="empty-ico">📌</div><h3>Vault empty</h3><p>Pin broadcasts to save them here.</p></div>
      ) : (
        pinned.map(p => <BroadcastCard key={p.id} post={p} currentUserId={currentUserId} users={users} onProfileClick={onProfileClick} />)
      )}
    </div>
  );
}
