import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Music, ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AnimatedNumber } from './Shared';
import { toggleLike, toggleBookmark, addComment } from '../hooks';
import { formatCount, formatTime } from '../utils';
import { getTrackById, playTrack, stopTrack } from '../musicLibrary';

export default function ReelsTab({ posts, currentUserId, users, onProfileClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Filter posts that have images (visual content for Reels)
  const reels = useMemo(() =>
    posts.filter(p => p.imageUrl).sort((a, b) => {
      const scoreA = (a.likedBy?.length || 0) + (a.repostedBy?.length || 0) * 2;
      const scoreB = (b.likedBy?.length || 0) + (b.repostedBy?.length || 0) * 2;
      return scoreB - scoreA;
    }),
    [posts]
  );

  // Play music for active reel
  useEffect(() => {
    const reel = reels[currentIndex];
    if (!reel || muted) {
      stopTrack();
      return;
    }
    if (reel.musicId) {
      playTrack(reel.musicId, { loop: true, volume: 0.4 });
    } else {
      stopTrack();
    }
  }, [currentIndex, reels, muted]);

  // Stop music when leaving Reels tab
  useEffect(() => {
    return () => stopTrack();
  }, []);

  // Snap scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollTop / height);
      setCurrentIndex(Math.max(0, Math.min(index, reels.length - 1)));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [reels.length]);

  const scrollToIndex = (index) => {
    const container = containerRef.current;
    if (!container || index < 0 || index >= reels.length) return;
    isScrollingRef.current = true;
    container.scrollTo({ top: index * container.clientHeight, behavior: 'smooth' });
    setCurrentIndex(index);
    setTimeout(() => { isScrollingRef.current = false; }, 500);
  };

  const toggleMute = () => setMuted(m => !m);

  if (reels.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-surface flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-dark-muted" />
        </div>
        <h3 className="text-xl font-bold text-dark-text mb-2">No Reels Yet</h3>
        <p className="text-dark-muted text-sm">Create a post with an image to see it here as a Reel!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="reel-container"
      style={{ height: 'calc(100vh - 120px)', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}
    >
      {reels.map((reel, index) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          isActive={index === currentIndex}
          currentUserId={currentUserId}
          users={users}
          muted={muted}
          onToggleMute={toggleMute}
          onProfileClick={onProfileClick}
          onNext={() => scrollToIndex(index + 1)}
          onPrev={() => scrollToIndex(index - 1)}
          hasNext={index < reels.length - 1}
          hasPrev={index > 0}
        />
      ))}
    </div>
  );
}

function ReelCard({ reel, isActive, currentUserId, users, muted, onToggleMute, onProfileClick, onNext, onPrev, hasNext, hasPrev }) {
  const [liked, setLiked] = useState((reel.likedBy || []).includes(currentUserId));
  const [bookmarked, setBookmarked] = useState((reel.favoritedBy || []).includes(currentUserId));
  const [likeCount, setLikeCount] = useState((reel.likedBy || []).filter(id => id !== reel.userId).length);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const lastTapRef = useRef(0);

  const author = users.find(u => u.id === reel.userId);
  const track = reel.musicId ? getTrackById(reel.musicId) : null;

  useEffect(() => {
    setLiked((reel.likedBy || []).includes(currentUserId));
    setLikeCount((reel.likedBy || []).filter(id => id !== reel.userId).length);
    setBookmarked((reel.favoritedBy || []).includes(currentUserId));
  }, [reel.likedBy, reel.favoritedBy, currentUserId, reel.userId]);

  const handleLike = useCallback(async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    try {
      await toggleLike(reel.id, currentUserId, liked, reel.userId);
    } catch (err) {
      setLiked(liked);
      setLikeCount((reel.likedBy || []).filter(id => id !== reel.userId).length);
    }
  }, [liked, reel.id, currentUserId, reel.userId, reel.likedBy]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [liked, handleLike]);

  const handleBookmark = async () => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    try {
      await toggleBookmark(reel.id, currentUserId, bookmarked);
    } catch { setBookmarked(bookmarked); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'CaisterPlayz Reel', url: window.location.origin }); }
      catch {}
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(reel.id, currentUserId, commentText.trim(), reel.userId);
      setCommentText('');
      setShowComments(false);
    } catch (err) { console.error(err); }
  };

  if (!author) return null;

  const commentCount = reel._commentCount || 0;

  return (
    <div
      className="reel-card"
      style={{ height: 'calc(100vh - 120px)', scrollSnapAlign: 'start' }}
      onClick={handleDoubleTap}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-dark-bg">
        <img
          src={reel.imageUrl}
          alt="Reel"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Double-tap Heart */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-double-tap-heart drop-shadow-2xl" />
        </div>
      )}

      {/* Mute/Unmute Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white animate-bounce-gentle transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={`p-2.5 rounded-full ${liked ? 'bg-red-500/20' : 'bg-black/30 backdrop-blur-sm'} transition-all`}>
            <Heart className={`w-7 h-7 transition-colors ${liked ? 'text-red-500 fill-red-500 animate-heart-burst' : 'text-white group-hover:text-red-400'}`} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow">{formatCount(likeCount)}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-1 group">
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-sm">
            <MessageCircle className="w-7 h-7 text-white group-hover:text-brand-primary transition-colors" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow">{formatCount(commentCount)}</span>
        </button>

        <button onClick={handleBookmark} className="flex flex-col items-center gap-1 group">
          <div className={`p-2.5 rounded-full ${bookmarked ? 'bg-brand-primary/20' : 'bg-black/30 backdrop-blur-sm'} transition-all`}>
            <Bookmark className={`w-7 h-7 transition-colors ${bookmarked ? 'text-brand-primary fill-brand-primary' : 'text-white group-hover:text-brand-primary'}`} />
          </div>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-sm">
            <Share className="w-7 h-7 text-white group-hover:text-brand-primary transition-colors" />
          </div>
        </button>

        <button onClick={() => onProfileClick(author.id)} className="mt-1">
          <Avatar src={author.avatarUrl} name={author.displayName} size="md" />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-16 z-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-white text-sm drop-shadow cursor-pointer hover:underline" onClick={() => onProfileClick(author.id)}>
            {author.displayName}
          </span>
          <span className="text-white/60 text-xs drop-shadow">{formatTime(reel.created)}</span>
        </div>
        {reel.text && (
          <p className="text-white text-sm leading-relaxed drop-shadow line-clamp-3">{reel.text}</p>
        )}
        {/* Music Track Info */}
        <div className="flex items-center gap-2 mt-2">
          {track ? (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                <Music className="w-3.5 h-3.5 text-white" />
                {isActive && !muted && (
                  <div className="flex items-end gap-[2px] h-3 mr-1">
                    {[1,2,3].map(i => (
                      <div
                        key={i}
                        className="w-[3px] rounded-full bg-white animate-waveform"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
                <span className="text-white text-xs font-medium">{track.name}</span>
                <span className="text-white/50 text-xs">• {track.artist}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              <Music className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/60 text-xs">Original audio — {author.displayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Comment Drawer */}
      {showComments && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30 bg-dark-bg/95 backdrop-blur-xl rounded-t-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
            <h3 className="font-bold text-dark-text">Comments</h3>
            <button onClick={() => setShowComments(false)} className="text-dark-muted text-sm">Close</button>
          </div>
          <div className="max-h-[40vh] overflow-y-auto p-4">
            <p className="text-dark-muted text-sm text-center py-4">Comments load from the main feed</p>
          </div>
          <form onSubmit={handleComment} className="flex gap-2 px-4 py-3 border-t border-dark-border">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-dark-surface border border-dark-border rounded-full px-4 py-2 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-brand-primary"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-full disabled:opacity-40"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
