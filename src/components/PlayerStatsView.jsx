import React, { useState } from 'react';
import PlayerStats from './PlayerStats';
import GearInventoryModal from './GearInventoryModal';
import { ArrowLeft, Shield, Backpack } from 'lucide-react';
import pb from '../pocketbase';

export default function PlayerStatsView({ user, onBack, onUserUpdate }) {
  const [showGear, setShowGear] = useState(false);

  if (!user) return <div style={{ padding: 24, color: '#fff' }}>Loading player...</div>;

  const handleEquip = async (type, id) => {
    try {
      // Find player stats post
      const statsQuery = await pb.collection('cplayz_posts').getList(1, 1, { filter: `userId="${user.id}" && type="player_stats"` });
      if (statsQuery.items.length > 0) {
        const sp = statsQuery.items[0];
        let d = {};
        try { d = JSON.parse(sp.text); } catch(e){}
        
        if (type === 'frame') d.equippedFrame = id;
        if (type === 'aura') d.equippedAura = id;
        
        await pb.collection('cplayz_posts').update(sp.id, { text: JSON.stringify(d) });
        
        // Optimistically update the UI if onUserUpdate is provided (or it will just refresh via subscription)
        if (onUserUpdate) {
          onUserUpdate({ ...user, equippedFrame: d.equippedFrame, equippedAura: d.equippedAura });
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

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

      {/* RPG Profile Section */}
      <div style={{ position: 'relative' }}>
        <PlayerStats user={user} />
        
        <button
          onClick={() => setShowGear(true)}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--cyan)', color: '#000', border: 'none',
            borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6,
            fontWeight: 900, fontSize: 12, cursor: 'pointer', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
          }}
        >
          <Backpack size={16} /> LOADOUT
        </button>
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

      {showGear && (
        <GearInventoryModal 
          user={user} 
          onClose={() => setShowGear(false)} 
          onEquip={handleEquip}
        />
      )}
    </div>
  );
}
