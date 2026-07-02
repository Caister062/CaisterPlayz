import React from 'react';
import PlayerStats from './PlayerStats';
import { ArrowLeft } from 'lucide-react';

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

      <PlayerStats user={user} />

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
