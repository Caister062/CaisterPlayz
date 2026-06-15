import { useState, useRef } from 'react';
import { Camera, Check, X, Loader } from 'lucide-react';
import PostCard, { Avatar, timeAgo } from './PostCard';
import { updateProfile } from '../hooks';

function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => { canvas.width = 200; canvas.height = 200; ctx.drawImage(img, 0, 0, 200, 200); resolve(canvas.toDataURL('image/jpeg', 0.85)); };
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
  const fileRef = useRef(null);

  if (!profile) {
    return <div className="empty"><div className="empty-icon">⏳</div><h3>Loading…</h3></div>;
  }

  const isOwn = profile.id === currentUserId;
  const myPosts = posts.filter(p => p.userId === profile.id);
  const mediaPosts = myPosts.filter(p => p.imageUrl);
  const likedPosts = posts.filter(p => (p.likedBy || []).includes(profile.id));
  const tabPosts = tab === 'posts' ? myPosts : tab === 'media' ? mediaPosts : likedPosts;
  const followerCount = followData?.followers?.length || 0;
  const followingCount = followData?.following?.length || 0;
  const initial = (profile.displayName || '?')[0].toUpperCase();

  const startEdit = () => { setEditName(profile.displayName || ''); setEditBio(profile.bio || ''); setEditing(true); };
  const saveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try { await updateProfile(profile.id, { displayName: editName.trim(), bio: editBio.trim() }); await onRefresh?.(); setEditing(false); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setSaving(true);
    try { const d = await compressAvatar(file); await updateProfile(profile.id, { avatarUrl: d }); await onRefresh?.(); }
    catch (err) { console.error(err); }
    finally { setSaving(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  // Compute total engagement from all posts by this user
  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likedBy?.length || 0), 0);
  const totalViews = myPosts.reduce((sum, p) => sum + (p.viewedBy?.length || 0), 0);

  return (
    <div>
      {/* Banner */}
      <div className="profile-banner">
        <div className="profile-av-wrap">
          <div className="profile-av-ring">
            <div className="profile-av-inner">
              <div className="av xl">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initial}
              </div>
            </div>
          </div>
          {isOwn && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 4, right: -4,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', boxShadow: '0 2px 10px rgba(0,212,255,0.5)', zIndex: 5
                }}
              >
                {saving ? <Loader size={12} className="spin" /> : <Camera size={12} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
            </>
          )}
        </div>
      </div>

      {/* Profile Body */}
      <div className="profile-body">
        <div className="profile-row">
          <div />
          {isOwn && !editing && <button className="edit-btn" onClick={startEdit}>Edit Profile</button>}
          {isOwn && editing && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="edit-btn" onClick={() => setEditing(false)}><X size={14} /></button>
              <button className="edit-btn" onClick={saveEdit} style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                {saving ? <Loader size={14} className="spin" /> : <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <input className="edit-input" value={editName} onChange={e => setEditName(e.target.value)} maxLength={40} placeholder="Display name" />
            <textarea className="edit-input" value={editBio} onChange={e => setEditBio(e.target.value)} maxLength={160} rows={2} placeholder="Write a bio…" style={{ resize: 'none', lineHeight: 1.5 }} />
          </div>
        ) : (
          <>
            <div className="profile-name">{profile.displayName}</div>
            <div className="profile-handle">Joined {timeAgo(profile.created)}</div>
            {profile.bio && <div className="profile-bio">{profile.bio}</div>}
          </>
        )}

        {/* Gamer badge based on engagement */}
        {isOwn && totalLikes > 0 && (
          <div className="gamer-badge" style={{ marginBottom: 12, marginTop: 8 }}>
            {totalLikes >= 20 ? '🏆 Legend' : totalLikes >= 10 ? '⚡ Rising Star' : '🎮 Newcomer'}
            <span style={{ opacity: 0.6 }}>• {totalLikes} likes earned</span>
          </div>
        )}

        <div className="profile-stats">
          <div className="pstat"><div className="pstat-val">{myPosts.length}</div><div className="pstat-label">Posts</div></div>
          <div className="pstat"><div className="pstat-val">{totalLikes}</div><div className="pstat-label">Likes</div></div>
          <div className="pstat"><div className="pstat-val">{totalViews}</div><div className="pstat-label">Views</div></div>
          <div className="pstat"><div className="pstat-val">{followerCount}</div><div className="pstat-label">Followers</div></div>
          <div className="pstat"><div className="pstat-val">{followingCount}</div><div className="pstat-label">Following</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {['posts', 'media', 'likes'].map(t => (
          <button key={t} className={`ptab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'posts' ? '📝 Posts' : t === 'media' ? '📸 Media' : '❤️ Likes'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabPosts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">{tab === 'posts' ? '📝' : tab === 'media' ? '📸' : '❤️'}</div>
          <h3>No {tab} yet</h3>
          <p>{tab === 'posts' ? 'Share your first gaming moment!' : tab === 'media' ? 'Posts with images appear here.' : 'Posts you like appear here.'}</p>
        </div>
      ) : (
        tabPosts.map(post => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} users={users} onProfileClick={onProfileClick} />
        ))
      )}
    </div>
  );
}
