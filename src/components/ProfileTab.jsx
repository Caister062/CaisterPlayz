import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, X, Loader2, Camera, MessageCircle } from 'lucide-react';
import PostCard from './PostCard';
import { Avatar, FollowButton, Spinner } from './Shared';
import { followUser, unfollowUser, updateProfile, useUserProfile } from '../hooks';
import { compressAvatar, formatCount } from '../utils';

export default function ProfileTab({
  viewingUserId,
  currentUserId,
  users,
  posts,
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
  const [profileTab, setProfileTab] = useState('broadcasts');
  const [listModal, setListModal] = useState(null);

  const isOwnProfile = viewingUserId === currentUserId;
  const realTimeProfile = useUserProfile(viewingUserId);

  const viewingUser =
    realTimeProfile ||
    (users || []).find(u => u.id === viewingUserId);

  const [localIsFollowing, setLocalIsFollowing] = useState(false);

  useEffect(() => {
    setLocalIsFollowing((followingIds || []).includes(viewingUserId));
  }, [followingIds, viewingUserId]);

  const sortedPosts = useMemo(() => {
    return [...(posts || [])].sort(
      (a, b) => new Date(b.created || 0) - new Date(a.created || 0)
    );
  }, [posts]);

  const userPosts = useMemo(
    () => sortedPosts.filter(p => p.userId === viewingUserId),
    [sortedPosts, viewingUserId]
  );

  const energyPosts = useMemo(
    () => sortedPosts.filter(p => (p.likedBy || []).includes(viewingUserId)),
    [sortedPosts, viewingUserId]
  );

  const anchoredPosts = useMemo(
    () => sortedPosts.filter(p => (p.favoritedBy || []).includes(viewingUserId)),
    [sortedPosts, viewingUserId]
  );

  const activeFeedPosts = useMemo(() => {
    if (profileTab === 'energy') return energyPosts;
    if (profileTab === 'anchors') return anchoredPosts;
    return userPosts;
  }, [profileTab, userPosts, energyPosts, anchoredPosts]);

  const connectedUsers = useMemo(() => {
    const idSet = new Set(
      (allFollows || [])
        .filter(f => f.followerId === viewingUserId)
        .map(f => f.followingId)
    );

    return (users || []).filter(u => idSet.has(u.id));
  }, [allFollows, users, viewingUserId]);

  const reachUsers = useMemo(() => {
    const idSet = new Set(
      (allFollows || [])
        .filter(f => f.followingId === viewingUserId)
        .map(f => f.followerId)
    );

    return (users || []).filter(u => idSet.has(u.id));
  }, [allFollows, users, viewingUserId]);

  const connections = connectedUsers.length;
  const signalReach = reachUsers.length;

  const totalEnergy = useMemo(
    () => userPosts.reduce((sum, p) => sum + (p.likedBy || []).length, 0),
    [userPosts]
  );

  const signalName = viewingUser?.displayName
    ?.toLowerCase()
    .replace(/\s+/g, '') || 'signal';

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
      console.error('Connection failed:', err);
      setLocalIsFollowing(originalState);
    }
  }, [currentUserId, viewingUserId]);

  if (!viewingUser) return null;

  return (
    <div className="flex-1 bg-dark-bg min-h-screen text-dark-text pb-24">

      {/* SIGNAL CORE HEADER */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-dark-border sticky top-0 bg-dark-bg/85 backdrop-blur z-20">
        {!isOwnProfile && (
          <button onClick={onBack} className="p-1 hover:bg-dark-hover rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-1">
            <h2 className="font-extrabold text-lg">
              Signal Core
            </h2>

            {viewingUser?.verified && (
              <svg className="w-4 h-4 text-brand-primary fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>

          <p className="text-xs text-dark-muted">
            {userPosts.length} broadcasts active
          </p>
        </div>
      </div>

      {/* SIGNAL BANNER */}
      <div className="h-36 bg-gradient-to-r from-brand-primary/30 via-brand-secondary/20 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-6 left-8 w-24 h-24 rounded-full bg-brand-primary/30 blur-2xl" />
          <div className="absolute bottom-4 right-10 w-28 h-28 rounded-full bg-green-500/20 blur-2xl" />
        </div>
      </div>

      {/* AVATAR + ACTIONS */}
      <div className="flex justify-between px-4 -mt-10">
        <Avatar
          src={viewingUser.avatarUrl}
          name={viewingUser.displayName}
          size="xl"
        />

        <div className="pt-12 flex gap-2">
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-xl border border-dark-border bg-dark-card text-sm font-bold"
              >
                Edit Core
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl border border-dark-border bg-dark-card text-sm font-bold"
                >
                  Disconnect
                </button>
              )}
            </>
          ) : (
            <>
              {onMessageClick && (
                <button
                  onClick={() => onMessageClick(viewingUser.id)}
                  className="p-2 rounded-xl border border-dark-border bg-dark-card"
                >
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

      {/* SIGNAL INFO */}
      <div className="px-4 mt-3">
        <h3 className="text-xl font-bold">{viewingUser.displayName}</h3>

        <p className="text-sm text-brand-primary font-bold">
          @{signalName}.core
        </p>

        {viewingUser.bio && (
          <p className="mt-2 text-sm leading-relaxed">
            {viewingUser.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
          <CoreStat
            label="Connections"
            value={formatCount(connections)}
            onClick={() => setListModal('connections')}
          />

          <CoreStat
            label="Signal Reach"
            value={formatCount(signalReach)}
            onClick={() => setListModal('reach')}
          />

          <CoreStat
            label="Energy"
            value={formatCount(totalEnergy)}
          />
        </div>
      </div>

      {/* CORE TABS */}
      <div className="flex border-b border-dark-border mt-4">
        {[
          { key: 'broadcasts', label: 'Broadcasts' },
          { key: 'energy', label: 'Energy' },
          { key: 'anchors', label: 'Anchors' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setProfileTab(tab.key)}
            className={`flex-1 py-3 text-sm font-bold ${
              profileTab === tab.key
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-dark-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SIGNAL STREAM */}
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
          No signals found
        </div>
      )}

      {loadingMore && <Spinner />}

      {/* EDIT CORE MODAL */}
      {showEditModal && (
        <EditCoreModal
          profile={viewingUser}
          uid={currentUserId}
          onClose={() => setShowEditModal(false)}
          onSaved={() => onProfileUpdate?.()}
        />
      )}

      {/* CONNECTION MODAL */}
      {listModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setListModal(null)}
          />

          <div className="relative bg-dark-card p-4 rounded-2xl w-full max-w-sm border border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black">
                {listModal === 'connections' ? 'Connections' : 'Signal Reach'}
              </h3>

              <button onClick={() => setListModal(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {(listModal === 'connections' ? connectedUsers : reachUsers).map(u => (
              <div key={u.id} className="flex justify-between items-center py-2">
                <button
                  onClick={() => {
                    setListModal(null);
                    onProfileClick(u.id);
                  }}
                  className="font-bold text-sm"
                >
                  {u.displayName}
                </button>

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

function CoreStat({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-dark-card rounded-2xl p-3 border border-dark-border text-left"
    >
      <div className="text-lg font-black text-brand-primary">{value}</div>
      <div className="text-[11px] text-dark-muted">{label}</div>
    </button>
  );
}

/* ---------------- EDIT CORE MODAL ---------------- */

function EditCoreModal({ profile, uid, onClose, onSaved }) {
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

  const handleAvatarChange = async e => {
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
      alert('Failed to update core');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-dark-bg p-4 rounded-2xl w-full max-w-lg border border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg">Edit Core</h2>

          <button onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Avatar src={avatarPreview} name={name} size="xl" />

            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-brand-primary text-white"
              disabled={compressing}
            >
              {compressing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <div className="font-bold">Core Identity</div>
            <div className="text-xs text-dark-muted">
              Update your signal look.
            </div>
          </div>
        </div>

        <label className="block text-xs text-dark-muted mb-1">
          Display Name
        </label>
        <input
          className="w-full bg-dark-card border border-dark-border rounded-xl p-3 mb-3"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Core name"
        />

        <label className="block text-xs text-dark-muted mb-1">
          Signal Description
        </label>
        <textarea
          className="w-full bg-dark-card border border-dark-border rounded-xl p-3 mb-3"
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Describe your signal..."
          rows={4}
        />

        <label className="block text-xs text-dark-muted mb-1">
          Signal Link
        </label>
        <input
          className="w-full bg-dark-card border border-dark-border rounded-xl p-3 mb-4"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          placeholder="https://..."
        />

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full py-3 rounded-xl bg-brand-primary text-white font-black disabled:opacity-50"
        >
          {saving ? 'Saving Core...' : 'Save Core'}
        </button>
      </div>
    </div>
  );
}
