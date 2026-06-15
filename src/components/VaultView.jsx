import { useState } from 'react';
import { GridCard } from './PostCard';
import ExpandedBroadcast from './PostCard';

export default function VaultView({ posts, currentUserId, users, onProfileClick }) {
  const [expanded, setExpanded] = useState(null);
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
        <div className="grid" style={{ padding: '10px 10px' }}>
          {pinned.map(p => <GridCard key={p.id} post={p} users={users} onClick={setExpanded} />)}
        </div>
      )}
      {expanded && <ExpandedBroadcast post={expanded} currentUserId={currentUserId} users={users} onClose={() => setExpanded(null)} />}
    </div>
  );
}
