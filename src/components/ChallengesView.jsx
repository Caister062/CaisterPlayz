import React, { useState } from 'react';
import { Trophy, Activity, Flame, ShieldAlert, Star, TrendingUp } from 'lucide-react';

export default function ChallengesView({ users = [], currentUserId }) {
  const [boardType, setBoardType] = useState('xp'); // 'xp', 'damage', 'streak'

  // Sort users based on selected board
  const sortedUsers = [...users].sort((a, b) => {
    if (boardType === 'xp') return (b.xp || 0) - (a.xp || 0);
    if (boardType === 'streak') return (b.streak || 0) - (a.streak || 0);
    
    // For damage, we'll mock it based on XP if they don't have a direct damage stat
    if (boardType === 'damage') {
      const dmgA = (a.xp || 0) * 1.5;
      const dmgB = (b.xp || 0) * 1.5;
      return dmgB - dmgA;
    }
    return 0;
  });

  const getRankColor = (index) => {
    if (index === 0) return 'var(--amber)'; // Gold
    if (index === 1) return '#94a3b8'; // Silver
    if (index === 2) return '#b45309'; // Bronze
    return 'var(--text2)';
  };

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 900, 
          fontFamily: '"Anton", sans-serif',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          background: 'var(--caister-grad)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8
        }}>
          Global Rankings
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Compete against the world. Become a legend.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setBoardType('xp')}
          style={{
            background: boardType === 'xp' ? 'var(--cyan)' : 'var(--surface)',
            color: boardType === 'xp' ? '#000' : 'var(--text1)',
            border: `1px solid ${boardType === 'xp' ? 'var(--cyan)' : 'var(--border)'}`,
            padding: '8px 16px',
            borderRadius: 20,
            fontWeight: 800,
            fontSize: 13,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <Trophy size={14} /> Total XP
        </button>
        <button
          onClick={() => setBoardType('damage')}
          style={{
            background: boardType === 'damage' ? 'var(--rose)' : 'var(--surface)',
            color: boardType === 'damage' ? '#fff' : 'var(--text1)',
            border: `1px solid ${boardType === 'damage' ? 'var(--rose)' : 'var(--border)'}`,
            padding: '8px 16px',
            borderRadius: 20,
            fontWeight: 800,
            fontSize: 13,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldAlert size={14} /> Boss Damage
        </button>
        <button
          onClick={() => setBoardType('streak')}
          style={{
            background: boardType === 'streak' ? 'var(--amber)' : 'var(--surface)',
            color: boardType === 'streak' ? '#000' : 'var(--text1)',
            border: `1px solid ${boardType === 'streak' ? 'var(--amber)' : 'var(--border)'}`,
            padding: '8px 16px',
            borderRadius: 20,
            fontWeight: 800,
            fontSize: 13,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <Flame size={14} /> Longest Streak
        </button>
      </div>

      {/* Leaderboard List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedUsers.map((u, i) => {
          const isMe = u.id === currentUserId;
          const rankColor = getRankColor(i);
          
          let scoreText = '';
          if (boardType === 'xp') scoreText = `${(u.xp || 0).toLocaleString()} XP`;
          if (boardType === 'damage') scoreText = `${((u.xp || 0) * 1.5).toLocaleString()} DMG`;
          if (boardType === 'streak') scoreText = `${u.streak || 0} Days`;

          return (
            <div 
              key={u.id}
              style={{
                background: isMe ? 'var(--bg2)' : 'var(--surface)',
                border: `1px solid ${isMe ? 'var(--brand-primary)' : 'var(--border)'}`,
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isMe && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'var(--brand-primary)' }} />}

              <div style={{ width: 30, textAlign: 'center', fontSize: 18, fontWeight: 900, color: rankColor }}>
                #{i + 1}
              </div>

              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {u.avatarUrl ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.displayName[0] || '?').toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                  {u.displayName}
                  {isMe && <span style={{ fontSize: 10, background: 'var(--brand-primary)', color: '#fff', padding: '2px 6px', borderRadius: 4, marginLeft: 8, verticalAlign: 'middle' }}>YOU</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
                  Lvl {u.level || 1}
                </div>
              </div>

              <div style={{ fontSize: 16, fontWeight: 900, color: boardType === 'damage' ? 'var(--rose)' : (boardType === 'streak' ? 'var(--amber)' : 'var(--cyan)') }}>
                {scoreText}
              </div>
            </div>
          );
        })}
        
        {sortedUsers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
            No players found on this server.
          </div>
        )}
      </div>

    </div>
  );
}
