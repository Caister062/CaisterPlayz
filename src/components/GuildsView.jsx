import React, { useState, useMemo } from 'react';
import { Shield, Plus, Users, Target, Activity, Flame, X } from 'lucide-react';
import { useGuilds, createGuild, toggleGuildMembership } from '../hooks';

export default function GuildsView({ currentUserId, users = [] }) {
  const { guilds, loading } = useGuilds();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildMotto, setNewGuildMotto] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Derive active guilds with calculated XP based on current members
  const activeGuilds = useMemo(() => {
    return guilds.map(g => {
      // Calculate total XP by summing the XP of all users in the members array
      const totalXp = g.members.reduce((sum, memberId) => {
        const u = users.find(user => user.id === memberId);
        return sum + (u?.xp || 0);
      }, 0);
      
      const level = Math.floor(totalXp / 5000) + 1; // Level up every 5000 guild XP

      return {
        ...g,
        xp: totalXp,
        level: level
      };
    }).sort((a, b) => b.xp - a.xp); // Sort by highest XP
  }, [guilds, users]);

  const myGuild = activeGuilds.find(g => g.members.includes(currentUserId));

  const handleCreate = async () => {
    if (!newGuildName.trim()) return;
    setIsCreating(true);
    try {
      await createGuild(currentUserId, newGuildName.trim(), newGuildMotto.trim());
      setShowCreateModal(false);
      setNewGuildName('');
      setNewGuildMotto('');
    } catch (err) {
      console.error(err);
      alert('Failed to create guild.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleMembership = async (guildId) => {
    try {
      // If leaving, just leave. If joining, leave current first (only 1 guild allowed).
      if (myGuild && myGuild.id !== guildId) {
        await toggleGuildMembership(myGuild.id, currentUserId); // Leave old
      }
      await toggleGuildMembership(guildId, currentUserId); // Join/Leave new
    } catch (err) {
      console.error(err);
      alert('Failed to update membership.');
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--cyan)' }}>Loading Guilds...</div>;
  }

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
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{ 
              background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 20, 
              padding: '8px 16px', fontWeight: 900, fontSize: 13, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
            }}
          >
            <Plus size={14} /> Create
          </button>
        )}
      </div>

      {/* MY GUILD WIDGET */}
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
                  onClick={() => handleToggleMembership(myGuild.id)}
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

      {/* GUILD LEADERBOARD */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text1)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={16} color="var(--hot)" /> Top Guilds
        </h2>

        {activeGuilds.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)', background: 'var(--surface)', borderRadius: 16, border: '1px dashed var(--border)' }}>
            No guilds exist yet. Be the first to create one!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeGuilds.map((g, i) => {
              const isMine = myGuild?.id === g.id;
              return (
                <div key={g.id} style={{ 
                  background: isMine ? 'var(--bg2)' : 'var(--surface)', 
                  border: `1px solid ${isMine ? 'var(--cyan)' : 'var(--border)'}`, 
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
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
                      {g.name}
                      {isMine && <span style={{ fontSize: 9, background: 'var(--cyan)', color: '#000', padding: '2px 6px', borderRadius: 4, marginLeft: 8, verticalAlign: 'middle' }}>YOURS</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 12, marginTop: 4, fontWeight: 600 }}>
                      <span>Lvl {g.level}</span>
                      <span>{g.members.length} Members</span>
                      <span style={{ color: 'var(--emerald)' }}>{g.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  
                  {!isMine && (
                    <button 
                      onClick={() => handleToggleMembership(g.id)}
                      style={{ background: 'var(--bg)', color: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 16px', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      Join
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE GUILD MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24
        }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--cyan)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 400, position: 'relative' }}>
            <button 
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 8 }}>Found a Guild</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>Lead your squad to glory.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text1)', textTransform: 'uppercase', marginBottom: 8 }}>Guild Name</label>
              <input 
                type="text" 
                maxLength={24}
                value={newGuildName}
                onChange={e => setNewGuildName(e.target.value)}
                placeholder="e.g. Iron Titans"
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 16, fontWeight: 800 }}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text1)', textTransform: 'uppercase', marginBottom: 8 }}>Guild Motto</label>
              <input 
                type="text"
                maxLength={60}
                value={newGuildMotto}
                onChange={e => setNewGuildMotto(e.target.value)}
                placeholder="e.g. We forge our strength in iron."
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}
              />
            </div>

            <button 
              onClick={handleCreate}
              disabled={isCreating || !newGuildName.trim()}
              style={{
                width: '100%', background: 'var(--cyan)', color: '#000', border: 'none', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 900, textTransform: 'uppercase', cursor: (isCreating || !newGuildName.trim()) ? 'not-allowed' : 'pointer', opacity: (isCreating || !newGuildName.trim()) ? 0.5 : 1
              }}
            >
              {isCreating ? 'Forging...' : 'Create Guild'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
