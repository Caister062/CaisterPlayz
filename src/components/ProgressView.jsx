import React from 'react';
import PlayerStats from './PlayerStats';
import { LogOut } from 'lucide-react';
import pb from '../pocketbase';

export default function ProgressView({ user, onRefresh }) {
  if (!user) return <div style={{ padding: 24, color: '#fff' }}>Loading progress...</div>;

  const handleLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem('cplayz_user_id');
    window.location.reload();
  };

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          My Progress
        </h1>
        <button 
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid var(--hot)',
            color: 'var(--hot)',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '13px'
          }}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Integrate the gamer stats */}
      <PlayerStats user={user} />

      {/* Advanced Workout Statistics */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, color: 'var(--text2)' }}>
          Workout Statistics
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          
          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Total Workouts</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{user?.workoutsLogged || 0}</div>
          </div>

          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Hours Trained</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{Math.floor((user?.timeTrained || 0) / 60)} <span style={{fontSize: 12, color: 'var(--text2)'}}>hrs</span></div>
          </div>

          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Calories Burned</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{user?.weeklyCals || 0}<span style={{fontSize: 12, color: 'var(--text2)'}}></span></div>
          </div>

          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Boss Damage</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--rose)' }}>{user?.bossDamage || 0}<span style={{fontSize: 12, color: 'var(--text2)'}}></span></div>
          </div>

          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Avg Session</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{user?.workoutsLogged ? Math.floor((user.timeTrained || 0) / user.workoutsLogged) : 0} <span style={{fontSize: 12, color: 'var(--text2)'}}>min</span></div>
          </div>

          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Fav Exercise</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--cyan)' }}>{user?.favExercise || 'None'}</div>
          </div>

          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Best Streak</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--amber)' }}>{user?.bestStreak || user?.streak || 0} <span style={{fontSize: 12, color: 'var(--text2)'}}>Days</span></div>
          </div>

          <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--hot)' }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Legendary Sessions</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--hot)' }}>{user?.legendarySessions || 0}</div>
          </div>

        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, color: 'var(--text2)' }}>
          Recent Achievements
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
            No badges unlocked yet. Keep grinding!
          </div>
        )}
      </div>
    </div>
  );
}
