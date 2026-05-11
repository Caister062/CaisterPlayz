import { useState, useMemo } from 'react';
import { Search, TrendingUp, X } from 'lucide-react';
import PostCard from './PostCard';
import { Avatar, FollowButton } from './Shared';
import { followUser, unfollowUser } from '../hooks';
import { engagementScore } from '../utils';

export default function ExploreTab({ posts, currentUserId, users, followingIds, onProfileClick, searchQuery, setSearchQuery }) {
  const [searchFocused, setSearchFocused] = useState(false);

  // Who to Follow: users NOT already followed and NOT self
  const whoToFollow = useMemo(() =>
    users
      .filter(u => u.id !== currentUserId && !followingIds.includes(u.id))
      .slice(0, 6),
    [users, currentUserId, followingIds]
  );

  // Trending: top 15 posts by engagement (excluding own)
  const trendingPosts = useMemo(() =>
    posts
      .filter(p => p.userId !== currentUserId)
      .sort((a, b) => engagementScore(b) - engagementScore(a))
      .slice(0, 15),
    [posts, currentUserId]
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

  return (
    <div>
      {/* Search Bar */}
      <div className="px-4 h-[60px] flex flex-col justify-center sticky top-[53px] z-30 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border">
        <div className={`flex items-center gap-2 bg-dark-surface rounded-full px-4 py-2.5 border transition-colors ${
          searchFocused ? 'border-brand-primary' : 'border-dark-border'
        }`}>
          <Search className={`w-5 h-5 flex-shrink-0 ${searchFocused ? 'text-brand-primary' : 'text-dark-muted'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search users and posts"
            className="flex-1 bg-transparent text-dark-text text-sm placeholder-dark-muted focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-brand-primary">
              <X className="w-4 h-4" />
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
              <h3 className="px-4 py-3 font-bold text-dark-text">People</h3>
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
              <h3 className="px-4 py-3 font-bold text-dark-text">Posts</h3>
              {searchResults.posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  users={users}
                  onProfileClick={onProfileClick}
                />
              ))}
            </div>
          )}

          {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-muted">No results for "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── Default Explore View ─── */
        <>
          {/* Who to Follow Carousel */}
          {whoToFollow.length > 0 && (
            <div className="border-b border-dark-border py-4">
              <h3 className="px-4 font-bold text-xl text-dark-text mb-3">Who to follow</h3>
              <div className="flex gap-3 px-4 overflow-x-auto snap-container pb-2" style={{ scrollbarWidth: 'none' }}>
                {whoToFollow.map(user => (
                  <div
                    key={user.id}
                    className="snap-item flex-shrink-0 w-[160px] bg-dark-surface border border-dark-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-dark-hover transition-colors"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      name={user.displayName}
                      size="lg"
                      onClick={() => onProfileClick(user.id)}
                    />
                    <p className="font-bold text-sm text-dark-text text-center truncate w-full">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-dark-muted truncate w-full text-center">
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

          {/* Trending Feed */}
          <div>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-border">
              <TrendingUp className="w-5 h-5 text-brand-accent" />
              <h3 className="font-bold text-xl text-dark-text">Trending</h3>
            </div>
            {trendingPosts.length > 0 ? (
              trendingPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  users={users}
                  onProfileClick={onProfileClick}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-dark-muted">No trending posts yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
