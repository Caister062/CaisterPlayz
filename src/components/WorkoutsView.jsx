import React from 'react';
import QuestCard from './QuestCard';

export default function WorkoutsView({ onOpenComposer, posts = [], users = [], currentUserId }) {
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
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 800,
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}>
          Log Session
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.length > 0 ? (
          posts.map(p => (
            <QuestCard key={p.id} post={p} users={users} currentUserId={currentUserId} />
          ))
        ) : (
          <div style={{ padding: 40, background: 'var(--surface)', borderRadius: 16, textAlign: 'center', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text1)', marginBottom: 8, fontSize: 18, fontWeight: 800 }}>No workouts logged</h3>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Tap Log Session to start your grind.</p>
          </div>
        )}
      </div>
    </div>
  );
}
