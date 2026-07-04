import React, { useState, useEffect } from 'react';
import { X, Flame, ShieldAlert, Crosshair, Zap, Trophy, Target } from 'lucide-react';
import { logWorkout, attackLiveBoss } from '../hooks';

const WORKOUT_TYPES = [
  { id: 'strength', label: '🏋️ Strength', baseCaloriesPerMin: 6 },
  { id: 'cardio', label: '🏃 Cardio', baseCaloriesPerMin: 10 },
  { id: 'hiit', label: '🔥 HIIT', baseCaloriesPerMin: 14 }
];

const DIFFICULTIES = [
  { id: 'Easy', multiplier: 0.8, color: '#34d399' },
  { id: 'Normal', multiplier: 1.0, color: '#3b82f6' },
  { id: 'Hard', multiplier: 1.5, color: '#f59e0b' },
  { id: 'Legendary', multiplier: 2.5, color: '#f43f5e' }
];

export default function RaidCombatModal({ boss, currentUserId, config, playerName = 'Player', onClose }) {
  const [duration, setDuration] = useState('45');
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [attacking, setAttacking] = useState(false);
  const [damageDealt, setDamageDealt] = useState(null);

  const durationNum = parseInt(duration) || 0;
  const estimatedCalories = Math.floor(durationNum * workoutType.baseCaloriesPerMin * difficulty.multiplier);
  const totalXP = durationNum * 5 + Math.floor(durationNum * 5 * (difficulty.multiplier - 1));
  const expectedDamage = totalXP * 5;

  const handleAttack = async () => {
    if (!durationNum) return alert('Enter duration to attack!');
    setAttacking(true);
    
    // Simulate strike sequence
    setTimeout(() => {
      setDamageDealt(expectedDamage);
      
      // Submit the workout in the background after damage is shown
      setTimeout(async () => {
        try {
          const workoutDetails = {
            type: workoutType.label,
            duration: durationNum,
            difficulty: difficulty.id,
            calories: estimatedCalories,
            xp: totalXP,
            bossDamage: expectedDamage,
            privacy: 'Public',
            exercises: [],
            coachSummary: `You dealt ${expectedDamage} damage to the World Boss!`
          };

          await logWorkout(currentUserId, `Attacked the World Boss for ${expectedDamage} DMG!`, '', workoutDetails);
          
          if (config && config.id) {
            await attackLiveBoss(config.id, config, expectedDamage, playerName);
          }

          onClose();
        } catch (err) {
          console.error(err);
          alert('Attack failed to register on the server.');
          setAttacking(false);
        }
      }, 2500); // Wait 2.5s to show damage celebration before closing
    }, 500); // 500ms hit delay
  };

  if (!boss) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.95)', zIndex: 99999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes floatUpAndFade {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; }
          }
          @keyframes slash {
            0% { transform: rotate(-45deg) scaleX(0); opacity: 0; }
            50% { transform: rotate(-45deg) scaleX(1); opacity: 1; }
            100% { transform: rotate(-45deg) scaleX(1) translateY(20px); opacity: 0; }
          }
          @keyframes shakeBoss {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
          .shake-animation {
            animation: shakeBoss 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}
      </style>
      <div 
        className={attacking ? "shake-animation" : ""}
        style={{
          width: '100%', maxWidth: 400,
          background: 'linear-gradient(180deg, #1e1b4b 0%, #000 100%)',
          borderRadius: 24, padding: 24, border: '1px solid var(--rose)',
          position: 'relative', overflow: 'hidden',
          boxShadow: attacking ? '0 0 50px rgba(244, 63, 94, 0.5)' : '0 0 30px rgba(0,0,0,0.8)',
          transition: 'box-shadow 0.3s ease'
        }}
      >
        <button onClick={onClose} disabled={attacking} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: 8, cursor: 'pointer', zIndex: 10 }}>
          <X size={20} />
        </button>

        <h2 style={{ textAlign: 'center', color: 'var(--rose)', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
          <Target size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Target Acquired
        </h2>

        {/* Boss Visual */}
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px', filter: attacking ? 'brightness(2) contrast(1.5) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'all 0.1s ease' }}>
          {boss.image ? (
            <img src={boss.image} alt="Boss" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--rose)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--rose)' }}>
              <ShieldAlert size={64} color="var(--rose)" />
            </div>
          )}

          {/* Damage Number Overlay */}
          {damageDealt !== null && (
            <div style={{
              position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
              color: '#fff', fontSize: 42, fontWeight: 900, textShadow: '0 0 20px #f43f5e, 0 0 10px #000',
              fontFamily: '"Anton", sans-serif', animation: 'floatUpAndFade 2s forwards', zIndex: 20, whiteSpace: 'nowrap'
            }}>
              -{damageDealt.toLocaleString()}
            </div>
          )}

          {/* Slashing Animation Effect */}
          {attacking && damageDealt === null && (
            <div style={{
              position: 'absolute', top: '50%', left: '-20%', right: '-20%', height: 4,
              background: '#fff', boxShadow: '0 0 20px #f43f5e', transform: 'rotate(-45deg)',
              animation: 'slash 0.2s ease forwards'
            }} />
          )}
        </div>

        <h3 style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 8 }}>{boss.name}</h3>

        {/* Form Controls */}
        <div style={{ opacity: attacking ? 0.3 : 1, transition: 'opacity 0.3s ease', pointerEvents: attacking ? 'none' : 'auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Duration (Min)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: '#fff', padding: 12, borderRadius: 12, outline: 'none', fontWeight: 800, fontSize: 16 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Type</label>
              <select value={workoutType.id} onChange={e => setWorkoutType(WORKOUT_TYPES.find(w => w.id === e.target.value))} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: '#fff', padding: 12, borderRadius: 12, outline: 'none', fontWeight: 800, fontSize: 16 }}>
                {WORKOUT_TYPES.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: 'var(--text2)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Intensity Multiplier</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1, padding: '10px 4px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
                    background: difficulty.id === d.id ? `${d.color}20` : 'rgba(0,0,0,0.5)',
                    color: difficulty.id === d.id ? d.color : 'var(--text2)',
                    border: `1px solid ${difficulty.id === d.id ? d.color : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer'
                  }}
                >
                  {d.id}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(244,63,94,0.1)', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px dashed rgba(244,63,94,0.3)' }}>
            <div style={{ color: 'var(--text2)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Expected DMG</div>
            <div style={{ color: 'var(--rose)', fontSize: 24, fontWeight: 900, fontFamily: '"Anton", sans-serif' }}>{expectedDamage.toLocaleString()}</div>
          </div>

          <button 
            onClick={handleAttack}
            disabled={!durationNum || attacking}
            style={{ 
              width: '100%', padding: 20, background: 'var(--rose)', color: '#fff', border: 'none', 
              borderRadius: 16, fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.05em',
              cursor: (!durationNum || attacking) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: (!durationNum || attacking) ? 0.5 : 1,
              boxShadow: '0 8px 30px rgba(244, 63, 94, 0.4)'
            }}
          >
            <Crosshair size={24} /> {attacking ? 'STRIKING...' : 'LAUNCH ATTACK'}
          </button>
        </div>
      </div>
    </div>
  );
}
