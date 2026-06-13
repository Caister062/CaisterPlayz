import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, LinkIcon, Calendar, X, Loader2, Camera, MessageCircle } from 'lucide-react';
import PostCard from './PostCard';
import { Avatar, FollowButton, Spinner } from './Shared';
import { followUser, unfollowUser, updateProfile, useUserProfile } from '../hooks';
import { compressAvatar, formatCount, formatTime } from '../utils';

export default function ProfileTab({
  viewingUserId,
  currentUserId,
  users,
  posts,
  hasMore,
  loadingMore,
  followingIds,
  allFollows,
  onProfileClick,
  onBack,
  onProfileUpdate,
  onLogout,
  onHashtagClick,
  onMessageClick,
  onQuote
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileTab, setProfileTab] = useState('posts');
  const [listModal, setListModal] = useState(null);

  const isOwnProfile = viewingUserId === currentUserId;

  const realTimeProfile = useUserProfile(viewingUserId);

  const viewingUser =
    realTimeProfile ||
    (users || []).find(u => u.id === viewingUserId);

  const [localIsFollowing, setLocalIsFollowing] = useState(false);

  useEffect(() => {
    setLocalIsFollowing(
      (followingIds || []).includes(viewingUserId)
    );
  }, [followingIds, viewingUserId]);

  // ----------------------------
  // PERFORMANCE: sort once
  // ----------------------------
  const sortedPosts = useMemo(() => {
    return [...(posts || [])].sort(
      (a, b) => new Date(b.created || 0) - new Date(a.created || 0)
    );
  }, [posts]);

  const userPosts = useMemo(
    () => sortedPosts.filter(p => p.userId === viewingUserId),
    [sortedPosts, viewingUserId]
  );

  const likedPosts = useMemo(
    () => sortedPosts.filter(p => (p.likedBy || []).includes(viewingUserId)),
    [sortedPosts, viewingUserId]
  );

  const bookmarkedPosts = useMemo(
    () => sortedPosts.filter(p => (p.favoritedBy || []).includes(viewingUserId)),
    [sortedPosts, viewingUserId]
  );

  const activeFeedPosts = useMemo(() => {
    if (profileTab === 'likes') return likedPosts;
    if (profileTab === 'bookmarks') return bookmarkedPosts;
    return userPosts;
  }, [profileTab, userPosts, likedPosts, bookmarkedPosts]);

  // ----------------------------
  // FOLLOWERS / FOLLOWING (optimized)
  // ----------------------------
  const followingUsers = useMemo(() => {
    const idSet = new Set(
      (allFollows || [])
        .filter(f => f.followerId === viewingUserId)
        .map(f => f.followingId)
    );

    return (users || []).filter(u => idSet.has(u.id));
  }, [allFollows, users, viewingUserId]);

  const followerUsers = useMemo(() => {
    const idSet = new Set(
      (allFollows || [])
        .filter(f => f.followingId === viewingUserId)
        .map(f => f.followerId)
    );

    return (users || []).filter(u => idSet.has(u.id));
  }, [allFollows, users, viewingUserId]);

  const viewingFollowing = useMemo(
    () => (allFollows || []).filter(f => f.followerId === viewingUserId).length,
    [allFollows, viewingUserId]
  );

  const viewingFollowers = useMemo(
    () => (allFollows || []).filter(f => f.followingId === viewingUserId).length,
    [allFollows, viewingUserId]
  );

  const totalLikes = useMemo(
    () => userPosts.reduce((sum, p) => sum + (p.likedBy || []).length, 0),
    [userPosts]
  );

  // ----------------------------
  // FIXED FOLLOW LOGIC
  // ----------------------------
  const handleFollow = useCallback(async () => {
    let originalState;

    setLocalIsFollowing(prev => {
      originalState = prev;
      return !prev;
    });

    try {
      if (originalState) {
        await unfollowUser(currentUserId, viewingUserId);
      } else {
        await followUser(currentUserId, viewingUserId);
      }
    } catch (err) {
      console.error("Follow transaction failed:", err);
      setLocalIsFollowing(originalState);
    }
  }, [currentUserId, viewingUserId]);

  if (!viewingUser) return null;

  return (
    <div className="flex-1 bg-dark-bg min-h-screen text-dark-text pb-24">

      {/* Header */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-dark-border sticky top-0 bg-dark-bg/85 backdrop-blur z-20">
        {!isOwnProfile && (
          <button onClick={onBack} className="p-1 hover:bg-dark-hover rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-1">
            <h2 className="font-extrabold text-lg">{viewingUser?.displayName}</h2>
            {viewingUser?.verified && (
              <svg className="w-4 h-4 text-brand-primary fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          <p className="text-xs text-dark-muted">{userPosts.length} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20" />

      {/* Avatar + Actions */}
      <div className="flex justify-between px-4 -mt-10">
        <Avatar src={viewingUser.avatarUrl} name={viewingUser.displayName} size="xl" />

        <div className="pt-12 flex gap-2">
          {isOwnProfile ? (
            <>
              <button onClick={() => setShowEditModal(true)}>Edit profile</button>
              {onLogout && <button onClick={onLogout}>Sign out</button>}
            </>
          ) : (
            <>
              {onMessageClick && (
                <button onClick={() => onMessageClick(viewingUser.id)}>
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
              <FollowButton
                isFollowing={localIsFollowing}
                onClick={handleFollow}
              />
            </>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="px-4 mt-3">
        <h3 className="text-xl font-bold">{viewingUser.displayName}</h3>
        <p className="text-sm text-dark-muted">
          @{viewingUser.displayName?.toLowerCase().replace(/\s+/g, '')}
        </p>

        {viewingUser.bio && (
          <p className="mt-2">{viewingUser.bio}</p>
        )}

        <div className="flex gap-4 mt-2 text-sm text-dark-muted">
          <span>{formatCount(viewingFollowing)} Following</span>
          <span>{formatCount(viewingFollowers)} Followers</span>
          <span>{formatCount(totalLikes)} Likes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-border mt-3">
        {['posts', 'likes', 'bookmarks'].map(tab => (
          <button
            key={tab}
            onClick={() => setProfileTab(tab)}
            className={`flex-1 py-3 text-sm font-bold ${
              profileTab === tab ? 'border-b-2 border-brand-primary' : ''
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed */}
      {activeFeedPosts.length > 0 ? (
        activeFeedPosts.map(post => (
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
        <div className="text-center py-12 text-dark-muted">
          No posts yet
        </div>
      )}

      {loadingMore && <Spinner />}

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={viewingUser}
          uid={currentUserId}
          onClose={() => setShowEditModal(false)}
          onSaved={() => onProfileUpdate?.()}
        />
      )}

      {/* Followers Modal */}
      {listModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setListModal(null)}
          />

          <div className="relative bg-dark-card p-4 rounded-xl w-full max-w-sm">
            {(listModal === 'following' ? followingUsers : followerUsers)
              .map(u => (
                <div key={u.id} className="flex justify-between py-2">
                  <div onClick={() => onProfileClick(u.id)}>
                    {u.displayName}
                  </div>
                  {u.id !== currentUserId && (
                    <FollowButton
                      isFollowing={followingIds.includes(u.id)}
                      size="sm"
                      onClick={() =>
                        followingIds.includes(u.id)
                          ? unfollowUser(currentUserId, u.id)
                          : followUser(currentUserId, u.id)
                      }
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- EDIT PROFILE MODAL ---------------- */

function EditProfileModal({ profile, uid, onClose, onSaved }) {
  const [name, setName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || '');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef(null);

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
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      const data = {
        displayName: name.trim(),
        bio: bio.trim(),
        website: website.trim(),
        ...(avatarBase64 && { avatarUrl: avatarBase64 })
      };

      await updateProfile(uid, data);
      onClose();
      onSaved?.();
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-dark-bg p-4 rounded-xl w-full max-w-lg">
        <h2>Edit Profile</h2>

        <input value={name} onChange={e => setName(e.target.value)} />
        <textarea value={bio} onChange={e => setBio(e.target.value)} />

        <button onClick={handleSave}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
