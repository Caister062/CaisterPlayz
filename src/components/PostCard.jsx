import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Heart, Repeat2, MessageCircle, Bookmark, Eye, Share, Trash2, Loader2, X } from 'lucide-react';
import { Avatar, AnimatedNumber, ImageLightbox, RichText, FollowButton } from './Shared';
import { formatTime, parsePostText, getGamerBadge } from '../utils';
import { toggleLike, toggleRepost, toggleBookmark, addView, addComment, deletePost, useComments, deleteComment, followUser, unfollowUser, useFollows } from '../hooks';
import { playLikeSound, playRepostSound } from '../sounds';

export default function PostCard({ post, currentUserId, users, onProfileClick, onHashtagClick, onQuote, posts }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likeAnim, setLikeAnim] = useState(false);
  const [repostAnim, setRepostAnim] = useState(false);
  const [bookmarkAnim, setBookmarkAnim] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [localLikedBy, setLocalLikedBy] = useState(null);
  const [localRepostedBy, setLocalRepostedBy] = useState(null);
  const [localFavoritedBy, setLocalFavoritedBy] = useState(null);
  const [localCommentCount, setLocalCommentCount] = useState(post._commentCount || 0);
  const [detailModal, setDetailModal] = useState(null); // 'likes' | 'reposts' | null
  const [showRepostDropdown, setShowRepostDropdown] = useState(false);

  const originalPost = useMemo(() => {
    if (post.type === 'quote' && post.originalPostId) {
      return posts?.find(p => p.id === post.originalPostId);
    }
    return null;
  }, [post.type, post.originalPostId, posts]);

  useEffect(() => {
    setLocalCommentCount(post._commentCount || 0);
  }, [post._commentCount]);
  
  const postRef = useRef(null);
  const viewedRef = useRef(false);
  const commentInputRef = useRef(null);

  const { following } = useFollows(currentUserId);
  const followingIds = useMemo(() => following.map(f => f.followingId), [following]);


  
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

  const detailUsers = useMemo(() => {
    if (detailModal === 'likes') {
      return users.filter(u => actualLikedBy.includes(u.id));
    }
    if (detailModal === 'reposts') {
      return users.filter(u => actualRepostedBy.includes(u.id));
    }
    return [];
  }, [detailModal, users, actualLikedBy, actualRepostedBy]);

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
      setLocalCommentCount(prev => prev + 1);
      refreshComments();
    } catch (err) { 
      console.error(err); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId, currentUserId);
      setLocalCommentCount(prev => Math.max(0, prev - 1));
      refreshComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.message || 'Failed to delete comment');
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
                {author.verified && (
                  <svg className="w-4 h-4 text-brand-primary fill-current flex-shrink-0 inline-block ml-0.5" viewBox="0 0 24 24" title="Verified Creator">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
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
                  onHashtagClick={onHashtagClick}
                  onMentionClick={onProfileClick}
                  users={users}
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

            {/* Quote Post Preview */}
            {originalPost && (
              <div 
                className="mt-2 mb-3 bg-dark-surface/30 hover:bg-dark-surface/50 border border-dark-border/50 rounded-2xl p-3.5 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onProfileClick(originalPost.userId);
                }}
              >
                {/* Original author details */}
                {(() => {
                  const origAuthor = users.find(u => u.id === originalPost.userId);
                  if (!origAuthor) return null;
                  return (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-brand-primary/10 border border-dark-border flex items-center justify-center text-xs font-bold text-brand-primary">
                        {origAuthor.avatarUrl ? (
                          <img src={origAuthor.avatarUrl} alt={origAuthor.displayName} className="w-full h-full object-cover" />
                        ) : (
                          origAuthor.displayName[0].toUpperCase()
                        )}
                      </div>
                      <span className="font-bold text-xs text-dark-text">{origAuthor.displayName}</span>
                      {origAuthor.verified && (
                        <svg className="w-3.5 h-3.5 text-brand-primary fill-current flex-shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                      <span className="text-[10px] text-dark-muted">@{origAuthor.displayName?.toLowerCase().replace(/\s+/g, '')}</span>
                    </div>
                  );
                })()}
                
                {/* Original post text */}
                <p className="text-xs text-dark-text leading-relaxed line-clamp-3 whitespace-pre-wrap break-words">
                  {originalPost.text}
                </p>

                {/* Original post image */}
                {originalPost.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden max-h-[220px] border border-dark-border/40">
                    <img src={originalPost.imageUrl} alt="Quoted content" className="w-full h-full object-cover" />
                  </div>
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
                  <AnimatedNumber value={localCommentCount} />
                </span>
              </button>

              {/* Repost & Quote */}
              <div className="flex items-center gap-1 group relative">
                <button
                  onClick={() => setShowRepostDropdown(!showRepostDropdown)}
                  className="p-1.5 rounded-full hover:bg-brand-success/10 transition-colors text-dark-muted hover:text-brand-success cursor-pointer"
                >
                  <Repeat2
                    className={`w-[18px] h-[18px] transition-colors ${
                      isReposted ? 'text-brand-success' : 'text-dark-muted group-hover:text-brand-success'
                    } ${repostAnim ? 'animate-repost-burst' : ''}`}
                  />
                </button>
                {repostCount > 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModal('reposts');
                    }}
                    className={`text-xs font-semibold cursor-pointer hover:underline ${
                      isReposted ? 'text-brand-success' : 'text-dark-muted hover:text-brand-success'
                    }`}
                  >
                    <AnimatedNumber value={repostCount} />
                  </button>
                ) : (
                  <span className="text-xs text-dark-muted">0</span>
                )}

                {showRepostDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRepostDropdown(false)} />
                    <div className="absolute left-0 bottom-full mb-1 z-50 bg-dark-card border border-dark-border rounded-xl shadow-xl p-1.5 min-w-[120px] animate-fade-in flex flex-col text-left">
                      <button
                        onClick={() => {
                          setShowRepostDropdown(false);
                          handleRepost();
                        }}
                        className="px-3 py-1.5 text-xs text-dark-text hover:bg-dark-hover rounded-lg transition-colors font-bold flex items-center gap-1.5 text-left w-full cursor-pointer"
                      >
                        <Repeat2 className="w-3.5 h-3.5 text-brand-success" />
                        Repost
                      </button>
                      <button
                        onClick={() => {
                          setShowRepostDropdown(false);
                          if (onQuote) onQuote(post);
                        }}
                        className="px-3 py-1.5 text-xs text-dark-text hover:bg-dark-hover rounded-lg transition-colors font-bold flex items-center gap-1.5 text-left w-full cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Quote Post
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Like */}
              <div className="flex items-center gap-1 group">
                <button
                  onClick={handleLike}
                  className="p-1.5 rounded-full hover:bg-red-500/10 transition-colors text-dark-muted hover:text-red-500"
                >
                  <Heart
                    className={`w-[18px] h-[18px] transition-colors ${
                      isLiked ? 'text-red-500 fill-red-500' : 'text-dark-muted group-hover:text-red-500'
                    } ${likeAnim ? 'animate-heart-burst' : ''}`}
                  />
                </button>
                {likeCount > 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModal('likes');
                    }}
                    className={`text-xs font-semibold cursor-pointer hover:underline ${
                      isLiked ? 'text-red-500' : 'text-dark-muted hover:text-red-500'
                    }`}
                  >
                    <AnimatedNumber value={likeCount} />
                  </button>
                ) : (
                  <span className="text-xs text-dark-muted">0</span>
                )}
              </div>

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
                  const isCommentOwner = comment.userId === currentUserId;
                  return (
                    <div key={comment.id} className="flex gap-2.5 py-2 animate-fade-slide">
                      <Avatar
                        src={commenter.avatarUrl}
                        name={commenter.displayName}
                        size="sm"
                        onClick={() => onProfileClick(commenter.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-dark-text">{commenter.displayName}</span>
                            <span className="text-dark-muted text-xs">{formatTime(comment.created)}</span>
                          </div>
                          {isCommentOwner && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-dark-muted hover:text-brand-danger transition-colors p-1 cursor-pointer"
                              title="Delete reply"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Detail list modal */}
      {detailModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-modal-overlay"
          onClick={() => setDetailModal(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div 
            className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-xs p-4 mx-4 shadow-2xl animate-modal-enter flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-dark-border mb-3">
              <h3 className="font-bold text-dark-text capitalize">
                {detailModal === 'likes' ? 'Liked by' : 'Reposted by'}
              </h3>
              <button 
                onClick={() => setDetailModal(null)}
                className="p-1 rounded-full hover:bg-dark-hover text-dark-muted hover:text-dark-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {detailUsers.length === 0 ? (
                <p className="text-sm text-dark-muted text-center py-4">No records found</p>
              ) : (
                detailUsers.map(u => {
                  const isUserFollowing = followingIds.includes(u.id);
                  return (
                    <div key={u.id} className="flex items-center justify-between gap-3">
                      <div 
                        className="flex items-center gap-2 cursor-pointer min-w-0"
                        onClick={() => {
                          setDetailModal(null);
                          onProfileClick(u.id);
                        }}
                      >
                        <Avatar src={u.avatarUrl} name={u.displayName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-dark-text truncate">{u.displayName}</p>
                          <p className="text-xs text-dark-muted truncate">@{u.displayName?.toLowerCase().replace(/\s+/g, '')}</p>
                        </div>
                      </div>
                      {u.id !== currentUserId && (
                        <FollowButton
                          isFollowing={isUserFollowing}
                          size="sm"
                          onClick={async () => {
                            if (isUserFollowing) {
                              await unfollowUser(currentUserId, u.id);
                            } else {
                              await followUser(currentUserId, u.id);
                            }
                          }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
