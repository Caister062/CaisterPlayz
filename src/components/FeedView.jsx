import { useState, useMemo } from 'react';
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
  const raid = config?.liveRaid;
  const BOSS_MAX_HP = 100000;
  const totalCommunityXp = users.reduce((acc, u) => acc + (u.xp || 0), 0);
  const currentHp = Math.max(0, BOSS_MAX_HP - (totalCommunityXp * 1.5));
  const raidHpPercent = (currentHp / BOSS_MAX_HP) * 100;

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* GLOBAL LIVE RAID BOSS */}
      {config && config.liveRaid && config.liveRaid.active && (
        <div style={{ padding: '16px 16px 0 16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--rose)', borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 80, height: 80, background: 'var(--rose)', opacity: 0.1, filter: 'blur(30px)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--rose)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {config.liveRaid.bossRarity}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {config.liveRaid.bossName}
                </div>
              </div>
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--rose)', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 8 }}>
                LIVE RAID
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text1)', fontWeight: 800, marginBottom: 4 }}>
                <span>HP</span>
                <span>{currentHp.toLocaleString()} / {BOSS_MAX_HP.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ height: '100%', width: `${raidHpPercent}%`, background: 'var(--hot)', borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
            </div>
            
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>
              Top Raider: <span style={{ color: 'var(--cyan)' }}>{config.liveRaid.topRaider}</span>
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
