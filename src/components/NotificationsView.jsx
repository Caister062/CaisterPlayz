import { useEffect } from 'react';
import { markAllNotificationsRead } from '../hooks';
import { Avatar, timeAgo } from './PostCard';

const ICONS = {
  like:    { emoji: '❤️', cls: 'like' },
  comment: { emoji: '💬', cls: 'comment' },
  repost:  { emoji: '🔁', cls: 'repost' },
  follow:  { emoji: '👤', cls: 'follow' },
};
const LABELS = {
  like:    'liked your post',
  comment: 'commented on your post',
  repost:  'reposted your post',
  follow:  'started following you',
};

export default function NotificationsView({ notifications, users, currentUserId, onRefresh, onProfileClick }) {
  // Mark all read on mount
  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      markAllNotificationsRead(currentUserId).then(() => onRefresh?.()).catch(() => {});
    }
  }, []); // run once on mount

  if (notifications.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🔔</div>
        <h3>No notifications yet</h3>
        <p>When someone likes, comments, or follows you, it shows up here.</p>
      </div>
    );
  }

  return (
    <div>
      {notifications.map(n => {
        const sender = users.find(u => u.id === n.senderId);
        const { emoji, cls } = ICONS[n.type] || { emoji: '🔔', cls: 'like' };
        const label = LABELS[n.type] || 'interacted with you';
        return (
          <div key={n.id} className={`notif-row${n.read ? '' : ' unread'}`} onClick={() => sender && onProfileClick?.(sender.id)}>
            <div className={`notif-emoji ${cls}`}>{emoji}</div>
            <Avatar src={sender?.avatarUrl} name={sender?.displayName || '?'} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="notif-text">
                <strong>{sender?.displayName || 'Someone'}</strong> {label}
              </div>
              <div className="notif-time">{timeAgo(n.created)}</div>
            </div>
            {!n.read && <div className="unread-pip" />}
          </div>
        );
      })}
    </div>
  );
}
