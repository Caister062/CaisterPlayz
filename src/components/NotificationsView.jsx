import { useEffect } from 'react';
import { markAllNotificationsRead } from '../hooks';
import { timeAgo } from './PostCard';
import { Trophy, Target, Flame, Zap, Bell, MessageSquare, BellOff } from 'lucide-react';

const ICONS = {
  like: <Flame size={16} color="#00f0ff" />,
  comment: <MessageSquare size={16} color="#7c3aed" />,
  repost: <Trophy size={16} color="#ffd700" />,
  announcement: <Bell size={16} color="#10b981" />
};

const MSGS = {
  like: 'liked your Victory Royale clip!',
  comment: 'commented on your post!',
  repost: 'shared your Fortnite highlight!',
};

export default function NotificationsView({
  notifications = [],
  users = [],
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

  // Show only real user notifications received from the PocketBase database
  const realNotifications = notifications.filter(n => n.type !== 'follow');

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            FORTNITE ALERTS & NOTIFICATIONS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0 0' }}>
            Real-time player notifications and interactions.
          </p>
        </div>
      </div>

      {realNotifications.length === 0 ? (
        <div style={{
          background: '#0f172a',
          border: '1px border #1e293b',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <BellOff size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
            No Notifications Yet
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Interactions from actual players will appear here when they like or comment on your clips.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {realNotifications.map(n => {
            const sender = users.find(u => u.id === n.senderId);
            const senderName = sender?.displayName || 'Fortnite Gamer';
            const icon = ICONS[n.type] || <Bell size={16} color="#00f0ff" />;
            const msgText = MSGS[n.type] || 'interacted with your post.';

            return (
              <div
                key={n.id}
                style={{
                  background: n.read ? '#0f172a' : '#1e1b4b',
                  border: `1px solid ${n.read ? '#1e293b' : '#7c3aed66'}`,
                  borderRadius: 14,
                  padding: 16,
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ background: '#020617', padding: 10, borderRadius: 12, border: '1px solid #334155' }}>
                  {icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#e2e8f0' }}>
                    <strong style={{ color: '#fff', fontWeight: 900 }}>@{senderName}</strong>{' '}
                    {msgText}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>
                    {timeAgo(n.created)}
                  </div>
                </div>

                {!n.read && <div style={{ width: 8, height: 8, background: '#00f0ff', borderRadius: '50%', boxShadow: '0 0 8px #00f0ff' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
