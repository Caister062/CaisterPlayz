import { useState } from 'react';
import {
  Heart,
  Repeat2,
  MessageCircle,
  UserPlus,
  Bell
} from 'lucide-react';

import { Avatar, EmptyState } from './Shared';
import { markNotificationRead } from '../hooks';
import { formatTime } from '../utils';

const typeConfig = {
  like: {
    icon: Heart,
    color: 'text-red-500',
    text: 'liked your post'
  },
  comment: {
    icon: MessageCircle,
    color: 'text-brand-primary',
    text: 'commented on your post'
  },
  repost: {
    icon: Repeat2,
    color: 'text-brand-success',
    text: 'reposted your post'
  },
  follow: {
    icon: UserPlus,
    color: 'text-brand-secondary',
    text: 'followed you'
  }
};

export default function NotificationsTab({
  notifications = [],
  users = [],
  onProfileClick
}) {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined'
      ? window.Notification?.permission
      : 'default'
  );

  const requestPush = async () => {
    if (!window.Notification) {
      alert('Notifications not supported on this browser.');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif.id);
      } catch (err) {
        console.error(err);
      }
    }

    if (notif.senderId) {
      onProfileClick?.(notif.senderId);
    }
  };

  const enrichedNotifications = notifications.map(n => {
    const sender = users.find(u => u.id === n.senderId);

    return {
      ...n,
      sender
    };
  });

  return (
    <div className="pb-6">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-dark-border sticky top-[53px] z-30 bg-dark-bg/80 backdrop-blur-xl flex justify-between items-center">

        <h2 className="font-bold text-xl text-dark-text">
          Notifications
        </h2>

        {permission === 'default' && (
          <button
            onClick={requestPush}
            className="text-xs bg-brand-primary text-white px-3 py-1.5 rounded-full font-bold hover:opacity-90 transition"
          >
            Enable Push
          </button>
        )}

      </div>

      {/* EMPTY STATE */}
      {enrichedNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          subtitle="Interactions from your community will show here."
        />
      ) : (
        <div className="divide-y divide-dark-border">

          {enrichedNotifications.map(notif => {
            const sender = notif.sender;
            if (!sender) return null;

            const config =
              typeConfig[notif.type] || typeConfig.like;

            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-dark-hover/40 ${
                  !notif.read ? 'bg-brand-primary/5' : ''
                }`}
              >

                {/* ICON */}
                <div className="mt-1">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2">
                    <Avatar
                      src={sender.avatarUrl}
                      name={sender.displayName}
                      size="sm"
                    />
                  </div>

                  <p className="text-sm text-dark-text mt-1">
                    <span className="font-bold">
                      {sender.displayName}
                    </span>{' '}
                    <span className="text-dark-muted">
                      {config.text}
                    </span>
                  </p>

                  <p className="text-xs text-dark-muted mt-1">
                    {formatTime(notif.created)}
                  </p>

                </div>

                {/* UNREAD DOT */}
                {!notif.read && (
                  <div className="w-2 h-2 bg-brand-primary rounded-full mt-2" />
                )}

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}
