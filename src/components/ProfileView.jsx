import { useState, useRef } from 'react';
import { Camera, Check, X, Loader } from 'lucide-react';
import PostCard from './PostCard';
import { updateProfile } from '../hooks';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      const size = 200;
      canvas.width = size; canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileView({ profile, posts, users, currentUserId, followData, onProfileClick, onRefresh }) {
  const [tab, setTab] = useState('posts');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef(null);

  if (!profile) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <h3>Loading profile…</h3>
      </div>
    );
  }

  const isOwn = profile.id === currentUserId;
  const myPosts = posts.filter(p => p.userId === profile.id);
  const mediaPosts = myPosts.filter(p => p.imageUrl);
  const likedPosts = posts.filter(p => (p.likedBy || []).includes(profile.id));

  const tabPosts = tab === 'posts' ? myPosts : tab === 'media' ? mediaPosts : likedPosts;

  const followerCount = (followData?.followers || []).length;
  const followingCount = (followData?.following || []).length;

  const startEdit = () => {
    setEditName(profile.displayName || '');
    setEditBio(profile.bio || '');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, { displayName: editName.trim(), bio: editBio.trim() });
      await onRefresh?.();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const compressed = await compressImage(file);
      await updateProfile(profile.id, { avatarUrl: compressed });
      await onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
    if (avatarRef.current) avatarRef.current.value = '';
  };

  const initial = (profile.displayName || '?')[0].toUpperCase();

  return (
    <div>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-top-row">
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="avatar xl">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} /> : initial}
            </div>
            {isOwn && (
              <>
                <button
                  onClick={() => avatarRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}
                >
                  {saving ? <Loader size={12} className="spin" /> : <Camera size={12} />}
                </button>
                <input ref={avatarRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </>
            )}
          </div>

          {/* Follow / Edit Button */}
          {isOwn ? (
            editing ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="edit-profile-btn" onClick={() => setEditing(false)}><X size={14} /></button>
                <button className="edit-profile-btn" onClick={saveEdit} style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                  {saving ? <Loader size={14} className="spin" /> : <Check size={14} />}
                </button>
              </div>
            ) : (
              <button className="edit-profile-btn" onClick={startEdit}>Edit Profile</button>
            )
          ) : null}
        </div>

        {/* Info */}
        <div className="profile-info">
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                maxLength={40}
                placeholder="Display name"
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: '8px 12px', color: 'var(--text)', fontSize: 15, outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                maxLength={160}
                rows={2}
                placeholder="Write a bio…"
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: '8px 12px', color: 'var(--text)', fontSize: 14, outline: 'none',
                  resize: 'none', lineHeight: 1.5
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ) : (
            <>
              <div className="profile-name">{profile.displayName}</div>
              <div className="profile-handle" style={{ color: 'var(--muted)', fontSize: 13 }}>
                Joined {formatTime(profile.created)}
              </div>
              {profile.bio && <div className="profile-bio">{profile.bio}</div>}
            </>
          )}

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-val">{myPosts.length}</span>
              <span className="profile-stat-label">Posts</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-val">{followerCount}</span>
              <span className="profile-stat-label">Followers</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-val">{followingCount}</span>
              <span className="profile-stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['posts', 'media', 'likes'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{tab === 'posts' ? '📝' : tab === 'media' ? '📸' : '❤️'}</div>
          <h3>No {tab} yet</h3>
        </div>
      ) : (
        tabPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            users={users}
            onProfileClick={onProfileClick}
          />
        ))
      )}
    </div>
  );
}
