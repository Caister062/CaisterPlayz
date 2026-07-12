import { useState, useCallback, useMemo } from 'react';
import { Zap, Flame, Trophy, Users, Target, TrendingUp } from 'lucide-react';
import PostCard from './PostCard';
import GamePlayComposer from './GamePlayComposer';

/**
 * GamingFeedManager
 * Renders posts with gaming-aware filtering, sorting, and interactions
 * Different from traditional social feeds - focuses on gaming-specific content
 */
export default function GamingFeedManager({
  posts,
  users,
  communities,
  currentUserId,
  profile,
  onProfileClick,
  onHashtagClick,
  onQuote
}) {
  const [feedMode, setFeedMode] = useState('trending'); // 'trending', 'achievements', 'squads', 'challenges', 'highlights'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'engagement', 'hottest'

  // Filter posts by type
  const achievementPosts = useMemo(() =>
    posts.filter(p => p.type === 'achievement'),
    [posts]
  );

  const squadPosts = useMemo(() =>
    posts.filter(p => p.type === 'squad'),
    [posts]
  );

  const challengePosts = useMemo(() =>
    posts.filter(p => p.type === 'mission'),
    [posts]
  );

  const highlightPosts = useMemo(() =>
    posts.filter(p => p.type === 'highlight' || p.imageUrl),
    [posts]
  );

  // Calculate engagement scores for trending
  const getEngagementScore = useCallback((post) => {
    const rc = (arr) => (arr || []).filter(id => id !== post.userId).length;
    const likes = rc(post.likedBy);
    const reposts = rc(post.repostedBy);
    const views = rc(post.viewedBy) * 0.1;
    return likes * 10 + reposts * 20 + views;
  }, []);

  // Get hotness (recently engaged)
  const getHotness = useCallback((post) => {
    const created = new Date(post.created).getTime();
    const now = new Date().getTime();
    const ageHours = (now - created) / (1000 * 60 * 60);
    const engagement = getEngagementScore(post);
    
    // Decay formula: fresh + engaged posts rank higher
    return engagement / (1 + ageHours / 6);
  }, [getEngagementScore]);

  // Get active feed based on mode
  const activeFeed = useMemo(() => {
    let filtered = posts;

    switch (feedMode) {
      case 'achievements':
        filtered = achievementPosts;
        break;
      case 'squads':
        filtered = squadPosts;
        break;
      case 'challenges':
        filtered = challengePosts;
        break;
      case 'highlights':
        filtered = highlightPosts;
        break;
      default:
        filtered = posts;
    }

    // Sort
    if (sortBy === 'engagement') {
      return [...filtered].sort((a, b) => getEngagementScore(b) - getEngagementScore(a));
    } else if (sortBy === 'hottest') {
      return [...filtered].sort((a, b) => getHotness(b) - getHotness(a));
    } else {
      return [...filtered].sort((a, b) => new Date(b.created) - new Date(a.created));
    }
  }, [posts, feedMode, sortBy, achievementPosts, squadPosts, challengePosts, highlightPosts, getEngagementScore, getHotness]);

  const feedModes = [
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-brand-primary' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'text-brand-accent' },
    { id: 'squads', label: 'Squad LFG', icon: Users, color: 'text-brand-secondary' },
    { id: 'challenges', label: 'Challenges', icon: Target, color: 'text-brand-success' },
    { id: 'highlights', label: 'Highlights', icon: Flame, color: 'text-brand-danger' },
  ];

  const sortModes = [
    { id: 'recent', label: 'Recent' },
    { id: 'engagement', label: 'Top Engagement' },
    { id: 'hottest', label: 'Hottest Now' },
  ];

  return (
    <div className="w-full">
      {/* Composer Section */}
      <GamePlayComposer
        currentUserId={currentUserId}
        profile={profile}
        communities={communities}
        users={users}
      />

      {/* Feed Mode Tabs */}
      <div className="sticky top-14 z-30 border-b border-dark-border/50 bg-dark-bg/80 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
          {feedModes.map(mode => {
            const Icon = mode.icon;
            const isActive = feedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setFeedMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r from-brand-primary to-brand-secondary text-dark-bg shadow-lg`
                    : 'bg-dark-card border border-dark-border/50 text-dark-muted hover:text-brand-primary hover:border-brand-primary/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-b border-dark-border/50 px-4 py-2 bg-dark-surface/20">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {sortModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSortBy(mode.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                sortBy === mode.id
                  ? 'bg-brand-primary text-dark-bg'
                  : 'bg-dark-card border border-dark-border text-dark-muted hover:bg-dark-hover'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div>
        {activeFeed.length > 0 ? (
          activeFeed.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              users={users}
              onProfileClick={onProfileClick}
              onHashtagClick={onHashtagClick}
              onQuote={onQuote}
              posts={posts}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-dark-muted/30 mx-auto mb-3" />
            <p className="text-dark-muted font-semibold">No gaming posts in this category yet</p>
            <p className="text-xs text-dark-muted mt-1">Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}
