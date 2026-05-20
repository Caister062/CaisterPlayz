import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback
} from 'react';

import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Music,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX
} from 'lucide-react';

import { Avatar } from './Shared';

import {
  toggleLike,
  toggleBookmark,
  addComment
} from '../hooks';

import {
  formatCount,
  formatTime
} from '../utils';

import {
  getTrackById,
  playTrack,
  stopTrack
} from '../musicLibrary';

export default function ReelsTab({
  posts,
  currentUserId,
  users,
  onProfileClick
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);

  const containerRef = useRef(null);
  const reelRefs = useRef([]);

  // FILTER REELS
  const reels = useMemo(() => {
    return posts
      .filter(
        post =>
          post.imageUrl ||
          post.videoUrl
      )
      .sort((a, b) => {
        const scoreA =
          (a.likedBy?.length || 0) +
          (a.repostedBy?.length || 0) * 2;

        const scoreB =
          (b.likedBy?.length || 0) +
          (b.repostedBy?.length || 0) * 2;

        return scoreB - scoreA;
      });
  }, [posts]);

  // INTERSECTION OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(
              entry.target.dataset.index
            );

            setCurrentIndex(index);
          }
        });
      },
      {
        threshold: 0.7
      }
    );

    reelRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reels]);

  // MUSIC
  useEffect(() => {
    const reel = reels[currentIndex];

    if (!reel || muted) {
      stopTrack();
      return;
    }

    stopTrack();

    if (reel.musicId) {
      playTrack(reel.musicId, {
        loop: true,
        volume: 0.4
      });
    }
  }, [currentIndex, reels, muted]);

  // CLEANUP
  useEffect(() => {
    return () => {
      stopTrack();
    };
  }, []);

  const scrollToIndex = index => {
    const container = containerRef.current;

    if (!container) return;

    container.scrollTo({
      top: index * container.clientHeight,
      behavior: 'smooth'
    });
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  if (reels.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-zinc-500" />
        </div>

        <h2 className="text-white text-xl font-bold mb-2">
          No Reels Yet
        </h2>

        <p className="text-zinc-400 text-sm">
          Upload videos or images to see them here.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-y-scroll h-[calc(100vh-120px)]"
      style={{
        scrollSnapType: 'y mandatory',
        overscrollBehaviorY: 'contain'
      }}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          ref={el => {
            reelRefs.current[index] = el;
          }}
          data-index={index}
          style={{
            scrollSnapAlign: 'start'
          }}
        >
          <ReelCard
            reel={reel}
            currentUserId={currentUserId}
            users={users}
            isActive={index === currentIndex}
            muted={muted}
            onToggleMute={toggleMute}
            onProfileClick={onProfileClick}
            hasNext={index < reels.length - 1}
            hasPrev={index > 0}
            onNext={() =>
              scrollToIndex(index + 1)
            }
            onPrev={() =>
              scrollToIndex(index - 1)
            }
          />
        </div>
      ))}
    </div>
  );
}

function ReelCard({
  reel,
  currentUserId,
  users,
  isActive,
  muted,
  onToggleMute,
  onProfileClick,
  hasNext,
  hasPrev,
  onNext,
  onPrev
}) {
  const likedUsers = reel.likedBy || [];

  const [liked, setLiked] = useState(
    likedUsers.includes(currentUserId)
  );

  const [bookmarked, setBookmarked] =
    useState(
      (reel.favoritedBy || []).includes(
        currentUserId
      )
    );

  const [likeCount, setLikeCount] =
    useState(likedUsers.length);

  const [comments, setComments] =
    useState(reel.comments || []);

  const [commentCount, setCommentCount] =
    useState(
      reel.comments?.length ||
        reel._commentCount ||
        0
    );

  const [showComments, setShowComments] =
    useState(false);

  const [commentText, setCommentText] =
    useState('');

  const [showHeart, setShowHeart] =
    useState(false);

  const videoRef = useRef(null);
  const commentsRef = useRef(null);
  const lastTapRef = useRef(0);

  const author = users.find(
    user => user.id === reel.userId
  );

  const track = reel.musicId
    ? getTrackById(reel.musicId)
    : null;

  const isVideo =
    reel.videoUrl ||
    reel.imageUrl?.match(
      /\.(mp4|webm|ogg|mov)$/i
    );

  // VIDEO PLAYBACK
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  // TAB VISIBILITY
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        videoRef.current?.pause();
        stopTrack();
      } else if (isActive) {
        videoRef.current?.play();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );
    };
  }, [isActive]);

  // AUTO SCROLL COMMENTS
  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop =
        commentsRef.current.scrollHeight;
    }
  }, [comments]);

  // SYNC STATE
  useEffect(() => {
    setLiked(
      (reel.likedBy || []).includes(
        currentUserId
      )
    );

    setBookmarked(
      (reel.favoritedBy || []).includes(
        currentUserId
      )
    );

    setLikeCount(
      (reel.likedBy || []).length
    );
  }, [reel, currentUserId]);

  // LIKE
  const handleLike = useCallback(async () => {
    const newLiked = !liked;

    setLiked(newLiked);

    setLikeCount(prev =>
      newLiked ? prev + 1 : prev - 1
    );

    try {
      await toggleLike(
        reel.id,
        currentUserId,
        liked,
        reel.userId
      );
    } catch (err) {
      console.error(err);
    }
  }, [
    liked,
    reel.id,
    currentUserId,
    reel.userId
  ]);

  // DOUBLE TAP
  const handleDoubleTap = () => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      if (!liked) {
        handleLike();
      }

      setShowHeart(true);

      setTimeout(() => {
        setShowHeart(false);
      }, 800);
    }

    lastTapRef.current = now;
  };

  // BOOKMARK
  const handleBookmark = async () => {
    const newBookmarked = !bookmarked;

    setBookmarked(newBookmarked);

    try {
      await toggleBookmark(
        reel.id,
        currentUserId,
        bookmarked
      );
    } catch (err) {
      console.error(err);
    }
  };

  // SHARE
  const handleShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: 'CaisterPlayz Reel',
        url: `${window.location.origin}/reel/${reel.id}`
      });
    } catch (err) {
      console.error(err);
    }
  };

  // COMMENT
  const handleComment = async e => {
    e.preventDefault();

    const text = commentText.trim();

    if (!text) return;

    const currentUser = users.find(
      u => u.id === currentUserId
    );

    const newComment = {
      id: Date.now().toString(),
      userId: currentUserId,
      text,
      created: new Date().toISOString(),
      authorName:
        currentUser?.displayName || 'User'
    };

    setComments(prev => [
      ...prev,
      newComment
    ]);

    setCommentCount(prev => prev + 1);

    setCommentText('');

    try {
      await addComment(
        reel.id,
        currentUserId,
        text,
        reel.userId
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!author) return null;

  return (
    <div
      className="relative h-[calc(100vh-120px)] bg-black overflow-hidden"
      onTouchEnd={handleDoubleTap}
    >
      {/* MEDIA */}
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            ref={videoRef}
            src={
              reel.videoUrl ||
              reel.imageUrl
            }
            className="w-full h-full object-cover"
            loop
            autoPlay={isActive}
            playsInline
            muted={muted}
            preload="metadata"
            webkit-playsinline="true"
          />
        ) : (
          <img
            src={reel.imageUrl}
            alt="Reel"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* DOUBLE TAP HEART */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Heart className="w-24 h-24 text-red-500 fill-red-500" />
        </div>
      )}

      {/* MUTE */}
      <button
        onClick={e => {
          e.stopPropagation();
          onToggleMute();
        }}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40"
      >
        {muted ? (
          <VolumeX className="text-white w-5 h-5" />
        ) : (
          <Volume2 className="text-white w-5 h-5" />
        )}
      </button>

      {/* NAVIGATION */}
      {hasPrev && (
        <button
          onClick={e => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
        >
          <ChevronUp className="text-white" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={e => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
        >
          <ChevronDown className="text-white" />
        </button>
      )}

      {/* RIGHT ACTIONS */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5">
        <button
          onClick={handleLike}
          className="flex flex-col items-center"
        >
          <Heart
            className={`w-7 h-7 ${
              liked
                ? 'fill-red-500 text-red-500'
                : 'text-white'
            }`}
          />

          <span className="text-white text-xs font-bold">
            {formatCount(likeCount)}
          </span>
        </button>

        <button
          onClick={() =>
            setShowComments(prev => !prev)
          }
          className="flex flex-col items-center"
        >
          <MessageCircle className="w-7 h-7 text-white" />

          <span className="text-white text-xs font-bold">
            {formatCount(commentCount)}
          </span>
        </button>

        <button
          onClick={handleBookmark}
        >
          <Bookmark
            className={`w-7 h-7 ${
              bookmarked
                ? 'fill-white text-white'
                : 'text-white'
            }`}
          />
        </button>

        <button onClick={handleShare}>
          <Share className="w-7 h-7 text-white" />
        </button>

        <button
          onClick={() =>
            onProfileClick(author.id)
          }
        >
          <Avatar
            src={author.avatarUrl}
            name={author.displayName}
            size="md"
          />
        </button>
      </div>

      {/* INFO */}
      <div className="absolute bottom-4 left-4 right-20 z-20">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-bold text-white text-sm"
            onClick={() =>
              onProfileClick(author.id)
            }
          >
            {author.displayName}
          </span>

          <span className="text-white/60 text-xs">
            {formatTime(reel.created)}
          </span>
        </div>

        {reel.text && (
          <p className="text-white text-sm leading-relaxed">
            {reel.text}
          </p>
        )}

        {/* MUSIC */}
        <div className="mt-3">
          {track ? (
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-white" />

              <span className="text-white text-xs">
                {track.name} • {track.artist}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-white" />

              <span className="text-white text-xs">
                Original audio
              </span>
            </div>
          )}
        </div>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div
          className="absolute bottom-0 left-0 right-0 z-40 bg-zinc-900 rounded-t-3xl"
          onClick={e =>
            e.stopPropagation()
          }
        >
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h2 className="text-white font-bold">
              Comments
            </h2>

            <button
              onClick={() =>
                setShowComments(false)
              }
              className="text-zinc-400"
            >
              Close
            </button>
          </div>

          <div
            ref={commentsRef}
            className="max-h-[40vh] overflow-y-auto p-4"
          >
            {comments.length === 0 ? (
              <p className="text-zinc-400 text-center">
                No comments yet
              </p>
            ) : (
              comments.map(comment => {
                const commentAuthor =
                  users.find(
                    u =>
                      u.id === comment.userId
                  );

                return (
                  <div
                    key={comment.id}
                    className="flex gap-3 mb-4"
                  >
                    <Avatar
                      src={
                        commentAuthor?.avatarUrl
                      }
                      name={
                        commentAuthor?.displayName
                      }
                      size="sm"
                    />

                    <div>
                      <div className="bg-zinc-800 rounded-2xl px-3 py-2">
                        <p className="text-white text-sm font-semibold">
                          {commentAuthor?.displayName ||
                            'User'}
                        </p>

                        <p className="text-white/90 text-sm">
                          {comment.text}
                        </p>
                      </div>

                      <p className="text-zinc-500 text-xs mt-1">
                        {formatTime(
                          comment.created
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleComment}
            className="flex gap-2 p-4 border-t border-zinc-700"
          >
            <input
              type="text"
              value={commentText}
              onChange={e =>
                setCommentText(
                  e.target.value
                )
              }
              placeholder="Add a comment..."
              className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 outline-none"
            />

            <button
              type="submit"
              disabled={
                !commentText.trim()
              }
              className="bg-white text-black px-4 py-2 rounded-full font-semibold disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
