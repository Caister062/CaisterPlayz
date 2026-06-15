import { useState, useEffect } from 'react';
import { Home, Search, Lock, User, Plus, Swords, Bell, Loader } from 'lucide-react';
import { useRealtimePosts, useAllUsers, useNotifications, useFollows, useUserProfile, ensureGuestUser } from './hooks';
import FeedView from './components/FeedView';
import ExploreView from './components/ExploreView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import VaultView from './components/VaultView';
import SquadsView from './components/SquadsView';
import Composer from './components/Composer';

export default function App() {
  const [tab, setTab] = useState('home');
  const [showCompose, setShowCompose] = useState(false);
  const [userId, setUserId] = useState(null);
  const [booting, setBooting] = useState(true);
  const [viewProfile, setViewProfile] = useState(null);

  useEffect(() => {
    ensureGuestUser().then(u => setUserId(u.id)).catch(console.error).finally(() => setBooting(false));
  }, []);

  const { posts, loading } = useRealtimePosts();
  const users = useAllUsers();
  const { notifications, unreadCount, refresh: refNotif } = useNotifications(userId);
  const followData = useFollows(userId);
  const { profile: me, refresh: refMe } = useUserProfile(userId);

  const pUser = viewProfile ? users.find(u => u.id === viewProfile) : me;

  const goProfile = (uid) => { setViewProfile(uid); setTab('profile'); };
  const goTab = (t) => { if (t === 'profile') setViewProfile(null); setTab(t); };

  if (booting) {
    return (
      <div style={{ minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:18,background:'#04060e' }}>
        <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#0050dd,#00e5ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:'0 0 40px rgba(0,229,255,0.4)',animation:'bootFloat 2s ease-in-out infinite' }}>🎮</div>
        <div style={{ fontSize:13,fontWeight:900,letterSpacing:'0.12em',color:'#00e5ff',textTransform:'uppercase' }}>CaisterPlayz</div>
        <div style={{ fontSize:10,color:'#475569',letterSpacing:'0.1em',textTransform:'uppercase' }}>Initializing…</div>
        <Loader size={16} style={{ color:'#00e5ff',animation:'bootSpin 0.8s linear infinite' }} />
        <style>{`@keyframes bootFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes bootSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const NAV = [
    { id: 'home',    icon: Home,   label: 'Home' },
    { id: 'explore', icon: Search, label: 'Arena' },
    { id: 'squads',  icon: Swords, label: 'Squads' },
    { id: 'vault',   icon: Lock,   label: 'Vault' },
    { id: 'profile', icon: User,   label: 'Player' },
  ];

  return (
    <div className="console">
      {/* ─ HUD ─ */}
      <header className="hud">
        <div className="hud-logo">
          <div className="hud-glyph">🎮</div>
          <span className="hud-name">CaisterPlayz</span>
        </div>
        <div className="hud-actions">
          <button className={`hud-btn${tab==='notifications'?' lit':''}`} onClick={() => goTab('notifications')}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="hud-pip" />}
          </button>
        </div>
      </header>

      {/* ─ Main ─ */}
      <main className="main">
        {tab==='home' && <FeedView posts={posts} loading={loading} users={users} currentUserId={userId} notifications={notifications} onProfileClick={goProfile} />}
        {tab==='explore' && <ExploreView posts={posts} users={users} currentUserId={userId} onProfileClick={goProfile} />}
        {tab==='squads' && <SquadsView posts={posts} users={users} currentUserId={userId} />}
        {tab==='vault' && <VaultView posts={posts} currentUserId={userId} users={users} onProfileClick={goProfile} />}
        {tab==='notifications' && <NotificationsView notifications={notifications} users={users} currentUserId={userId} onRefresh={refNotif} onProfileClick={goProfile} />}
        {tab==='profile' && <ProfileView profile={pUser||me} posts={posts} users={users} currentUserId={userId} followData={viewProfile?{}:followData} onProfileClick={goProfile} onRefresh={refMe} />}
      </main>

      {/* ─ Bottom Nav ─ */}
      <nav className="bnav">
        {NAV.map(n => (
          <button key={n.id} className={`bnav-item${tab===n.id?' on':''}`} onClick={() => goTab(n.id)}>
            <n.icon size={20} fill={tab===n.id?'currentColor':'none'} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      {/* ─ FAB ─ */}
      <button className="fab" onClick={() => setShowCompose(true)}>
        <Plus size={20} strokeWidth={2.5} />
      </button>

      {/* ─ Composer ─ */}
      {showCompose && userId && <Composer currentUserId={userId} currentUser={me} onClose={() => setShowCompose(false)} />}
    </div>
  );
}
