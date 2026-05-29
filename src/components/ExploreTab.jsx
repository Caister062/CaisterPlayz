import { useState, useMemo } from 'react';
import { Search, TrendingUp, X, Hash, Sparkles, Tv, Compass, Flame } from 'lucide-react';
import PostCard from './PostCard';
import { Avatar, FollowButton } from './Shared';
import { followUser, unfollowUser } from '../hooks';
import { engagementScore, getTrendingHashtags } from '../utils';

export default function ExploreTab({ posts, currentUserId, users, followingIds, onProfileClick, searchQuery, setSearchQuery, onCommentClick, onLike, onRepost, onQuote, onDelete }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('foryou'); // 'foryou' | 'trending' | 'entertainment' | 'inspiration'

  // Who to Follow: users NOT already followed and NOT self
  const whoToFollow = useMemo(() =>
    users
      .filter(u => u.id !== currentUserId && !followingIds.includes(u.id))
      .slice(0, 6),
    [users, currentUserId, followingIds]
  );

  // Calculate trending hashtags using getTrendingHashtags
  const trendingHashtags = useMemo(() =>
    getTrendingHashtags(posts).slice(0, 4),
    [posts]
  );

  // Sub-Feeds Logic:
  // 1. For You: Mixed chronological feed of people followed + other popular users
  const forYouPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        // Boost followed users slightly, but keep chronological order mostly
        const scoreA = (followingIds.includes(a.userId) ? 1.5 : 1) * new Date(a.created || a.id).getTime();
        const scoreB = (followingIds.includes(b.userId) ? 1.5 : 1) * new Date(b.created || b.id).getTime();
        return scoreB - scoreA;
      })
      .slice(0, 20);
  }, [posts, followingIds]);

  // 2. Trending: Top engagement posts (all posts sorted by engagement score)
  const trendingPosts = useMemo(() =>
    [...posts]
      .sort((a, b) => engagementScore(b) - engagementScore(a))
      .slice(0, 20),
    [posts]
  );

  // 3. Entertainment: Posts containing media or music
  const entertainmentPosts = useMemo(() =>
    posts
      .filter(p => p.imageUrl || p.musicId)
      .slice(0, 20),
    [posts]
  );

  // 4. Inspiration: Top engage score posts + engagement metrics
  const inspirationPosts = useMemo(() =>
    [...posts]
      .sort((a, b) => engagementScore(b) - engagementScore(a))
      .slice(0, 10),
    [posts]
  );

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { users: [], posts: [] };
    const q = searchQuery.toLowerCase();
    return {
      users: users.filter(u =>
        u.id !== currentUserId &&
        (u.displayName?.toLowerCase().includes(q) ||
         u.displayName?.toLowerCase().replace(/\s+/g, '').includes(q))
      ),
      posts: posts.filter(p =>
        p.text?.toLowerCase().includes(q)
      )
    };
  }, [searchQuery, users, posts, currentUserId]);

  const handleFollow = async (userId) => {
    if (followingIds.includes(userId)) {
      await unfollowUser(currentUserId, userId);
    } else {
      await followUser(currentUserId, userId);
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  // Active posts array based on sub-tab
  const getSubTabPosts = () => {
    switch (activeSubTab) {
      case 'trending':
        return trendingPosts;
      case 'entertainment':
        return entertainmentPosts;
      case 'inspiration':
        return inspirationPosts;
      case 'foryou':
      default:
        return forYouPosts;
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="px-4 h-[60px] flex flex-col justify-center sticky top-[53px] z-30 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border">
        <div className={`flex items-center gap-2 bg-dark-surface rounded-full px-4 py-2 border transition-colors ${
          searchFocused ? 'border-brand-primary' : 'border-dark-border'
        }`}>
          <Search className={`w-4 h-4 flex-shrink-0 ${searchFocused ? 'text-brand-primary' : 'text-dark-muted'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search users, posts, or tags"
            className="flex-1 bg-transparent text-dark-text text-xs placeholder-dark-muted focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-brand-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        /* ─── Search Results ─── */
        <div className="animate-fade-in">
          {/* User Results */}
          {searchResults.users.length > 0 && (
            <div className="border-b border-dark-border">
              <h3 className="px-4 py-3 font-bold text-xs text-dark-muted uppercase tracking-wider">People</h3>
              {searchResults.users.map(user => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-dark-hover/50 transition-colors">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onProfileClick(user.id)}>
                    <Avatar src={user.avatarUrl} name={user.displayName} size="md" />
                    <div>
                      <p className="font-bold text-sm text-dark-text">{user.displayName}</p>
                      <p className="text-xs text-dark-muted">@{user.displayName?.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>
                  </div>
                  <FollowButton
                    isFollowing={followingIds.includes(user.id)}
                    onClick={() => handleFollow(user.id)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Post Results */}
          {searchResults.posts.length > 0 && (
            <div>
              <h3 className="px-4 py-3 font-bold text-xs text-dark-muted uppercase tracking-wider">Posts</h3>
              {searchResults.posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={{ id: currentUserId }}
                  users={users}
                  onProfileClick={onProfileClick}
                  onCommentClick={onCommentClick}
                  onLike={onLike}
                  onRepost={onRepost}
                  onQuote={onQuote}
                  onDelete={onDelete}
                  onHashtagClick={(tag) => setSearchQuery(tag)}
                />
              ))}
            </div>
          )}

          {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xs text-dark-muted">No results for "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── Default Explore View ─── */
        <>
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-dark-border bg-dark-bg/60 sticky top-[113px] z-20 backdrop-blur-md overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveSubTab('foryou')}
              className={`flex-1 py-3 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 min-w-[90px] ${
                activeSubTab === 'foryou' ? 'text-brand-primary' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              For You
              {activeSubTab === 'foryou' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full" />}
            </button>

            <button
              onClick={() => setActiveSubTab('trending')}
              className={`flex-1 py-3 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 min-w-[90px] ${
                activeSubTab === 'trending' ? 'text-brand-primary' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Trending
              {activeSubTab === 'trending' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full" />}
            </button>

            <button
              onClick={() => setActiveSubTab('entertainment')}
              className={`flex-1 py-3 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 min-w-[110px] ${
                activeSubTab === 'entertainment' ? 'text-brand-primary' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Entertainment
              {activeSubTab === 'entertainment' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full" />}
            </button>

            <button
              onClick={() => setActiveSubTab('inspiration')}
              className={`flex-1 py-3 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 min-w-[100px] ${
                activeSubTab === 'inspiration' ? 'text-brand-primary' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Inspiration
              {activeSubTab === 'inspiration' && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full" />}
            </button>
          </div>

          {/* Sub Tab Specific Widgets */}
          {activeSubTab === 'foryou' && trendingHashtags.length > 0 && (
            <div className="border-b border-dark-border py-4 px-4 animate-fade-in bg-dark-surface/10">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Hash className="w-4 h-4 text-brand-primary" />
                <h3 className="font-bold text-xs text-dark-text uppercase tracking-wider">Trending Hashtags</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {trendingHashtags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="flex flex-col items-start p-2.5 bg-dark-surface border border-dark-border hover:border-brand-primary/30 hover:bg-dark-hover rounded-xl transition-all duration-200 text-left active:scale-[0.98]"
                  >
                    <span className="text-brand-primary font-bold text-xs truncate w-full">
                      {tag}
                    </span>
                    <span className="text-[10px] text-dark-muted mt-0.5">
                      {count} {count === 1 ? 'post' : 'posts'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'trending' && whoToFollow.length > 0 && (
            <div className="border-b border-dark-border py-4">
              <h3 className="px-4 font-bold text-xs text-dark-muted uppercase tracking-wider mb-2.5">Recommended Creators</h3>
              <div className="flex gap-3 px-4 overflow-x-auto snap-container pb-2" style={{ scrollbarWidth: 'none' }}>
                {whoToFollow.map(user => (
                  <div
                    key={user.id}
                    className="snap-item flex-shrink-0 w-[140px] bg-dark-surface border border-dark-border rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-dark-hover transition-colors"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      name={user.displayName}
                      size="md"
                      onClick={() => onProfileClick(user.id)}
                    />
                    <p className="font-bold text-xs text-dark-text text-center truncate w-full">
                      {user.displayName}
                    </p>
                    <p className="text-[10px] text-dark-muted truncate w-full text-center">
                      @{user.displayName?.toLowerCase().replace(/\s+/g, '')}
                    </p>
                    <div className="w-full mt-1">
                      <FollowButton
                        isFollowing={followingIds.includes(user.id)}
                        onClick={() => handleFollow(user.id)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'inspiration' && (
            <div className="border-b border-dark-border p-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-brand-secondary animate-bounce mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-dark-text uppercase tracking-wider">Creator Dashboard Inspiration</h4>
                  <p className="text-[11px] text-dark-muted mt-1 leading-normal">
                    These posts have the highest engagement multiplier today. Examine their structures, images, or music tags to optimize your next creation and earn more revenue!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab Feed List */}
          <div className="divide-y divide-dark-border">
            {getSubTabPosts().length > 0 ? (
              getSubTabPosts().map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={{ id: currentUserId }}
                  users={users}
                  onProfileClick={onProfileClick}
                  onCommentClick={onCommentClick}
                  onLike={onLike}
                  onRepost={onRepost}
                  onQuote={onQuote}
                  onDelete={onDelete}
                  onHashtagClick={(tag) => setSearchQuery(tag)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-dark-muted">No content found under this feed</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
