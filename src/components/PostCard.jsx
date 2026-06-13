import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Bookmark,
  Eye,
  Share,
  Trash2,
  Loader2,
  X
} from 'lucide-react';

import {
  Avatar,
  AnimatedNumber,
  ImageLightbox,
  RichText,
  FollowButton
} from './Shared';

import {
  formatTime,
  parsePostText,
  getGamerBadge
} from '../utils';

import {
  toggleLike,
  toggleRepost,
  toggleBookmark,
  addView,
  addComment,
  deletePost,
  useComments,
  deleteComment,
  followUser,
  unfollowUser,
  useFollows
} from '../hooks';

import {
  playLikeSound,
  playRepostSound
} from '../sounds';

export default function PostCard({
  post,
  currentUserId,
  users = [],
  onProfileClick,
  onHashtagClick,
  onQuote,
  posts = []
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
  const commentInputRef = useRef(null);

  const { following = [] } = useFollows(currentUserId);
  const followingIds = useMemo(
    () => following.map(f => f.followingId),
    [following]
  );

  const { comments = [], refreshComments } =
    useComments(showComments ? post.id : null);

  const author = useMemo(
    () => users.find(u => u.id === post.userId),
    [users, post.userId]
  );

  const originalPost = useMemo(() => {
    if (post.type === 'quote' && post.originalPostId) {
      return posts.find(p => p.id === post.originalPostId);
    }
    return null;
  }, [post, posts]);

  const gamerBadge = getGamerBadge(post.userId);

  const isLiked = post.likedBy?.includes(currentUserId);
  const isReposted = post.repostedBy?.includes(currentUserId);
  const isBookmarked = post.favoritedBy?.includes(currentUserId);

  const likeCount = post.likedBy?.length || 0;
  const repostCount = post.repostedBy?.length || 0;
  const viewCount = post.viewedBy?.length || 0;

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

    const updated = liked
      ? post.likedBy.filter(id => id !== currentUserId)
      : [...(post.likedBy || []), currentUserId];

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

  if (!author) return null;

  return (
    <>
      <div ref={postRef} className="px-4 py-3 border-b border-dark-border">

        {/* HEADER */}
        <div className="flex gap-3">

          <Avatar
            src={author.avatarUrl}
            name={author.displayName}
            onClick={() => onProfileClick(author.id)}
          />

          <div className="flex-1">

            <div className="flex justify-between">
              <div className="flex gap-2 items-center">
                <span className="font-bold">
                  {author.displayName}
                </span>
                {author.verified && <span>✓</span>}
              </div>

              {post.userId === currentUserId && (
                <button onClick={handleDelete}>
                  {deleting ? <Loader2 /> : <Trash2 />}
                </button>
              )}
            </div>

            {/* TEXT */}
            <RichText parts={textParts} />

            {/* IMAGE */}
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                onClick={() => setShowLightbox(true)}
                className="rounded-xl mt-2"
              />
            )}

            {/* ACTIONS */}
            <div className="flex gap-6 mt-2">

              <button onClick={() => setShowComments(!showComments)}>
                <MessageCircle /> {post._commentCount || 0}
              </button>

              <button onClick={handleRepost}>
                <Repeat2 /> {repostCount}
              </button>

              <button onClick={handleLike}>
                <Heart /> {likeCount}
              </button>

              <button>
                <Eye /> {viewCount}
              </button>

              <button onClick={handleBookmark}>
                <Bookmark />
              </button>

              <button onClick={() => navigator.share?.({
                title: 'Post',
                text: post.text,
                url: window.location.href
              })}>
                <Share />
              </button>

            </div>

            {/* COMMENTS */}
            {showComments && (
              <div>
                <form onSubmit={handleComment}>
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Reply..."
                  />
                  <button disabled={submitting}>
                    Reply
                  </button>
                </form>

                {comments.map(c => {
                  const u = users.find(x => x.id === c.userId);
                  return (
                    <div key={c.id}>
                      <b>{u?.displayName}</b>
                      <p>{c.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {showLightbox && post.imageUrl && (
        <ImageLightbox
          src={post.imageUrl}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}
