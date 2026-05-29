import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Home, Search, Bell, User, Gamepad2, RefreshCw, Film, MessageSquare, Menu, X, Award, Users, List, Settings } from 'lucide-react';
import { useAuth, useUserProfile, usePosts, useNotifications, useFollows, useAllUsers, useAllFollows, useNewUserAlert, getCommentCounts, useDMThreads, useCommunities } from './hooks';
import { Spinner, Toast, NewUserToast, Avatar } from './components/Shared';
import HomeTab from './components/HomeTab';
import ExploreTab from './components/ExploreTab';
import ReelsTab from './components/ReelsTab';
import NotificationsTab from './components/NotificationsTab';
import ProfileTab from './components/ProfileTab';
import Auth from './components/Auth';
import DirectMessages from './components/DirectMessages';

import SettingsModal from './components/SettingsModal';
import CreatorStudio from './components/CreatorStudio';
import ListsModal from './components/ListsModal';
import CommunitiesTab from './components/CommunitiesTab';

export default function App() {
  const auth = useAuth();
  const { user, loading: authLoading, error: authError, retry: authRetry, logout } = auth;
  const profile = useUserProfile(user?.id);
  const { posts, loading: postsLoading, hasMore, loadingMore, loadMore, refresh: refreshPosts } = usePosts();
  const allUsers = useAllUsers();
  const { following, followers } = useFollows(user?.id);
  const { notifications, unreadCount, newNotification } = useNotifications(user?.id);
  const allFollows = useAllFollows();
  const newUserAlert = useNewUserAlert(allUsers, user?.id);
  const { communities } = useCommunities();

  const [activeTab, setActiveTab] = useState('home');
  const [homeSubTab, setHomeSubTab] = useState('foryou');
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [prevTab, setPrevTab] = useState(null);
  const [tabTransitioning, setTabTransitioning] = useState(false);
  
  // Advanced features state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreatorStudioOpen, setIsCreatorStudioOpen] = useState(false);
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false);
  const [quotedPost, setQuotedPost] = useState(null);
  const [dmRecipientId, setDmRecipientId] = useState(null);

  const [isDmOpen, setIsDmOpen] = useState(false);
  const mainRef = useRef(null);

  const followingIds = useMemo(() => following.map(f => f.followingId), [following]);
  const followerIds = useMemo(() => followers.map(f => f.followerId), [followers]);

  // DM threads and unread calculation
  const { threads: dmThreads } = useDMThreads(user?.id);
  const hasUnreadDms = useMemo(() => {
    return dmThreads.some(t => t.lastMessage && t.lastMessage.senderId !== user?.id && !t.lastMessage.read);
  }, [dmThreads, user?.id]);

  // Dynamic hashtag search routing
  const handleHashtagClick = useCallback((tag) => {
    setExploreSearchQuery(tag);
    setActiveTab('explore');
  }, []);

  // Comment counts per post
  const [commentCounts, setCommentCounts] = useState({});
  useEffect(() => {
    if (!posts || posts.length === 0) return;
    getCommentCounts(posts).then(setCommentCounts).catch(console.error);
  }, [posts]);

  const enrichedPosts = useMemo(() =>
    posts.map(p => ({ ...p, _commentCount: commentCounts[p.id] || 0 })),
    [posts, commentCounts]
  );

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;

      // Trigger when user is within 300px of bottom
      if (scrollHeight - scrollTop - clientHeight < 300) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [loadMore]);

  const handleProfileClick = (userId) => {
    if (userId === user?.id && activeTab === 'profile' && !viewingProfileId) return;
    if (activeTab !== 'profile') setPrevTab(activeTab);
    setViewingProfileId(userId);
    setActiveTab('profile');
  };

  const handleMessageClick = (recipientId) => {
    setDmRecipientId(recipientId);
    setIsDmOpen(true);
  };

  // Scroll to top when re-tapping active tab
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTabChange = (tab) => {
    if (tab === activeTab && !viewingProfileId) {
      // Re-tapping the same tab scrolls to top
      scrollToTop();
      if (tab === 'explore') setExploreSearchQuery('');
      return;
    }
    setTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      if (tab === 'profile') {
        setViewingProfileId(null);
        setPrevTab(null);
      } else {
        setViewingProfileId(null);
      }
      // Scroll to top on tab change
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => {
        setTabTransitioning(false);
      }, 150);
    }, 350);
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
          <Gamepad2 className="w-10 h-10 text-brand-primary" fill="currentColor" />
          <span className="text-2xl font-black text-dark-text tracking-tight">CaisterPlayz</span>
        </div>
        <Spinner />
      </div>
    );
  }

  if (authError || !user) {
    return <Auth auth={auth} />;
  }

  const effectiveProfileId = viewingProfileId || user.id;

  return (
    <div className="w-full min-h-screen bg-dark-bg flex justify-center">
      <div className="w-full max-w-lg flex flex-col min-h-screen relative border-x border-dark-border overflow-x-hidden">
        {/* Sleek Glassmorphic Tab Transition Loading Overlay */}
        {tabTransitioning && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-dark-bg/85 backdrop-blur-md animate-fade-in">
            {/* Top glowing progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 animate-tab-progress" />
            
            {/* Center pulsing icon & spinner */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center relative">
                <Gamepad2 className="w-8 h-8 text-brand-primary animate-pulse" />
              </div>
              <p className="text-[10px] font-bold text-brand-primary tracking-widest uppercase animate-pulse">
                Loading...
              </p>
            </div>
          </div>
        )}
        {/* ─── Top Header (Hidden on Reels Tab for a clean, immersive look) ─── */}
        {activeTab !== 'reels' && (
          <header className="sticky top-0 z-40 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border h-[53px] flex flex-col justify-center">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 rounded-full text-dark-muted hover:text-brand-primary hover:bg-dark-hover transition-all duration-200 active:scale-95 cursor-pointer"
                  title="Main Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <Gamepad2 className="w-6 h-6 text-brand-primary" fill="currentColor" />
                  <span className="text-lg font-black text-dark-text tracking-tight">CaisterPlayz</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDmOpen(true)}
                  className="p-2 rounded-full text-dark-muted hover:text-brand-primary hover:bg-dark-hover transition-all duration-200 relative active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" />
                  {hasUnreadDms && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-primary rounded-full ring-2 ring-dark-bg animate-pulse" />
                  )}
                </button>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse-live" />
                  <span className="text-xs font-semibold text-brand-success">Live</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* ─── Main Content ─── */}
        <main ref={mainRef} className="flex-1 pb-20">
          {activeTab === 'home' && (
            <HomeTab
              subTab={homeSubTab}
              setSubTab={setHomeSubTab}
              posts={enrichedPosts}
              postsLoading={postsLoading}
              hasMore={hasMore}
              loadingMore={loadingMore}
              currentUserId={user.id}
              profile={profile}
              users={allUsers}
              followingIds={followingIds}
              onProfileClick={handleProfileClick}
              onNavigate={handleTabChange}
              onHashtagClick={handleHashtagClick}
              onQuote={(post) => setQuotedPost(post)}
              quotedPost={quotedPost}
              onClearQuote={() => setQuotedPost(null)}
              communities={communities}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreTab
              posts={enrichedPosts}
              hasMore={hasMore}
              loadingMore={loadingMore}
              currentUserId={user.id}
              users={allUsers}
              followingIds={followingIds}
              onProfileClick={handleProfileClick}
              searchQuery={exploreSearchQuery}
              setSearchQuery={setExploreSearchQuery}
              onHashtagClick={handleHashtagClick}
              onQuote={(post) => setQuotedPost(post)}
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
              hasMore={hasMore}
              loadingMore={loadingMore}
              followingIds={followingIds}
              followerIds={followerIds}
              allFollows={allFollows}
              onProfileClick={handleProfileClick}
              onBack={handleProfileBack}
              onProfileUpdate={authRetry}
              onLogout={logout}
              onHashtagClick={handleHashtagClick}
              onMessageClick={handleMessageClick}
              onQuote={(post) => setQuotedPost(post)}
            />
          )}
        </main>

        {/* ─── Bottom Navigation ─── */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-dark-bg/90 backdrop-blur-xl border-t border-x border-dark-border safe-bottom z-40">
          <div className="flex items-center justify-around py-2">
            <NavItem icon={Home} active={activeTab === 'home'} onClick={() => handleTabChange('home')} />
            <NavItem icon={Search} active={activeTab === 'explore'} onClick={() => handleTabChange('explore')} />
            <NavItem icon={Film} active={activeTab === 'reels'} onClick={() => handleTabChange('reels')} />
            <NavItem icon={Bell} active={activeTab === 'notifications'} onClick={() => handleTabChange('notifications')} badge={unreadCount} />
            <NavItem icon={User} active={activeTab === 'profile'} onClick={() => handleTabChange('profile')} />
          </div>
        </nav>

        {showToast && <Toast notification={newNotification} users={allUsers} />}
        {newUserAlert && !showToast && <NewUserToast user={newUserAlert} />}

        {/* Direct Messages Drawer */}
        <DirectMessages 
          isOpen={isDmOpen} 
          onClose={() => setIsDmOpen(false)} 
          currentUserId={user.id} 
          users={allUsers} 
          initialRecipientId={dmRecipientId}
        />

        {/* Sliding Sidebar Drawer */}
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-modal-overlay"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Sliding Panel */}
            <div 
              className="fixed top-0 left-0 h-full w-64 max-w-[80vw] bg-dark-surface border-r border-dark-border z-50 p-6 flex flex-col justify-between shadow-2xl animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-brand-primary" fill="currentColor" />
                    <span className="text-lg font-black text-dark-text">CaisterPlayz</span>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-hover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* User Profile Mini Card */}
                <div 
                  className="flex items-center gap-3 p-3 bg-dark-bg/40 border border-dark-border/60 rounded-2xl hover:bg-dark-bg/85 cursor-pointer transition-all"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    handleProfileClick(user.id);
                  }}
                >
                  <Avatar src={profile?.avatarUrl} name={profile?.displayName} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-xs text-dark-text truncate">{profile?.displayName || user.displayName}</h4>
                      {profile?.verified && (
                        <svg className="w-3.5 h-3.5 text-brand-primary fill-current flex-shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </div>
                    <p className="text-[10px] text-dark-muted truncate">@{profile?.displayName?.toLowerCase().replace(/\s+/g, '')}</p>
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => { setIsSidebarOpen(false); setIsCreatorStudioOpen(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-hover text-dark-text font-bold text-xs transition-colors text-left cursor-pointer"
                  >
                    <Award className="w-4.5 h-4.5 text-brand-secondary" />
                    <span>Creator Studio</span>
                  </button>
                  <button
                    onClick={() => { setIsSidebarOpen(false); setIsCommunitiesOpen(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-hover text-dark-text font-bold text-xs transition-colors text-left cursor-pointer"
                  >
                    <Users className="w-4.5 h-4.5 text-brand-primary" />
                    <span>Gaming Rooms</span>
                  </button>
                  <button
                    onClick={() => { setIsSidebarOpen(false); setIsListsOpen(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-hover text-dark-text font-bold text-xs transition-colors text-left cursor-pointer"
                  >
                    <List className="w-4.5 h-4.5 text-brand-success" />
                    <span>Custom Timelines</span>
                  </button>
                  <button
                    onClick={() => { setIsSidebarOpen(false); setIsSettingsOpen(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-hover text-dark-text font-bold text-xs transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4.5 h-4.5 text-dark-muted" />
                    <span>Preferences & Settings</span>
                  </button>
                </div>
              </div>

              {/* Footer Profile actions */}
              <div className="border-t border-dark-border/60 pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 border border-brand-danger/30 hover:bg-brand-danger/10 text-brand-danger rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modular Overlays */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          user={user} 
          profile={profile} 
          onProfileUpdate={authRetry} 
        />

        <CreatorStudio 
          isOpen={isCreatorStudioOpen} 
          onClose={() => setIsCreatorStudioOpen(false)} 
          user={user} 
          profile={profile} 
          posts={enrichedPosts} 
          followersCount={followerIds.length} 
        />

        <ListsModal 
          isOpen={isListsOpen} 
          onClose={() => setIsListsOpen(false)} 
          user={user} 
          allUsers={allUsers} 
          posts={enrichedPosts} 
          onProfileClick={handleProfileClick} 
        />

        <CommunitiesTab 
          isOpen={isCommunitiesOpen} 
          onClose={() => setIsCommunitiesOpen(false)} 
          user={user} 
          allUsers={allUsers} 
          posts={enrichedPosts} 
          onProfileClick={handleProfileClick} 
          refreshAllPosts={refreshPosts}
        />
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, active, onClick, badge }) {
  // Safe fill strategy depending on whether icon allows path fills cleanly
  const shouldFill = active && (Icon === Home || Icon === Bell || Icon === User);

  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-full transition-all active:scale-90 ${
        active ? 'text-brand-primary' : 'text-dark-muted hover:text-dark-text hover:bg-dark-hover'
      }`}
    >
      <Icon 
        className="w-6 h-6" 
        strokeWidth={active ? 2.5 : 1.5} 
        fill={shouldFill ? 'currentColor' : 'none'} 
      />
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-brand-primary text-white text-[10px] font-bold rounded-full animate-pop">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
