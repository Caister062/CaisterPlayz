import React from 'react';
import { Target, Flame, Trophy, CheckCircle, ShieldAlert } from 'lucide-react';
import { timeAgo } from './PostCard';

export default function QuestCard({ post, users, currentUserId }) {
  const author = users.find(u => u.id === post.userId) || post.expand?.userId || { id: post.userId, displayName: 'Player' };
  
  let xpMatch = post.text.match(/\[WORKOUT_LOG:\s*(\d+)\s*XP Earned\]/i);
  let xp = xpMatch ? parseInt(xpMatch[1], 10) : 100;
  let caption = post.text.replace(/\[WORKOUT_LOG:.*?\]\s*/i, '');

  let title = "Daily Grind";
  let difficulty = "Normal";
  
  if (xp >= 500) {
    title = "Boss Raid";
    difficulty = "Legendary";
  } else if (xp >= 300) {
    title = "Elite Quest";
    difficulty = "Hard";
  }

  const isOwn = post.userId === currentUserId;

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${xp >= 500 ? 'var(--hot)' : 'var(--border)'}`,
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: xp >= 500 ? '0 4px 20px rgba(244, 63, 94, 0.15)' : 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background glow for high XP */}
      {xp >= 500 && (
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'var(--hot)',
          opacity: 0.1,
          filter: 'blur(40px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {author.avatarUrl ? <img src={author.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (author.displayName[0] || '?').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
              {author.displayName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>
              {timeAgo(post.created)}
            </div>
          </div>
        </div>
        
        <div style={{ background: xp >= 500 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: xp >= 500 ? 'var(--hot)' : '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
          <CheckCircle size={12} /> Complete
        </div>
      </div>

      {/* Quest Details Box */}
      <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px', marginBottom: '12px', border: '1px solid var(--bg2)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={16} color="var(--cyan)" /> {title}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--surface)', padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 800 }}>XP Earned</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--cyan)' }}>+{xp}</span>
          </div>
          <div style={{ background: 'var(--surface)', padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 800 }}>Difficulty</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: xp >= 500 ? 'var(--hot)' : '#3b82f6' }}>{difficulty}</span>
          </div>
        </div>

        {/* Progress Bar Mock */}
        <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: xp >= 500 ? 'var(--hot)' : 'var(--cyan)', borderRadius: '3px' }} />
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <p style={{ fontSize: '14px', color: 'var(--text1)', marginBottom: '12px', lineHeight: 1.4 }}>
          {caption}
        </p>
      )}

      {/* Media */}
      {post.imageUrl && (
        <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', background: 'var(--bg2)' }}>
          <img src={post.imageUrl} alt="Quest Proof" style={{ width: '100%', display: 'block' }} loading="lazy" />
        </div>
      )}

      {/* Footer Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--bg2)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text2)', fontWeight: 600 }}>
            <Flame size={14} color="#f59e0b" /> Streak Maintained
          </div>
        </div>
        {xp >= 500 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--hot)', fontWeight: 800 }}>
            <Trophy size={14} /> Boss Defeated
          </div>
        )}
      </div>
    </div>
  );
}
