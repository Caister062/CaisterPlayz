import { useState, useEffect } from 'react';
import { Radio, Search, Lock, User, Plus, Bell, Loader, ShieldAlert, MessageSquare, Trophy } from 'lucide-react';
import pb from './pocketbase';
import { useRealtimePosts, useAllUsers, useNotifications, useFollows, useUserProfile, useSystemConfig, useSquads } from './hooks';
import { applyTheme } from './utils';
import FeedView from './components/FeedView';
import AdminView from './components/AdminView';
import Composer from './components/Composer';

import DailyQuestView from './components/DailyQuestView';
import WorkoutsView from './components/WorkoutsView';
import ChallengesView from './components/ChallengesView';
import ProgressView from './components/ProgressView';
import SeasonsView from './components/SeasonsView';
import GuildsView from './components/GuildsView';
import PlayerStatsView from './components/PlayerStatsView';
import NotificationsView from './components/NotificationsView';
import LoadingScreen from './components/LoadingScreen';

function CpMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="256" y="390" textAnchor="middle" fontFamily="'Arial Black','Impact',sans-serif" fontWeight="900" fontSize="340" fill="white" letterSpacing="-20">CP</text>
    </svg>
  );
}

import AuthView from './components/AuthView';

export default function App() {
  const [tab, setTab] = useState('daily_quest');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dmRecipientId, setDmRecipientId] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [userId, setUserId] = useState(pb.authStore.model?.id || null);
  const [booting, setBooting] = useState(true);
  const [viewProfile, setViewProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [exploreQuery, setExploreQuery] = useState('');
  const [dismissedAnnounce, setDismissedAnnounce] = useState(localStorage.getItem('cp_dismissed_announce'));

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const state = urlParams.get('state');
      const code = urlParams.get('code');

      if (state && code) {
        try {
          // Try localStorage first, then fallback to cookie to survive Safari ITP
          let providerStr = localStorage.getItem('oauth_provider');
          if (!providerStr) {
            const match = document.cookie.match(new RegExp('(^| )oauth_provider=([^;]+)'));
            if (match) providerStr = decodeURIComponent(match[2]);
          }

          if (providerStr) {
            localStorage.removeItem('oauth_provider');
            document.cookie = 'oauth_provider=; Max-Age=0; path=/';
            
            const provider = JSON.parse(providerStr);
            const redirectUrl = provider.redirectUrl || (window.location.origin + window.location.pathname);
            
            const authData = await pb.collection('users').authWithOAuth2Code(
              provider.name,
              code,
              provider.codeVerifier,
              redirectUrl,
              { displayName: 'Operator' }
            );
            
            if (authData.record.displayName === 'Operator' && authData.meta?.name) {
              await pb.collection('users').update(authData.record.id, { displayName: authData.meta.name });
            }
            
            localStorage.setItem('cplayz_user_id', authData.record.id);
            setUserId(authData.record.id);
          } else {
            throw new Error('Login session expired. Please try again.');
          }
        } catch (e) {
          console.error('OAuth callback failed', e);
          alert('Authentication failed: ' + e.message);
        } finally {
          localStorage.removeItem('oauth_provider');
          document.cookie = 'oauth_provider=; Max-Age=0; path=/';
          window.history.replaceState(null, '', window.location.pathname);
          setBooting(false);
        }
      }
    };
    handleOAuthRedirect();

    const adminKey = localStorage.getItem('caister_admin');
    const adminEmails = ['caismoretton@gmail.com', 'nexusnpc0@gmail.com'];

    if (adminKey === 'CAISTER_CORE_ADMIN') {
      setIsAdmin(true);
    }

    const savedTheme = localStorage.getItem('cplayz_theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    }

    const unsub = pb.authStore.onChange((token, model) => {
      setUserId(model?.id || null);
      if (model?.email && adminEmails.includes(model.email.toLowerCase())) {
        setIsAdmin(true);
      }
    }, true);

    // Online Presence Heartbeat
    let presenceInterval;
    if (pb.authStore.isValid) {
      const pingPresence = async () => {
        try {
          await pb.collection('users').update(pb.authStore.model.id, {
            isOnline: true,
            lastActive: new Date().toISOString()
          });
        } catch (err) {
          if (err.status === 401 || err.status === 404) {
            console.warn('Session expired or account deleted. Logging out.');
            pb.authStore.clear();
            localStorage.removeItem('cplayz_user_id');
            setUserId(null);
          }
        }
      };
      pingPresence();
      presenceInterval = setInterval(pingPresence, 60000); // Every minute
    }

    if (window.location.search.includes('code=')) {
      // Don't disable booting yet, wait for OAuth to finish in the handleOAuthRedirect promise
    } else {
      setTimeout(() => setBooting(false), 800); // Fast load that completes animation
    }
    
    return () => {
      unsub();
      if (presenceInterval) clearInterval(presenceInterval);
    };
  }, []);

  const { posts, newPostsQueue, flushNewPosts, latestPostId, loading, loadMore, hasMore, loadingMore, refresh: refPosts } = useRealtimePosts();
  const users = useAllUsers();
  const { squads } = useSquads();
  const { notifications, unreadCount, refresh: refNotif } = useNotifications(userId);
  const followData = useFollows(userId);
  const { profile: me, refresh: refMe } = useUserProfile(userId);

  const pUser = viewProfile ? users.find(u => u.id === viewProfile) : null;
  const { config } = useSystemConfig();

  if (config) window.cplayz_config = config;

  const goProfile = uid => {
    if (uid === userId) {
      setTab('progress');
    } else {
      setViewProfile(uid);
      setTab('player_stats');
    }
  };

  const goHashtag = tag => {
    setExploreQuery(tag);
    setTab('explore');
  };

  const goMention = mentionStr => {
    const username = mentionStr.slice(1).toLowerCase();
    const targetUser = users.find(u => u.displayName.toLowerCase() === username);
    if (targetUser) {
      goProfile(targetUser.id);
    }
  };

  const goTab = t => {
    if (tab === t) {
      if (t === 'profile' && viewProfile) {
        setViewProfile(null);
      }
      return;
    }
    
    // Haptic feedback on nav switch
    if (navigator.vibrate) navigator.vibrate(8);
    
    // Switch immediately to prevent getting stuck
    if (t === 'profile') setViewProfile(null);
    setTab(t);
    
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (booting) {
    return <LoadingScreen />;
  }

  if (!userId) {
    return <AuthView onAuthSuccess={(id) => setUserId(id)} />;
  }

  const NAV = [
    { id: 'daily_quest', icon: Radio, label: 'Quest' },
    { id: 'workouts', icon: Search, label: 'Workouts' },
    { id: 'leaderboards', icon: Trophy, label: 'Leaderboards' },
    { id: 'guilds', icon: ShieldAlert, label: 'Guilds' },
    { id: 'seasons', icon: Star, label: 'Seasons' },
    { id: 'progress', icon: User, label: 'Progress' },
    { id: 'home', icon: Bell, label: 'Community' },
  ];

  return (
    <div className="console">
      {config?.lockdown && !isAdmin ? (
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
                    const key = prompt('Enter Control Core Key:');
                    if (key && key.trim() === 'CAISTER_CORE_ADMIN') {
                      localStorage.setItem('caister_admin', 'CAISTER_CORE_ADMIN');
                      setIsAdmin(true);
                      goTab('admin');
                    } else if (key) {
                      alert('Access denied.');
                    }
                  }
                }}
                title="Control Core"
                style={{ color:'#f43f5e' }}
              >
                <ShieldAlert size={18} />
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
            <div className={`tab-content ${isTransitioning ? 'tab-slide-enter' : ''}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                {tab === 'daily_quest' && <DailyQuestView user={me} config={config} users={users} onOpenComposer={() => setShowCompose(true)} />}
                {tab === 'workouts' && <WorkoutsView onOpenComposer={() => setShowCompose(true)} posts={posts.filter(p => p.type === 'workout_log' && p.userId === userId)} users={users} currentUserId={userId} />}
                {tab === 'leaderboards' && <ChallengesView posts={posts} users={users} currentUserId={userId} />}
                {tab === 'guilds' && <GuildsView currentUserId={userId} users={users} />}
                {tab === 'seasons' && <SeasonsView config={config} />}
                {tab === 'progress' && <ProgressView user={me} onRefresh={refMe} />}
                {tab === 'player_stats' && <PlayerStatsView user={pUser} onBack={() => setTab('home')} />}
                {tab === 'notifications' && <NotificationsView notifications={notifications} users={users} currentUserId={userId} onRefresh={refNotif} />}
                {tab === 'home' && (
                  <FeedView
                    posts={posts.filter(p => p.type === 'workout_log')}
                    newPostsQueue={newPostsQueue}
                    flushNewPosts={flushNewPosts}
                    latestPostId={latestPostId}
                    loading={loading}
                    users={users}
                    currentUserId={userId}
                    notifications={notifications}
                    loadMore={loadMore}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onProfileClick={goProfile}
                    onHashtagClick={goHashtag}
                    onMentionClick={goMention}
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
                Powered by CaisterPlayz — Level Up Your Fitness
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
                  COMMUNITY BROADCAST
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
