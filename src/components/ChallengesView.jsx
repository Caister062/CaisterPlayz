import React from 'react';
import { Target, Users, Shield, Award } from 'lucide-react';

/* =========================
   CHALLENGES VIEW
   Global and squad fitness challenges
========================= */
export default function ChallengesView() {
  const challenges = [
    { id: 1, title: 'The 10k Step Raid', desc: 'Hit 10,000 steps every day this week.', xp: 2000, participants: 342, type: 'Global' },
    { id: 2, title: 'Iron Lift Boss Fight', desc: 'Log 5 strength training sessions.', xp: 5000, participants: 128, type: 'Event' },
    { id: 3, title: 'Cardio Speedrun', desc: 'Run 10 miles total before Sunday.', xp: 1500, participants: 56, type: 'Global' }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Boss Fights
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Join global fitness challenges to earn massive XP drops and exclusive badges.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {challenges.map(c => (
          <div key={c.id} style={{
            background: 'linear-gradient(145deg, var(--surface), rgba(59, 130, 246, 0.05))',
            borderRadius: 16,
            padding: 20,
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ 
                background: c.type === 'Event' ? '#f43f5e' : '#3b82f6',
                color: '#fff',
                fontSize: 10,
                fontWeight: 900,
                textTransform: 'uppercase',
                padding: '4px 8px',
                borderRadius: 4,
                letterSpacing: '0.05em'
              }}>
                {c.type} Challenge
              </div>
              <div style={{ color: '#10b981', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Award size={16} /> +{c.xp} XP
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{c.title}</h3>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16, lineHeight: 1.4 }}>{c.desc}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 12 }}>
                <Users size={14} /> {c.participants} players joined
              </div>
              <button style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer'
              }}>
                Join Raid
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
