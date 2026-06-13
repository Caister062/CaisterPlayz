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

  const reels = useMemo(() => {
    return posts
      .filter(p => p.imageUrl || p.videoUrl)
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setCurrentIndex(Number(entry.target.dataset.index));
          }
        });
      },
      { threshold: 0.7 }
    );

    reelRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [reels]);

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

  useEffect(() => {
    return () => stopTrack();
  }, []);

  const scrollToIndex = index => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: index * container.clientHeight,
      behavior: 'smooth'
    });
  };

  const toggleMute = () => setMuted(p => !p);

  if (reels.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center px-6">
        <Music className="w-8 h-8 text-zinc-500 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">No Reels Yet</h2>
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
          ref={el => (reelRefs.current[index] = el)}
          data-index={index}
          style={{ scrollSnapAlign: 'start' }}
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
            onNext={() => scrollToIndex(index + 1)}
            onPrev={() => scrollToIndex(index - 1)}
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

  const [liked, setLiked] = useState(likedUsers.includes(currentUserId));
  const [bookmarked, setBookmarked] = useState(
    (reel.favoritedBy || []).includes(currentUserId)
  );

  const [likeCount, setLikeCount] = useState(likedUsers.length);
  const [comments, setComments] = useState(reel.comments || []);
  const [commentCount, setCommentCount] = useState(reel.comments?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showHeart, setShowHeart] = useState(false);

  const videoRef = useRef(null);
  const commentsRef = useRef(null);
  const lastTapRef = useRef(0);

  const author = users.find(u => u.id === reel.userId);
  const track = reel.musicId ? getTrackById(reel.musicId) : null;

  const isVideo =
    reel.videoUrl ||
    reel.imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) video.play().catch(() => {});
    else video.pause();
  }, [isActive]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        videoRef.current?.pause();
        stopTrack();
      } else if (isActive) {
        videoRef.current?.play();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive]);

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [comments]);

  useEffect(() => {
    setLiked((reel.likedBy || []).includes(currentUserId));
    setBookmarked((reel.favoritedBy || []).includes(currentUserId));
    setLikeCount((reel.likedBy || []).length);
  }, [reel, currentUserId]);

  const handleLike = useCallback(async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(p => (newLiked ? p + 1 : p - 1));

    try {
      await toggleLike(reel.id, currentUserId, liked, reel.userId);
    } catch (err) {
      console.error(err);
    }
  }, [liked, reel.id, currentUserId, reel.userId]);

  const handleDoubleTap = () => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      if (!liked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }

    lastTapRef.current = now;
  };

  const handleBookmark = async () => {
    const newState = !bookmarked;
    setBookmarked(newState);

    try {
      await toggleBookmark(reel.id, currentUserId, bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: 'Reel',
        url: `${window.location.origin}/reel/${reel.id}`
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async e => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    const user = users.find(u => u.id === currentUserId);

    const newComment = {
      id: Date.now().toString(),
      userId: currentUserId,
      text,
      created: new Date().toISOString(),
      authorName: user?.displayName || 'User'
    };

    setComments(prev => [...prev, newComment]);
    setCommentCount(p => p + 1);
    setCommentText('');

    try {
      await addComment(reel.id, currentUserId, text, reel.userId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!author) return null;

  return (
    <div className="relative h-[calc(100vh-120px)] bg-black overflow-hidden" onTouchEnd={handleDoubleTap}>
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            ref={videoRef}
            src={reel.videoUrl || reel.imageUrl}
            className="w-full h-full object-cover"
            loop
            autoPlay={isActive}
            playsInline
            muted={muted}
          />
        ) : (
          <img src={reel.imageUrl} className="w-full h-full object-cover" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-24 h-24 text-red-500 fill-red-500" />
        </div>
      )}

      <button
        onClick={e => {
          e.stopPropagation();
          onToggleMute();
        }}
        className="absolute top-4 right-4 bg-black/40 p-2 rounded-full"
      >
        {muted ? <VolumeX className="text-white" /> : <Volume2 className="text-white" />}
      </button>

      {hasPrev && (
        <button onClick={onPrev} className="absolute top-4 left-1/2 -translate-x-1/2">
          <ChevronUp className="text-white" />
        </button>
      )}

      {hasNext && (
        <button onClick={onNext} className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <ChevronDown className="text-white" />
        </button>
      )}

      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        <button onClick={handleLike}>
          <Heart className={liked ? 'text-red-500 fill-red-500' : 'text-white'} />
          <span>{formatCount(likeCount)}</span>
        </button>

        <button onClick={() => setShowComments(p => !p)}>
          <MessageCircle className="text-white" />
          <span>{formatCount(commentCount)}</span>
        </button>

        <button onClick={handleBookmark}>
          <Bookmark className={bookmarked ? 'text-white fill-white' : 'text-white'} />
        </button>

        <button onClick={handleShare}>
          <Share className="text-white" />
        </button>

        <button onClick={() => onProfileClick(author.id)}>
          <Avatar src={author.avatarUrl} name={author.displayName} size="md" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-20 text-white">
        <div className="flex gap-2">
          <span className="font-bold">{author.displayName}</span>
          <span className="text-xs text-white/60">{formatTime(reel.created)}</span>
        </div>

        {reel.text && <p className="text-sm mt-2">{reel.text}</p>}

        <div className="mt-2 flex gap-2">
          <Music className="w-4 h-4" />
          <span className="text-xs">
            {track ? `${track.name} • ${track.artist}` : 'Original audio'}
          </span>
        </div>
      </div>

      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl">
          <div className="p-4 flex justify-between border-b border-zinc-700">
            <h2 className="text-white font-bold">Comments</h2>
            <button onClick={() => setShowComments(false)}>Close</button>
          </div>

          <div ref={commentsRef} className="max-h-[40vh] overflow-y-auto p-4">
            {comments.map(c => {
              const user = users.find(u => u.id === c.userId);
              return (
                <div key={c.id} className="flex gap-3 mb-3">
                  <Avatar src={user?.avatarUrl} name={user?.displayName} size="sm" />
                  <div>
                    <p className="text-white font-semibold">{user?.displayName}</p>
                    <p className="text-white/80">{c.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleComment} className="p-4 flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2"
              placeholder="Add a comment..."
            />
            <button disabled={!commentText.trim()}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}
