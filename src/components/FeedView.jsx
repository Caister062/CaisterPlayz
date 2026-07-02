import { useState, useMemo } from 'react';
import QuestCard from './QuestCard';

export default function FeedView({
  posts,
  users,
  currentUserId,
  loading
}) {
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
        Syncing Global Progress...
      </div>
    );
  }

  // Sort latest quests
  const signalDrops = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.created) - new Date(a.created));
  }, [posts]);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="feed-header" style={{ marginBottom: 16 }}>
        <h2 className="feed-title" style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Global Quests
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Real-time updates from other players on the grind.</p>
      </div>

      {posts.length === 0 ? (
        <div className="empty">
          <h3>The Island is empty</h3>
          <p>No quests logged globally yet.</p>
        </div>
      ) : (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {signalDrops.map(p => (
            <QuestCard
              key={p.id}
              post={p}
              users={users}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
