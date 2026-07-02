import React from 'react';
import { ArrowLeft, Flame, Trophy, ShieldAlert } from 'lucide-react';

export default function PlayerStatsView({ user, onBack }) {
  if (!user) return <div style={{ padding: 24, color: '#fff' }}>Loading player...</div>;

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <button 
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text1)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          cursor: 'pointer',
          fontWeight: 800,
          textTransform: 'uppercase',
          fontSize: 13
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: 24, 
          background: 'var(--caister-grad)', 
          margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 900, color: '#fff'
        }}>
          {user.level || 1}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
          {user.displayName || 'Player'}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          {user.xp || 0} Total XP
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 18 }}>
              {user.streak || 0} <Flame size={18} fill="#f59e0b" />
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase' }}>Day Streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 18 }}>
              {user.workoutsLogged || 0} <Trophy size={18} fill="var(--emerald)" />
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase' }}>Workouts</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, color: 'var(--text2)' }}>
          Achievements
        </h2>
        
        {user.badges && user.badges.length > 0 ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {user.badges.map((b, i) => (
              <div key={i} style={{ padding: '8px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--cyan)', color: 'var(--cyan)', fontWeight: 800, fontSize: 13 }}>
                {b}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', textAlign: 'center', color: 'var(--text2)', fontSize: 14 }}>
            No badges unlocked yet.
          </div>
        )}
      </div>
    </div>
  );
}
