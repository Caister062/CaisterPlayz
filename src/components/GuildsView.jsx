import React, { useState } from 'react';
import { Shield, Plus, Users, Target, Activity, Flame } from 'lucide-react';

export default function GuildsView({ currentUserId, users = [] }) {
  const [guilds, setGuilds] = useState([
    {
      id: 'g1',
      name: 'Iron Titans',
      level: 42,
      xp: 1450000,
      members: ['1', '2', '3', '4', '5'],
      bossDefeats: 12,
      motto: 'We forge our strength in iron.'
    },
    {
      id: 'g2',
      name: 'Cardio Legion',
      level: 38,
      xp: 1200000,
      members: ['6', '7', '8'],
      bossDefeats: 9,
      motto: 'Run until the raid is over.'
    },
    {
      id: 'g3',
      name: 'Storm Lifters',
      level: 15,
      xp: 250000,
      members: ['9', '10'],
      bossDefeats: 2,
      motto: 'Lightning fast lifts.'
    }
  ]);
  
  const [myGuildId, setMyGuildId] = useState(null);

  const myGuild = guilds.find(g => g.id === myGuildId);

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ 
            fontSize: 28, 
            fontWeight: 900, 
            fontFamily: '"Anton", sans-serif',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background: 'var(--caister-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 4
          }}>
            Fitness Guilds
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            Join a guild to take down raid bosses together.
          </p>
        </div>
        {!myGuild && (
          <button style={{ 
            background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 20, 
            padding: '8px 16px', fontWeight: 900, fontSize: 13, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
          }}>
            <Plus size={14} /> Create
          </button>
        )}
      </div>

      {myGuild ? (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text1)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="var(--cyan)" /> My Guild
          </h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--cyan)', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--cyan)', opacity: 0.1, filter: 'blur(50px)', borderRadius: '50%' }} />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{myGuild.name}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>"{myGuild.motto}"</div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '6px 12px', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 900, textTransform: 'uppercase' }}>Level</div>
                  <div style={{ fontSize: 18, color: 'var(--cyan)', fontWeight: 900 }}>{myGuild.level}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Activity size={18} color="var(--emerald)" />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 900, textTransform: 'uppercase' }}>Guild XP</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>{myGuild.xp.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Target size={18} color="var(--rose)" />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 900, textTransform: 'uppercase' }}>Boss Kills</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>{myGuild.bossDefeats}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text1)', fontWeight: 800 }}>
                  <Users size={16} color="var(--text2)" /> {myGuild.members.length} Members
                </div>
                <button 
                  onClick={() => setMyGuildId(null)}
                  style={{ background: 'transparent', color: 'var(--rose)', border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Leave Guild
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--emerald)', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 32 }}>
          <Shield size={32} color="var(--emerald)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 8 }}>No Guild Assigned</h3>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
            You are a solo player. Join a guild to unlock guild raids and bonus XP.
          </p>
        </div>
      )}

      {/* Guild Leaderboard */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text1)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={16} color="var(--hot)" /> Top Guilds
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {guilds.sort((a, b) => b.xp - a.xp).map((g, i) => (
            <div key={g.id} style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: 16, 
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{ width: 24, textAlign: 'center', fontSize: 16, fontWeight: 900, color: i === 0 ? 'var(--amber)' : (i === 1 ? '#94a3b8' : 'var(--text2)') }}>
                #{i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{g.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 12, marginTop: 4, fontWeight: 600 }}>
                  <span>Lvl {g.level}</span>
                  <span>{g.members.length} Members</span>
                </div>
              </div>
              
              {!myGuildId && (
                <button 
                  onClick={() => setMyGuildId(g.id)}
                  style={{ background: 'var(--bg2)', color: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 16px', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
