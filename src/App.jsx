import { useState, useEffect } from 'react';
import { Home, Search, Lock, User, Plus, Swords, Bell, Loader, ShieldAlert } from 'lucide-react';
import { useRealtimePosts, useAllUsers, useNotifications, useFollows, useUserProfile, ensureGuestUser } from './hooks';
import FeedView from './components/FeedView';
import ExploreView from './components/ExploreView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import VaultView from './components/VaultView';
import AdminView from './components/AdminView';
import Composer from './components/Composer';

/* ─── CP Monogram SVG ─── */
function CpMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="256" y="390" textAnchor="middle" fontFamily="'Arial Black','Impact',sans-serif" fontWeight="900" fontSize="340" fill="white" letterSpacing="-20">CP</text>
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [showCompose, setShowCompose] = useState(false);
  const [userId, setUserId] = useState(null);
  const [booting, setBooting] = useState(true);
  const [viewProfile, setViewProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminEmail = localStorage.getItem('caister_admin');
    if (adminEmail === 'caismoretton@gmail.com' || adminEmail === 'nexusnpc0@gmail') {
      setIsAdmin(true);
    }
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
        <div style={{ width:60,height:60,borderRadius:16,background:'linear-gradient(135deg,#00e5ff,#7c3aed,#f43f5e)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(0,229,255,0.35), 0 0 60px rgba(124,58,237,0.15)',animation:'bootFloat 2s ease-in-out infinite' }}>
          <CpMark size={34} />
        </div>
        <div style={{ fontSize:13,fontWeight:900,letterSpacing:'0.12em',background:'linear-gradient(90deg,#00e5ff,#a78bfa,#f43f5e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textTransform:'uppercase' }}>CaisterPlayz</div>
        <div style={{ fontSize:10,color:'#475569',letterSpacing:'0.1em',textTransform:'uppercase' }}>Initializing…</div>
        <Loader size={16} style={{ color:'#00e5ff',animation:'bootSpin 0.8s linear infinite' }} />
        <style>{`@keyframes bootFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes bootSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const NAV = [
    { id: 'home',    icon: Home,   label: 'Base' },
    { id: 'explore', icon: Search, label: 'Arena' },
    { id: 'vault',   icon: Lock,   label: 'Vault' },
    { id: 'profile', icon: User,   label: 'Me' },
  ];

  return (
    <div className="console">
      {/* ─ HUD ─ */}
      <header className="hud">
        <div className="hud-logo">
          <div className="cp-mark">
            <CpMark size={18} />
          </div>
          <span className="hud-name" style={{ display: 'none' }}>CaisterPlayz</span>
        </div>
        <div className="hud-actions">
          {NAV.map(n => (
            <button key={n.id} className={`hud-btn${tab===n.id?' lit':''}`} onClick={() => goTab(n.id)} title={n.label}>
              <n.icon size={18} fill={tab===n.id?'currentColor':'none'} />
            </button>
          ))}
          {isAdmin && (
            <button className={`hud-btn${tab==='admin'?' lit':''}`} onClick={() => goTab('admin')} title="Admin" style={{ color: '#f43f5e' }}>
              <ShieldAlert size={18} />
            </button>
          )}
          <button className="hud-btn" onClick={() => setShowCompose(true)} title="Compose">
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <button className={`hud-btn${tab==='notifications'?' lit':''}`} onClick={() => goTab('notifications')} title="Notifications">
            <Bell size={18} />
            {unreadCount > 0 && <span className="hud-pip" />}
          </button>
        </div>
      </header>

      {/* ─ Main ─ */}
      <main className="main">
        {tab==='home' && <FeedView posts={posts} loading={loading} users={users} currentUserId={userId} notifications={notifications} onProfileClick={goProfile} />}
        {tab==='explore' && <ExploreView posts={posts} users={users} currentUserId={userId} onProfileClick={goProfile} />}
        {tab==='vault' && <VaultView posts={posts} currentUserId={userId} users={users} onProfileClick={goProfile} />}
        {tab==='notifications' && <NotificationsView notifications={notifications} users={users} currentUserId={userId} onRefresh={refNotif} onProfileClick={goProfile} />}
        {tab==='profile' && <ProfileView profile={pUser||me} posts={posts} users={users} currentUserId={userId} followData={viewProfile?{}:followData} onProfileClick={goProfile} onRefresh={refMe} />}
        {tab==='admin' && isAdmin && <AdminView posts={posts} users={users} currentUserId={userId} />}
        
        {/* ─ Brand Footer ─ */}
        <div className="brand-footer">Powered by CaisterPlayz</div>
      </main>

      {/* ─ Composer ─ */}
      {showCompose && userId && <Composer currentUserId={userId} currentUser={me} onClose={() => setShowCompose(false)} />}
    </div>
  );
}
