import { useState, useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useActiveRaid } from '../hooks';
import QuestCard from './QuestCard';

export default function FeedView({
  posts,
  users,
  currentUserId,
  loading,
  config
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

  // Dynamic Boss Damage
  const { raid } = useActiveRaid();
  const totalCommunityXp = users.reduce((acc, u) => acc + Number(u.xp || 0), 0);
  
  let currentHp = 0;
  let raidHpPercent = 0;
  let isDefeated = false;

  if (raid) {
    const totalCommunityDamage = (totalCommunityXp - raid.startCommunityXp) * 1.5;
    currentHp = Math.max(0, raid.maxHp - totalCommunityDamage);
    raidHpPercent = (currentHp / raid.maxHp) * 100;
    isDefeated = currentHp <= 0;
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* LIVE RAID - FEED WIDGET */}
      {raid && !isDefeated && (
        <div style={{ background: 'var(--surface)', margin: 16, padding: 16, borderRadius: 16, border: '1px solid var(--rose)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 15px rgba(244, 63, 94, 0.3)' }}>
            <Flame size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: 'var(--rose)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LIVE RAID</span>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 900, textTransform: 'uppercase' }}>{raid.name}</span>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text1)', fontWeight: 800, marginBottom: 4 }}>
                <span>HP</span>
                <span>{currentHp.toLocaleString()} / {raid.maxHp.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ height: '100%', width: `${raidHpPercent}%`, background: 'var(--hot)', borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="feed-header" style={{ marginBottom: 16, marginTop: 16 }}>
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
