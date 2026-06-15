import { useState, useEffect } from 'react';
import { Home, Search, Bell, User, Plus, Lock, Swords, Loader } from 'lucide-react';
import { useRealtimePosts, useAllUsers, useNotifications, useFollows, useUserProfile, ensureGuestUser } from './hooks';
import FeedView from './components/FeedView';
import ExploreView from './components/ExploreView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import VaultView from './components/VaultView';
import SquadsView from './components/SquadsView';
import Composer from './components/Composer';

/*
  Tabs:  Home | Explore | (+) | Vault | Profile
  With sub-pages: Notifications, Squads accessed via header buttons
*/

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showComposer, setShowComposer] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewingProfile, setViewingProfile] = useState(null);

  // Auth bootstrap
  useEffect(() => {
    ensureGuestUser()
      .then(user => setCurrentUserId(user.id))
      .catch(err => console.error('Auth failed:', err))
      .finally(() => setAuthLoading(false));
  }, []);

  // Data hooks — all realtime
  const { posts, loading: postsLoading } = useRealtimePosts();
  const users = useAllUsers();
  const { notifications, unreadCount, refresh: refreshNotifs } = useNotifications(currentUserId);
  const followData = useFollows(currentUserId);
  const { profile: myProfile, refresh: refreshProfile } = useUserProfile(currentUserId);

  const profileUser = viewingProfile ? users.find(u => u.id === viewingProfile) : myProfile;

  const handleProfileClick = (userId) => {
    setViewingProfile(userId);
    setActiveTab('profile');
  };

  const handleTabChange = (tab) => {
    if (tab === 'profile') setViewingProfile(null);
    setActiveTab(tab);
  };

  // Loading state
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 22,
        background: 'var(--bg, #06080f)'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg, #0061ff, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, boxShadow: '0 0 40px rgba(0,212,255,0.4)',
          animation: 'floatBoot 2s ease-in-out infinite'
        }}>🎮</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
          CAISTERPLAYZ
        </div>
        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Loading your world…
        </div>
        <Loader size={18} style={{ color: '#00d4ff', animation: 'spinBoot 0.8s linear infinite' }} />
        <style>{`
          @keyframes floatBoot { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes spinBoot { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Header title based on tab
  const titles = {
    home: null, // show logo
    explore: 'Explore',
    vault: 'Vault',
    squads: 'Squads',
    notifications: 'Notifications',
    profile: viewingProfile ? (profileUser?.displayName || 'Player') : 'Profile',
  };

  const showLogo = activeTab === 'home';

  return (
    <div className="app">
      {/* ─── Header ─── */}
      <header className="app-header">
        {showLogo ? (
          <div className="header-logo">
            <div className="header-logo-icon">🎮</div>
            <span className="header-logo-text">CaisterPlayz</span>
          </div>
        ) : (
          <span style={{ fontSize: 17, fontWeight: 900 }}>{titles[activeTab]}</span>
        )}

        <div className="header-right">
          {/* Squads btn */}
          <button
            className={`header-btn${activeTab === 'squads' ? '' : ''}`}
            onClick={() => handleTabChange('squads')}
            style={activeTab === 'squads' ? { color: 'var(--brand)' } : {}}
            title="Squads"
          >
            <Swords />
          </button>

          {/* Notifications btn */}
          <button
            className="header-btn"
            onClick={() => handleTabChange('notifications')}
            style={activeTab === 'notifications' ? { color: 'var(--brand)' } : {}}
            title="Notifications"
          >
            <Bell size={20} fill={activeTab === 'notifications' ? 'currentColor' : 'none'} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="view-scroll">
        {activeTab === 'home' && (
          <FeedView posts={posts} loading={postsLoading} users={users} currentUserId={currentUserId} onProfileClick={handleProfileClick} />
        )}
        {activeTab === 'explore' && (
          <ExploreView posts={posts} users={users} currentUserId={currentUserId} onProfileClick={handleProfileClick} />
        )}
        {activeTab === 'vault' && (
          <VaultView posts={posts} currentUserId={currentUserId} users={users} onProfileClick={handleProfileClick} />
        )}
        {activeTab === 'squads' && (
          <SquadsView posts={posts} users={users} currentUserId={currentUserId} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsView notifications={notifications} users={users} currentUserId={currentUserId} onRefresh={refreshNotifs} onProfileClick={handleProfileClick} />
        )}
        {activeTab === 'profile' && (
          <ProfileView
            profile={profileUser || myProfile}
            posts={posts}
            users={users}
            currentUserId={currentUserId}
            followData={viewingProfile ? {} : followData}
            onProfileClick={handleProfileClick}
            onRefresh={refreshProfile}
          />
        )}
      </main>

      {/* ─── Bottom Nav ─── */}
      <nav className="bottom-nav">
        {/* Home */}
        <button className={`nav-item${activeTab === 'home' ? ' active' : ''}`} onClick={() => handleTabChange('home')}>
          <Home size={22} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
          <span>Home</span>
        </button>

        {/* Explore */}
        <button className={`nav-item${activeTab === 'explore' ? ' active' : ''}`} onClick={() => handleTabChange('explore')}>
          <Search size={22} />
          <span>Explore</span>
        </button>

        {/* Compose (FAB center) */}
        <div className="nav-compose-btn">
          <button className="nav-compose-inner" onClick={() => setShowComposer(true)}>
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Vault */}
        <button className={`nav-item${activeTab === 'vault' ? ' active' : ''}`} onClick={() => handleTabChange('vault')}>
          <Lock size={22} fill={activeTab === 'vault' ? 'currentColor' : 'none'} />
          <span>Vault</span>
        </button>

        {/* Profile */}
        <button className={`nav-item${activeTab === 'profile' && !viewingProfile ? ' active' : ''}`} onClick={() => handleTabChange('profile')}>
          {myProfile?.avatarUrl ? (
            <img
              src={myProfile.avatarUrl}
              style={{
                width: 24, height: 24, borderRadius: '50%', objectFit: 'cover',
                border: (activeTab === 'profile' && !viewingProfile) ? '2px solid var(--brand)' : '2px solid var(--border-bright)',
              }}
              alt=""
            />
          ) : (
            <User size={22} fill={(activeTab === 'profile' && !viewingProfile) ? 'currentColor' : 'none'} />
          )}
          <span>Profile</span>
        </button>
      </nav>

      {/* ─── Composer Modal ─── */}
      {showComposer && currentUserId && (
        <Composer
          currentUserId={currentUserId}
          currentUser={myProfile}
          onClose={() => setShowComposer(false)}
        />
      )}
    </div>
  );
}
