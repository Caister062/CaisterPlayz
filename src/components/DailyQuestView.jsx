import React, { useState } from 'react';
import { Flame, Star, Trophy, Radio, Target, Award, ArrowUpCircle, Sparkles, Gamepad2, Shield, Plus, Zap, Crosshair } from 'lucide-react';
import { useActiveRaid, spawnRaid } from '../hooks';
import RaidCombatModal from './RaidCombatModal';

export default function DailyQuestView({ user, config, users = [], onOpenComposer }) {
  const { raid, loading } = useActiveRaid();
  const [spawning, setSpawning] = useState(false);
  const [showRaidModal, setShowRaidModal] = useState(false);

  const profile = user || {
    displayName: 'FortniteGamer',
    xp: 0,
    level: 1,
    streak: 0,
    badges: []
  };

  const currentLevelXp = (profile.xp || 0) % 500;
  const xpProgress = (currentLevelXp / 500) * 100;
  const xpRemaining = 500 - currentLevelXp;
  
  const totalCommunityXp = users.reduce((acc, u) => acc + Number(u.xp || 0), 0);
  
  let currentHp = 0;
  let raidHpPercent = 0;
  let isDefeated = false;

  if (raid) {
    currentHp = raid.currentHp !== undefined ? raid.currentHp : raid.maxHp;
    raidHpPercent = (currentHp / raid.maxHp) * 100;
    isDefeated = currentHp <= 0;
  }

  const handleSpawnRaid = async () => {
    if (spawning) return;
    setSpawning(true);
    try {
      const maxHp = 50000;
      await spawnRaid(profile.id, 'Storm King Live Event', maxHp, 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop', totalCommunityXp);
    } catch (e) {
      console.error(e);
      alert('Failed to trigger live event');
    } finally {
      setSpawning(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 120 }}>
      {/* Original Fortnite Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #17072b 0%, #0d122b 50%, #061c30 100%)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        border: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: '0 12px 40px rgba(0, 240, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Elements */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: '#00f0ff', opacity: 0.15, filter: 'blur(50px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, background: '#7c3aed', opacity: 0.2, filter: 'blur(50px)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00f0ff', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            <Radio size={16} /> Fortnite Battle HQ
          </div>

          <h1 style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 16px 0',
            lineHeight: 1.2,
            textShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
          }}>
            VICTORY ROYALE & LIVE EVENT HUB
          </h1>

          {/* User Profile Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: 16,
            padding: 16,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontWeight: 900,
                  fontSize: 20,
                  color: '#000',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
                }}>
                  {profile.level || 1}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: '0.02em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 180 }}>
                    @{profile.displayName || 'FortniteGamer'}
                  </div>
                  <span style={{ color: '#00f0ff', fontSize: 12, fontWeight: 800 }}>{profile.xp || 0} BATTLE XP</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#ffd700', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  {profile.streak || 0} <Flame size={18} fill="#ffd700" />
                </div>
                <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Win Streak</span>
              </div>
            </div>

            {/* Level XP Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', fontWeight: 800, marginBottom: 6 }}>
                <span>Level {profile.level || 1}</span>
                <span>{xpRemaining} XP to Level Up</span>
              </div>
              <div style={{ height: 10, background: '#020617', borderRadius: 5, overflow: 'hidden', border: '1px solid #1e293b' }}>
                <div style={{
                  height: '100%',
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, #00f0ff, #7c3aed)',
                  borderRadius: 5,
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 12, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <Trophy size={20} color="#ffd700" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Victory Royales</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 2 }}>{profile?.streak || 0} Wins</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 12, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <Gamepad2 size={20} color="#00f0ff" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Main Mode</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginTop: 2 }}>Zero Build</div>
            </div>
          </div>
        </div>
      </div>

      {showRaidModal && raid && !isDefeated && (
        <RaidCombatModal 
          boss={raid}
          currentUserId={profile.id}
          config={config}
          playerName={profile.displayName || 'FortnitePlayer'}
          onClose={() => setShowRaidModal(false)}
        />
      )}

    </div>
  );
}
