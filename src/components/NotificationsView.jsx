import { useEffect } from 'react';
import { markAllNotificationsRead } from '../hooks';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

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

export default function NotificationsView({ notifications, users, currentUserId, onRefresh }) {
  // Mark all as read when view opens
  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      markAllNotificationsRead(currentUserId).then(onRefresh).catch(() => {});
    }
  }, []);

  if (notifications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔔</div>
        <h3>No notifications yet</h3>
        <p>When people like, comment, or follow you, you'll see it here.</p>
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
          <div key={n.id} className={`notif-item${n.read ? '' : ' unread'}`}>
            <div className={`notif-icon ${cls}`}>{emoji}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              {/* Sender avatar */}
              <div className="avatar sm" style={{ flexShrink: 0 }}>
                {sender?.avatarUrl
                  ? <img src={sender.avatarUrl} alt={sender.displayName} />
                  : (sender?.displayName || '?')[0].toUpperCase()
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="notif-text">
                  <strong>{sender?.displayName || 'Someone'}</strong> {label}
                </div>
                <div className="notif-time">{formatTime(n.created)}</div>
              </div>
            </div>

            {!n.read && <div className="unread-dot" />}
          </div>
        );
      })}
    </div>
  );
}
