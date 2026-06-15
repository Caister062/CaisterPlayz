import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import PostCard from './PostCard';

export default function ExploreView({ posts, users, currentUserId, onProfileClick }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(p =>
      (p.text || '').toLowerCase().includes(q) ||
      (users.find(u => u.id === p.userId)?.displayName || '').toLowerCase().includes(q)
    );
  }, [query, posts, users]);

  const imagePosts = useMemo(() =>
    posts.filter(p => p.imageUrl).slice(0, 30), [posts]);

  const hashtags = useMemo(() => {
    const counts = {};
    posts.forEach(p => {
      const matches = (p.text || '').match(/#\w+/g) || [];
      matches.forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  return (
    <div>
      {/* Search */}
      <div className="search-bar-wrap">
        <div className="search-bar">
          <Search size={16} />
          <input
            placeholder="Search posts, players…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {query.trim() ? (
        /* Search results */
        <>
          <div className="section-title">
            Results for "{query}" <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({filtered.length})</span>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try a different search term or hashtag.</p>
            </div>
          ) : (
            filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                users={users}
                onProfileClick={onProfileClick}
              />
            ))
          )}
        </>
      ) : (
        <>
          {/* Trending Tags */}
          {hashtags.length > 0 && (
            <>
              <div className="section-title">🔥 Trending</div>
              {hashtags.map(({ tag, count }) => (
                <div
                  key={tag}
                  className="trending-tag"
                  onClick={() => setQuery(tag)}
                >
                  <div>
                    <div className="trending-tag-name">{tag}</div>
                    <div className="trending-tag-count">{count} post{count !== 1 ? 's' : ''}</div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 18 }}>›</span>
                </div>
              ))}
            </>
          )}

          {/* Image Grid */}
          {imagePosts.length > 0 && (
            <>
              <div className="section-title">📸 Recent Captures</div>
              <div className="explore-grid">
                {imagePosts.map(post => (
                  <div key={post.id} className="explore-grid-item">
                    <img src={post.imageUrl} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </>
          )}

          {hashtags.length === 0 && imagePosts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🌐</div>
              <h3>Nothing here yet</h3>
              <p>Be the first to post and explore!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
