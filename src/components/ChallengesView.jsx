import React, { useMemo } from 'react';
import { Target, Users, Zap, ShieldAlert } from 'lucide-react';

export default function ChallengesView({ posts = [], users = [], currentUserId }) {
  
  // Calculate total community XP from actual users
  const totalCommunityXp = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.xp || 0), 0);
  }, [users]);

  // Boss Health Logic
  const BOSS_MAX_HP = 5000000;
  const currentDamage = totalCommunityXp;
  const healthPercent = Math.max(0, 100 - ((currentDamage / BOSS_MAX_HP) * 100));
  
  // Find top contributors
  const activeRaiders = [...users]
    .filter(u => u.xp > 0)
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 5);

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>
        Active Epic Challenges
      </h1>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--emerald)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
        <div style={{ padding: 24, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={20} color="var(--emerald)" /> The Iron Titan
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Global Community Raid</p>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', padding: '4px 12px', borderRadius: 12, fontWeight: 800, fontSize: 12, textTransform: 'uppercase' }}>
              Legendary
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text1)' }}>
              <span>Challenge Goal Progress</span>
              <span>{Math.max(0, BOSS_MAX_HP - currentDamage).toLocaleString()} / {BOSS_MAX_HP.toLocaleString()}</span>
            </div>
            <div style={{ height: 12, background: 'var(--bg2)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${healthPercent}%`, background: 'var(--emerald)', transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8, textAlign: 'right' }}>
              {currentDamage.toLocaleString()} DMG dealt by community
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} /> Top Raiders
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeRaiders.length > 0 ? activeRaiders.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text2)', fontWeight: 800, fontSize: 12 }}>#{i + 1}</span>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{u.displayName}</span>
                  </div>
                  <span style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: 13 }}>{u.xp} DMG</span>
                </div>
              )) : (
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>No players have attacked yet.</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--hot)', opacity: 0.1, filter: 'blur(50px)', borderRadius: '50%' }} />
      </div>

    </div>
  );
}
