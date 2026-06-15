import { useState, useMemo } from 'react';
import { Plus, Users, Zap, Crown, Shield } from 'lucide-react';
import { Avatar } from './PostCard';

const GAME_ICONS = ['⚔️', '🎯', '🏆', '🛡️', '🚀', '💣', '🗡️', '🔫', '🎮', '🕹️'];

export default function SquadsView({ posts, users, currentUserId }) {
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [joinedSquads, setJoinedSquads] = useState(new Set());

  // Build squads from posts tagged as squads, or derive from users
  const squads = useMemo(() => {
    // Real squads from posts
    const fromPosts = posts
      .filter(p => p.type === 'squad' || (p.text && p.text.toLowerCase().includes('#squad')))
      .map(p => {
        const owner = users.find(u => u.id === p.userId);
        return {
          id: p.id,
          name: owner ? `${owner.displayName}'s Squad` : 'Gaming Squad',
          desc: (p.text || '').replace(/#\w+/g, '').trim() || 'Looking for teammates',
          ownerId: p.userId,
          ownerName: owner?.displayName || 'Unknown',
          memberCount: (p.likedBy || []).length + 1,
          icon: GAME_ICONS[Math.abs(p.id.charCodeAt(0)) % GAME_ICONS.length],
          isHot: (p.likedBy || []).length > 3,
          isOpen: true,
          created: p.created,
        };
      });

    // Auto-generate community squads from active users if few real squads
    if (fromPosts.length < 3) {
      const activeUsers = users.filter(u => posts.some(p => p.userId === u.id)).slice(0, 6);
      activeUsers.forEach((u, i) => {
        if (!fromPosts.some(s => s.ownerId === u.id)) {
          fromPosts.push({
            id: `auto_${u.id}`,
            name: `Team ${u.displayName}`,
            desc: 'Auto-formed squad from active players',
            ownerId: u.id,
            ownerName: u.displayName,
            memberCount: Math.floor(Math.random() * 5) + 1,
            icon: GAME_ICONS[i % GAME_ICONS.length],
            isHot: false,
            isOpen: true,
            created: u.created,
          });
        }
      });
    }

    return fromPosts;
  }, [posts, users]);

  const filtered = useMemo(() => {
    if (filter === 'hot') return squads.filter(s => s.isHot);
    if (filter === 'mine') return squads.filter(s => s.ownerId === currentUserId || joinedSquads.has(s.id));
    return squads;
  }, [squads, filter, currentUserId, joinedSquads]);

  const handleJoin = (squadId) => {
    setJoinedSquads(prev => {
      const next = new Set(prev);
      if (next.has(squadId)) next.delete(squadId);
      else next.add(squadId);
      return next;
    });
  };

  return (
    <div>
      {/* Hero */}
      <div className="squads-hero">
        <div className="squads-title">⚔️ Squads</div>

        {/* Filters */}
        <div className="squads-filter-row">
          {[
            { key: 'all', label: 'All Squads' },
            { key: 'hot', label: '🔥 Active' },
            { key: 'mine', label: '🛡️ Mine' },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-chip${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Squad */}
      <button className="create-squad-btn" onClick={() => setShowCreate(!showCreate)}>
        <Plus size={18} /> Create Squad
      </button>

      {/* Squad Cards */}
      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">⚔️</div>
          <h3>No squads found</h3>
          <p>{filter === 'mine' ? 'Join a squad or create your own!' : 'Be the first to create a squad!'}</p>
        </div>
      ) : (
        filtered.map(squad => {
          const owner = users.find(u => u.id === squad.ownerId);
          const isJoined = joinedSquads.has(squad.id) || squad.ownerId === currentUserId;

          return (
            <div key={squad.id} className="squad-card">
              <div className="squad-card-header">
                <div className="squad-icon">{squad.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="squad-name">{squad.name}</div>
                  <div className="squad-desc">{squad.desc}</div>
                </div>
              </div>

              {/* Meta tags */}
              <div className="squad-meta">
                <span className="squad-tag">
                  <Users size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 3 }} />
                  {squad.memberCount} player{squad.memberCount !== 1 ? 's' : ''}
                </span>
                {squad.isHot && <span className="squad-tag hot">🔥 Active</span>}
                {squad.isOpen && <span className="squad-tag open">Open</span>}
                {squad.ownerId === currentUserId && <span className="squad-tag" style={{ color: 'var(--gold)' }}>👑 Owner</span>}
              </div>

              {/* Leader */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <Avatar src={owner?.avatarUrl} name={owner?.displayName || '?'} size="sm" />
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Led by <strong style={{ color: 'var(--text)' }}>{owner?.displayName || 'Unknown'}</strong></span>
              </div>

              {/* Actions */}
              <div className="squad-actions">
                <button
                  className={`join-btn${isJoined ? ' joined' : ''}`}
                  onClick={() => handleJoin(squad.id)}
                >
                  {isJoined ? '✓ Joined' : 'Join Squad'}
                </button>
                <button className="squad-view-btn">Details</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
