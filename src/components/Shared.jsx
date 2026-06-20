import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { formatCount } from '../utils';

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
      <span
        className={animating ? 'number-slide-exit' : 'number-slide-enter'}
        key={display}
      >
        {display}
      </span>
    </span>
  );
}

export function Avatar({ src, name, size = 'md', onClick }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={onClick}
        className={`${sizes[size]} rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center cursor-pointer ring-2 ring-brand-primary/20 hover:ring-brand-primary transition-all duration-200 shadow-sm`}
      >
        {src ? (
          <img
            src={src}
            alt={name || 'signal core'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`${textSizes[size]} font-black text-white`}>
            {(name || '?')[0].toUpperCase()}
          </span>
        )}
      </div>

      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-success rounded-full border-2 border-dark-bg shadow-sm animate-pulse-live" />
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-2 border-dark-border border-t-brand-primary rounded-full animate-spin" />
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="p-4 border-b border-dark-border">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-2xl animate-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded animate-shimmer" />
          <div className="h-3 w-full rounded animate-shimmer" />
          <div className="h-3 w-3/4 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {Icon && (
        <Icon
          className="w-12 h-12 text-dark-muted mb-4"
          strokeWidth={1.5}
        />
      )}

      <h3 className="text-xl font-bold text-dark-text mb-2">
        {title}
      </h3>

      {subtitle && (
        <p className="text-dark-muted text-sm mb-4 max-w-xs">
          {subtitle}
        </p>
      )}

      {action && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function Toast({ notification, users }) {
  const sender = users.find(u => u.id === notification?.senderId);

  if (!notification || !sender) return null;

  const typeText = {
    like: 'boosted your signal',
    comment: 'sent an echo',
    repost: 'relayed your broadcast',
    follow: 'connected to your core'
  };

  return (
    <div className="fixed top-4 left-1/2 z-50 animate-toast-in">
      <div className="bg-dark-elevated border border-dark-border rounded-2xl px-4 py-3 shadow-2xl shadow-brand-primary/10 flex items-center gap-3 min-w-[280px]">
        <Avatar
          src={sender.avatarUrl}
          name={sender.displayName}
          size="sm"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm text-dark-text truncate">
            <span className="font-bold">{sender.displayName}</span>{' '}
            <span className="text-dark-muted">
              {typeText[notification.type] || 'triggered your signal'}
            </span>
          </p>
        </div>

        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse-live" />
      </div>
    </div>
  );
}

export function NewUserToast({ user }) {
  if (!user) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 animate-toast-in">
      <div className="bg-dark-elevated border border-brand-success/40 rounded-2xl px-4 py-3 shadow-2xl shadow-brand-success/15 flex items-center gap-3 min-w-[300px]">
        <div className="w-9 h-9 rounded-2xl bg-brand-success/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">📡</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-brand-success mb-0.5">
            New core detected
          </p>

          <p className="text-sm text-dark-text font-bold truncate">
            {user.displayName || 'Someone new'}
          </p>
        </div>

        <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse-live" />
      </div>
    </div>
  );
}

export function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    document.body.classList.add('modal-open');

    const handler = e => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-modal-overlay"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <img
        src={src}
        alt={alt || 'Signal visual'}
        className="relative max-w-[95vw] max-h-[90vh] object-contain rounded-lg animate-modal-enter"
        onClick={e => e.stopPropagation()}
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

export function FollowButton({ isFollowing, onClick, size = 'md' }) {
  const [hoverDisconnect, setHoverDisconnect] = useState(false);
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

  const sizeClasses =
    size === 'sm'
      ? 'px-4 py-1.5 text-xs'
      : 'px-5 py-1.5 text-sm';

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => isFollowing && setHoverDisconnect(true)}
      onMouseLeave={() => setHoverDisconnect(false)}
      disabled={loading}
      className={`${sizeClasses} font-bold rounded-2xl transition-all disabled:opacity-60 ${
        isFollowing
          ? hoverDisconnect
            ? 'border border-red-500/60 text-red-500 bg-red-500/10'
            : 'border border-brand-primary/40 text-brand-primary bg-brand-primary/10'
          : 'bg-brand-primary text-white hover:bg-brand-primary/90'
      }`}
    >
      {loading
        ? '...'
        : isFollowing
          ? hoverDisconnect
            ? 'Disconnect'
            : 'Connected'
          : 'Connect'}
    </button>
  );
}

export function RichText({
  parts,
  onHashtagClick,
  onMentionClick,
  users,
  className = ''
}) {
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
            onClick={e => e.stopPropagation()}
          >
            {part.content.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}
            {part.content.replace(/^https?:\/\/(www\.)?/, '').length > 40
              ? '…'
              : ''}
          </a>
        ) : part.type === 'game-tag' ? (
          <span
            key={i}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-brand-primary/20 bg-brand-primary/10 text-brand-primary text-xs font-semibold cursor-pointer hover:bg-brand-primary/25 mx-0.5 transition-colors"
            onClick={e => {
              e.stopPropagation();

              if (onHashtagClick) {
                onHashtagClick(part.content);
              }
            }}
          >
            {part.content}
          </span>
        ) : part.type === 'mention' ? (
          <span
            key={i}
            className="text-brand-primary font-bold hover:underline cursor-pointer"
            onClick={e => {
              e.stopPropagation();

              if (onMentionClick && users) {
                const cleanName = part.content.slice(1).toLowerCase();

                const found = users.find(
                  u =>
                    u.displayName?.toLowerCase().replace(/\s+/g, '') === cleanName ||
                    u.displayName?.toLowerCase() === cleanName
                );

                if (found) {
                  onMentionClick(found.id);
                }
              }
            }}
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
