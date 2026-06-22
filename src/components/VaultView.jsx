import { useState } from 'react';
import { GridCard } from './PostCard';
import ExpandedBroadcast from './PostCard';

export default function VaultView({ posts, currentUserId, users }) {
  const [expanded, setExpanded] = useState(null);

  const anchored = posts.filter(p =>
    (p.favoritedBy || []).includes(currentUserId)
  );

  return (
    <div>
      <div className="vault-head">
        <div className="vault-title">🔒 Signal Vault</div>
        <div className="vault-sub">
          {anchored.length} anchored signal{anchored.length !== 1 ? 's' : ''}
        </div>
      </div>

      {anchored.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">📡</div>
          <h3>Vault is quiet</h3>
          <p>Anchor signals to store them in your Core Archive.</p>
        </div>
      ) : (
        <div className="grid" style={{ padding: '10px 10px' }}>
          {anchored.map(p => (
            <GridCard
              key={p.id}
              post={p}
              users={users}
              onClick={setExpanded}
            />
          ))}
        </div>
      )}

      {expanded && (
        <ExpandedBroadcast
          post={expanded}
          currentUserId={currentUserId}
          users={users}
          onClose={() => setExpanded(null)}
        />
      )}
    </div>
  );
}
