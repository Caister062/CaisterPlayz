import { useState } from 'react';
import { Users, Shield, Radio, Sparkles, MessageSquare, Plus, CheckCircle2, Gamepad2, Volume2, Globe, Users2 } from 'lucide-react';

export default function FortniteLfgView({ posts = [], users = [], currentUserId, onComposeLfg }) {
  const [selectedMode, setSelectedMode] = useState('ALL');

  // Filter posts created by actual registered players tagged with LFG or Squad Beacon
  const realLfgPosts = posts.filter(p => 
    p.type === 'SQUAD_BEACON' || 
    p.category === 'LFG' || 
    p.tags?.includes('LFG') || 
    p.mode ||
    p.type === 'squad_lfg'
  );

  const displayList = realLfgPosts.filter(p => {
    if (selectedMode !== 'ALL') {
      const pMode = (p.mode || '').toUpperCase();
      if (!pMode.includes(selectedMode)) return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '16px', paddingBottom: '120px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2a0845 0%, #17042a 100%)',
        border: '1px solid #7c3aed33',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00f0ff', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
              <Radio size={16} /> Live Fortnite Squad Finder
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '4px 0 6px 0', textTransform: 'uppercase' }}>
              Assemble Your Squad
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, maxWidth: 480 }}>
              Connect with Fortnite players for Zero Build, Battle Royale, Reload, and Ranked lobbies.
            </p>
          </div>
          <button
            onClick={onComposeLfg}
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)',
              color: '#000',
              fontWeight: 900,
              border: 'none',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)'
            }}
          >
            <Plus size={18} /> Broadcast Squad Beacon
          </button>
        </div>
      </div>

      {/* Mode Filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
        {['ALL', 'ZERO BUILD', 'BATTLE ROYALE', 'RELOAD', 'RANKED', 'CREATIVE'].map(mode => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              border: selectedMode === mode ? '1px solid #00f0ff' : '1px solid #334155',
              background: selectedMode === mode ? 'rgba(0, 240, 255, 0.15)' : '#0f172a',
              color: selectedMode === mode ? '#00f0ff' : '#94a3b8',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* LFG Cards Grid */}
      {displayList.length === 0 ? (
        <div style={{
          background: '#0f172a',
          border: '1px border #1e293b',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <Users2 size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
            No Squad Beacons Active
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px 0' }}>
            Be the first player to broadcast a squad beacon for Zero Build, Battle Royale, or Ranked!
          </p>
          <button
            onClick={onComposeLfg}
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #7c3aed 100%)',
              color: '#000',
              fontWeight: 900,
              border: 'none',
              padding: '10px 20px',
              borderRadius: 12,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Plus size={16} /> Broadcast Squad Beacon
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {displayList.map(item => {
            const author = users.find(u => u.id === item.userId);
            const displayName = author?.displayName || item.username || 'Fortnite Gamer';
            return (
              <div
                key={item.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: 12,
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        @{displayName}
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {item.platform || 'Cross-Platform'} • {item.region || 'NA-EAST'}
                      </span>
                    </div>
                    <span style={{
                      background: 'rgba(124, 58, 237, 0.2)',
                      color: '#a855f7',
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '4px 10px',
                      borderRadius: 20,
                      border: '1px solid #7c3aed44'
                    }}>
                      Need +{item.needed || 1} Player(s)
                    </span>
                  </div>

                  <div style={{
                    background: '#1e293b',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#e2e8f0',
                    marginBottom: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between'
                  }}>
                    <span>🎮 {item.mode || 'Battle Royale'}</span>
                    {item.rank && <span style={{ color: '#ffd700', fontWeight: 900 }}>🏆 {item.rank}</span>}
                  </div>

                  <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                    "{item.content || item.note || 'Looking for squad members to queue up!'}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Volume2 size={12} color={item.micRequired ? '#10b981' : '#64748b'} />
                      {item.micRequired ? 'Mic Required' : 'Mic Optional'}
                    </span>
                  </div>
                  <button
                    onClick={() => alert(`Sent join request to @${displayName}!`)}
                    style={{
                      background: '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Users size={14} /> Request Join
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
