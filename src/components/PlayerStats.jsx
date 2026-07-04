import React from 'react';
import { Flame, Trophy, Shield, Star, Crosshair } from 'lucide-react';
import { useGuilds } from '../hooks';
import { getRankForLevel, getUnlockedGear, GEAR_DB } from '../rpgConfig';

export default function PlayerStats({ user }) {
  const { guilds } = useGuilds();
  
  if (!user) return null;
  
  const myGuild = guilds.find(g => g.members.includes(user.id));
  
  const level = user.level || 1;
  const xp = user.xp || 0;
  const streak = user.streak || 0;
  
  const rank = getRankForLevel(level);
  const nextRank = getRankForLevel(level + 5); // Just for progress bar visualization
  
  const equippedFrameId = user.equippedFrame || 'frame_basic';
  const equippedAuraId = user.equippedAura || null;
  
  const frame = GEAR_DB.find(g => g.id === equippedFrameId);
  const aura = GEAR_DB.find(g => g.id === equippedAuraId);
  
  const frameColor = frame?.preview || 'gray';
  const auraEmoji = aura?.preview || '';

  return (
    <div style={{ 
      background: 'var(--surface)', 
      borderRadius: 16, 
      padding: 24, 
      border: `2px solid ${frameColor}`, 
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: auraEmoji ? `0 0 30px ${frameColor}44` : 'none'
    }}>
      
      {/* Background rank gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 100,
        background: rank.bgGrad, opacity: 0.5, zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 16 }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: 30, 
            background: 'var(--bg)', 
            border: `4px solid ${frameColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, position: 'relative',
            boxShadow: `0 0 20px ${frameColor}aa`
          }}>
            {rank.icon}
            
            {auraEmoji && (
              <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 24, filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }}>
                {auraEmoji}
              </div>
            )}
            
            <div style={{ 
              position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
              background: frameColor, color: '#fff', fontSize: 12, fontWeight: 900, 
              padding: '2px 8px', borderRadius: 10, border: '2px solid var(--bg)'
            }}>
              Lv. {level}
            </div>
          </div>
        </div>

        <div style={{ color: rank.color, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          {rank.title}
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 4 }}>
          {user.displayName || 'Player'}
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {myGuild ? (
            <>
              <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: 'var(--amber)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                Guild Leader
              </span>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                Guild: {myGuild.name}
              </span>
            </>
          ) : (
            <span style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
              Solo Player
            </span>
          )}
        </div>

        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4, fontWeight: 800 }}>
          {xp.toLocaleString()} Total XP
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 20 }}>
              {streak} <Flame size={20} fill="#f59e0b" />
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase' }}>Day Streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 20 }}>
              {user.workoutsLogged || 0} <Crosshair size={20} />
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase' }}>Workouts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
