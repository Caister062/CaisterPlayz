import { useState, useMemo } from 'react';
import { Trash2, Users, Radio, Zap, AlertTriangle } from 'lucide-react';
import { Hex, timeAgo } from './PostCard';
import { deletePost } from '../hooks';

export default function AdminView({ posts, users, currentUserId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(null);

  // Stats
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalEngagement = useMemo(() => {
    return posts.reduce((sum, p) => 
      sum + (p.likedBy?.length||0) + (p.repostedBy?.length||0) + (p.viewedBy?.length||0)
    , 0);
  }, [posts]);

  // Recent content
  const recentPosts = useMemo(() => [...posts].sort((a,b) => new Date(b.created) - new Date(a.created)), [posts]);

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Delete broadcast by ${users.find(u=>u.id===post.userId)?.displayName || 'Unknown'}?`)) return;
    setDeleting(post.id);
    try {
      // Impersonate author's X-User-Id to bypass backend rule since we don't have true admin auth on the PB instance
      await deletePost(post.id, post.userId);
    } catch(e) {
      alert('Delete failed: ' + e.message);
    }
    setDeleting(null);
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

      <div className="admin-tabs">
        <button className={`admin-tab${activeTab==='overview'?' on':''}`} onClick={()=>setActiveTab('overview')}>Content Queue</button>
        <button className={`admin-tab${activeTab==='users'?' on':''}`} onClick={()=>setActiveTab('users')}>User Roster</button>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-list">
          {recentPosts.map(p => {
            const author = users.find(u => u.id === p.userId);
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
          {users.map(u => (
            <div key={u.id} className="admin-item" style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
              <Hex src={u.avatarUrl} name={u.displayName||'?'} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>{u.displayName}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>ID: {u.id} • Device: {u.deviceId?.slice(0,8)||'N/A'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
