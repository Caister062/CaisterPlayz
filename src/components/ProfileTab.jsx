import { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowLeft, LinkIcon, Calendar, X, Loader2, Camera } from 'lucide-react';
import PostCard from './PostCard';
import { Avatar, FollowButton } from './Shared';
import { followUser, unfollowUser, updateProfile } from '../hooks';
import { compressAvatar, formatCount, formatTime } from '../utils';

export default function ProfileTab({
  viewingUserId, currentUserId, users, posts,
  followingIds, allFollows, onProfileClick, onBack
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwnProfile = viewingUserId === currentUserId;
  const viewingUser = users.find(u => u.id === viewingUserId);
  const isFollowing = followingIds.includes(viewingUserId);

  // Counts for the viewing user
  const userPosts = useMemo(() =>
    posts.filter(p => p.userId === viewingUserId).sort((a, b) => {
      const aTime = new Date(a.created || 0);
      const bTime = new Date(b.created || 0);
      return bTime - aTime;
    }),
    [posts, viewingUserId]
  );

  const viewingFollowing = useMemo(() =>
    allFollows.filter(f => f.followerId === viewingUserId).length,
    [allFollows, viewingUserId]
  );

  const viewingFollowers = useMemo(() =>
    allFollows.filter(f => f.followingId === viewingUserId).length,
    [allFollows, viewingUserId]
  );

  const totalLikes = useMemo(() =>
    userPosts.reduce((sum, p) => sum + (p.likedBy || []).filter(id => id !== p.userId).length, 0),
    [userPosts]
  );

  const handleFollow = async () => {
    if (isFollowing) {
      await unfollowUser(currentUserId, viewingUserId);
    } else {
      await followUser(currentUserId, viewingUserId);
    }
  };

  if (!viewingUser) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 h-[53px] border-b border-dark-border sticky top-[53px] z-30 bg-dark-bg/95 backdrop-blur-xl">
        {!isOwnProfile && (
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-dark-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-dark-text" />
          </button>
        )}
        <div className="flex-1 overflow-hidden">
          <h2 className="font-bold text-lg text-dark-text truncate">{viewingUser.displayName}</h2>
          <p className="text-xs text-dark-muted truncate">{userPosts.length} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />

      {/* Action Button & Avatar */}
      <div className="flex justify-between items-start px-4 relative -mt-10 mb-2">
        <div className="ring-4 ring-dark-bg rounded-full bg-dark-bg">
          <Avatar src={viewingUser.avatarUrl} name={viewingUser.displayName} size="xl" />
        </div>
        <div className="pt-12">
          {isOwnProfile ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-1.5 text-sm font-bold rounded-full border border-dark-border text-dark-text hover:bg-dark-hover transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <FollowButton
              isFollowing={isFollowing}
              onClick={handleFollow}
            />
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 mb-3">
        <h3 className="text-xl font-bold text-dark-text">{viewingUser.displayName}</h3>
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
          <span className="text-sm">
            <span className="font-bold text-dark-text">{formatCount(viewingFollowing)}</span>{' '}
            <span className="text-dark-muted">Following</span>
          </span>
          <span className="text-sm">
            <span className="font-bold text-dark-text">{formatCount(viewingFollowers)}</span>{' '}
            <span className="text-dark-muted">Followers</span>
          </span>
          <span className="text-sm">
            <span className="font-bold text-dark-text">{formatCount(totalLikes)}</span>{' '}
            <span className="text-dark-muted">Likes</span>
          </span>
        </div>
      </div>

      {/* Posts Tab */}
      <div className="border-b border-dark-border">
        <div className="px-4 py-3">
          <span className="font-bold text-sm text-dark-text relative pb-3">
            Posts
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-full" />
          </span>
        </div>
      </div>

      {/* User Posts */}
      {userPosts.length > 0 ? (
        userPosts.map(post => (
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
          <p className="text-dark-muted">No posts yet</p>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={viewingUser}
          uid={currentUserId}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

/* ─── Edit Profile Modal ─── */
function EditProfileModal({ profile, uid, onClose }) {
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
    }
    setCompressing(false);
    if (fileRef.current) fileRef.current.value = '';
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
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile.');
    }
    setSaving(false);
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
            className="px-5 py-1.5 bg-white text-black font-bold text-sm rounded-full disabled:opacity-40 hover:bg-gray-200 transition-colors"
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
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
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
              type="url"
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
