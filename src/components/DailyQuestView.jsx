import React from 'react';
import { Flame, Star, Trophy, Activity, ChevronRight, Zap } from 'lucide-react';

/* =========================
   DAILY QUEST VIEW
   The new home dashboard for "Fitness for Gamers"
========================= */
export default function DailyQuestView({ user, config, onOpenComposer }) {
  // Demo data for now, eventually hooked up to pocketbase
  const profile = user || {
    id: 'demo-user',
    displayName: 'Player',
    xp: 2450,
    level: 12,
    streak: 4
  };

  const xpForNextLevel = (profile.level || 1) * 500;
  const xpProgress = ((profile.xp || 0) % 500) / 500 * 100;

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      {/* HUD Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 900, 
          fontFamily: '"Anton", sans-serif',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #10b981, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8
        }}>
          READY TO GRIND, {profile.displayName?.split(' ')[0] || 'PLAYER'}?
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Complete your daily quests to earn XP and level up your player profile.
        </p>
      </div>

      {/* Player Stats HUD */}
      <div style={{ 
        background: 'var(--surface)', 
        borderRadius: 16, 
        padding: 20,
        marginBottom: 24,
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 48, height: 48, 
              borderRadius: 12, 
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 20, color: '#fff'
            }}>
              {profile.level || 1}
            </div>
            <div>
              <div style={{ color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Player Level</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{profile.xp || 0} XP</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 18 }}>
              {profile.streak || 0} <Flame size={18} fill="#f59e0b" />
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase' }}>Day Streak</div>
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: 'var(--text2)', fontWeight: 600 }}>
            <span>Level {profile.level || 1}</span>
            <span>Level {(profile.level || 1) + 1}</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${xpProgress}%`, 
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderRadius: 4,
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
            }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
            {(profile.xp || 0) % 500} / 500 XP to next level
          </div>
        </div>
      </div>

      {/* Daily Quest Card */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Star size={18} color="#10b981" /> TODAY'S QUEST
      </h2>
      <div style={{ 
        background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 16,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#10b981', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Main Objective
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
              The 30-Minute Grind
            </h3>
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
              Log at least 30 minutes of any physical activity today to complete your daily quest and keep your streak alive.
            </p>
          </div>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.2)', 
            padding: '4px 8px', 
            borderRadius: 8, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4,
            color: '#10b981',
            fontWeight: 800,
            fontSize: 14
          }}>
            +500 <Zap size={14} fill="#10b981" />
          </div>
        </div>

        <button 
          onClick={onOpenComposer}
          style={{
          width: '100%',
          padding: '14px',
          background: '#10b981',
          color: '#000',
          border: 'none',
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        }}>
          <Activity size={20} /> Log Workout to Complete
        </button>
      </div>

      {/* Weekly Challenge Teaser */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Trophy size={18} color="#3b82f6" /> ACTIVE BOSS FIGHT
      </h2>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            width: 50, height: 50, 
            borderRadius: 12, 
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trophy size={24} color="#3b82f6" />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, color: '#fff', fontSize: 16, marginBottom: 4 }}>10k Step Raid</h4>
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>3,450 / 10,000 Steps</p>
          </div>
        </div>
        <ChevronRight color="var(--text3)" />
      </div>

    </div>
  );
}
