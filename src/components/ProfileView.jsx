import { useState, useRef } from 'react';
import { Camera, Check, X, Loader } from 'lucide-react';
import { GridCard, Hex, timeAgo } from './PostCard';
import ExpandedBroadcast from './PostCard';
import { updateProfile } from '../hooks';

function compressAv(file) {
  return new Promise((res, rej) => {
    const c = document.createElement('canvas'), ctx = c.getContext('2d'), img = new window.Image();
    img.onload = () => { c.width = 200; c.height = 200; ctx.drawImage(img,0,0,200,200); res(c.toDataURL('image/jpeg',0.85)); };
    img.onerror = rej;
    const r = new FileReader(); r.onload = e => { img.src = e.target.result; }; r.onerror = rej; r.readAsDataURL(file);
  });
}

export default function ProfileView({ profile, posts, users, currentUserId, followData, onProfileClick, onRefresh }) {
  const [tab, setTab] = useState('broadcasts');
  const [editing, setEditing] = useState(false);
  const [eName, setEName] = useState('');
  const [eBio, setEBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const fRef = useRef(null);

  if (!profile) return <div className="empty"><div className="empty-ico">⏳</div><h3>Loading…</h3></div>;

  const isOwn = profile.id === currentUserId;
  const myPosts = posts.filter(p => p.userId === profile.id);
  const mediaPosts = myPosts.filter(p => p.imageUrl);
  const boostedPosts = posts.filter(p => (p.likedBy||[]).includes(profile.id));
  const tabData = tab === 'broadcasts' ? myPosts : tab === 'media' ? mediaPosts : boostedPosts;
  const totalBoosts = myPosts.reduce((s,p) => s + (p.likedBy?.length||0), 0);
  const totalViews = myPosts.reduce((s,p) => s + (p.viewedBy?.length||0), 0);
  const totalEchoes = myPosts.reduce((s,p) => s + (p.repostedBy?.length||0), 0);
  const initial = (profile.displayName||'?')[0].toUpperCase();

  const startEdit = () => { setEName(profile.displayName||''); setEBio(profile.bio||''); setEditing(true); };
  const saveEdit = async () => {
    if (!eName.trim()) return; setSaving(true);
    try { await updateProfile(profile.id,{displayName:eName.trim(),bio:eBio.trim()}); await onRefresh?.(); setEditing(false); }
    catch(e){ console.error(e); } finally { setSaving(false); }
  };
  const handleAv = async (e) => {
    const f = e.target.files?.[0]; if (!f) return; setSaving(true);
    try { const d = await compressAv(f); await updateProfile(profile.id,{avatarUrl:d}); await onRefresh?.(); }
    catch(e){ console.error(e); } finally { setSaving(false); if(fRef.current) fRef.current.value=''; }
  };

  const eng = totalBoosts + totalEchoes;
  const rank = eng >= 50 ? '🏆 LEGEND' : eng >= 20 ? '⚡ VETERAN' : eng >= 5 ? '🎯 RISING' : '🎮 ROOKIE';

  return (
    <div>
      <div className="pcard-banner">
        <div className="pcard-av-wrap">
          <div className="pcard-ring"><div className="pcard-ring-inner">
            <div className="hex xl">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initial}</div>
          </div></div>
          {isOwn && (
            <>
              <button onClick={() => fRef.current?.click()} style={{ position:'absolute',bottom:2,right:-6,width:24,height:24,borderRadius:7,background:'var(--cyan)',display:'flex',alignItems:'center',justifyContent:'center',color:'#000',boxShadow:'0 2px 10px rgba(0,229,255,0.5)',zIndex:5 }}>
                {saving ? <Loader size={9} className="spin" /> : <Camera size={9} />}
              </button>
              <input ref={fRef} type="file" accept="image/*" hidden onChange={handleAv} />
            </>
          )}
        </div>
      </div>

      <div className="pcard-body">
        <div className="pcard-row">
          <div />
          {isOwn && !editing && <button className="edit-btn" onClick={startEdit}>Edit</button>}
          {isOwn && editing && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="edit-btn" onClick={() => setEditing(false)}><X size={11} /></button>
              <button className="edit-btn" onClick={saveEdit} style={{ borderColor:'var(--cyan)',color:'var(--cyan)' }}>
                {saving ? <Loader size={11} className="spin" /> : <Check size={11} />}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:10 }}>
            <input className="edit-box" value={eName} onChange={e => setEName(e.target.value)} maxLength={40} placeholder="Name" />
            <textarea className="edit-box" value={eBio} onChange={e => setEBio(e.target.value)} maxLength={160} rows={2} placeholder="Bio…" style={{ resize:'none',lineHeight:1.5 }} />
          </div>
        ) : (
          <>
            <div className="pcard-name">{profile.displayName}</div>
            <div className="pcard-joined">Joined {timeAgo(profile.created)}</div>
            {profile.bio && <div className="pcard-bio">{profile.bio}</div>}
          </>
        )}

        <div className="rank-badge">{rank} · {eng} engagement</div>

        <div className="stat-grid">
          <div className="stat-cell"><div className="stat-val">{myPosts.length}</div><div className="stat-key">Drops</div></div>
          <div className="stat-cell"><div className="stat-val">{totalBoosts}</div><div className="stat-key">Zaps</div></div>
          <div className="stat-cell"><div className="stat-val">{totalViews}</div><div className="stat-key">Views</div></div>
          <div className="stat-cell"><div className="stat-val">{totalEchoes}</div><div className="stat-key">Echoes</div></div>
        </div>
      </div>

      <div className="ptabs">
        {[['broadcasts','📡'],['media','🖼️'],['zapped','⚡']].map(([k,icon]) => (
          <button key={k} className={`ptab${tab===k?' on':''}`} onClick={() => setTab(k)}>{icon} {k}</button>
        ))}
      </div>

      {tabData.length === 0 ? (
        <div className="empty"><div className="empty-ico">{tab==='broadcasts'?'📡':tab==='media'?'🖼️':'⚡'}</div><h3>No {tab}</h3></div>
      ) : (
        <div className="grid" style={{ padding: '10px 10px' }}>
          {tabData.map(p => <GridCard key={p.id} post={p} users={users} onClick={setExpanded} />)}
        </div>
      )}

      {expanded && <ExpandedBroadcast post={expanded} currentUserId={currentUserId} users={users} onClose={() => setExpanded(null)} />}
    </div>
  );
}
