import React from 'react';
import { Star, Shield, Zap, Lock, Unlock, Trophy } from 'lucide-react';

export default function SeasonsView({ config }) {
  const season = config?.season || { name: 'Season 1: Iron Awakening', level: 1 };
  const currentLevel = season.level || 1;

  const REWARDS = [
    { level: 1, title: 'Rookie Badge', type: 'badge', icon: Shield, unlocked: currentLevel >= 1 },
    { level: 2, title: '+500 XP Boost', type: 'xp', icon: Zap, unlocked: currentLevel >= 2 },
    { level: 3, title: 'Iron Titan Title', type: 'title', icon: Trophy, unlocked: currentLevel >= 3 },
    { level: 4, title: 'Neon Frame', type: 'frame', icon: Star, unlocked: currentLevel >= 4 },
    { level: 5, title: 'Storm Lifter Badge', type: 'badge', icon: Shield, unlocked: currentLevel >= 5 },
    { level: 6, title: 'Legendary Raider Title', type: 'title', icon: Trophy, unlocked: currentLevel >= 6 },
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(234, 179, 8, 0.1)', color: 'var(--amber)', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>
          <Star size={14} fill="currentColor" /> Active Season
        </div>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 900, 
          fontFamily: '"Anton", sans-serif',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#fff',
          marginBottom: 8,
          textShadow: '0 0 20px rgba(234, 179, 8, 0.3)'
        }}>
          {season.name}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Level up your Seasonal Rank to unlock exclusive gear.
        </p>
      </div>

      {/* Progress Box */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--amber)', opacity: 0.1, filter: 'blur(50px)', borderRadius: '50%' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase' }}>Current Rank</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--amber)', lineHeight: 1 }}>{currentLevel}</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text1)', fontWeight: 800 }}>
            Next Reward: {REWARDS.find(r => r.level === currentLevel + 1)?.title || 'Max Rank!'}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ height: 16, background: 'var(--bg2)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ 
              height: '100%', 
              width: `${(currentLevel / REWARDS.length) * 100}%`, 
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              borderRadius: 8
            }} />
          </div>
        </div>
      </div>

      {/* Reward Track */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 16 }}>Reward Track</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REWARDS.map(reward => (
            <div 
              key={reward.level}
              style={{
                background: reward.unlocked ? 'rgba(245, 158, 11, 0.05)' : 'var(--surface)',
                border: `1px solid ${reward.unlocked ? 'var(--amber)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: reward.unlocked ? 1 : 0.6
              }}
            >
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 12, 
                background: reward.unlocked ? 'var(--amber)' : 'var(--bg2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: reward.unlocked ? '#000' : 'var(--text2)'
              }}>
                <reward.icon size={24} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: reward.unlocked ? 'var(--amber)' : 'var(--text2)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 2 }}>
                  Rank {reward.level}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: reward.unlocked ? '#fff' : 'var(--text1)' }}>
                  {reward.title}
                </div>
              </div>

              <div>
                {reward.unlocked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber)', fontSize: 12, fontWeight: 800 }}>
                    <Unlock size={14} /> CLAIMED
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text2)', fontSize: 12, fontWeight: 800 }}>
                    <Lock size={14} /> LOCKED
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
