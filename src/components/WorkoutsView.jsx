import React from 'react';
import { Activity, Dumbbell, History, ChevronRight } from 'lucide-react';

/* =========================
   WORKOUTS VIEW
   Logging and tracking fitness sessions
========================= */
export default function WorkoutsView({ onOpenComposer }) {
  const dummyWorkouts = [
    { id: 1, name: 'Upper Body Grind', duration: '45 min', xp: 450, date: 'Today' },
    { id: 2, name: 'Cardio Speedrun', duration: '30 min', xp: 300, date: 'Yesterday' },
    { id: 3, name: 'Core Raid', duration: '20 min', xp: 200, date: '2 days ago' }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Workout Logs
        </h1>
        <button 
          onClick={onOpenComposer}
          style={{
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 20,
          fontWeight: 800,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer'
        }}>
          <Activity size={16} /> New Session
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Total Sessions</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#3b82f6' }}>42</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>XP Earned</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>12.4k</div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <History size={16} /> RECENT LOGS
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dummyWorkouts.map(w => (
          <div key={w.id} style={{
            background: 'var(--surface)',
            padding: 16,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={20} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{w.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{w.duration} • {w.date}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: '#10b981', fontSize: 14 }}>+{w.xp} XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
