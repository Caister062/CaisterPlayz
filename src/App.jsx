import { useState, useEffect } from 'react';
import { Radio, Search, Lock, User, Plus, Bell, Loader, ShieldAlert } from 'lucide-react';
import { useRealtimePosts, useAllUsers, useNotifications, useFollows, useUserProfile, ensureGuestUser, useSystemConfig } from './hooks';
import FeedView from './components/FeedView';
import ExploreView from './components/ExploreView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import VaultView from './components/VaultView';
import AdminView from './components/AdminView';
import Composer from './components/Composer';

function CpMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="256" y="390" textAnchor="middle" fontFamily="'Arial Black','Impact',sans-serif" fontWeight="900" fontSize="340" fill="white" letterSpacing="-20">CP</text>
    </svg>
  );
}

import AuthView from './components/AuthView';

export default function App() {
  const [tab, setTab] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('cplayz_user_id'));
  const [booting, setBooting] = useState(true);
  const [viewProfile, setViewProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dismissedAnnounce, setDismissedAnnounce] = useState(localStorage.getItem('cp_dismissed_announce'));

  useEffect(() => {
    const adminKey = localStorage.getItem('caister_admin');

    if (adminKey === 'CAISTER_CORE_ADMIN') {
      setIsAdmin(true);
    }

    setTimeout(() => setBooting(false), 500); // Small boot delay for the Slurp Shield animation
  }, []);

  const { posts, loading } = useRealtimePosts();
  const users = useAllUsers();
  const { notifications, unreadCount, refresh: refNotif } = useNotifications(userId);
  const followData = useFollows(userId);
  const { profile: me, refresh: refMe } = useUserProfile(userId);

  const pUser = viewProfile ? users.find(u => u.id === viewProfile) : null;
  const { config } = useSystemConfig();

  if (config) window.cplayz_config = config;

  const goProfile = uid => {
    setViewProfile(uid);
    setTab('profile');
  };

  const goTab = t => {
    if (tab === t) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (t === 'profile') setViewProfile(null);
      setTab(t);
      setTimeout(() => setIsTransitioning(false), 200);
    }, 200);
  };

  if (booting) {
    return (
      <div style={{ minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24,background:'var(--bg)' }}>
        <div className="slurp-shield-container">
          <div className="slurp-shield-outline">
            <div className="slurp-shield-fill" />
          </div>
          <ShieldAlert size={40} color="#fff" style={{ position: 'absolute', zIndex: 10 }} />
        </div>

        <div style={{ fontSize:16,fontWeight:900,letterSpacing:'0.12em',color:'var(--cyan)',fontFamily:'"Anton", sans-serif',textTransform:'uppercase' }}>
          Loading the Drop Zone…
        </div>
      </div>
    );
  }

  if (!userId) {
    return <AuthView onAuthSuccess={(id) => setUserId(id)} />;
  }

  const NAV = [
    { id: 'home', icon: Radio, label: 'Feed' },
    { id: 'explore', icon: Search, label: 'Island' },
    { id: 'vault', icon: Lock, label: 'Locker' },
    { id: 'profile', icon: User, label: 'Stats' },
  ];

  return (
    <div className="console">
      {config.lockdown && !isAdmin ? (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',padding:20,textAlign:'center' }}>
          <ShieldAlert size={64} color="#f43f5e" style={{ marginBottom:20 }} />

          <h1 style={{ fontSize:24,fontWeight:900,color:'#f43f5e',textTransform:'uppercase',letterSpacing:'0.1em' }}>
            Drop Zone Locked
          </h1>

          <p style={{ marginTop:10,color:'var(--text2)',fontSize:14 }}>
            CaisterPlayz is under maintenance. Drop back in later.
          </p>
        </div>
      ) : (
        <>
          <div className="rift-flash-overlay" />
          <header className="hud">
            <div className="hud-logo">
              <div className="cp-mark">
                <CpMark size={18} />
              </div>
              <span className="hud-name" style={{ display:'none' }}>
                CaisterPlayz
              </span>
            </div>

            <div className="hud-actions">
              {NAV.map(n => (
                <button
                  key={n.id}
                  className={`hud-btn${tab === n.id ? ' lit' : ''}`}
                  onClick={() => goTab(n.id)}
                  title={n.label}
                >
                  <n.icon size={18} fill={tab === n.id ? 'currentColor' : 'none'} />
                </button>
              ))}

              <button
                className={`hud-btn${tab === 'admin' ? ' lit' : ''}`}
                onClick={() => {
                  if (isAdmin) {
                    goTab('admin');
                  } else {
                    const key = prompt('Enter Admin Signal Key:');

                    if (key === 'CAISTER_CORE_ADMIN') {
                      localStorage.setItem('caister_admin', key);
                      setIsAdmin(true);
                      goTab('admin');
                    } else if (key) {
                      alert('Signal key denied.');
                    }
                  }
                }}
                title="Control Core"
                style={{ color:'#f43f5e' }}
              >
                <ShieldAlert size={18} />
              </button>

              <button
                className="hud-btn"
                onClick={() => setShowCompose(true)}
                title="Drop a Post"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>

              <button
                className={`hud-btn${tab === 'notifications' ? ' lit' : ''}`}
                onClick={() => goTab('notifications')}
                title="Echo Alerts"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="hud-pip" />}
              </button>
            </div>
          </header>

          <main className="main tab-container">
            <div className={`rift-wipe ${isTransitioning ? 'active' : ''}`} />
            <div className={`tab-content ${isTransitioning ? 'transitioning' : ''}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                {tab === 'home' && (
                  <FeedView
                    posts={posts}
                    loading={loading}
                    users={users}
                    currentUserId={userId}
                    notifications={notifications}
                    onProfileClick={goProfile}
                    config={config}
                  />
                )}

                {tab === 'explore' && (
                  <ExploreView
                    posts={posts}
                    users={users}
                    currentUserId={userId}
                    onProfileClick={goProfile}
                    config={config}
                  />
                )}

                {tab === 'vault' && (
                  <VaultView
                    posts={posts}
                    currentUserId={userId}
                    users={users}
                    onProfileClick={goProfile}
                    config={config}
                  />
                )}

                {tab === 'notifications' && (
                  <NotificationsView
                    notifications={notifications}
                    users={users}
                    currentUserId={userId}
                    onRefresh={refNotif}
                    onProfileClick={goProfile}
                  />
                )}

                {tab === 'profile' && (
                  <ProfileView
                    profile={pUser || me}
                    posts={posts}
                    users={users}
                    currentUserId={userId}
                    followData={viewProfile ? {} : followData}
                    onProfileClick={goProfile}
                    onRefresh={refMe}
                    config={config}
                  />
                )}

                {tab === 'admin' && isAdmin && (
                  <AdminView
                    posts={posts}
                    users={users}
                    currentUserId={userId}
                  />
                )}
              </div>

              <div className="brand-footer">
                Powered by CaisterPlayz — Fortnite & Fitness
              </div>
            </div>
          </main>

          {/* ─ Composer ─ */}
          {showCompose && userId && (
            <Composer
              currentUserId={userId}
              currentUser={me}
              onClose={() => setShowCompose(false)}
            />
          )}

          {/* ─ Global Announcement Modal ─ */}
          {config?.globalAnnouncement && !isAdmin && String(config.globalAnnouncement.timestamp) !== dismissedAnnounce && (
            <div className="modal-backdrop">
              <div className="modal" style={{ border: '2px solid var(--cyan)', boxShadow: '0 0 30px var(--cyan-glow)' }}>
                <div className="modal-head" style={{ color: 'var(--cyan)' }}>
                  <ShieldAlert size={20} />
                  BATTLE BUS BROADCAST
                </div>
                <div className="modal-body" style={{ textAlign: 'center', padding: '20px 10px', fontSize: 16 }}>
                  {config.globalAnnouncement.text}
                </div>
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                  <button 
                    className="btn primary" 
                    onClick={() => {
                      localStorage.setItem('cp_dismissed_announce', String(config.globalAnnouncement.timestamp));
                      setDismissedAnnounce(String(config.globalAnnouncement.timestamp));
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
