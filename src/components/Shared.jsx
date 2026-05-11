import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { formatCount } from '../utils';

/* ─── Animated Number (Slot Machine) ─── */
export function AnimatedNumber({ value, className = '' }) {
  const [display, setDisplay] = useState(formatCount(value));
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setAnimating(true);
      setTimeout(() => {
        setDisplay(formatCount(value));
        setAnimating(false);
      }, 150);
      prevRef.current = value;
    }
  }, [value]);

  return (
    <span className={`number-slide-container ${className}`}>
      <span className={animating ? 'number-slide-exit' : 'number-slide-enter'} key={display}>
        {display}
      </span>
    </span>
  );
}

/* ─── Avatar ─── */
export function Avatar({ src, name, size = 'md', onClick }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-20 h-20' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-xl', xl: 'text-2xl' };

  return (
    <div className="relative inline-block">
      <div
        onClick={onClick}
        className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center cursor-pointer ring-2 ring-dark-border hover:ring-brand-primary transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.2)]`}
      >
      {src ? (
        <img src={src} alt={name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className={`${textSizes[size]} font-bold text-white`}>
          {(name || '?')[0].toUpperCase()}
        </span>
      )}
      </div>
      
      {/* Online presence indicator */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-success rounded-full border-2 border-dark-bg shadow-[0_0_8px_rgba(57,255,20,0.8)] animate-pulse-live" />
    </div>
  );
}

/* ─── Loading Spinner ─── */
export function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-2 border-dark-border border-t-brand-primary rounded-full animate-spin" />
    </div>
  );
}

/* ─── Skeleton Loader ─── */
export function PostSkeleton() {
  return (
    <div className="p-4 border-b border-dark-border">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded animate-shimmer" />
          <div className="h-3 w-full rounded animate-shimmer" />
          <div className="h-3 w-3/4 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
export function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {Icon && <Icon className="w-12 h-12 text-dark-muted mb-4" strokeWidth={1.5} />}
      <h3 className="text-xl font-bold text-dark-text mb-2">{title}</h3>
      {subtitle && <p className="text-dark-muted text-sm mb-4 max-w-xs">{subtitle}</p>}
      {action && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-full hover:bg-brand-primary/90 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ─── Toast Notification ─── */
export function Toast({ notification, users }) {
  const sender = users.find(u => u.id === notification?.senderId);
  if (!notification || !sender) return null;

  const typeText = {
    like: 'liked your post',
    comment: 'commented on your post',
    repost: 'reposted your post',
    follow: 'followed you'
  };

  return (
    <div className="fixed top-4 left-1/2 z-50 animate-toast-in">
      <div className="bg-dark-elevated border border-dark-border rounded-2xl px-4 py-3 shadow-2xl shadow-brand-primary/10 flex items-center gap-3 min-w-[280px]">
        <Avatar src={sender.avatarUrl} name={sender.displayName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-dark-text truncate">
            <span className="font-bold">{sender.displayName}</span>{' '}
            <span className="text-dark-muted">{typeText[notification.type]}</span>
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse-live" />
      </div>
    </div>
  );
}

/* ─── New User Joined Toast ─── */
export function NewUserToast({ user }) {
  if (!user) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 animate-toast-in">
      <div className="bg-dark-elevated border border-brand-success/40 rounded-2xl px-4 py-3 shadow-2xl shadow-brand-success/15 flex items-center gap-3 min-w-[300px]">
        <div className="w-9 h-9 rounded-full bg-brand-success/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎉</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-brand-success mb-0.5">New user joined!</p>
          <p className="text-sm text-dark-text font-bold truncate">
            {user.displayName || 'Someone new'}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse-live" />
      </div>
    </div>
  );
}

/* ─── Image Lightbox ─── */
export function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    document.body.classList.add('modal-open');
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <img
        src={src}
        alt={alt || 'Image'}
        className="relative max-w-[95vw] max-h-[90vh] object-contain rounded-lg animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] p-2.5 bg-dark-bg/60 backdrop-blur rounded-full text-white hover:bg-dark-bg/90 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ─── Follow Button (reusable) ─── */
export function FollowButton({ isFollowing, onClick, size = 'md' }) {
  const [hoverUnfollow, setHoverUnfollow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClick();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const sizeClasses = size === 'sm'
    ? 'px-4 py-1.5 text-xs'
    : 'px-5 py-1.5 text-sm';

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => isFollowing && setHoverUnfollow(true)}
      onMouseLeave={() => setHoverUnfollow(false)}
      disabled={loading}
      className={`${sizeClasses} font-bold rounded-full transition-all disabled:opacity-60 ${
        isFollowing
          ? hoverUnfollow
            ? 'border border-red-500/60 text-red-500 bg-red-500/10'
            : 'border border-dark-border text-dark-text'
          : 'bg-white text-black hover:bg-gray-200'
      }`}
    >
      {loading ? '...' : isFollowing ? (hoverUnfollow ? 'Unfollow' : 'Following') : 'Follow'}
    </button>
  );
}

/* ─── Rich Text Renderer ─── */
export function RichText({ parts, className = '' }) {
  return (
    <p className={className}>
      {parts.map((part, i) =>
        part.type === 'link' ? (
          <a
            key={i}
            href={part.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part.content.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}
            {part.content.replace(/^https?:\/\/(www\.)?/, '').length > 40 ? '…' : ''}
          </a>
        ) : part.type === 'game-tag' ? (
          <span 
            key={i} 
            className="inline-flex items-center px-2 py-0.5 rounded border border-brand-primary/50 bg-brand-primary/10 text-brand-primary text-xs font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)] cursor-pointer hover:bg-brand-primary/20 mx-0.5"
            onClick={(e) => { e.stopPropagation(); /* Optional: handle tag click */ }}
          >
            {part.content}
          </span>
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
    </p>
  );
}
