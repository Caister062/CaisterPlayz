import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Heart, Repeat2, MessageCircle, Bookmark, Eye, Share, Trash2, Loader2 } from 'lucide-react';
import { Avatar, AnimatedNumber, ImageLightbox, RichText } from './Shared';
import { formatTime, parsePostText, getGamerBadge } from '../utils';
import { toggleLike, toggleRepost, toggleBookmark, addView, addComment, deletePost, useComments } from '../hooks';
import { playLikeSound, playRepostSound } from '../sounds';

export default function PostCard({ post, currentUserId, users, onProfileClick }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likeAnim, setLikeAnim] = useState(false);
  const [repostAnim, setRepostAnim] = useState(false);
  const [bookmarkAnim, setBookmarkAnim] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  const postRef = useRef(null);
  const viewedRef = useRef(false);
  const commentInputRef = useRef(null);
  
  // Safely fallback to an empty array if comments are still loading or undefined
  const { comments = [], refreshComments } = useComments(showComments ? post.id : null);

  // Track the last server-confirmed arrays so we can compare contents not references
  const serverLikedRef = useRef(null);
  const serverRepRef = useRef(null);
  const serverFavRef = useRef(null);

  // Sync server arrays; reset local overlay whenever server data changes (poll/refetch)
  useEffect(() => {
    if (serverLikedRef.current !== post.likedBy) {
      setLocalLikedBy(null);
      serverLikedRef.current = post.likedBy;
    }
    if (serverRepRef.current !== post.repostedBy) {
      setLocalRepostedBy(null);
      serverRepRef.current = post.repostedBy;
    }
    if (serverFavRef.current !== post.favoritedBy) {
      setLocalFavoritedBy(null);
      serverFavRef.current = post.favoritedBy;
    }
  }, [post.likedBy, post.repostedBy, post.favoritedBy]);

  // Stable "source of truth" — starts as null, then follows server state
  const [stableLiked, setStableLiked] = useState(null);
  const [stableRep, setStableRep] = useState(null);
  const [stableFav, setStableFav] = useState(null);

  // Once server gives us data, lock in as the new baseline (no more null-wipes)
  useEffect(() => {
    if (post.likedBy && post.likedBy.length > 0) setStableLiked(post.likedBy);
    if (post.repostedBy && post.repostedBy.length > 0) setStableRep(post.repostedBy);
    if (post.favoritedBy && post.favoritedBy.length > 0) setStableFav(post.favoritedBy);
  }, [post.likedBy, post.repostedBy, post.favoritedBy]);

  const actualLikedBy = useMemo(() => localLikedBy !== null ? [...localLikedBy] : (stableLiked !== null ? [...stableLiked] : [...(post.likedBy || [])]), [localLikedBy, stableLiked, post.likedBy]);
  const actualRepostedBy = useMemo(() => localRepostedBy !== null ? [...localRepostedBy] : (stableRep !== null ? [...stableRep] : [...(post.repostedBy || [])]), [localRepostedBy, stableRep, post.repostedBy]);
  const actualFavoritedBy = useMemo(() => localFavoritedBy !== null ? [...localFavoritedBy] : (stableFav !== null ? [...stableFav] : [...(post.favoritedBy || [])]), [localFavoritedBy, stableFav, post.favoritedBy]);

  const author = users.find(u => u.id === post.userId);
  const gamerBadge = getGamerBadge(post.userId);
  const isLiked = actualLikedBy.includes(currentUserId);
  const isReposted = actualRepostedBy.includes(currentUserId);
  const isBookmarked = actualFavoritedBy.includes(currentUserId);
  
  const likeCount = actualLikedBy.length;
  const repostCount = actualRepostedBy.length;
  const viewCount = (post.viewedBy || []).length;

  // Parse post text for rich links
  const textParts = parsePostText(post.text);

  // IntersectionObserver for view tracking
  useEffect(() => {
    if (!postRef.current || viewedRef.current || post.userId === currentUserId) return;
    if ((post.viewedBy || []).includes(currentUserId)) {
      viewedRef.current = true;
      return;
    }
    
    let viewTimer = null;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewTimer = setTimeout(() => {
            viewedRef.current = true;
            addView(post.id, currentUserId).catch(() => {});
            obs.disconnect();
          }, 1500);
        } else {
          if (viewTimer) clearTimeout(viewTimer);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(postRef.current);
    
    return () => {
      if (viewTimer) clearTimeout(viewTimer);
      obs.disconnect();
    };
  }, [post.id, post.userId, currentUserId, post.viewedBy]);

  const handleLike = useCallback(async () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 450);
    
    const newLikedBy = isLiked 
      ? actualLikedBy.filter(id => id !== currentUserId) 
      : [...actualLikedBy, currentUserId];
    
    if (!isLiked) playLikeSound();
    
    setLocalLikedBy(newLikedBy);

    try {
      await toggleLike(post.id, currentUserId, isLiked, post.userId);
    } catch (err) { 
      console.error(err);
      setLocalLikedBy(null);
    }
  }, [isLiked, actualLikedBy, currentUserId, post.id, post.userId]);

  const handleRepost = useCallback(async () => {
    setRepostAnim(true);
    setTimeout(() => setRepostAnim(false), 400);

    const newRepostedBy = isReposted 
      ? actualRepostedBy.filter(id => id !== currentUserId) 
      : [...actualRepostedBy, currentUserId];

    if (!isReposted) playRepostSound();

    setLocalRepostedBy(newRepostedBy);

    try {
      await toggleRepost(post.id, currentUserId, isReposted, post.userId);
    } catch (err) { 
      console.error(err);
      setLocalRepostedBy(null);
    }
  }, [isReposted, actualRepostedBy, currentUserId, post.id, post.userId]);

  const handleBookmark = useCallback(async () => {
    setBookmarkAnim(true);
    setTimeout(() => setBookmarkAnim(false), 400);

    const newFavoritedBy = isBookmarked 
      ? actualFavoritedBy.filter(id => id !== currentUserId) 
      : [...actualFavoritedBy, currentUserId];
    setLocalFavoritedBy(newFavoritedBy);

    try {
      await toggleBookmark(post.id, currentUserId, isBookmarked);
    } catch (err) { 
      console.error(err);
      setLocalFavoritedBy(null);
    }
  }, [isBookmarked, actualFavoritedBy, currentUserId, post.id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(post.id, currentUserId, commentText.trim(), post.userId);
      setCommentText('');
      refreshComments();
    } catch (err) { 
      console.error(err); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    setDeleting(true);
    try {
      await deletePost(post.id, currentUserId);
      window.dispatchEvent(new Event('refreshPosts'));
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const shareText = post.text ? `${post.text.slice(0, 100)}${post.text.length > 100 ? '...' : ''}` : 'Check out this post on CaisterPlayz!';
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CaisterPlayz', text: shareText, url: shareUrl });
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    } else {
      await navigator.clipboard?.writeText(shareUrl);
    }
  };

  const handleToggleComments = () => {
    const nextShowComments = !showComments;
    setShowComments(nextShowComments);
    if (nextShowComments) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  if (!author) return null;

  return (
    <>
      <div ref={postRef} className="px-4 py-3 border-b border-dark-border hover:bg-dark-hover/50 transition-colors animate-fade-slide relative">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar
            src={author.avatarUrl}
            name={author.displayName}
            size="md"
            onClick={() => onProfileClick(author.id)}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-0.5 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="font-bold text-dark-text text-[15px] hover:underline cursor-pointer truncate"
                  onClick={() => onProfileClick(author.id)}
                >
                  {author.displayName}
                </span>
                {gamerBadge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-dark-border bg-dark-bg ${gamerBadge.color}`}>
                    {gamerBadge.text}
                  </span>
                )}
                <span className="text-dark-muted text-sm truncate">
                  @{author.displayName?.toLowerCase().replace(/\s+/g, '')}
                </span>
                <span className="text-dark-muted text-sm flex-shrink-0">·</span>
                <span className="text-dark-muted text-sm whitespace-nowrap flex-shrink-0">{formatTime(post.created)}</span>
              </div>
              {post.userId === currentUserId && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`p-1.5 rounded-full transition-colors ml-2 ${
                    confirmDelete 
                      ? 'bg-brand-danger text-white' 
                      : 'hover:bg-brand-danger/10 group text-dark-muted hover:text-brand-danger'
                  }`}
                  title={confirmDelete ? "Click again to confirm" : "Delete post"}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 transition-colors" />
                  )}
                </button>
              )}
            </div>

            {/* Text with rich links */}
            <div className="relative">
              {post.text && (
                <RichText
                  parts={textParts}
                  className="text-dark-text text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-2"
                />
              )}
            </div>

            {/* Image/Video */}
            {post.imageUrl && (
              <div
                className={`mt-2 mb-3 rounded-2xl overflow-hidden border border-dark-border relative ${
                  post.imageUrl.startsWith('data:video/') ? '' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (!post.imageUrl.startsWith('data:video/')) {
                    setShowLightbox(true);
                  }
                }}
              >
                {post.imageUrl.startsWith('data:video/') ? (
                  <video
                    src={post.imageUrl}
                    controls
                    className="w-full max-h-[500px] bg-black"
                  />
                ) : (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full max-h-[500px] object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-1 -ml-2 max-w-md">
              {/* Comment */}
              <button
                onClick={handleToggleComments}
                className="flex items-center gap-1.5 group px-2 py-1.5 rounded-full hover:bg-brand-primary/10 transition-colors"
              >
                <MessageCircle className="w-[18px] h-[18px] text-dark-muted group-hover:text-brand-primary transition-colors" />
                <span className="text-xs text-dark-muted group-hover:text-brand-primary">
                  <AnimatedNumber value={post._commentCount || 0} />
                </span>
              </button>

              {/* Repost */}
              <button
                onClick={handleRepost}
                className="flex items-center gap-1.5 group px-2 py-1.5 rounded-full hover:bg-brand-success/10 transition-colors"
              >
                <Repeat2
                  className={`w-[18px] h-[18px] transition-colors ${
                    isReposted ? 'text-brand-success' : 'text-dark-muted group-hover:text-brand-success'
                  } ${repostAnim ? 'animate-repost-burst' : ''}`}
                />
                <span className={`text-xs ${isReposted ? 'text-brand-success' : 'text-dark-muted group-hover:text-brand-success'}`}>
                  <AnimatedNumber value={repostCount} />
                </span>
              </button>

              {/* Like */}
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 group px-2 py-1.5 rounded-full hover:bg-red-500/10 transition-colors"
              >
                <Heart
                  className={`w-[18px] h-[18px] transition-colors ${
                    isLiked ? 'text-red-500 fill-red-500' : 'text-dark-muted group-hover:text-red-500'
                  } ${likeAnim ? 'animate-heart-burst' : ''}`}
                />
                <span className={`text-xs ${isLiked ? 'text-red-500' : 'text-dark-muted group-hover:text-red-500'}`}>
                  <AnimatedNumber value={likeCount} />
                </span>
              </button>

              {/* Views */}
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <Eye className="w-[18px] h-[18px] text-dark-muted" />
                <span className="text-xs text-dark-muted">
                  <AnimatedNumber value={viewCount} />
                </span>
              </div>

              {/* Bookmark & Share */}
              <div className="flex items-center">
                <button
                  onClick={handleBookmark}
                  className="p-1.5 rounded-full hover:bg-brand-primary/10 transition-colors"
                >
                  <Bookmark
                    className={`w-[18px] h-[18px] transition-colors ${
                      isBookmarked ? 'text-brand-primary fill-brand-primary' : 'text-dark-muted hover:text-brand-primary'
                    } ${bookmarkAnim ? 'animate-bookmark-burst' : ''}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-full hover:bg-brand-primary/10 transition-colors"
                >
                  <Share className="w-[18px] h-[18px] text-dark-muted hover:text-brand-primary transition-colors" />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-3 border-t border-dark-border pt-3 animate-fade-slide">
                {/* Comment Input */}
                <form onSubmit={handleComment} className="flex gap-2 mb-3">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Post your reply..."
                    className="flex-1 bg-dark-surface border border-dark-border rounded-full px-4 py-2 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submitting}
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-full disabled:opacity-40 hover:bg-brand-primary/90 transition-colors"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reply'}
                  </button>
                </form>

                {/* Comment List */}
                {comments.map(comment => {
                  const commenter = users.find(u => u.id === comment.userId);
                  if (!commenter) return null;
                  return (
                    <div key={comment.id} className="flex gap-2.5 py-2 animate-fade-slide">
                      <Avatar
                        src={commenter.avatarUrl}
                        name={commenter.displayName}
                        size="sm"
                        onClick={() => onProfileClick(commenter.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-dark-text">{commenter.displayName}</span>
                          <span className="text-dark-muted text-xs">{formatTime(comment.created)}</span>
                        </div>
                        <p className="text-sm text-dark-text mt-0.5">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
                {comments.length === 0 && (
                  <p className="text-dark-muted text-sm text-center py-3">No replies yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {showLightbox && post.imageUrl && (
        <ImageLightbox
          src={post.imageUrl}
          alt="Post image"
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}
