import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import BroadcastCard from './PostCard';

export default function ExploreView({ posts, users, currentUserId, onProfileClick }) {
  const [q, setQ] = useState('');
  const isSearching = q.trim().length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return [];
    const lq = q.toLowerCase();
    return posts.filter(p =>
      (p.text||'').toLowerCase().includes(lq) ||
      (users.find(u => u.id === p.userId)?.displayName||'').toLowerCase().includes(lq)
    );
  }, [q, posts, users]);

  const hashtags = useMemo(() => {
    const c = {};
    posts.forEach(p => { (p.text||'').match(/#\w+/g)?.forEach(t => { c[t] = (c[t]||0) + 1; }); });
    return Object.entries(c).sort((a,b) => b[1]-a[1]).slice(0,10).map(([tag,count]) => ({ tag, count }));
  }, [posts]);

  const media = useMemo(() => posts.filter(p => p.imageUrl).slice(0,24), [posts]);

  return (
    <div>
      <div className="arena-search">
        <div className="arena-box">
          <Search size={14} />
          <input placeholder="Search broadcasts, players, #tags…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {isSearching ? (
        <>
          <div className="sec"><span className="sec-label">Results</span><span className="sec-action">{filtered.length}</span></div>
          {filtered.length === 0
            ? <div className="empty"><div className="empty-ico">🔍</div><h3>No matches</h3></div>
            : filtered.map(p => <BroadcastCard key={p.id} post={p} currentUserId={currentUserId} users={users} onProfileClick={onProfileClick} />)
          }
        </>
      ) : (
        <>
          {hashtags.length > 0 && (
            <>
              <div className="sec"><span className="sec-label">Trending Tags</span></div>
              {hashtags.map(({ tag, count }) => (
                <div key={tag} className="trending-item" onClick={() => setQ(tag)}>
                  <div><div className="trending-name">{tag}</div><div className="trending-count">{count} broadcast{count !== 1 ? 's' : ''}</div></div>
                  <span style={{ color: 'var(--text3)', fontSize: 16 }}>›</span>
                </div>
              ))}
            </>
          )}
          {media.length > 0 && (
            <>
              <div className="sec"><span className="sec-label">Media Wall</span></div>
              <div className="media-wall">
                {media.map(p => <div key={p.id} className="media-cell"><img src={p.imageUrl} alt="" loading="lazy" /></div>)}
              </div>
            </>
          )}
          {hashtags.length === 0 && media.length === 0 && (
            <div className="empty"><div className="empty-ico">🌐</div><h3>Nothing yet</h3><p>Start broadcasting!</p></div>
          )}
        </>
      )}
    </div>
  );
}
