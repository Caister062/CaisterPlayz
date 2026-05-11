import { useState } from 'react';
import { Heart, Repeat2, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { Avatar, EmptyState } from './Shared';
import { markNotificationRead } from '../hooks';
import { formatTime } from '../utils';

const typeConfig = {
  like: { icon: Heart, color: 'text-red-500', fill: 'fill-red-500', text: 'liked your post' },
  comment: { icon: MessageCircle, color: 'text-brand-primary', fill: '', text: 'commented on your post' },
  repost: { icon: Repeat2, color: 'text-brand-success', fill: '', text: 'reposted your post' },
  follow: { icon: UserPlus, color: 'text-brand-secondary', fill: '', text: 'followed you' },
};

export default function NotificationsTab({ notifications, users, onProfileClick }) {
  const [permission, setPermission] = useState(window.Notification?.permission || 'default');

  const requestPush = async () => {
    if (!window.Notification) return alert('Push notifications are not supported on this device/browser yet.');
    const p = await Notification.requestPermission();
    setPermission(p);
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif.id);
      } catch (err) { console.error(err); }
    }
    if (notif.senderId) onProfileClick(notif.senderId);
  };

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border sticky top-[53px] z-30 bg-dark-bg/80 backdrop-blur-xl flex justify-between items-center">
        <h2 className="font-bold text-xl text-dark-text">Notifications</h2>
        {permission === 'default' && (
          <button onClick={requestPush} className="text-xs bg-brand-primary hover:bg-brand-primary/90 text-white px-3 py-1.5 rounded-full font-bold transition-colors">
            Enable Push
          </button>
        )}
      </div>

      {/* Notifications list or empty state */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          subtitle="When someone interacts with your posts, you'll see it here."
        />
      ) : (
        notifications.map(notif => {
          const sender = users.find(u => u.id === notif.senderId);
          if (!sender) return null;
          const config = typeConfig[notif.type] || typeConfig.like;
          const Icon = config.icon;

          return (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`flex gap-3 px-4 py-3 border-b border-dark-border cursor-pointer transition-colors hover:bg-dark-hover/50 animate-fade-slide ${
                !notif.read ? 'bg-brand-primary/5' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                <Icon className={`w-5 h-5 ${config.color} ${config.fill}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar src={sender.avatarUrl} name={sender.displayName} size="sm" />
                </div>
                <p className="text-sm text-dark-text">
                  <span className="font-bold">{sender.displayName}</span>{' '}
                  <span className="text-dark-muted">{config.text}</span>
                </p>
                <p className="text-xs text-dark-muted mt-1">{formatTime(notif.created)}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-2" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
