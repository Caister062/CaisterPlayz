import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Loader2, Zap, Trophy, Target, Users, Clock, Flame } from 'lucide-react';
import { Avatar } from './Shared';
import { createPost } from '../hooks';
import { playPostSound } from '../sounds';

export default function GamePlayComposer({ currentUserId, profile, communities, users }) {
  const [showCreator, setShowCreator] = useState(false);
  const [creatorMode, setCreatorMode] = useState('post'); // 'post', 'challenge', 'squad-lfg', 'achievement'
  
  return (
    <>
      <div className="px-4 py-3 border-b border-dark-border/50 bg-dark-surface/30">
        <div className="flex gap-3 items-center mb-3">
          <Avatar src={profile?.avatarUrl} name={profile?.displayName} size="md" />
          <button
            onClick={() => {
              setShowCreator(true);
              setCreatorMode('post');
            }}
            className="flex-1 px-4 py-2.5 rounded-lg bg-dark-card border border-dark-border/50 text-dark-muted text-sm hover:bg-dark-hover transition-colors text-left"
          >
            Share your gameplay moment...
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="gaming-grid-3">
          <button
            onClick={() => {
              setShowCreator(true);
              setCreatorMode('challenge');
            }}
            className="gaming-card p-3 text-center hover:neon-border-magenta transition-all"
          >
            <Target className="w-5 h-5 mx-auto mb-1 text-brand-secondary" />
            <p className="text-xs font-bold text-brand-secondary">Challenge</p>
          </button>
          
          <button
            onClick={() => {
              setShowCreator(true);
              setCreatorMode('squad-lfg');
            }}
            className="gaming-card p-3 text-center hover:neon-border-accent transition-all"
          >
            <Users className="w-5 h-5 mx-auto mb-1 text-brand-accent" />
            <p className="text-xs font-bold text-brand-accent">Squad LFG</p>
          </button>
          
          <button
            onClick={() => {
              setShowCreator(true);
              setCreatorMode('achievement');
            }}
            className="gaming-card p-3 text-center hover:neon-border transition-all"
          >
            <Trophy className="w-5 h-5 mx-auto mb-1 text-brand-primary" />
            <p className="text-xs font-bold text-brand-primary">Achievement</p>
          </button>
        </div>
      </div>

      {showCreator && (
        <GamePlayCreatorModal
          mode={creatorMode}
          setMode={setCreatorMode}
          onClose={() => setShowCreator(false)}
          currentUserId={currentUserId}
          profile={profile}
          communities={communities}
          users={users}
        />
      )}
    </>
  );
}

function GamePlayCreatorModal({ mode, setMode, onClose, currentUserId, profile, communities, users }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [compressedImage, setCompressedImage] = useState('');
  const fileRef = useRef(null);

  // Mode-specific state
  const [challengeReward, setChallengeReward] = useState('');
  const [challengeDuration, setChallengeDuration] = useState('24h');
  const [squadRole, setSquadRole] = useState('Any');
  const [gameTitle, setGameTitle] = useState('');
  const [achievementType, setAchievementType] = useState('milestone');

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setCompressedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);

    try {
      const postType = mode === 'challenge' ? 'mission' : mode === 'squad-lfg' ? 'squad' : mode === 'achievement' ? 'achievement' : 'post';
      
      let enrichedText = text.trim();
      
      if (mode === 'challenge') {
        enrichedText = `${enrichedText}\n\n🎯 REWARD: ${challengeReward}\n⏱️ Duration: ${challengeDuration}`;
      } else if (mode === 'squad-lfg') {
        enrichedText = `${enrichedText}\n\n🎮 Game: ${gameTitle}\n👥 Role: ${squadRole}`;
      } else if (mode === 'achievement') {
        enrichedText = `${enrichedText}\n\n⭐ Type: ${achievementType.charAt(0).toUpperCase() + achievementType.slice(1)}`;
      }

      await createPost(
        currentUserId,
        enrichedText,
        compressedImage,
        '',
        '',
        '',
        postType,
        ''
      );

      playPostSound();
      window.dispatchEvent(new Event('refreshPosts'));
      onClose();
    } catch (err) {
      console.error('Post failed:', err);
      alert('Failed to create post');
    }
    setPosting(false);
  };

  const modes = [
    { id: 'post', label: 'Post', icon: Zap },
    { id: 'challenge', label: 'Challenge', icon: Target },
    { id: 'squad-lfg', label: 'Squad LFG', icon: Users },
    { id: 'achievement', label: 'Achievement', icon: Trophy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-dark-bg border border-brand-primary/30 rounded-xl animate-modal-enter max-h-[85vh] overflow-y-auto gaming-shadow-neon"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-brand-primary/20 bg-dark-bg/95 backdrop-blur">
          <h3 className="font-bold text-lg gaming-text-primary">Create {modes.find(m => m.id === mode)?.label}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 px-4 py-3 border-b border-dark-border overflow-x-auto">
          {modes.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  mode === m.id
                    ? 'bg-brand-primary text-dark-bg'
                    : 'bg-dark-surface border border-dark-border text-dark-muted hover:text-brand-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Text Input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getPlaceholder(mode)}
            rows={4}
            className="w-full bg-dark-card border border-dark-border/50 rounded-lg px-4 py-3 text-dark-text text-sm resize-none focus:outline-none focus:border-brand-primary transition-colors"
          />

          {/* Mode-specific inputs */}
          {mode === 'challenge' && (
            <div className="space-y-3 p-3 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20">
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Challenge Reward</label>
                <input
                  type="text"
                  value={challengeReward}
                  onChange={(e) => setChallengeReward(e.target.value)}
                  placeholder="e.g., 100 XP, In-game currency"
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-secondary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Duration</label>
                <select
                  value={challengeDuration}
                  onChange={(e) => setChallengeDuration(e.target.value)}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-secondary"
                >
                  <option>24h</option>
                  <option>3 days</option>
                  <option>1 week</option>
                  <option>Ongoing</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'squad-lfg' && (
            <div className="space-y-3 p-3 rounded-lg bg-brand-accent/10 border border-brand-accent/20">
              <div>
                <label className="block text-xs font-bold text-brand-accent mb-1.5">Game Title</label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="e.g., Fortnite, Valorant"
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-accent mb-1.5">Looking For</label>
                <select
                  value={squadRole}
                  onChange={(e) => setSquadRole(e.target.value)}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-accent"
                >
                  <option>Any</option>
                  <option>Casual</option>
                  <option>Competitive</option>
                  <option>Speedrunner</option>
                  <option>Streamer</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'achievement' && (
            <div className="p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
              <label className="block text-xs font-bold text-brand-primary mb-1.5">Achievement Type</label>
              <select
                value={achievementType}
                onChange={(e) => setAchievementType(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand-primary"
              >
                <option value="milestone">Milestone</option>
                <option value="speedrun">Speedrun</option>
                <option value="skill">Skill Showcase</option>
                <option value="discovery">Discovery</option>
                <option value="first">First-Time Clear</option>
              </select>
            </div>
          )}

          {/* Image Preview */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-dark-border hover:border-brand-primary text-dark-muted hover:text-brand-primary transition-colors text-sm font-semibold"
            >
              + Add Screenshot/Clip
            </button>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-full mt-2 rounded-lg max-h-64 object-cover" />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-2 px-4 py-3 border-t border-dark-border bg-dark-bg/95 backdrop-blur">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-dark-border text-dark-text hover:bg-dark-hover transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!text.trim() || posting}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-primary to-brand-success text-dark-bg font-bold disabled:opacity-40 hover:shadow-lg transition-all active:scale-95"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getPlaceholder(mode) {
  switch (mode) {
    case 'challenge':
      return 'Describe your challenge... What are the rules? What do players need to do?';
    case 'squad-lfg':
      return 'Looking for squad members? Describe your playstyle and what you\'re looking for...';
    case 'achievement':
      return 'Share your achievement! What milestone did you reach?';
    default:
      return 'Share a gaming moment, thought, or update...';
  }
}
