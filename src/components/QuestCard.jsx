import React from 'react';
import { Target, Flame, Trophy, CheckCircle, Activity, BrainCircuit } from 'lucide-react';
import { timeAgo } from './PostCard';

export default function QuestCard({ post, users, currentUserId }) {
  const author = users.find(u => u.id === post.userId) || post.expand?.userId || { id: post.userId, displayName: 'Player' };
  
  // Parse legacy WORKOUT_LOG format
  let legacyXPMatch = post.text.match(/\[WORKOUT_LOG:\s*(\d+)\s*XP Earned\]/i);
  let legacyXP = legacyXPMatch ? parseInt(legacyXPMatch[1], 10) : 0;
  
  // Parse new WORKOUT_DATA JSON format
  let workoutData = null;
  const dataMatch = post.text.match(/<!--WORKOUT_DATA:(.*?)-->/);
  if (dataMatch) {
    try {
      workoutData = JSON.parse(dataMatch[1]);
    } catch(e) {
      console.error("Failed to parse workout data", e);
    }
  }

  // Clean caption
  let caption = post.text
    .replace(/\[WORKOUT_LOG:.*?\]\s*/i, '')
    .replace(/<!--WORKOUT_DATA:.*?-->\s*/, '')
    .trim();

  // Derived values
  const isLegacy = !workoutData && legacyXP > 0;
  const xp = workoutData ? workoutData.xp : (legacyXP || 100);
  const title = workoutData ? `${workoutData.type} Session` : (xp >= 500 ? "Boss Raid" : (xp >= 300 ? "Elite Quest" : "Daily Grind"));
  const difficulty = workoutData ? workoutData.difficulty : (xp >= 500 ? "Legendary" : (xp >= 300 ? "Hard" : "Normal"));
  
  const isEpic = xp >= 500 || difficulty === 'Legendary';
  const isOwn = post.userId === currentUserId;

  return (
    <div className={`bg-dark-surface border rounded-2xl p-4 mb-4 relative overflow-hidden transition ${
      isEpic ? 'border-rose-500 shadow-[0_4px_20px_rgba(244,63,94,0.15)]' : 'border-white/10'
    }`}>
      {/* Decorative background glow for Epic Workouts */}
      {isEpic && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 blur-[40px] rounded-full pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center overflow-hidden">
            {author.avatarUrl ? <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" /> : (author.displayName[0] || '?').toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-black text-white">
              {author.displayName}
            </div>
            <div className="text-[11px] font-bold text-dark-muted">
              {timeAgo(post.created)}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
          isEpic ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
        }`}>
          <CheckCircle size={10} /> Complete
        </div>
      </div>

      {/* Main Stats Box */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-3 mb-3 relative z-10">
        <h3 className="text-sm font-black uppercase mb-2 flex items-center gap-1.5 text-white">
          <Target size={14} className="text-brand-primary" /> {title}
        </h3>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white/5 p-2 rounded-lg flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-dark-muted uppercase">XP Earned</span>
            <span className="text-xs font-black text-brand-primary">+{xp}</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-dark-muted uppercase">Duration</span>
            <span className="text-xs font-black text-white">{workoutData ? `${workoutData.duration}m` : '--'}</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-dark-muted uppercase">Difficulty</span>
            <span className={`text-xs font-black ${isEpic ? 'text-rose-400' : 'text-blue-400'}`}>{difficulty}</span>
          </div>
        </div>

        {/* Exercises List (if any) */}
        {workoutData && workoutData.exercises && workoutData.exercises.length > 0 && (
          <div className="bg-black/40 rounded-lg p-2 mb-3 border border-white/5">
            <div className="text-[9px] font-black text-dark-muted uppercase mb-2 flex items-center gap-1">
              <Activity size={10} /> Exercises Logged
            </div>
            <div className="space-y-1.5">
              {workoutData.exercises.map(ex => (
                <div key={ex.id} className="flex justify-between items-center text-[11px]">
                  <span className="text-white font-bold">{ex.name}</span>
                  <div className="text-dark-muted font-bold">
                    <span className="text-white">{ex.sets}</span>×<span className="text-white">{ex.reps}</span>
                    {ex.weight && <span className="ml-1 text-emerald-400">{ex.weight}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Coach Summary (if any) */}
        {workoutData && workoutData.coachSummary && (
          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-2.5">
            <div className="text-[9px] font-black text-brand-primary uppercase mb-1 flex items-center gap-1">
              <BrainCircuit size={10} /> AI Coach Analysis
            </div>
            <p className="text-[11px] text-white/80 font-medium leading-relaxed whitespace-pre-wrap">
              {workoutData.coachSummary}
            </p>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-[13px] text-white/90 mb-3 leading-relaxed relative z-10 font-medium">
          {caption}
        </p>
      )}

      {/* Media */}
      {post.imageUrl && (
        <div className="w-full rounded-xl overflow-hidden mb-3 bg-black/50 border border-white/5 relative z-10">
          <img src={post.imageUrl} alt="Quest Proof" className="w-full block object-cover" loading="lazy" />
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between border-t border-white/5 pt-3 relative z-10">
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-[11px] font-bold text-dark-muted">
            <Flame size={12} className="text-amber-500" /> Streak Up
          </div>
        </div>
        {workoutData && workoutData.bossDamage > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-black text-rose-400">
            <Trophy size={12} /> {workoutData.bossDamage.toLocaleString()} Boss DMG
          </div>
        )}
      </div>
    </div>
  );
}
