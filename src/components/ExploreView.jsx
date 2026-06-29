import { useState, useMemo } from 'react';
import { Search, Radar, Flame, Image as ImageIcon } from 'lucide-react';
import { GridCard } from './PostCard';
import ExpandedBroadcast from './PostCard';

export default function ExploreView({ posts, users, currentUserId, onProfileClick }) {
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);

  const isScanning = q.trim().length > 0;

  const filtered = useMemo(() => {
    if (!isScanning) return [];

    const lq = q.toLowerCase();

    return posts.filter(p =>
      (p.text || '').toLowerCase().includes(lq) ||
      (users.find(u => u.id === p.userId)?.displayName || '')
        .toLowerCase()
        .includes(lq)
    );
  }, [q, posts, users, isScanning]);

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
            placeholder="Search posts, players, tags..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {isScanning ? (
        <>
          <div className="sec">
            <span className="sec-label">Search Results</span>
            <span className="sec-badge">{filtered.length}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-ico">📡</div>
              <h3>No results found</h3>
              <p>Try a different keyword, tag, or player name.</p>
            </div>
          ) : (
            <div className="grid">
              {filtered.map(p => (
                <GridCard
                  key={p.id}
                  post={p}
                  users={users}
                  onClick={setExpanded}
                />
              ))}
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
        />
      )}
    </div>
  );
}
