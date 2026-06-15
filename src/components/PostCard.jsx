import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Heart, Repeat2, MessageCircle, Bookmark, Eye, Share, Trash2, Loader2, X } from 'lucide-react';
import { Avatar, AnimatedNumber, ImageLightbox, RichText, FollowButton } from './Shared';
import { formatTime, parsePostText, getGamerBadge } from '../utils';
import { toggleLike, toggleRepost, toggleBookmark, addView, addComment, deletePost, useComments, deleteComment, followUser, unfollowUser, useFollows } from '../hooks';
import { playLikeSound, playRepostSound } from '../sounds';

export default function PostCard({
  post,
  currentUserId,
  users = [],
  onProfileClick,
  onHashtagClick,
  onQuote,
  posts = [],
  compact = false // New prop for carousel mode
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const postRef = useRef(null);
  const viewedRef = useRef(false);

  const { following = [] } = useFollows(currentUserId);
  const { comments = [], refreshComments } = useComments(showComments && !compact ? post.id : null);

  const author = useMemo(() => users.find(u => u.id === post.userId), [users, post.userId]);

  const gamerBadge = getGamerBadge(post.userId);

  const isLiked = post.likedBy?.includes(currentUserId);
  const isReposted = post.repostedBy?.includes(currentUserId);
  const isBookmarked = post.favoritedBy?.includes(currentUserId);

  const likeCount = post.likedBy?.length || 0;
  const repostCount = post.repostedBy?.length || 0;
  const viewCount = post.viewedBy?.length || 0;
  const commentCount = post._commentCount || 0;

  const textParts = parsePostText(post.text || '');

  useEffect(() => {
    if (!postRef.current || viewedRef.current) return;
    if (post.viewedBy?.includes(currentUserId)) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        viewedRef.current = true;
        addView(post.id, currentUserId).catch(() => {});
        obs.disconnect();
      }
    });

    obs.observe(postRef.current);
    return () => obs.disconnect();
  }, [post.id, currentUserId, post.viewedBy]);

  const handleLike = useCallback(async () => {
    const liked = isLiked;
    if (!liked) playLikeSound();
    try {
      await toggleLike(post.id, currentUserId, liked, post.userId);
    } catch (e) {
      console.error(e);
    }
  }, [isLiked, post, currentUserId]);

  const handleRepost = useCallback(async () => {
    const reposted = isReposted;
    if (!reposted) playRepostSound();
    try {
      await toggleRepost(post.id, currentUserId, reposted, post.userId);
    } catch (e) {
      console.error(e);
    }
  }, [isReposted, post, currentUserId]);

  const handleBookmark = async () => {
    try {
      await toggleBookmark(post.id, currentUserId, isBookmarked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
      return;
    }
    setDeleting(true);
    try {
      await deletePost(post.id, currentUserId);
      window.dispatchEvent(new Event('refreshPosts'));
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(post.id, currentUserId, commentText, post.userId);
      setCommentText('');
      refreshComments();
    } finally {
      setSubmitting(false);
    }
  };

  if (!author) return null;

  // COMPACT MODE (CAROUSEL ITEM)
  if (compact) {
    return (
      <div ref={postRef} className="card relative h-[280px] rounded-[24px] overflow-hidden group cursor-pointer border border-white/5">
         {post.imageUrl ? (
           <img src={post.imageUrl} alt="post" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
         ) : (
           <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/20 to-purple-600/20" />
         )}
         
         {/* Glassmorphic Overlay */}
         <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />
         
         <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 z-10">
            <div className="flex items-center gap-2 mb-1">
              <Avatar src={author.avatarUrl} name={author.displayName} size="sm" onClick={(e) => { e.stopPropagation(); onProfileClick(author.id); }} />
              <span className="font-bold text-sm text-white drop-shadow-md truncate">{author.displayName}</span>
            </div>
            
            <p className="text-xs text-gray-200 line-clamp-2 drop-shadow-sm font-medium">
              {post.text}
            </p>

            <div className="flex gap-4 mt-2 text-white/70">
              <button className="flex items-center gap-1 hover:text-brand-primary transition" onClick={(e) => { e.stopPropagation(); handleLike(); }}>
                 <Heart size={14} className={isLiked ? "fill-brand-primary text-brand-primary" : ""} />
                 <span className="text-xs font-bold">{likeCount > 0 ? likeCount : ''}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-white transition">
                 <MessageCircle size={14} />
                 <span className="text-xs font-bold">{commentCount > 0 ? commentCount : ''}</span>
              </button>
            </div>
         </div>
      </div>
    );
  }

  // STANDARD MODE (FEED ITEM)
  return (
    <>
      <div ref={postRef} className="card p-6 mb-6 rounded-3xl mx-4 my-2 border border-white/10 hover:border-brand-primary/30 transition-all shadow-lg hover:shadow-brand-primary/10">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <Avatar src={author.avatarUrl} name={author.displayName} onClick={() => onProfileClick(author.id)} className="ring-2 ring-brand-primary/20" />
            <div>
              <div className="flex gap-2 items-center">
                <span className="font-bold text-white hover:text-brand-primary transition cursor-pointer" onClick={() => onProfileClick(author.id)}>
                  {author.displayName}
                </span>
                {author.verified && <span className="text-brand-primary text-xs">✓</span>}
              </div>
              <span className="text-xs text-dark-muted font-medium uppercase tracking-wider">{formatTime(post.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.userId === currentUserId && (
              <button onClick={handleDelete} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-danger transition">
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            )}
            <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition" onClick={() => navigator.share?.({ title: 'Post', text: post.text, url: window.location.href })}>
              <Share size={16} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mb-4 text-[15px] leading-relaxed text-gray-200">
          <RichText parts={textParts} />
        </div>

        {/* MEDIA */}
        {post.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden mb-4 cursor-pointer ring-1 ring-white/10" onClick={() => setShowLightbox(true)}>
             <img src={post.imageUrl} className="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-white/50">
          <div className="flex gap-6">
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 hover:text-brand-primary transition group">
              <div className="p-2 rounded-full group-hover:bg-brand-primary/10 transition"><MessageCircle size={18} /></div>
              <span className="text-sm font-bold">{commentCount > 0 ? commentCount : ''}</span>
            </button>

            <button onClick={handleRepost} className={`flex items-center gap-2 transition group ${isReposted ? "text-success" : "hover:text-success"}`}>
              <div className={`p-2 rounded-full transition ${isReposted ? "bg-success/10" : "group-hover:bg-success/10"}`}><Repeat2 size={18} /></div>
              <span className="text-sm font-bold">{repostCount > 0 ? repostCount : ''}</span>
            </button>

            <button onClick={handleLike} className={`flex items-center gap-2 transition group ${isLiked ? "text-brand-primary" : "hover:text-brand-primary"}`}>
              <div className={`p-2 rounded-full transition ${isLiked ? "bg-brand-primary/10" : "group-hover:bg-brand-primary/10"}`}>
                <Heart size={18} className={isLiked ? "fill-current" : ""} />
              </div>
              <span className="text-sm font-bold">{likeCount > 0 ? likeCount : ''}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-white/5 transition flex items-center gap-1" title="Views">
              <Eye size={18} /> <span className="text-xs">{viewCount > 0 ? viewCount : ''}</span>
            </button>
            <button onClick={handleBookmark} className={`p-2 rounded-full hover:bg-white/5 transition ${isBookmarked ? "text-brand-secondary fill-brand-secondary" : ""}`}>
              <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
            </button>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <form onSubmit={handleComment} className="flex gap-3 mb-6">
              <Avatar src={users.find(u => u.id === currentUserId)?.avatarUrl} name="Me" size="sm" />
              <input
                className="flex-1 bg-dark-bg/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Broadcast a reply..."
              />
              <button disabled={submitting || !commentText.trim()} className="btn-primary py-2 px-6 text-sm disabled:opacity-50">
                Send
              </button>
            </form>

            <div className="space-y-4">
              {comments.map(c => {
                const u = users.find(x => x.id === c.userId);
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar src={u?.avatarUrl} name={u?.displayName} size="sm" />
                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                      <div className="flex items-baseline justify-between mb-1">
                        <b className="text-sm text-white">{u?.displayName || 'User'}</b>
                        <span className="text-xs text-white/40">{formatTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-300">{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {showLightbox && post.imageUrl && (
        <ImageLightbox src={post.imageUrl} onClose={() => setShowLightbox(false)} />
      )}
    </>
  );
}
