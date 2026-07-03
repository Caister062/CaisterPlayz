import React from 'react';
import { Flame, Trophy } from 'lucide-react';

export default function PlayerStats({ user }) {
  if (!user) return null;

  return (
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
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 4 }}>
        {user.displayName || 'Player'}
      </h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: 'var(--amber)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
          Iron Titan
        </span>
        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
          Guild: Iron Titans
        </span>
      </div>

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
  );
}
