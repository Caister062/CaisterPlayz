import { useState, useRef } from 'react';
import { Camera, Check, X, Loader, CheckCircle, Trash2, ShieldAlert, LogOut, ShieldBan } from 'lucide-react';
import pb from '../pocketbase';
import { GridCard, timeAgo } from './PostCard';
import ExpandedBroadcast from './PostCard';
import { updateProfile, useBlocks, blockUser, unblockUser } from '../hooks';
import { formatCount, THEMES, applyTheme } from '../utils';

function compressAv(file) {
  return new Promise((res, rej) => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      c.width = 200;
      c.height = 200;
      ctx.drawImage(img, 0, 0, 200, 200);
      res(c.toDataURL('image/jpeg', 0.85));
    };

    img.onerror = rej;

    const r = new FileReader();
    r.onload = e => {
      img.src = e.target.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function ProfileView({
  profile,
  posts,
  users,
  currentUserId,
  onRefresh,
  onMessageClick
}) {
  const [tab, setTab] = useState('broadcasts');
  const [editing, setEditing] = useState(false);
  const [eName, setEName] = useState('');
  const [eBio, setEBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { blocks, refresh: refreshBlocks } = useBlocks(currentUserId);
  const isBlocked = blocks.some(b => b.blockedId === profile?.id);

  const fRef = useRef(null);

  if (!profile) {
    return (
      <div className="empty">
        <div className="empty-ico">⏳</div>
        <h3>Loading Stats…</h3>
      </div>
    );
  }

  const isOwn = profile.id === currentUserId;

  const myPosts = posts.filter(p => p.userId === profile.id);
  const mediaPosts = myPosts.filter(p => p.imageUrl);
  const boostedPosts = posts.filter(p => (p.likedBy || []).includes(profile.id));

  const tabData =
    tab === 'broadcasts'
      ? myPosts
      : tab === 'visuals'
        ? mediaPosts
        : boostedPosts;

  const rc = (arr, authorId) =>
    (arr || []).filter(id => id !== authorId).length;

  const totalBoosts = myPosts.reduce(
    (s, p) => s + rc(p.likedBy, p.userId),
    0
  );

  const totalDetections = myPosts.reduce(
    (s, p) => s + rc(p.viewedBy, p.userId),
    0
  );

  const totalRelays = myPosts.reduce(
    (s, p) => s + rc(p.repostedBy, p.userId),
    0
  );

  const initial = (profile.displayName || '?')[0].toUpperCase();

  const startEdit = () => {
    setEName(profile.displayName || '');
    setEBio(profile.bio || '');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!eName.trim()) return;

    setSaving(true);

    try {
      await updateProfile(profile.id, {
        displayName: eName.trim(),
        bio: eBio.trim()
      });

      await onRefresh?.();
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAv = async e => {
    const f = e.target.files?.[0];

    if (!f) return;

    setSaving(true);

    try {
      const d = await compressAv(f);
      await updateProfile(profile.id, { avatarUrl: d });
      await onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);

      if (fRef.current) {
        fRef.current.value = '';
      }
    }
  };

  const energy = totalBoosts + totalRelays;

  const rank =
    energy >= 50
      ? '🏆 UNREAL'
      : energy >= 20
        ? '⚡ CHAMPION'
        : energy >= 5
          ? '📡 ELITE'
          : '🌱 BRONZE';

  return (
    <div>
      <div className="pcard-banner">
        <div className="pcard-av-wrap">
          <div className="pcard-ring">
            <div className="pcard-ring-inner">
              <div className="hex xl">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" />
                ) : (
                  initial
                )}
              </div>
            </div>
          </div>

          {isOwn && (
            <>
              <button
                onClick={() => fRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: -6,
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background: 'var(--cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  boxShadow: '0 2px 10px rgba(0,229,255,0.5)',
                  zIndex: 5
                }}
              >
                {saving ? <Loader size={9} className="spin" /> : <Camera size={9} />}
              </button>

              <input
                ref={fRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAv}
              />
            </>
          )}
        </div>
      </div>

      <div className="pcard-body">
        <div className="pcard-row">
          <div />

          {isOwn && !editing && (
            <button className="edit-btn" onClick={startEdit}>
              Edit Profile
            </button>
          )}

          {!isOwn && onMessageClick && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="edit-btn" onClick={() => onMessageClick(profile.id)}>
                Message
              </button>

              <button
                onClick={async () => {
                  setActionLoading(true);
                  if (isBlocked) {
                    await unblockUser(currentUserId, profile.id);
                  } else {
                    await blockUser(currentUserId, profile.id);
                  }
                  await refreshBlocks();
                  setActionLoading(false);
                }}
                className={`edit-btn ${isBlocked ? 'text-red-500 border-red-500' : ''}`}
                title={isBlocked ? "Unblock User" : "Block User"}
                disabled={actionLoading}
              >
                <ShieldBan size={14} />
              </button>
            </div>
          )}

          {isOwn && editing && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="edit-btn" onClick={() => setEditing(false)}>
                <X size={11} />
              </button>

              <button
                className="edit-btn"
                onClick={saveEdit}
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
              >
                {saving ? <Loader size={11} className="spin" /> : <Check size={11} />}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 10
            }}
          >
            <input
              className="edit-box"
              value={eName}
              onChange={e => setEName(e.target.value)}
              maxLength={40}
              placeholder="Core name"
            />

            <textarea
              className="edit-box"
              value={eBio}
              onChange={e => setEBio(e.target.value)}
              maxLength={160}
              rows={2}
              placeholder="Profile description..."
              style={{ resize: 'none', lineHeight: 1.5 }}
            />
          </div>
        ) : (
          <>
            <div className="pcard-name">
              {profile.displayName}

              {window.cplayz_config?.verifiedUsers?.includes(profile.id) && (
                <CheckCircle
                  size={18}
                  color="#00e5ff"
                  style={{ marginLeft: 6, display: 'inline' }}
                />
              )}
            </div>

            <div className="pcard-joined">
              Core created · {timeAgo(profile.created)}
            </div>

            {profile.bio && (
              <div className="pcard-bio">
                {profile.bio}
              </div>
            )}
          </>
        )}

        <div className="rank-badge">
          {rank} · {formatCount(energy)} V-Bucks & PRs
        </div>

        <div className="stat-grid">
          <div className="stat-cell">
            <div className="stat-val">{formatCount(myPosts.length)}</div>
            <div className="stat-key">Posts</div>
          </div>

          <div className="stat-cell">
            <div className="stat-val">{formatCount(totalBoosts)}</div>
            <div className="stat-key">Hypes</div>
          </div>

          <div className="stat-cell">
            <div className="stat-val">{formatCount(totalDetections)}</div>
            <div className="stat-key">Views</div>
          </div>

          <div className="stat-cell">
            <div className="stat-val">{formatCount(totalRelays)}</div>
            <div className="stat-key">Shares</div>
          </div>
        </div>
      </div>

      <div className="ptabs">
        {[
          ['broadcasts', '🏆', 'Posts'],
          ['visuals', '🖼️', 'Media'],
          ['boosted', '🔥', 'Hyped']
        ].map(([k, icon, label]) => (
          <button
            key={k}
            className={`ptab${tab === k ? ' on' : ''}`}
            onClick={() => setTab(k)}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tabData.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">
            {tab === 'broadcasts' ? '📡' : tab === 'visuals' ? '🖼️' : '⚡'}
          </div>

          <h3>No {tab === 'broadcasts' ? 'signals' : tab === 'visuals' ? 'visual signals' : 'boosted signals'}</h3>
        </div>
      ) : (
        <div className="grid" style={{ padding: '10px 10px' }}>
          {tabData.map(p => (
            <GridCard
              key={p.id}
              post={p}
              users={users}
              onClick={setExpanded}
            />
          ))}
        </div>
      )}

      {isOwn && (
        <div style={{ textAlign: 'center', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Theme Selector */}
          <div className="bg-dark-surface p-4 rounded-xl border border-dark-border">
            <h3 className="text-sm font-bold text-dark-muted mb-3 uppercase tracking-wider text-left">App Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {['cyberpunk', 'neonGreen', 'bloodRed', 'gold'].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    localStorage.setItem('cplayz_theme', t);
                    window.location.reload();
                  }}
                  className={`p-2 rounded-lg border capitalize text-sm font-bold transition-all ${localStorage.getItem('cplayz_theme') === t || (!localStorage.getItem('cplayz_theme') && t === 'cyberpunk') ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-dark-border text-dark-muted hover:border-gray-500'}`}
                >
                  {t.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          </div>

          <button
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => {
              if (window.confirm('Sign out of your CaisterPlayz session?')) {
                pb.authStore.clear();
                window.location.reload();
              }
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>

          <button
            className="admin-login-btn"
            style={{ color: '#f43f5e', borderColor: '#f43f5e' }}
            onClick={async () => {
              if (window.confirm('WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                try {
                  await pb.collection('users').delete(currentUserId);
                  pb.authStore.clear();
                  window.location.reload();
                } catch(e) {
                  alert('Could not delete account.');
                  console.error(e);
                }
              }
            }}
          >
            <Trash2 size={16} /> Delete Account
          </button>

          <button
            className="admin-login-btn"
            onClick={() => {
              const key = prompt('Enter Admin Signal Key:');

              if (key && key.trim() === 'CAISTER_CORE_ADMIN') {
                localStorage.setItem('caister_admin', key.trim());
                window.location.reload();
              } else if (key) {
                alert('Signal key denied.');
              }
            }}
          >
            <ShieldAlert size={16} /> Control Center Access
          </button>
        </div>
      )}

      {expanded && (
        <ExpandedBroadcast
          post={expanded}
          currentUserId={currentUserId}
          users={users}
          onClose={() => setExpanded(null)}
        />
      )}
    </div>
  );
}
