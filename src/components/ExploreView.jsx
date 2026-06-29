import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Radar, Loader2, Users, Users2 } from 'lucide-react';
import { GridCard } from './PostCard';
import ExpandedBroadcast from './PostCard';
import { Avatar } from './Shared';

export default function ExploreView({ 
  posts, 
  users, 
  squads = [],
  currentUserId, 
  onProfileClick,
  onHashtagClick,
  onMentionClick,
  loadMore,
  hasMore,
  loadingMore,
  initialQuery = ''
}) {
  const [q, setQ] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all'); // all, posts, users, squads
  const [expanded, setExpanded] = useState(null);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && activeTab === 'all') {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore, activeTab]);

  const isScanning = q.trim().length > 0;
  const lq = q.toLowerCase();

  const filteredPosts = useMemo(() => {
    if (!isScanning) return [];
    return posts.filter(p =>
      (p.text || '').toLowerCase().includes(lq) ||
      (users.find(u => u.id === p.userId)?.displayName || '').toLowerCase().includes(lq)
    );
  }, [q, posts, users, isScanning, lq]);

  const filteredUsers = useMemo(() => {
    if (!isScanning) return [];
    return users.filter(u => u.displayName.toLowerCase().includes(lq));
  }, [q, users, isScanning, lq]);

  const filteredSquads = useMemo(() => {
    if (!isScanning) return [];
    return squads.filter(s => s.name.toLowerCase().includes(lq));
  }, [q, squads, isScanning, lq]);

  const signalTags = useMemo(() => {
    const c = {};
    posts.forEach(p => {
      (p.text || '').match(/#\w+/g)?.forEach(t => {
        c[t] = (c[t] || 0) + 1;
      });
    });
    return Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const media = useMemo(
    () => posts.filter(p => p.imageUrl).slice(0, 24),
    [posts]
  );

  const featured = useMemo(() => {
    const ids = window.cplayz_config?.featuredPosts || [];
    return posts.filter(p => ids.includes(p.id));
  }, [posts]);

  return (
    <div>
      {/* RADAR SEARCH */}
      <div className="arena-search">
        <div className="arena-box">
          <Radar size={14} />
          <input
            placeholder="Search posts, players, tags, squads..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {isScanning ? (
        <>
          {/* TABS */}
          <div className="flex gap-2 px-4 mb-4 overflow-x-auto hide-scrollbar">
            {['all', 'users', 'squads', 'posts'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeTab === t ? 'bg-brand-primary text-white' : 'bg-dark-surface text-dark-muted hover:bg-dark-hover'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="sec">
            <span className="sec-label">Search Results</span>
          </div>

          {(activeTab === 'all' || activeTab === 'users') && filteredUsers.length > 0 && (
            <div className="px-4 mb-6 space-y-2">
              <h3 className="text-xs font-bold text-dark-muted uppercase tracking-wider mb-2">Users</h3>
              {filteredUsers.slice(0, activeTab === 'all' ? 3 : undefined).map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-dark-surface rounded-xl cursor-pointer hover:bg-dark-hover" onClick={() => onProfileClick(u.id)}>
                  <Avatar src={u.avatarUrl} name={u.displayName} size="md" />
                  <div>
                    <div className="font-bold">{u.displayName}</div>
                    <div className="text-xs text-dark-muted">{u.bio || 'Player'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'squads') && filteredSquads.length > 0 && (
            <div className="px-4 mb-6 space-y-2">
              <h3 className="text-xs font-bold text-dark-muted uppercase tracking-wider mb-2">Squads</h3>
              {filteredSquads.slice(0, activeTab === 'all' ? 3 : undefined).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-dark-surface rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs text-brand-primary">Squad</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'posts') && filteredPosts.length > 0 && (
            <div className="px-2 mb-6">
              <h3 className="text-xs font-bold text-dark-muted uppercase tracking-wider mb-2 pl-2">Posts</h3>
              <div className="grid">
                {filteredPosts.map(p => (
                  <GridCard
                    key={p.id}
                    post={p}
                    users={users}
                    onClick={setExpanded}
                    onProfileClick={onProfileClick}
                    onHashtagClick={onHashtagClick}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && filteredSquads.length === 0 && filteredPosts.length === 0 && (
            <div className="empty">
              <div className="empty-ico">📡</div>
              <h3>No results found</h3>
              <p>Try a different keyword.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* FEATURED */}
          {featured.length > 0 && (
            <>
              <div className="sec">
                <span className="sec-label">Featured Items</span>
              </div>

              <div className="grid" style={{ marginBottom: 20 }}>
                {featured.map(p => (
                  <GridCard
                    key={p.id}
                    post={p}
                    users={users}
                    onClick={setExpanded}
                    onProfileClick={onProfileClick}
                    onHashtagClick={onHashtagClick}
                  />
                ))}
              </div>
            </>
          )}

          {/* TAGS */}
          {signalTags.length > 0 && (
            <>
              <div className="sec">
                <span className="sec-label">Trending Tags</span>
              </div>

              {signalTags.map(({ tag, count }) => (
                <div
                  key={tag}
                  className="trending-item"
                  onClick={() => setQ(tag)}
                >
                  <div>
                    <div className="trending-name">{tag}</div>
                    <div className="trending-count">
                      {count} post{count !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <span style={{ color: 'var(--text3)', fontSize: 16 }}>
                    ›
                  </span>
                </div>
              ))}
            </>
          )}

          {/* MEDIA */}
          {media.length > 0 && (
            <>
              <div className="sec">
                <span className="sec-label">Locker Media</span>
              </div>

              <div className="media-wall">
                {media.map(p => (
                  <div
                    key={p.id}
                    className="media-cell"
                    onClick={() => setExpanded(p)}
                  >
                    <img src={p.imageUrl} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </>
          )}

          {signalTags.length === 0 && media.length === 0 && (
            <div className="empty">
              <div className="empty-ico">🌐</div>
              <h3>Nothing here yet</h3>
              <p>Drop the first post about Fortnite or Fitness!</p>
            </div>
          )}
        </>
      )}

      {expanded && (
        <ExpandedBroadcast
          post={expanded}
          currentUserId={currentUserId}
          users={users}
          onClose={() => setExpanded(null)}
          onProfileClick={onProfileClick}
          onHashtagClick={onHashtagClick}
          onMentionClick={onMentionClick}
        />
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={observerTarget} style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
          {loadingMore ? <Loader2 className="animate-spin text-brand-primary" size={24} /> : null}
        </div>
      )}
    </div>
  );
}
