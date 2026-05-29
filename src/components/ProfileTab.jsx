import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, LinkIcon, Calendar, X, Loader2, Camera, MessageCircle } from 'lucide-react';
import PostCard from './PostCard';
import { Avatar, FollowButton, Spinner } from './Shared';
import { followUser, unfollowUser, updateProfile, useUserProfile } from '../hooks';
import { compressAvatar, formatCount, formatTime } from '../utils';

export default function ProfileTab({
  viewingUserId, currentUserId, users, posts, hasMore, loadingMore,
  followingIds, allFollows, onProfileClick, onBack, onProfileUpdate, onLogout,
  onHashtagClick, onMessageClick, onQuote
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwnProfile = viewingUserId === currentUserId;
  
  // Real-time hook for the viewed profile
  const realTimeProfile = useUserProfile(viewingUserId);
  const viewingUser = realTimeProfile || users.find(u => u.id === viewingUserId);
  
  // Use a local state fallback to allow immediate/optimistic toggle feedback
  const [localIsFollowing, setLocalIsFollowing] = useState(false);

  // Sync state whenever external dependencies update
  useEffect(() => {
    setLocalIsFollowing(followingIds.includes(viewingUserId));
  }, [followingIds, viewingUserId]);

  const [profileTab, setProfileTab] = useState('posts'); // 'posts' | 'likes' | 'bookmarks'
  const [listModal, setListModal] = useState(null); // 'followers' | 'following' | null

  // Counts for the viewing user
  const userPosts = useMemo(() =>
    posts.filter(p => p.userId === viewingUserId).sort((a, b) => {
      const aTime = new Date(a.created || 0);
      const bTime = new Date(b.created || 0);
      return bTime - aTime;
    }),
    [posts, viewingUserId]
  );

  const likedPosts = useMemo(() =>
    posts.filter(p => (p.likedBy || []).includes(viewingUserId)).sort((a, b) => {
      const aTime = new Date(a.created || 0);
      const bTime = new Date(b.created || 0);
      return bTime - aTime;
    }),
    [posts, viewingUserId]
  );

  const bookmarkedPosts = useMemo(() =>
    posts.filter(p => (p.favoritedBy || []).includes(viewingUserId)).sort((a, b) => {
      const aTime = new Date(a.created || 0);
      const bTime = new Date(b.created || 0);
      return bTime - aTime;
    }),
    [posts, viewingUserId]
  );

  const followingUsers = useMemo(() => {
    const ids = allFollows.filter(f => f.followerId === viewingUserId).map(f => f.followingId);
    return users.filter(u => ids.includes(u.id));
  }, [allFollows, users, viewingUserId]);

  const followerUsers = useMemo(() => {
    const ids = allFollows.filter(f => f.followingId === viewingUserId).map(f => f.followerId);
    return users.filter(u => ids.includes(u.id));
  }, [allFollows, users, viewingUserId]);

  const activeFeedPosts = useMemo(() => {
    if (profileTab === 'likes') return likedPosts;
    if (profileTab === 'bookmarks') return bookmarkedPosts;
    return userPosts;
  }, [profileTab, userPosts, likedPosts, bookmarkedPosts]);

  const viewingFollowing = useMemo(() =>
    allFollows.filter(f => f.followerId === viewingUserId).length,
    [allFollows, viewingUserId]
  );

  const viewingFollowers = useMemo(() =>
    allFollows.filter(f => f.followingId === viewingUserId).length,
    [allFollows, viewingUserId]
  );

  const totalLikes = useMemo(() =>
    userPosts.reduce((sum, p) => sum + (p.likedBy || []).length, 0),
    [userPosts]
  );

  const handleFollow = useCallback(async () => {
    const originalState = localIsFollowing;
    // Optimistic UI Update
    setLocalIsFollowing(!originalState);
    
    try {
      if (originalState) {
        await unfollowUser(currentUserId, viewingUserId);
      } else {
        await followUser(currentUserId, viewingUserId);
      }
    } catch (err) {
      console.error("Follow transaction failed:", err);
      // Revert if API failed
      setLocalIsFollowing(originalState);
    }
  }, [localIsFollowing, currentUserId, viewingUserId]);

  if (!viewingUser) return null;

  return (
    <div className="flex-1 bg-dark-bg min-h-screen text-dark-text pb-24">
      {/* Header Profile Title */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-dark-border sticky top-0 bg-dark-bg/85 backdrop-blur z-20">
        {!isOwnProfile && (
          <button onClick={onBack} className="p-1 hover:bg-dark-hover rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-1">
            <h2 className="font-extrabold text-lg text-dark-text leading-tight">{viewingUser?.displayName}</h2>
            {viewingUser?.verified && (
              <svg className="w-4 h-4 text-brand-primary fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          <p className="text-xs text-dark-muted font-bold tracking-tight">{userPosts.length} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/10 relative" />

      {/* Action Button & Avatar */}
      <div className="flex justify-between items-start px-4 relative -mt-10 mb-2">
        <div className="ring-4 ring-dark-bg rounded-full bg-dark-bg">
          <Avatar src={viewingUser.avatarUrl} name={viewingUser.displayName} size="xl" />
        </div>
        <div className="pt-12">
          {isOwnProfile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-5 py-1.5 text-sm font-bold rounded-full border border-dark-border text-dark-text hover:bg-dark-hover transition-colors cursor-pointer"
              >
                Edit profile
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-5 py-1.5 text-sm font-bold rounded-full border border-brand-danger/30 text-brand-danger hover:bg-brand-danger/10 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onMessageClick && (
                <button
                  onClick={() => onMessageClick(viewingUser.id)}
                  className="p-2 rounded-full border border-dark-border text-dark-text hover:bg-dark-hover transition-colors cursor-pointer"
                  title="Message"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
              <FollowButton
                isFollowing={localIsFollowing}
                onClick={handleFollow}
              />
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xl font-bold text-dark-text">{viewingUser.displayName}</h3>
          {viewingUser?.verified && (
            <svg className="w-5 h-5 text-brand-primary fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          )}
        </div>
        <p className="text-sm text-dark-muted">@{viewingUser.displayName?.toLowerCase().replace(/\s+/g, '')}</p>

        {viewingUser.bio && (
          <p className="text-sm text-dark-text mt-2 leading-relaxed">{viewingUser.bio}</p>
        )}

        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {viewingUser.website && (
            <a
              href={viewingUser.website.startsWith('http') ? viewingUser.website : `https://${viewingUser.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-brand-primary text-sm hover:underline"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              {viewingUser.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span className="flex items-center gap-1 text-dark-muted text-sm">
            <Calendar className="w-3.5 h-3.5" />
            Joined {viewingUser.created ? formatTime(viewingUser.created) : 'recently'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 mt-3">
          <button
            onClick={() => setListModal('following')}
            className="text-sm cursor-pointer hover:underline text-left focus:outline-none"
          >
            <span className="font-bold text-dark-text">{formatCount(viewingFollowing)}</span>{' '}
            <span className="text-dark-muted">Following</span>
          </button>
          <button
            onClick={() => setListModal('followers')}
            className="text-sm cursor-pointer hover:underline text-left focus:outline-none"
          >
            <span className="font-bold text-dark-text">{formatCount(viewingFollowers)}</span>{' '}
            <span className="text-dark-muted">Followers</span>
          </button>
          <span className="text-sm">
            <span className="font-bold text-dark-text">{formatCount(totalLikes)}</span>{' '}
            <span className="text-dark-muted">Likes</span>
          </span>
        </div>
      </div>

      {/* Profile Sub-Tabs */}
      <div className="border-b border-dark-border flex">
        <button
          onClick={() => setProfileTab('posts')}
          className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            profileTab === 'posts' ? 'border-brand-primary text-dark-text' : 'border-transparent text-dark-muted hover:text-dark-text'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setProfileTab('likes')}
          className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            profileTab === 'likes' ? 'border-brand-primary text-dark-text' : 'border-transparent text-dark-muted hover:text-dark-text'
          }`}
        >
          Likes
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setProfileTab('bookmarks')}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
              profileTab === 'bookmarks' ? 'border-brand-primary text-dark-text' : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
          >
            Bookmarks
          </button>
        )}
      </div>

      {/* User Posts Feed */}
      {activeFeedPosts.length > 0 ? (
        <>
          {activeFeedPosts.map(post => (
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
          ))}
          {loadingMore && <Spinner />}
          {!hasMore && (
            <p className="text-center py-6 text-xs text-dark-muted font-semibold">
              You've caught up! 🎉
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-dark-muted">No posts yet</p>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={viewingUser}
          uid={currentUserId}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            onProfileUpdate?.();
          }}
        />
      )}

      {/* Followers/Following Modal */}
      {listModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-modal-overlay"
          onClick={() => setListModal(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm bg-dark-card border border-dark-border rounded-2xl flex flex-col max-h-[70vh] p-4 mx-4 shadow-2xl animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-3">
              <h3 className="font-bold text-dark-text capitalize">
                {listModal}
              </h3>
              <button 
                onClick={() => setListModal(null)}
                className="p-1 rounded-full hover:bg-dark-hover text-dark-muted hover:text-dark-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {(listModal === 'following' ? followingUsers : followerUsers).length === 0 ? (
                <p className="text-sm text-dark-muted text-center py-6">No users listed</p>
              ) : (
                (listModal === 'following' ? followingUsers : followerUsers).map(u => {
                  const isUserFollowing = followingIds.includes(u.id);
                  return (
                    <div key={u.id} className="flex items-center justify-between gap-3">
                      <div
                        onClick={() => {
                          setListModal(null);
                          onProfileClick(u.id);
                        }}
                        className="flex items-center gap-2 cursor-pointer min-w-0"
                      >
                        <Avatar src={u.avatarUrl} name={u.displayName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-dark-text truncate">{u.displayName}</p>
                          <p className="text-xs text-dark-muted truncate">@{u.displayName?.toLowerCase().replace(/\s+/g, '')}</p>
                        </div>
                      </div>
                      {u.id !== currentUserId && (
                        <FollowButton
                          isFollowing={isUserFollowing}
                          size="sm"
                          onClick={async () => {
                            if (isUserFollowing) {
                              await unfollowUser(currentUserId, u.id);
                            } else {
                              await followUser(currentUserId, u.id);
                            }
                          }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

      /* ─── Edit Profile Modal ─── */
function EditProfileModal({ profile, uid, onClose, onSaved }) {
  const [name, setName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || '');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef(null);

  // Lock body scroll
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const base64 = await compressAvatar(file);
      setAvatarPreview(base64);
      setAvatarBase64(base64);
    } catch (err) {
      console.error('Avatar compression failed:', err);
      alert('Failed to process image.');
    } finally {
      setCompressing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const data = {
        displayName: name.trim(),
        bio: bio.trim(),
        website: website.trim(),
      };
      if (avatarBase64) data.avatarUrl = avatarBase64;
      await updateProfile(uid, data);
      onClose();
      onSaved?.();
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 animate-modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-dark-bg border border-dark-border rounded-2xl overflow-hidden animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-dark-hover transition-colors">
              <X className="w-5 h-5 text-dark-text" />
            </button>
            <h3 className="font-bold text-lg text-dark-text">Edit profile</h3>
          </div>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="px-5 py-1.5 bg-white text-black font-bold text-sm rounded-full disabled:opacity-40 hover:bg-gray-200 transition-colors flex items-center justify-center min-w-[70px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-dark-border bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">{(name || '?')[0].toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={compressing}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
              >
                {compressing ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-xs text-dark-muted mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-muted mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2.5 text-dark-text text-sm resize-none focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p className="text-right text-xs text-dark-muted mt-1">{bio.length}/160</p>
          </div>
          <div>
            <label className="block text-xs text-dark-muted mb-1.5">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://caisterplayz.com"
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-2.5 text-dark-text text-sm focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
