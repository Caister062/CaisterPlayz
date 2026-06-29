import { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, MoreHorizontal, Trash2, Share2, Loader, CheckCircle, Pin, Flag, Film } from 'lucide-react';
import { useComments, toggleLike, toggleRepost, toggleBookmark, addView, addComment, deletePost, editPost, deleteComment } from '../hooks';
import { formatCount, formatTime, triggerHaptic } from '../utils';
import GifPicker from './GifPicker';
import { Avatar } from './Shared';

export function timeAgo(ts) {
  if (!ts) return '';
  const sec = (Date.now() - new Date(ts)) / 1000;
  if (sec < 60) return 'now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function Hex({ src, name, size = '', onClick }) {
  const i = (name || '?')[0].toUpperCase();

  return (
    <div className={`hex${size ? ` ${size}` : ''}`} onClick={onClick}>
      {src ? <img src={src} alt={name} loading="lazy" /> : i}
    </div>
  );
}

function RichBody({ text, cls = 'expand-text', onHashtagClick, onMentionClick }) {
  if (!text) return null;

  const parts = [];
  const rx = /(#\w+|@\w+|https?:\/\/[^\s]+)/g;
  let last = 0;
  let m;

  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ t: 'x', v: text.slice(last, m.index) });
    }

    const w = m[0];

    parts.push({
      t: w[0] === '#' ? 'h' : w[0] === '@' ? 'a' : 'l',
      v: w
    });

    last = m.index + w.length;
  }

  if (last < text.length) {
    parts.push({ t: 'x', v: text.slice(last) });
  }

  return (
    <div className={cls}>
      {parts.map((p, i) =>
        p.t === 'h' ? (
          <span 
            key={i} 
            className="tag cursor-pointer hover:underline"
            onClick={(e) => { e.stopPropagation(); if (onHashtagClick) onHashtagClick(p.v); }}
          >
            {p.v}
          </span>
        ) : p.t === 'a' ? (
          <span 
            key={i} 
            className="at cursor-pointer hover:underline"
            onClick={(e) => { e.stopPropagation(); if (onMentionClick) onMentionClick(p.v); }}
          >
            {p.v}
          </span>
        ) : p.t === 'l' ? (
          <a
            key={i}
            href={p.v}
            target="_blank"
            rel="noreferrer"
            className="lnk"
          >
            {p.v.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35)}
          </a>
        ) : (
          <span key={i}>{p.v}</span>
        )
      )}
    </div>
  );
}

function realCount(arr, authorId) {
  return (arr || []).filter(id => id !== authorId).length;
}

function getPRLevel(power, views) {
  const total = power + views;

  if (total >= 100) return 'Unreal';
  if (total >= 50) return 'Champion';
  if (total >= 15) return 'Elite';
  return 'Bronze';
}

export function GridCard({ post, users, onClick }) {
  const author = users.find(u => u.id === post.userId) || post.expand?.userId || { id: post.userId, displayName: post.authorName || 'Operator' };
  if (!author) return null;

  const power =
    realCount(post.likedBy, post.userId) +
    realCount(post.repostedBy, post.userId);

  const views = realCount(post.viewedBy, post.userId);

  const isVerified = window.cplayz_config?.verifiedUsers?.includes(author.id);
  const isFeatured = window.cplayz_config?.featuredPosts?.includes(post.id);

  return (
    <div className="g-card" onClick={() => onClick(post)}>
      {isFeatured && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: 'var(--hot)',
            color: '#fff',
            borderRadius: '50%',
            padding: 4,
            zIndex: 10,
            boxShadow: '0 0 10px rgba(244,63,94,0.5)'
          }}
        >
          <Pin size={12} fill="currentColor" />
        </div>
      )}

      <div className="g-card-head">
        <Avatar src={author.avatarUrl} name={author.displayName} size="sm" isOnline={author.isOnline} />

        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
          {author.displayName}
          {isVerified && (
            <CheckCircle
              size={12}
              color="#00e5ff"
              style={{ marginLeft: 4, display: 'inline' }}
            />
          )}
        </span>
      </div>

      {post.imageUrl && (
        <div className="g-card-media">
          <img src={post.imageUrl} alt="" loading="lazy" />
        </div>
      )}

      <div className="g-card-text">{post.text}</div>

      <div className="g-card-power">
        <span className="power-chip">
          🏆 {getPRLevel(power, views)}
        </span>

        {power > 0 && (
          <span className="power-chip">
            🔥 {formatCount(power)}
          </span>
        )}

        {views > 0 && (
          <span className="power-chip">
            👁️ {formatCount(views)}
          </span>
        )}
      </div>
    </div>
  );
}

export function DeckCard({ post, users, onClick }) {
  const author = users.find(u => u.id === post.userId) || post.expand?.userId || { id: post.userId, displayName: post.authorName || 'Operator' };
  if (!author) return null;

  const power =
    realCount(post.likedBy, post.userId) +
    realCount(post.repostedBy, post.userId);

  const views = realCount(post.viewedBy, post.userId);

  return (
    <div className="deck-card" onClick={() => onClick(post)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Hex src={author.avatarUrl} name={author.displayName} size="sm" />

        <div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            {author.displayName}
          </div>

          <div style={{ fontSize: 9, color: 'var(--text3)' }}>
            Rank: {getPRLevel(power, views)}
          </div>
        </div>
      </div>

      {post.imageUrl && (
        <div className="deck-card-media">
          <img src={post.imageUrl} alt="" loading="lazy" />
        </div>
      )}

      <div className="deck-card-text">{post.text}</div>

      <div className="deck-card-foot">
        <span className="deck-power">
          🔥 {formatCount(power)}
        </span>

        {views > 0 && (
          <span className="deck-views">
            👁️ {formatCount(views)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ExpandedBroadcast({
  post,
  currentUserId,
  users,
  onClose,
  onHashtagClick,
  onMentionClick,
  onProfileClick
}) {
  const [echoText, setEchoText] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLB, setShowLB] = useState(false);
  const [chipPop, setChipPop] = useState('');
  const [reporting, setReporting] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [echoImg, setEchoImg] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [savingEdit, setSavingEdit] = useState(false);

  const [oLiked, setOLiked] = useState(null);
  const [oLikeN, setOLikeN] = useState(null);
  const [oReposted, setOReposted] = useState(null);
  const [oRepostN, setORepostN] = useState(null);
  const [oPinned, setOPinned] = useState(null);

  const likeT = useRef(null);
  const repostT = useRef(null);
  const viewedR = useRef(false);

  const { comments } = useComments(post.id);
  const author = users.find(u => u.id === post.userId) || post.expand?.userId || { id: post.userId, displayName: post.authorName || 'Operator' };
  const currentUser = users.find(u => u.id === currentUserId);

  const isVerified = window.cplayz_config?.verifiedUsers?.includes(author?.id);
  const isFeatured = window.cplayz_config?.featuredPosts?.includes(post.id);

  const liked =
    oLiked !== null
      ? oLiked
      : (post.likedBy || []).includes(currentUserId);

  const likeN =
    oLikeN !== null
      ? oLikeN
      : realCount(post.likedBy, post.userId);

  const reposted =
    oReposted !== null
      ? oReposted
      : (post.repostedBy || []).includes(currentUserId);

  const repostN =
    oRepostN !== null
      ? oRepostN
      : realCount(post.repostedBy, post.userId);

  const pinned =
    oPinned !== null
      ? oPinned
      : (post.favoritedBy || []).includes(currentUserId);

  const viewN = realCount(post.viewedBy, post.userId);

  const rankLevel = getPRLevel(likeN + repostN, viewN);

  useEffect(() => {
    if (!currentUserId || viewedR.current) return;

    if (post.userId === currentUserId) {
      viewedR.current = true;
      return;
    }

    if ((post.viewedBy || []).includes(currentUserId)) {
      viewedR.current = true;
      return;
    }

    viewedR.current = true;
    addView(post.id, currentUserId).catch(() => {});
  }, [post.id, post.userId, post.viewedBy, currentUserId]);

  const doReact = useCallback(
    type => {
      if (!currentUserId) return;

      triggerHaptic('light');

      setChipPop(type);
      setTimeout(() => setChipPop(''), 300);

      if (type === 'boost') {
        const next = !liked;

        setOLiked(next);
        setOLikeN(Math.max(0, likeN + (next ? 1 : -1)));

        if (likeT.current) clearTimeout(likeT.current);

        const sL = liked;
        const sN = likeN;

        likeT.current = setTimeout(() => {
          toggleLike(post.id, currentUserId, !next, author.displayName).catch(() => {
            setOLiked(sL);
            setOLikeN(sN);
          });
        }, 500);
      }

      if (type === 'relay') {
        const next = !reposted;

        setOReposted(next);
        setORepostN(Math.max(0, repostN + (next ? 1 : -1)));

        if (repostT.current) clearTimeout(repostT.current);

        const sR = reposted;
        const sN = repostN;

        repostT.current = setTimeout(() => {
          toggleRepost(post.id, currentUserId, !next, author.displayName).catch(() => {
            setOReposted(sR);
            setORepostN(sN);
          });
        }, 500);
      }

      if (type === 'anchor') {
        const next = !pinned;

        setOPinned(next);

        toggleBookmark(post.id, currentUserId, !next, author.displayName).catch(() =>
          setOPinned(pinned)
        );
      }
    },
    [
      liked,
      likeN,
      reposted,
      repostN,
      pinned,
      post.id,
      currentUserId
    ]
  );

  const doComment = useCallback(
    async () => {
      if ((!echoText.trim() && !echoImg) || sending) return;

      setSending(true);

      try {
        await addComment(post.id, currentUserId, echoText.trim(), author.displayName, echoImg);
        setEchoText('');
        setEchoImg('');
        triggerHaptic('success');
      } catch (err) {
        console.error(err);
      } finally {
        setSending(false);
      }
    },
    [echoText, echoImg, sending, post.id, currentUserId]
  );

  const doDel = async () => {
    if (!confirm('Purge this signal?')) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editText.trim() || editText === post.text) {
      setIsEditing(false);
      return;
    }
    setSavingEdit(true);
    try {
      await editPost(post.id, editText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  if (!author) return null;

  const REACTIONS = [
    {
      key: 'boost',
      emoji: '🔥',
      label: 'Hype',
      count: likeN,
      active: liked,
      cls: 'active-zap'
    },
    {
      key: 'relay',
      emoji: '🔁',
      label: 'Share',
      count: repostN,
      active: reposted,
      cls: 'active-fire'
    },
    {
      key: 'surge',
      emoji: '🧪',
      label: 'Slurp',
      count: 0,
      active: false,
      cls: 'active-skull',
      disabled: true
    },
    {
      key: 'lock',
      emoji: '🏋️',
      label: 'Iron',
      count: 0,
      active: false,
      cls: 'active-clutch',
      disabled: true
    },
    {
      key: 'anchor',
      emoji: '📌',
      label: 'Pin',
      count: 0,
      active: pinned,
      cls: 'active-pin'
    }
  ];

  return (
    <>
      <div
        className="expand-overlay"
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="expand-card" onClick={e => e.stopPropagation()}>
          <div className="expand-header" style={{ position: 'relative' }}>
            <div className="expand-author">
              <Avatar
                src={author.avatarUrl}
                name={author.displayName}
                size="md"
                onClick={e => {
                  e.stopPropagation();
                  if (onProfileClick) onProfileClick(author.id);
                }}
                isOnline={author.isOnline}
              />
              <div className="expand-meta">
                <div className="expand-name">
                  {author?.displayName || 'Unknown Operator'}

                  {isVerified && (
                    <CheckCircle
                      size={16}
                      color="#00e5ff"
                      style={{ marginLeft: 6, display: 'inline' }}
                    />
                  )}

                  {isFeatured && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'rgba(244,63,94,0.1)',
                        color: 'var(--hot)',
                        padding: '2px 6px',
                        borderRadius: 6,
                        marginLeft: 6,
                        fontSize: 10,
                        border: '1px solid rgba(244,63,94,0.2)'
                      }}
                    >
                      <Pin size={10} style={{ marginRight: 4 }} />
                      Prime Signal
                    </div>
                  )}
                </div>

                <div className="expand-time">
                  Rank: {rankLevel}
                  <span style={{ margin: '0 6px', color: 'var(--border)' }}>|</span>
                  {timeAgo(post.created)}
                  {post.isEdited && <span style={{ marginLeft: 4, fontStyle: 'italic', color: 'var(--text3)' }}>(edited)</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className="hud-btn"
                onClick={() => setShowMenu(v => !v)}
                style={{ width: 28, height: 28 }}
              >
                <MoreHorizontal size={14} />
              </button>

              <button className="expand-close" onClick={onClose}>
                ✕
              </button>
            </div>

            {showMenu && (
              <div className="expand-menu">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigator.share?.({ text: post.text }) ||
                      navigator.clipboard?.writeText(location.href);
                  }}
                >
                  <Share2 size={12} /> Transmit Signal
                </button>

                {post.userId === currentUserId && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditing(true);
                        setEditText(post.text);
                      }}
                    >
                      <MoreHorizontal size={12} /> Edit Signal
                    </button>
                    <button
                    onClick={() => {
                      setShowMenu(false);
                      doDel();
                    }}
                    style={{ color: 'var(--hot)' }}
                  >
                    {deleting ? (
                      <Loader size={12} className="spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Purge Signal
                  </button>
                  </>
                )}
                {post.userId !== currentUserId && (
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to report this post?')) return;
                      setShowMenu(false);
                      setReporting(true);
                      try {
                        const { reportPost } = await import('../hooks');
                        await reportPost(currentUserId, post.id);
                        alert('Report submitted successfully.');
                      } catch {
                        alert('Error submitting report.');
                      } finally {
                        setReporting(false);
                      }
                    }}
                    style={{ color: 'var(--hot)' }}
                  >
                    {reporting ? <Loader size={12} className="spin" /> : <Flag size={12} />} Report Signal
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="expand-body">
            {isEditing ? (
              <div style={{ marginBottom: 16 }}>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="post-textarea"
                  style={{ minHeight: 80, width: '100%', marginBottom: 8 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="hud-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button 
                    className="hud-btn" 
                    onClick={handleEditSave}
                    disabled={savingEdit}
                    style={{ background: 'var(--brand-primary)', color: 'white' }}
                  >
                    {savingEdit ? <Loader size={14} className="spin" /> : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <RichBody text={post.text} onHashtagClick={onHashtagClick} onMentionClick={onMentionClick} />
            )}

            {post.imageUrl && (
              <div className="expand-media" onClick={() => setShowLB(true)}>
                <img src={post.imageUrl} alt="" loading="lazy" />
              </div>
            )}
          </div>

          <div className="react-row">
            {REACTIONS.map(r => (
              <button
                key={r.key}
                className={`react-chip${r.active ? ` ${r.cls}` : ''}${
                  chipPop === r.key ? ' chip-pop' : ''
                }`}
                onClick={() => !r.disabled && doReact(r.key)}
                style={r.disabled ? { opacity: 0.4, cursor: 'default' } : {}}
              >
                <span className="remoji">{r.emoji}</span>
                {r.count > 0 ? formatCount(r.count) : r.label}
              </button>
            ))}
          </div>

          <div className="react-meta">
            {viewN > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={13} /> {formatCount(viewN)} signal scans
              </span>
            )}

            <span>{formatCount(comments.length)} echoes</span>
          </div>

          <div className="thread">
            <div className="thread-title">Signal Thread</div>

            <div className="expand-add-comment">
              <Hex
                src={currentUser?.avatarUrl}
                name={currentUser?.displayName}
                size="sm"
              />
              <div className="flex-1 flex flex-col gap-2 relative">
                {echoImg && (
                  <div className="relative inline-block w-fit">
                    <img src={echoImg} alt="GIF" className="max-h-32 rounded-lg" />
                    <button onClick={() => setEchoImg('')} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/80">✕</button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    className="thread-input flex-1 bg-transparent border-none outline-none"
                    placeholder="Echo back..."
                    value={echoText}
                    onChange={e => setEchoText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doComment()}
                    disabled={sending}
                  />
                  
                  <button
                    className="hud-btn relative p-1.5 rounded-full hover:bg-dark-surface"
                    onClick={() => setShowGif(v => !v)}
                  >
                    <Film size={14} className="text-brand-primary" />
                    {showGif && (
                      <GifPicker 
                        onSelect={(url) => {
                          setEchoImg(url);
                          setShowGif(false);
                        }}
                        onClose={() => setShowGif(false)}
                      />
                    )}
                  </button>

                  <button
                    className="thread-send"
                    onClick={doComment}
                    disabled={(!echoText.trim() && !echoImg) || sending}
                  >
                    {sending ? <Loader size={11} className="spin" /> : 'SEND'}
                  </button>
                </div>
              </div>
            </div>

            {comments.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--text3)',
                  fontSize: 11,
                  padding: '2px 0 6px'
                }}
              >
                No signal echoes detected
              </p>
            )}

            {comments.map(c => {
              const cu = users.find(u => u.id === c.userId);

              return (
                <div key={c.id} className="reply-item">
                  <Hex
                    src={cu?.avatarUrl}
                    name={cu?.displayName || '?'}
                    size="sm"
                  />

                  <div className="reply-bubble">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div className="reply-who">
                        {cu?.displayName || 'Operator'}
                      </div>

                      {c.userId === currentUserId && (
                        <button
                          className="reply-del"
                          onClick={() => {
                            if (confirm('Remove this echo?')) {
                              deleteComment(c.id, currentUserId).catch(console.error);
                            }
                          }}
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>

                    <div className="reply-msg">{c.text}</div>
                    <div className="reply-ts">{timeAgo(c.created)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showLB && (
        <div className="lb" onClick={() => setShowLB(false)}>
          <button className="lb-x" onClick={() => setShowLB(false)}>
            ✕
          </button>

          <img
            src={post.imageUrl}
            alt=""
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 79 }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
