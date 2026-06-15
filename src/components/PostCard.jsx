import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Repeat2, MessageCircle, Bookmark, Eye, MoreHorizontal, Trash2, Share2, Loader } from 'lucide-react';
import { useComments, toggleLike, toggleRepost, toggleBookmark, addView, addComment, deletePost } from '../hooks';

function timeAgo(ts) {
  if (!ts) return '';
  const sec = (Date.now() - new Date(ts)) / 1000;
  if (sec < 60) return 'now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function Avatar({ src, name, size = '', onClick }) {
  const initial = (name || '?')[0].toUpperCase();
  return (
    <div className={`av${size ? ` ${size}` : ''}`} onClick={onClick}>
      {src ? <img src={src} alt={name} loading="lazy" /> : initial}
    </div>
  );
}

function RichText({ text }) {
  if (!text) return null;
  const parts = [];
  const regex = /(#\w+|@\w+|https?:\/\/[^\s]+)/g;
  let last = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', val: text.slice(last, m.index) });
    const w = m[0];
    if (w.startsWith('#')) parts.push({ type: 'hash', val: w });
    else if (w.startsWith('@')) parts.push({ type: 'mention', val: w });
    else parts.push({ type: 'link', val: w });
    last = m.index + w.length;
  }
  if (last < text.length) parts.push({ type: 'text', val: text.slice(last) });

  return (
    <p className="p-body">
      {parts.map((p, i) =>
        p.type === 'hash' ? <span key={i} className="hashtag">{p.val}</span> :
        p.type === 'mention' ? <span key={i} className="mention">{p.val}</span> :
        p.type === 'link' ? <a key={i} href={p.val} target="_blank" rel="noreferrer" className="p-link">{p.val.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}</a> :
        <span key={i}>{p.val}</span>
      )}
    </p>
  );
}

export { Avatar, timeAgo };

export default function PostCard({ post, currentUserId, users = [], onProfileClick }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Optimistic UI
  const [optLiked, setOptLiked] = useState(null);
  const [optLikeCount, setOptLikeCount] = useState(null);
  const [optReposted, setOptReposted] = useState(null);
  const [optRepostCount, setOptRepostCount] = useState(null);
  const [optBookmarked, setOptBookmarked] = useState(null);
  const [likeAnim, setLikeAnim] = useState(false);

  const likeTimer = useRef(null);
  const repostTimer = useRef(null);
  const viewedRef = useRef(false);
  const cardRef = useRef(null);

  const { comments } = useComments(showComments ? post.id : null);
  const author = users.find(u => u.id === post.userId);

  const isLiked     = optLiked     !== null ? optLiked     : (post.likedBy     || []).includes(currentUserId);
  const likeCount   = optLikeCount !== null ? optLikeCount : (post.likedBy     || []).length;
  const isReposted  = optReposted  !== null ? optReposted  : (post.repostedBy  || []).includes(currentUserId);
  const repostCount = optRepostCount !== null ? optRepostCount : (post.repostedBy || []).length;
  const isBookmarked = optBookmarked !== null ? optBookmarked : (post.favoritedBy || []).includes(currentUserId);
  const viewCount   = (post.viewedBy || []).length;

  // Reset optimistic when server data catches up
  useEffect(() => {
    setOptLiked(null); setOptLikeCount(null);
    setOptReposted(null); setOptRepostCount(null);
    setOptBookmarked(null);
  }, [
    (post.likedBy || []).join(','),
    (post.repostedBy || []).join(','),
    (post.favoritedBy || []).join(',')
  ]);

  // View tracking
  useEffect(() => {
    if (!cardRef.current || viewedRef.current || !currentUserId) return;
    if ((post.viewedBy || []).includes(currentUserId)) { viewedRef.current = true; return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        viewedRef.current = true;
        addView(post.id, currentUserId).catch(() => {});
        obs.disconnect();
      }
    }, { threshold: 0.6 });
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, [post.id, currentUserId]);

  const handleLike = useCallback(() => {
    const next = !isLiked;
    setOptLiked(next);
    setOptLikeCount(Math.max(0, likeCount + (next ? 1 : -1)));
    if (next) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400); }
    if (likeTimer.current) clearTimeout(likeTimer.current);
    const snapLiked = isLiked;
    const snapCount = likeCount;
    likeTimer.current = setTimeout(() => {
      toggleLike(post.id, currentUserId, !next).catch(() => {
        setOptLiked(snapLiked); setOptLikeCount(snapCount);
      });
    }, 500);
  }, [isLiked, likeCount, post.id, currentUserId]);

  const handleRepost = useCallback(() => {
    const next = !isReposted;
    setOptReposted(next);
    setOptRepostCount(Math.max(0, repostCount + (next ? 1 : -1)));
    if (repostTimer.current) clearTimeout(repostTimer.current);
    const snapR = isReposted; const snapC = repostCount;
    repostTimer.current = setTimeout(() => {
      toggleRepost(post.id, currentUserId, !next).catch(() => {
        setOptReposted(snapR); setOptRepostCount(snapC);
      });
    }, 500);
  }, [isReposted, repostCount, post.id, currentUserId]);

  const handleBookmark = useCallback(() => {
    const next = !isBookmarked;
    setOptBookmarked(next);
    toggleBookmark(post.id, currentUserId, !next).catch(() => setOptBookmarked(isBookmarked));
  }, [isBookmarked, post.id, currentUserId]);

  const handleComment = useCallback(async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try { await addComment(post.id, currentUserId, commentText.trim()); setCommentText(''); }
    catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }, [commentText, submitting, post.id, currentUserId]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    try { await deletePost(post.id); }
    catch (err) { console.error(err); setDeleting(false); }
  }, [post.id]);

  if (!author) return null;

  return (
    <>
      <article ref={cardRef} className={`p-card${post.imageUrl ? ' has-media' : ''}`}>
        {/* Header */}
        <div className="p-header">
          <Avatar src={author.avatarUrl} name={author.displayName} onClick={() => onProfileClick?.(author.id)} />
          <div className="p-meta">
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
              <span className="p-name" onClick={() => onProfileClick?.(author.id)}>
                {author.displayName}
              </span>
              {author.verified && <span className="p-verified">✓</span>}
              <span className="p-time">· {timeAgo(post.created)}</span>
            </div>
          </div>

          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button className="p-menu-btn" onClick={() => setShowMenu(v => !v)}>
              <MoreHorizontal />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', zIndex: 80,
                background: 'var(--card)', border: '1px solid var(--border-bright)',
                borderRadius: 14, padding: '6px 0', minWidth: 148,
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
              }}>
                <button
                  onClick={() => { setShowMenu(false); navigator.share?.({ text: post.text, url: window.location.href }) || navigator.clipboard?.writeText(window.location.href); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', fontSize: 13, color: 'var(--text)' }}
                >
                  <Share2 size={14} /> Share
                </button>
                {post.userId === currentUserId && (
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', fontSize: 13, color: 'var(--danger)' }}
                  >
                    {deleting ? <Loader size={14} className="spin" /> : <Trash2 size={14} />} Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <RichText text={post.text} />

        {/* Media */}
        {post.imageUrl && (
          <div className="p-media" onClick={() => setShowLightbox(true)}>
            <img src={post.imageUrl} alt="post media" loading="lazy" />
          </div>
        )}

        {/* Action Bar */}
        <div className="p-actions">
          <div className="p-actions-left">
            <button
              className={`act do-comment${showComments ? ' reposted' : ''}`}
              onClick={() => setShowComments(v => !v)}
            >
              <MessageCircle size={17} />
              {comments.length > 0 && <span>{comments.length}</span>}
            </button>

            <button
              className={`act do-repost${isReposted ? ' reposted' : ''}`}
              onClick={handleRepost}
            >
              <Repeat2 size={17} />
              {repostCount > 0 && <span>{repostCount}</span>}
            </button>

            <button
              className={`act do-like${isLiked ? ' liked' : ''}${likeAnim ? ' like-pop' : ''}`}
              onClick={handleLike}
            >
              <Heart size={17} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>

          <div className="p-actions-right">
            {viewCount > 0 && (
              <span className="act views">
                <Eye size={15} /> <span>{viewCount}</span>
              </span>
            )}
            <button
              className={`act do-bookmark${isBookmarked ? ' bookmarked' : ''}`}
              onClick={handleBookmark}
            >
              <Bookmark size={17} />
            </button>
          </div>
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div className="comments-panel">
            <form className="cmt-form" onSubmit={handleComment}>
              <Avatar
                src={users.find(u => u.id === currentUserId)?.avatarUrl}
                name={users.find(u => u.id === currentUserId)?.displayName || 'Me'}
                size="sm"
              />
              <input
                className="cmt-input"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                maxLength={280}
              />
              <button type="submit" className="cmt-send" disabled={!commentText.trim() || submitting}>
                {submitting ? <Loader size={13} className="spin" /> : 'Post'}
              </button>
            </form>

            {comments.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: '4px 0 8px' }}>
                No replies yet — jump in!
              </p>
            )}

            {comments.map(c => {
              const cu = users.find(u => u.id === c.userId);
              return (
                <div key={c.id} className="cmt-item">
                  <Avatar src={cu?.avatarUrl} name={cu?.displayName || '?'} size="sm" />
                  <div className="cmt-bubble">
                    <div className="cmt-author">{cu?.displayName || 'User'}</div>
                    <div className="cmt-text">{c.text}</div>
                    <div className="cmt-time">{timeAgo(c.created)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>

      {/* Lightbox */}
      {showLightbox && (
        <div className="lightbox" onClick={() => setShowLightbox(false)}>
          <button className="lightbox-x" onClick={() => setShowLightbox(false)}>✕</button>
          <img src={post.imageUrl} alt="fullsize" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Menu backdrop */}
      {showMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 79 }} onClick={() => setShowMenu(false)} />
      )}
    </>
  );
}
