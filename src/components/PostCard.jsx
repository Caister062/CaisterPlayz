import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Repeat2, MessageCircle, Bookmark, MoreHorizontal, Eye, Share2, Trash2, Loader } from 'lucide-react';
import { useComments, toggleLike, toggleRepost, toggleBookmark, addView, addComment, deletePost, deleteComment } from '../hooks';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function Avatar({ src, name, size = 'md', onClick }) {
  const initial = (name || '?')[0].toUpperCase();
  return (
    <div
      className={`avatar ${size}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      {src ? <img src={src} alt={name} /> : initial}
    </div>
  );
}

function RichText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\s+)/).map((word, i) => {
    if (/^#\w+/.test(word)) return <span key={i} className="hashtag">{word}</span>;
    if (/^@\w+/.test(word)) return <span key={i} className="mention">{word}</span>;
    if (/^https?:\/\//.test(word)) return <a key={i} href={word} target="_blank" rel="noreferrer" className="rich-link">{word.replace(/^https?:\/\/(www\.)?/,'').slice(0,35)}{word.length > 35 ? '…' : ''}</a>;
    return <span key={i}>{word}</span>;
  });
  return <p className="post-content">{parts}</p>;
}

export default function PostCard({ post, currentUserId, users = [], onProfileClick }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Optimistic UI state
  const [optimisticLiked, setOptimisticLiked] = useState(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(null);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [optimisticReposted, setOptimisticReposted] = useState(null);
  const [optimisticRepostCount, setOptimisticRepostCount] = useState(null);
  const [optimisticBookmarked, setOptimisticBookmarked] = useState(null);

  const likeDebounceRef = useRef(null);
  const repostDebounceRef = useRef(null);
  const viewedRef = useRef(false);
  const postRef = useRef(null);

  const { comments, refreshComments } = useComments(showComments ? post.id : null);

  const author = users.find(u => u.id === post.userId);

  // Derive state (prefer optimistic if set)
  const isLiked = optimisticLiked !== null ? optimisticLiked : (post.likedBy || []).includes(currentUserId);
  const likeCount = optimisticLikeCount !== null ? optimisticLikeCount : (post.likedBy?.length || 0);
  const isReposted = optimisticReposted !== null ? optimisticReposted : (post.repostedBy || []).includes(currentUserId);
  const repostCount = optimisticRepostCount !== null ? optimisticRepostCount : (post.repostedBy?.length || 0);
  const isBookmarked = optimisticBookmarked !== null ? optimisticBookmarked : (post.favoritedBy || []).includes(currentUserId);
  const viewCount = post.viewedBy?.length || 0;

  // Reset optimistic when real post data changes
  useEffect(() => {
    setOptimisticLiked(null);
    setOptimisticLikeCount(null);
    setOptimisticReposted(null);
    setOptimisticRepostCount(null);
    setOptimisticBookmarked(null);
  }, [post.likedBy?.length, post.repostedBy?.length, post.favoritedBy?.length]);

  // Intersection observer for view tracking
  useEffect(() => {
    if (!postRef.current || viewedRef.current || !currentUserId) return;
    if ((post.viewedBy || []).includes(currentUserId)) { viewedRef.current = true; return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        viewedRef.current = true;
        addView(post.id, currentUserId).catch(() => {});
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(postRef.current);
    return () => obs.disconnect();
  }, [post.id, currentUserId]);

  const handleLike = useCallback(() => {
    // Optimistic update immediately
    const newLiked = !isLiked;
    const newCount = likeCount + (newLiked ? 1 : -1);
    setOptimisticLiked(newLiked);
    setOptimisticLikeCount(Math.max(0, newCount));

    if (newLiked) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 400);
    }

    // Debounce the actual API call
    if (likeDebounceRef.current) clearTimeout(likeDebounceRef.current);
    likeDebounceRef.current = setTimeout(() => {
      toggleLike(post.id, currentUserId, !newLiked).catch(() => {
        // Revert on error
        setOptimisticLiked(isLiked);
        setOptimisticLikeCount(likeCount);
      });
    }, 400);
  }, [isLiked, likeCount, post.id, currentUserId]);

  const handleRepost = useCallback(() => {
    const newReposted = !isReposted;
    setOptimisticReposted(newReposted);
    setOptimisticRepostCount(Math.max(0, repostCount + (newReposted ? 1 : -1)));

    if (repostDebounceRef.current) clearTimeout(repostDebounceRef.current);
    repostDebounceRef.current = setTimeout(() => {
      toggleRepost(post.id, currentUserId, !newReposted).catch(() => {
        setOptimisticReposted(isReposted);
        setOptimisticRepostCount(repostCount);
      });
    }, 400);
  }, [isReposted, repostCount, post.id, currentUserId]);

  const handleBookmark = useCallback(() => {
    const newBookmarked = !isBookmarked;
    setOptimisticBookmarked(newBookmarked);
    toggleBookmark(post.id, currentUserId, !newBookmarked).catch(() => {
      setOptimisticBookmarked(isBookmarked);
    });
  }, [isBookmarked, post.id, currentUserId]);

  const handleComment = useCallback(async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(post.id, currentUserId, commentText.trim());
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [commentText, submitting, post.id, currentUserId]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }, [post.id]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: 'CaisterPlayz Post', text: post.text, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  }, [post.text]);

  if (!author) return null;

  return (
    <>
      <article ref={postRef} className="post-card">
        {/* Header */}
        <div className="post-header">
          <Avatar src={author.avatarUrl} name={author.displayName} onClick={() => onProfileClick?.(author.id)} />
          <div className="post-meta">
            <div className="post-author-row">
              <span className="post-author-name" onClick={() => onProfileClick?.(author.id)}>
                {author.displayName}
              </span>
              {author.verified && <span style={{ color: 'var(--brand)', fontSize: 13 }}>✓</span>}
              <span className="post-handle" style={{ color: 'var(--muted)', fontSize: 13 }}>·</span>
              <span className="post-time">{formatTime(post.created)}</span>
            </div>
          </div>
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button className="post-more-btn" onClick={() => setShowMenu(v => !v)}>
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 50,
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '6px 0', minWidth: 140,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', width: '100%', fontSize: 13, color: 'var(--text)' }}>
                  <Share2 size={14} /> Share
                </button>
                {post.userId === currentUserId && (
                  <button onClick={() => { setShowMenu(false); handleDelete(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', width: '100%', fontSize: 13, color: 'var(--danger)' }}>
                    {deleting ? <Loader size={14} className="spin" /> : <Trash2 size={14} />} Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <RichText text={post.text} />

        {/* Image */}
        {post.imageUrl && (
          <img
            className="post-image"
            src={post.imageUrl}
            alt="post media"
            onClick={() => setShowLightbox(true)}
            loading="lazy"
          />
        )}

        {/* Actions */}
        <div className="post-actions">
          <div className="post-actions-group">
            {/* Comment */}
            <button
              className="action-btn comment-hover"
              onClick={() => setShowComments(v => !v)}
              style={showComments ? { color: 'var(--brand)' } : {}}
            >
              <MessageCircle size={18} />
              {comments.length > 0 && <span>{comments.length}</span>}
            </button>

            {/* Repost */}
            <button
              className={`action-btn repost-hover ${isReposted ? 'reposted' : ''}`}
              onClick={handleRepost}
            >
              <Repeat2 size={18} />
              {repostCount > 0 && <span>{repostCount}</span>}
            </button>

            {/* Like */}
            <button
              className={`action-btn like-hover ${isLiked ? 'liked' : ''} ${likeAnimating ? 'like-pop' : ''}`}
              onClick={handleLike}
            >
              <Heart size={18} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>

          <div className="post-actions-group">
            {/* Views */}
            {viewCount > 0 && (
              <span className="action-btn" style={{ cursor: 'default' }}>
                <Eye size={16} />
                <span>{viewCount}</span>
              </span>
            )}
            {/* Bookmark */}
            <button
              className={`action-btn bookmark-hover ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="comments-section">
            <form onSubmit={handleComment} className="comment-compose">
              <Avatar
                src={users.find(u => u.id === currentUserId)?.avatarUrl}
                name={users.find(u => u.id === currentUserId)?.displayName || 'Me'}
                size="sm"
              />
              <input
                className="comment-input"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                maxLength={280}
              />
              <button
                type="submit"
                className="comment-send-btn"
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? <Loader size={14} className="spin" /> : 'Post'}
              </button>
            </form>

            {comments.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '8px 0 4px' }}>
                No comments yet. Be first!
              </p>
            )}

            {comments.map(c => {
              const cu = users.find(u => u.id === c.userId);
              return (
                <div key={c.id} className="comment-item">
                  <Avatar src={cu?.avatarUrl} name={cu?.displayName || '?'} size="sm" />
                  <div className="comment-bubble">
                    <div className="comment-author">{cu?.displayName || 'User'}</div>
                    <div className="comment-text">{c.text}</div>
                    <div className="comment-time">{formatTime(c.created)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>

      {/* Lightbox */}
      {showLightbox && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <button className="lightbox-close" onClick={() => setShowLightbox(false)}>✕</button>
          <img src={post.imageUrl} alt="Full size" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Close menu on outside click */}
      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
