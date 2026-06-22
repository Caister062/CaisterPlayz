import { useEffect } from 'react';
import { markAllNotificationsRead } from '../hooks';
import { Hex, timeAgo } from './PostCard';

const ICONS = {
  like: { e: '⚡', c: 'boost' },
  comment: { e: '💬', c: 'reply' },
  repost: { e: '📡', c: 'echo' },
  follow: { e: '🔗', c: 'ally' }
};

const MSGS = {
  like: 'boosted your signal',
  comment: 'sent an echo',
  repost: 'relayed your broadcast',
  follow: 'connected to your core'
};

export default function NotificationsView({
  notifications,
  users,
  currentUserId,
  onRefresh,
  onProfileClick
}) {
  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      markAllNotificationsRead(currentUserId)
        .then(() => onRefresh?.())
        .catch(() => {});
    }
  }, []);

  if (notifications.length === 0) {
    return (
      <div className="empty">
        <div className="empty-ico">📡</div>
        <h3>No echo alerts yet</h3>
        <p>Boosts, echoes, relays, and core connections appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sec">
        <span className="sec-label">Echo Alerts</span>
      </div>

      {notifications.map(n => {
        const s = users.find(u => u.id === n.senderId);
        const { e, c } = ICONS[n.type] || { e: '📡', c: 'boost' };

        return (
          <div
            key={n.id}
            className={`notif${n.read ? '' : ' fresh'}`}
            onClick={() => s && onProfileClick?.(s.id)}
          >
            <div className={`notif-icon ${c}`}>
              {e}
            </div>

            <Hex
              src={s?.avatarUrl}
              name={s?.displayName || '?'}
              size="sm"
            />

            <div className="notif-body">
              <div className="notif-msg">
                <strong>{s?.displayName || 'Someone'}</strong>{' '}
                {MSGS[n.type] || 'triggered your signal'}
              </div>

              <div className="notif-ts">
                Signal ping · {timeAgo(n.created)}
              </div>
            </div>

            {!n.read && <div className="notif-pip" />}
          </div>
        );
      })}
    </div>
  );
}
