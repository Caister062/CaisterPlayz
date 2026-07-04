import React, { useState } from 'react';
import { X, Shield, Zap, Lock } from 'lucide-react';
import { pb } from '../pocketbase'; // Assuming pb is exported or imported if needed... wait, I can just use pb from global if it's there. Actually I'll use hooks.js
import { getUnlockedGear, GEAR_DB } from '../rpgConfig';

export default function GearInventoryModal({ user, onClose, onEquip }) {
  const [tab, setTab] = useState('frame');
  const level = user.level || 1;
  const streak = user.streak || 0;
  
  const unlockedGear = getUnlockedGear(level, streak);
  const equippedFrameId = user.equippedFrame || 'frame_basic';
  const equippedAuraId = user.equippedAura || null;
  
  const handleEquip = async (gear) => {
    onEquip(gear.type, gear.id);
  };
  
  const renderGearItem = (gear) => {
    const isUnlocked = unlockedGear.some(g => g.id === gear.id);
    const isEquipped = gear.id === equippedFrameId || gear.id === equippedAuraId;
    
    return (
      <div 
        key={gear.id}
        style={{
          background: 'var(--bg)',
          border: `2px solid ${isEquipped ? 'var(--cyan)' : 'var(--border)'}`,
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: isUnlocked ? 1 : 0.5,
          filter: isUnlocked ? 'none' : 'grayscale(1)',
          cursor: isUnlocked ? 'pointer' : 'default',
          position: 'relative'
        }}
        onClick={() => {
          if (isUnlocked) handleEquip(gear);
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'var(--surface)',
          border: gear.type === 'frame' ? `3px solid ${gear.preview}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24
        }}>
          {gear.type === 'aura' ? gear.preview : ''}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{gear.name}</div>
          <div style={{ color: gear.rarity === 'Legendary' ? 'var(--rose)' : gear.rarity === 'Epic' ? 'var(--amber)' : 'var(--text2)', fontSize: 12, fontWeight: 700 }}>
            {gear.rarity}
          </div>
          
          {!isUnlocked && (
            <div style={{ fontSize: 11, color: 'var(--rose)', marginTop: 4 }}>
              {gear.unlockLevel ? `Unlocks at Lv. ${gear.unlockLevel}` : `Unlocks at ${gear.unlockStreak} Day Streak`}
            </div>
          )}
        </div>
        
        {isEquipped && (
          <div style={{ background: 'var(--cyan)', color: '#000', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 8 }}>
            EQUIPPED
          </div>
        )}
        {!isUnlocked && <Lock size={20} color="var(--text3)" />}
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ 
        background: 'var(--surface)', width: '100%', maxWidth: 500, height: '80vh',
        borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>Gear Inventory</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff' }}><X size={24} /></button>
        </div>
        
        <div style={{ display: 'flex', gap: 16, padding: '16px 20px' }}>
          <button 
            onClick={() => setTab('frame')}
            style={{ 
              flex: 1, padding: 12, borderRadius: 12, fontWeight: 900,
              background: tab === 'frame' ? 'var(--cyan)' : 'var(--bg)',
              color: tab === 'frame' ? '#000' : 'var(--text1)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
            <Shield size={18} /> Frames
          </button>
          <button 
            onClick={() => setTab('aura')}
            style={{ 
              flex: 1, padding: 12, borderRadius: 12, fontWeight: 900,
              background: tab === 'aura' ? 'var(--cyan)' : 'var(--bg)',
              color: tab === 'aura' ? '#000' : 'var(--text1)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
            <Zap size={18} /> Auras
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GEAR_DB.filter(g => g.type === tab).map(renderGearItem)}
        </div>
      </div>
    </div>
  );
}
