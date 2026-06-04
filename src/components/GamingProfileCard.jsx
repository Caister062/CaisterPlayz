import { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, X, Loader2, Zap, Flame, Crown, Target } from 'lucide-react';
import PostCard from './PostCard';
import { Avatar, FollowButton, Spinner } from './Shared';
import { followUser, unfollowUser, updateProfile, useUserProfile } from '../hooks';
import { formatCount, formatTime } from '../utils';

export default function GamingProfileCard({
  viewingUserId, currentUserId, users, posts, allFollows, onProfileClick, onBack, onLogout,
  onHashtagClick, onMessageClick, onQuote
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwnProfile = viewingUserId === currentUserId;
  
  const realTimeProfile = useUserProfile(viewingUserId);
  const viewingUser = realTimeProfile || (users || []).find(u => u.id === viewingUserId);
  
  const [localIsFollowing, setLocalIsFollowing] = useState(false);

  const userPosts = useMemo(() =>
    posts.filter(p => p.userId === viewingUserId).sort((a, b) => {
      const aTime = new Date(a.created || 0);
      const bTime = new Date(b.created || 0);
      return bTime - aTime;
    }),
    [posts, viewingUserId]
  );

  // Gaming-specific stats
  const achievements = useMemo(() =>
    userPosts.filter(p => p.type === 'achievement').length,
    [userPosts]
  );

  const squadPosts = useMemo(() =>
    userPosts.filter(p => p.type === 'squad').length,
    [userPosts]
  );

  const challenges = useMemo(() =>
    userPosts.filter(p => p.type === 'mission').length,
    [userPosts]
  );

  const totalReputation = useMemo(() =>
    userPosts.reduce((sum, p) => sum + (p.likedBy || []).length, 0),
    [userPosts]
  );

  const viewingFollowers = useMemo(() =>
    (allFollows || []).filter(f => f.followingId === viewingUserId).length,
    [allFollows, viewingUserId]
  );

  const handleFollow = useCallback(async () => {
    const originalState = localIsFollowing;
    setLocalIsFollowing(!originalState);
    
    try {
      if (originalState) {
        await unfollowUser(currentUserId, viewingUserId);
      } else {
        await followUser(currentUserId, viewingUserId);
      }
    } catch (err) {
      console.error("Follow failed:", err);
      setLocalIsFollowing(originalState);
    }
  }, [localIsFollowing, currentUserId, viewingUserId]);

  if (!viewingUser) return null;

  return (
    <div className="flex-1 bg-dark-bg min-h-screen text-dark-text pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border/50 sticky top-0 bg-dark-bg/85 backdrop-blur z-20">
        {!isOwnProfile && (
          <button onClick={onBack} className="p-1 hover:bg-dark-hover rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="font-bold text-lg text-dark-text">{viewingUser?.displayName}</h2>
          <p className="text-xs text-dark-muted font-semibold">{userPosts.length} Posts</p>
        </div>
      </div>

      {/* Gaming Banner */}
      <div className="relative h-40 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/15 to-brand-accent/10 overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Crown className="w-32 h-32" />
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4">
        {/* Avatar & Action Buttons */}
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="ring-4 ring-dark-bg rounded-full bg-dark-bg">
            <Avatar src={viewingUser.avatarUrl} name={viewingUser.displayName} size="xl" />
          </div>
          <div className="pt-4">
            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-sm font-bold rounded-lg gaming-card hover:neon-border transition-all"
                >
                  Edit Profile
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-bold rounded-lg gaming-card text-brand-danger hover:bg-brand-danger/10 transition-all"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <FollowButton isFollowing={localIsFollowing} onClick={handleFollow} />
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-dark-text gaming-text-primary">{viewingUser.displayName}</h3>
          <p className="text-sm text-dark-muted">@{viewingUser.displayName?.toLowerCase().replace(/\s+/g, '')}</p>
          {viewingUser.bio && (
            <p className="text-sm text-dark-text mt-2">{viewingUser.bio}</p>
          )}
        </div>

        {/* Gaming Stats Grid */}
        <div className="gaming-grid mb-6">
          <div className="gaming-card border border-brand-primary/30">
            <Flame className="w-6 h-6 text-brand-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-brand-primary text-center">{formatCount(totalReputation)}</p>
            <p className="text-xs text-dark-muted text-center">Reputation</p>
          </div>
          
          <div className="gaming-card border border-brand-secondary/30">
            <Crown className="w-6 h-6 text-brand-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-brand-secondary text-center">{achievements}</p>
            <p className="text-xs text-dark-muted text-center">Achievements</p>
          </div>
          
          <div className="gaming-card border border-brand-accent/30">
            <Target className="w-6 h-6 text-brand-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-brand-accent text-center">{challenges}</p>
            <p className="text-xs text-dark-muted text-center">Challenges</p>
          </div>
          
          <div className="gaming-card border border-brand-success/30">
            <Zap className="w-6 h-6 text-brand-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-brand-success text-center">{squadPosts}</p>
            <p className="text-xs text-dark-muted text-center">Squad Posts</p>
          </div>
        </div>

        {/* Social Stats */}
        <div className="flex gap-4 mb-6 text-sm">
          <div>
            <p className="font-bold text-dark-text">{formatCount(viewingFollowers)}</p>
            <p className="text-dark-muted">Followers</p>
          </div>
          <div>
            <p className="font-bold text-dark-text">{userPosts.length}</p>
            <p className="text-dark-muted">Posts</p>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="border-t border-dark-border/50">
        {userPosts.length > 0 ? (
          userPosts.map(post => (
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
            <p className="text-dark-muted">No gameplay posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
