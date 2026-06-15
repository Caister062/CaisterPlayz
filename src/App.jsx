import { useState, useEffect } from 'react';
import { Home, Search, Bell, User, Plus, Loader } from 'lucide-react';
import { useRealtimePosts, useAllUsers, useNotifications, useFollows, useUserProfile, ensureGuestUser } from './hooks';
import FeedView from './components/FeedView';
import ExploreView from './components/ExploreView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import Composer from './components/Composer';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showComposer, setShowComposer] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewingProfile, setViewingProfile] = useState(null); // userId being viewed

  // Bootstrap guest auth
  useEffect(() => {
    ensureGuestUser()
      .then(user => {
        setCurrentUserId(user.id);
      })
      .catch(err => {
        console.error('Auth error:', err);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const { posts, loading: postsLoading, refresh: refreshPosts } = useRealtimePosts();
  const users = useAllUsers();
  const { notifications, unreadCount, refresh: refreshNotifs } = useNotifications(currentUserId);
  const followData = useFollows(currentUserId);
  const { profile: myProfile, refresh: refreshProfile } = useUserProfile(currentUserId);

  // Profile being viewed (own or other)
  const profileUser = viewingProfile
    ? users.find(u => u.id === viewingProfile)
    : myProfile;

  const handleProfileClick = (userId) => {
    setViewingProfile(userId);
    setActiveTab('profile');
  };

  const handleTabChange = (tab) => {
    if (tab === 'profile') setViewingProfile(null); // reset to own profile
    setActiveTab(tab);
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
        background: 'var(--bg)'
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: '0 0 40px rgba(59,130,246,0.4)',
          animation: 'floatAnim 2s ease-in-out infinite'
        }}>🎮</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '0.06em' }}>
          CAISTERPLAYZ
        </div>
        <Loader size={20} style={{ color: 'var(--brand)', animation: 'spin 1s linear infinite' }} />
        <style>{`
          @keyframes floatAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const TAB_HEADER_TITLES = {
    feed: 'CaisterPlayz',
    explore: 'Explore',
    notifications: 'Notifications',
    profile: profileUser?.displayName || 'Profile',
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="top-header">
        <h1>{TAB_HEADER_TITLES[activeTab]}</h1>
        <div className="header-actions">
          {activeTab === 'notifications' && unreadCount > 0 && (
            <span style={{
              background: 'var(--danger)', color: 'white', borderRadius: 999,
              fontSize: 11, fontWeight: 700, padding: '2px 7px'
            }}>{unreadCount}</span>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="feed-scroll">
        {activeTab === 'feed' && (
          <FeedView
            posts={posts}
            loading={postsLoading}
            users={users}
            currentUserId={currentUserId}
            onProfileClick={handleProfileClick}
          />
        )}
        {activeTab === 'explore' && (
          <ExploreView
            posts={posts}
            users={users}
            currentUserId={currentUserId}
            onProfileClick={handleProfileClick}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            users={users}
            currentUserId={currentUserId}
            onRefresh={refreshNotifs}
          />
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
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button
          className={`nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => handleTabChange('feed')}
        >
          <Home size={22} fill={activeTab === 'feed' ? 'currentColor' : 'none'} />
          <span>Home</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => handleTabChange('explore')}
        >
          <Search size={22} />
          <span>Explore</span>
        </button>

        {/* Compose button */}
        <button className="nav-compose" onClick={() => setShowComposer(true)}>
          <Plus size={24} strokeWidth={2.5} />
        </button>

        <button
          className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => handleTabChange('notifications')}
          style={{ position: 'relative' }}
        >
          <Bell size={22} fill={activeTab === 'notifications' ? 'currentColor' : 'none'} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 10,
              background: 'var(--danger)', color: 'white',
              borderRadius: 999, fontSize: 9, fontWeight: 700,
              padding: '1px 4px', border: '1.5px solid var(--bg)'
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
          <span>Activity</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          {myProfile?.avatarUrl ? (
            <img
              src={myProfile.avatarUrl}
              style={{
                width: 26, height: 26, borderRadius: '50%', objectFit: 'cover',
                border: activeTab === 'profile' ? '2px solid var(--brand)' : '2px solid var(--border)'
              }}
              alt=""
            />
          ) : (
            <User size={22} fill={activeTab === 'profile' ? 'currentColor' : 'none'} />
          )}
          <span>Profile</span>
        </button>
      </nav>

      {/* Composer Modal */}
      {showComposer && currentUserId && (
        <Composer
          currentUserId={currentUserId}
          currentUser={myProfile}
          onClose={() => setShowComposer(false)}
          onPosted={() => {
            setShowComposer(false);
            setActiveTab('feed');
          }}
        />
      )}
    </div>
  );
}
