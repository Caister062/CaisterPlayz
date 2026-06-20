import { useState, useMemo, useEffect } from 'react';
import { Trash2, Users, Radio, Zap, AlertTriangle, Shield, Mic, Activity, Download, Settings, Skull, Pin, CheckCircle } from 'lucide-react';
import { Hex, timeAgo } from './PostCard';
import { deletePost, updateProfile, sendNotification, useSystemConfig, updateSystemConfig } from '../hooks';
import pb from '../pocketbase';

export default function AdminView({ posts, users, currentUserId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(null);
  const [radarEvents, setRadarEvents] = useState([]);
  const [bannedWordInput, setBannedWordInput] = useState('');
  const { config, configId } = useSystemConfig();

  // Stats
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalEngagement = useMemo(() => {
    return posts.reduce((sum, p) => 
      sum + (p.likedBy?.length||0) + (p.repostedBy?.length||0) + (p.viewedBy?.length||0)
    , 0);
  }, [posts]);

  const recentPosts = useMemo(() => [...posts].sort((a,b) => new Date(b.created) - new Date(a.created)), [posts]);

  // F7: Live Activity Radar
  useEffect(() => {
    if (activeTab !== 'radar') return;
    let unsub;
    pb.collection('cplayz_posts').subscribe('*', (e) => {
      if (e.record.type === 'system_config') return;
      const u = users.find(x => x.id === e.record.userId);
      setRadarEvents(prev => [{ id: Date.now(), text: `[${e.action.toUpperCase()}] Broadcast by ${u?.displayName||'Unknown'}` }, ...prev].slice(0, 50));
    }).then(u => unsub = u);
    return () => unsub && unsub();
  }, [activeTab, users]);

  // Feature Helpers
  const handleDeletePost = async (post) => {
    if (!window.confirm(`Delete broadcast by ${users.find(u=>u.id===post.userId)?.displayName || 'Unknown'}?`)) return;
    setDeleting(post.id);
    try { await deletePost(post.id, post.userId); } catch(e) { alert('Delete failed: ' + e.message); }
    setDeleting(null);
  };

  // F1: Global Announcement
  const handleGlobalAnnounce = () => {
    const msg = prompt('Enter global announcement message (sends to all users):');
    if (!msg) return;
    if (!window.confirm(`Send "${msg}" to ${totalUsers} users?`)) return;
    users.forEach(u => {
      sendNotification(u.id, currentUserId, 'follow', ''); // Hijacking follow type for now or add custom
    });
    alert('Announcements dispatched!');
  };

  // F2: Auto-Mod Sweeper
  const handleSweep = async () => {
    if (!config.bannedWords || config.bannedWords.length === 0) return alert('No banned words defined in config.');
    const regex = new RegExp(config.bannedWords.join('|'), 'i');
    const badPosts = posts.filter(p => regex.test(p.text));
    if (badPosts.length === 0) return alert('Platform is clean! No violations found.');
    if (!window.confirm(`Found ${badPosts.length} violating broadcasts. Delete them all?`)) return;
    for (const p of badPosts) {
      try { await deletePost(p.id, p.userId); } catch(e) {}
    }
    alert(`Swept ${badPosts.length} broadcasts.`);
  };

  // F3: Verification Engine
  const toggleVerify = async (userId) => {
    const verified = config.verifiedUsers || [];
    const next = verified.includes(userId) ? verified.filter(id => id !== userId) : [...verified, userId];
    await updateSystemConfig(configId, { ...config, verifiedUsers: next });
  };

  // F4: User Impersonation
  const handleImpersonate = (user) => {
    if (!window.confirm(`Ghost login as ${user.displayName}?`)) return;
    localStorage.setItem('cplayz_user_id', user.id);
    window.location.reload();
  };

  // F5: The Nuke
  const handleNuke = async (userId) => {
    const userPosts = posts.filter(p => p.userId === userId);
    if (!window.confirm(`NUKE: Delete all ${userPosts.length} broadcasts by this user? This cannot be undone.`)) return;
    for (const p of userPosts) {
      try { await deletePost(p.id, p.userId); } catch(e) {}
    }
    alert('User content nuked.');
  };

  // F6: Shadowbanning
  const handleShadowban = async (user) => {
    if (!window.confirm(`SHADOWBAN ${user.displayName}? This will deface their profile and nuke their content.`)) return;
    await updateProfile(user.id, { displayName: '[BANNED]', bio: 'Account suspended for violating Terms of Service.', avatarUrl: '' });
    await handleNuke(user.id);
  };

  // F8: Data Export Engine
  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stats: { totalUsers, totalPosts, totalEngagement },
      users: users.map(u => ({ id: u.id, name: u.displayName, created: u.created })),
      posts: posts.map(p => ({ id: p.id, author: p.userId, text: p.text, likes: p.likedBy?.length||0 }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `caisterplayz-export-${Date.now()}.json`; a.click();
  };

  // F9: Featured Broadcasts
  const toggleFeature = async (postId) => {
    const featured = config.featuredPosts || [];
    const next = featured.includes(postId) ? featured.filter(id => id !== postId) : [...featured, postId];
    await updateSystemConfig(configId, { ...config, featuredPosts: next });
  };

  // F10: Platform Lockdown
  const toggleLockdown = async () => {
    if (!window.confirm(config.lockdown ? 'Lift platform lockdown?' : 'INITIATE TOTAL PLATFORM LOCKDOWN?')) return;
    await updateSystemConfig(configId, { ...config, lockdown: !config.lockdown });
  };

  return (
    <div className="admin-view">
      <div className="admin-hero">
        <div className="admin-title"><AlertTriangle size={24} /> Admin Command Center</div>
        <div className="admin-subtitle">Advanced moderation and platform analytics. Authorized access only.</div>
      </div>

      <div className="admin-stats">
        <div className="stat-box">
          <Users size={20} className="stat-icon" />
          <div className="stat-val">{totalUsers}</div>
          <div className="stat-lbl">Active Users</div>
        </div>
        <div className="stat-box">
          <Radio size={20} className="stat-icon" />
          <div className="stat-val">{totalPosts}</div>
          <div className="stat-lbl">Broadcasts</div>
        </div>
        <div className="stat-box">
          <Zap size={20} className="stat-icon" />
          <div className="stat-val">{totalEngagement}</div>
          <div className="stat-lbl">Engagements</div>
        </div>
      </div>

      <div className="admin-actions-grid" style={{ padding: '0 14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button className="admin-action-btn" onClick={handleGlobalAnnounce}><Mic size={16}/> Announce</button>
        <button className="admin-action-btn" onClick={handleExport}><Download size={16}/> Export Data</button>
        <button className="admin-action-btn" onClick={handleSweep}><Shield size={16}/> Auto-Sweep</button>
        <button className={`admin-action-btn ${config.lockdown ? 'danger-on' : 'danger'}`} onClick={toggleLockdown}>
          <Skull size={16}/> {config.lockdown ? 'LIFT LOCKDOWN' : 'LOCKDOWN'}
        </button>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${activeTab==='overview'?' on':''}`} onClick={()=>setActiveTab('overview')}>Queue</button>
        <button className={`admin-tab${activeTab==='users'?' on':''}`} onClick={()=>setActiveTab('users')}>Roster</button>
        <button className={`admin-tab${activeTab==='radar'?' on':''}`} onClick={()=>setActiveTab('radar')}>Radar</button>
        <button className={`admin-tab${activeTab==='config'?' on':''}`} onClick={()=>setActiveTab('config')}>Config</button>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-list">
          {recentPosts.map(p => {
            const author = users.find(u => u.id === p.userId);
            const isFeatured = (config.featuredPosts||[]).includes(p.id);
            return (
              <div key={p.id} className="admin-item">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Hex src={author?.avatarUrl} name={author?.displayName||'?'} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="admin-item-meta">
                      <strong>{author?.displayName||'Unknown'}</strong> • {timeAgo(p.created)}
                    </div>
                    <div className="admin-item-text">{p.text}</div>
                    {p.imageUrl && <div className="admin-item-media">Has Attachment</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className={`admin-micro-btn ${isFeatured?'on':''}`} onClick={() => toggleFeature(p.id)}>
                        <Pin size={12}/> {isFeatured ? 'Unpin' : 'Feature'}
                      </button>
                    </div>
                  </div>
                  <button 
                    className="admin-del-btn" 
                    disabled={deleting === p.id}
                    onClick={() => handleDeletePost(p)}
                  >
                    {deleting === p.id ? '...' : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-list">
          {users.map(u => {
            const isVerified = (config.verifiedUsers||[]).includes(u.id);
            return (
              <div key={u.id} className="admin-item" style={{ alignItems: 'flex-start', display: 'flex', gap: 12 }}>
                <Hex src={u.avatarUrl} name={u.displayName||'?'} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {u.displayName} {isVerified && <CheckCircle size={14} color="#00e5ff" />}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>ID: {u.id}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <button className="admin-micro-btn" onClick={() => handleImpersonate(u)}>Ghost</button>
                    <button className={`admin-micro-btn ${isVerified?'on':''}`} onClick={() => toggleVerify(u.id)}>Verify</button>
                    <button className="admin-micro-btn danger" onClick={() => handleNuke(u.id)}>Nuke</button>
                    <button className="admin-micro-btn danger" onClick={() => handleShadowban(u)}>Ban</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'radar' && (
        <div className="admin-list" style={{ background: '#000', padding: 14, borderRadius: 12, fontFamily: 'monospace', fontSize: 11, color: '#00e5ff', minHeight: 300 }}>
          <div style={{ marginBottom: 10, color: '#f43f5e', fontWeight: 'bold' }}><Activity size={14} style={{display:'inline',verticalAlign:'middle'}}/> Live Intercept Active...</div>
          {radarEvents.length === 0 && <div style={{ opacity: 0.5 }}>Waiting for signals...</div>}
          {radarEvents.map(e => (
            <div key={e.id} style={{ marginBottom: 4 }}>&gt; {e.text}</div>
          ))}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="admin-list">
          <div className="admin-item">
            <h4 style={{ color: 'var(--text)', fontSize: 13, marginBottom: 8, display:'flex', alignItems:'center', gap:6 }}><Settings size={14}/> Auto-Mod Config</h4>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Enter comma-separated words to ban. The sweep tool will nuke posts containing these words.</p>
            <textarea 
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border-b)', color: 'var(--text)', padding: 10, borderRadius: 8, fontSize: 12 }} 
              rows={3} 
              value={bannedWordInput || (config.bannedWords||[]).join(', ')} 
              onChange={e => setBannedWordInput(e.target.value)}
            />
            <button className="admin-action-btn" style={{ marginTop: 10, width: 'auto', padding: '6px 12px' }} onClick={async () => {
              const words = bannedWordInput.split(',').map(w => w.trim()).filter(Boolean);
              await updateSystemConfig(configId, { ...config, bannedWords: words });
              alert('Auto-mod words updated!');
            }}>Save Words</button>
          </div>
        </div>
      )}
    </div>
  );
}
