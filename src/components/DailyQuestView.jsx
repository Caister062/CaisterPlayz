import React from 'react';
import { Flame, Star, Trophy, Activity, Target, Award, ArrowUpCircle } from 'lucide-react';

/* =========================
   DAILY QUEST VIEW
   Premium RPG Dashboard
========================= */
export default function DailyQuestView({ user, config, onOpenComposer }) {
  // Use real data or fallback
  const profile = user || {
    displayName: 'Player',
    xp: 0,
    level: 1,
    streak: 0,
    badges: []
  };

  const xpForNextLevel = (profile.level || 1) * 500;
  const currentLevelXp = (profile.xp || 0) % 500;
  const xpProgress = (currentLevelXp / 500) * 100;
  const xpRemaining = 500 - currentLevelXp;

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      {/* RPG Header */}
      <div style={{ marginBottom: 24 }}>
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
          TRAINING HQ
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Complete workouts, earn XP, level up, and conquer fitness challenges.
        </p>
      </div>

      {/* Primary Player Card */}
      <div style={{ 
        background: 'var(--surface)', 
        borderRadius: 16, 
        padding: 20,
        marginBottom: 24,
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--purple)', opacity: 0.15, filter: 'blur(50px)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 56, height: 56, 
              borderRadius: 16, 
              background: 'var(--caister-grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 24, color: '#fff',
              boxShadow: 'var(--caister-glow)'
            }}>
              {profile.level || 1}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{profile.displayName?.split(' ')[0] || 'Player'}</div>
              <div style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 800 }}>{profile.xp || 0} TOTAL XP</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 900, fontSize: 20 }}>
              {profile.streak || 0} <Flame size={20} fill="var(--amber)" />
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', fontWeight: 800 }}>Day Streak</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: 'var(--text1)', fontWeight: 800 }}>
            <span>Level {profile.level || 1}</span>
            <span>Level {(profile.level || 1) + 1}</span>
          </div>
          <div style={{ height: 12, background: 'var(--bg2)', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ 
              height: '100%', 
              width: `${xpProgress}%`, 
              background: 'var(--caister-grad)',
              borderRadius: 6,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text2)', marginTop: 8, fontWeight: 600 }}>
            <ArrowUpCircle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {xpRemaining} XP to Level Up
          </div>
        </div>
      </div>

      {/* Grid of Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        
        {/* Weekly Goal Progress */}
        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
          <Target size={24} color="var(--cyan)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase' }}>Weekly Goal</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 4 }}>
            {profile.streak >= 3 ? '3/3' : `${profile.streak}/3`} <span style={{ fontSize: 12, color: 'var(--text2)' }}>Days</span>
          </div>
        </div>

        {/* Calories Burned */}
        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
          <Flame size={24} color="var(--hot)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase' }}>Weekly Cals</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 4 }}>
            2,450 <span style={{ fontSize: 12, color: 'var(--text2)' }}>kcal</span>
          </div>
        </div>

        {/* Workout Minutes */}
        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
          <Activity size={24} color="var(--emerald)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase' }}>Time Trained</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 4 }}>
            185 <span style={{ fontSize: 12, color: 'var(--text2)' }}>min</span>
          </div>
        </div>

        {/* Recent PR */}
        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
          <Award size={24} color="var(--amber)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase' }}>Latest PR</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--amber)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Bench 225x5
          </div>
        </div>

      </div>

      {/* Upcoming Community Raid */}
      <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid var(--violet)', borderRadius: 16, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--violet)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 2 }}>Global Raid</div>
          <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>10,000 km Run Challenge</div>
        </div>
        <div style={{ background: 'var(--violet)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px', borderRadius: 8 }}>
          JOIN
        </div>
      </div>

      {/* Active Quest */}
      <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Star size={16} color="var(--emerald)" /> Active Mission
      </h2>

      <div style={{ 
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)', 
        border: '1px solid var(--emerald)', 
        borderRadius: 16, 
        padding: 24,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--emerald)' }} />
        
        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8, textTransform: 'uppercase' }}>Daily Grind</h3>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>
          Log any workout session today to complete your daily quest and earn rewards.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', padding: '6px 12px', borderRadius: 8, fontWeight: 800, fontSize: 13 }}>
            +100 XP
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)', padding: '6px 12px', borderRadius: 8, fontWeight: 800, fontSize: 13 }}>
            +1 Streak
          </div>
        </div>

        <button 
          onClick={onOpenComposer}
          style={{
            background: 'var(--emerald)',
            color: '#fff',
            border: 'none',
            padding: '16px 32px',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            width: '100%',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
          <Activity size={20} />
          LOG WORKOUT
        </button>
      </div>

    </div>
  );
}
