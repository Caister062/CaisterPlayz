import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import PostCard from './PostCard';

export default function ExploreView({ posts, users, currentUserId, onProfileClick }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return posts.filter(p =>
      (p.text || '').toLowerCase().includes(q) ||
      (users.find(u => u.id === p.userId)?.displayName || '').toLowerCase().includes(q)
    );
  }, [query, posts, users]);

  const hashtags = useMemo(() => {
    const counts = {};
    posts.forEach(p => {
      const matches = (p.text || '').match(/#\w+/g) || [];
      matches.forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const imagePosts = useMemo(() =>
    posts.filter(p => p.imageUrl).slice(0, 30), [posts]);

  const isSearching = query.trim().length > 0;

  return (
    <div>
      {/* Search */}
      <div className="search-box-wrap">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search posts, players, #tags…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isSearching ? (
        <>
          <div className="explore-section-title">
            Results ({filtered.length})
          </div>
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <h3>No matches</h3>
              <p>Try a different keyword or #tag.</p>
            </div>
          ) : (
            filtered.map(post => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} users={users} onProfileClick={onProfileClick} />
            ))
          )}
        </>
      ) : (
        <>
          {/* Trending */}
          {hashtags.length > 0 && (
            <>
              <div className="explore-section-title">🔥 Trending Tags</div>
              {hashtags.map(({ tag, count }) => (
                <div key={tag} className="trending-row" onClick={() => setQuery(tag)}>
                  <div>
                    <div className="trending-tag-name">{tag}</div>
                    <div className="trending-tag-count">{count} post{count !== 1 ? 's' : ''}</div>
                  </div>
                  <span className="trending-arrow">›</span>
                </div>
              ))}
            </>
          )}

          {/* Media Grid */}
          {imagePosts.length > 0 && (
            <>
              <div className="explore-section-title">📸 Captures</div>
              <div className="media-grid">
                {imagePosts.map(p => (
                  <div key={p.id} className="media-grid-item">
                    <img src={p.imageUrl} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </>
          )}

          {hashtags.length === 0 && imagePosts.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🌐</div>
              <h3>Nothing to explore yet</h3>
              <p>Start posting to see content here!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
