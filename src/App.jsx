import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Home, Search, Bell, User, Zap, RefreshCw, Film } from 'lucide-react';
import { useAuth, useUserProfile, usePosts, useNotifications, useFollows, useAllUsers, useAllFollows, useNewUserAlert, getCommentCounts } from './hooks';
import { Spinner, Toast, NewUserToast } from './components/Shared';
import HomeTab from './components/HomeTab';
import ExploreTab from './components/ExploreTab';
import ReelsTab from './components/ReelsTab';
import NotificationsTab from './components/NotificationsTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  const { user, loading: authLoading, error: authError, retry: authRetry } = useAuth();
  const profile = useUserProfile(user?.id);
  const { posts, loading: postsLoading } = usePosts();
  const allUsers = useAllUsers();
  const { following, followers } = useFollows(user?.id);
  const { notifications, unreadCount, newNotification } = useNotifications(user?.id);
  const allFollows = useAllFollows();
  const newUserAlert = useNewUserAlert(allUsers, user?.id);

  const [activeTab, setActiveTab] = useState('home');
  const [homeSubTab, setHomeSubTab] = useState('foryou');
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [prevTab, setPrevTab] = useState(null);
  const mainRef = useRef(null);

  const followingIds = useMemo(() => following.map(f => f.followingId), [following]);
  const followerIds = useMemo(() => followers.map(f => f.followerId), [followers]);

  // Comment counts per post
  const [commentCounts, setCommentCounts] = useState({});
  useEffect(() => {
    if (posts.length === 0) return;
    getCommentCounts(posts).then(setCommentCounts).catch(console.error);
  }, [posts]);

  const enrichedPosts = useMemo(() =>
    posts.map(p => ({ ...p, _commentCount: commentCounts[p.id] || 0 })),
    [posts, commentCounts]
  );

  const handleProfileClick = (userId) => {
    if (userId === user?.id && activeTab === 'profile' && !viewingProfileId) return;
    if (activeTab !== 'profile') setPrevTab(activeTab);
    setViewingProfileId(userId);
    setActiveTab('profile');
  };

  // Scroll to top when re-tapping active tab
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTabChange = (tab) => {
    if (tab === activeTab && !viewingProfileId) {
      // Re-tapping the same tab scrolls to top
      scrollToTop();
      return;
    }
    setActiveTab(tab);
    if (tab === 'profile') {
      setViewingProfileId(null);
      setPrevTab(null);
    } else {
      setViewingProfileId(null);
    }
    // Scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleProfileBack = () => {
    if (prevTab) {
      setActiveTab(prevTab);
      setPrevTab(null);
      setViewingProfileId(null);
    } else {
      setViewingProfileId(null);
    }
  };

  const showToast = newNotification && activeTab !== 'notifications';

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-dark-bg">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-10 h-10 text-brand-primary" fill="currentColor" />
          <span className="text-2xl font-black text-dark-text tracking-tight">CaisterPlayz</span>
        </div>
        <Spinner />
      </div>
    );
  }

  if (authError || !user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-dark-bg gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-10 h-10 text-brand-primary" fill="currentColor" />
          <span className="text-2xl font-black text-dark-text tracking-tight">CaisterPlayz</span>
        </div>
        <p className="text-dark-muted text-sm">
          {authError ? 'Could not connect to server' : 'Connecting...'}
        </p>
        {authError && (
          <button
            onClick={authRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold rounded-full hover:bg-brand-primary/90 transition-colors active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  const effectiveProfileId = viewingProfileId || user.id;

  return (
    <div className="w-full min-h-screen bg-dark-bg flex justify-center">
      <div className="w-full max-w-lg flex flex-col min-h-screen relative border-x border-dark-border">
        {/* ─── Top Header ─── */}
        <header className="sticky top-0 z-40 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border h-[53px] flex flex-col justify-center">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-brand-primary" fill="currentColor" />
              <span className="text-lg font-black text-dark-text tracking-tight">CaisterPlayz</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse-live" />
              <span className="text-xs font-semibold text-brand-success">Live</span>
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main ref={mainRef} className="flex-1 pb-20">
          {activeTab === 'home' && (
            <HomeTab
              subTab={homeSubTab}
              setSubTab={setHomeSubTab}
              posts={enrichedPosts}
              postsLoading={postsLoading}
              currentUserId={user.id}
              profile={profile}
              users={allUsers}
              followingIds={followingIds}
              onProfileClick={handleProfileClick}
              onNavigate={handleTabChange}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreTab
              posts={enrichedPosts}
              currentUserId={user.id}
              users={allUsers}
              followingIds={followingIds}
              onProfileClick={handleProfileClick}
            />
          )}

          {activeTab === 'reels' && (
            <ReelsTab
              posts={enrichedPosts}
              currentUserId={user.id}
              users={allUsers}
              onProfileClick={handleProfileClick}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab
              user={user}
              notifications={notifications}
              users={allUsers}
              onProfileClick={handleProfileClick}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              viewingUserId={effectiveProfileId}
              currentUserId={user.id}
              profile={profile}
              users={allUsers}
              posts={enrichedPosts}
              followingIds={followingIds}
              followerIds={followerIds}
              allFollows={allFollows}
              onProfileClick={handleProfileClick}
              onBack={handleProfileBack}
            />
          )}
        </main>

        {/* ─── Bottom Navigation ─── */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-dark-bg/90 backdrop-blur-xl border-t border-x border-dark-border safe-bottom z-40">
          <div className="flex items-center justify-around py-2">
            <NavItem icon={Home} active={activeTab === 'home'} onClick={() => handleTabChange('home')} />
            <NavItem icon={Search} active={activeTab === 'explore'} onClick={() => handleTabChange('explore')} />
            <NavItem icon={Film} active={activeTab === 'reels'} onClick={() => handleTabChange('reels')} label="Reels" />
            <NavItem icon={Bell} active={activeTab === 'notifications'} onClick={() => handleTabChange('notifications')} badge={unreadCount} />
            <NavItem icon={User} active={activeTab === 'profile' && !viewingProfileId} onClick={() => handleTabChange('profile')} />
          </div>
        </nav>

        {showToast && <Toast notification={newNotification} users={allUsers} />}
        {newUserAlert && !showToast && <NewUserToast user={newUserAlert} />}
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-full transition-all active:scale-90 ${
        active ? 'text-brand-primary' : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
      }`}
    >
      <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} fill={active ? 'currentColor' : 'none'} />
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-brand-primary text-white text-[10px] font-bold rounded-full animate-pop">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
