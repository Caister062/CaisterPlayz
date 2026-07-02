import { useEffect } from 'react';
import { markAllNotificationsRead } from '../hooks';
import { timeAgo } from './PostCard';
import { Trophy, Target, Flame, Zap, CheckCircle, Bell } from 'lucide-react';

const ICONS = {
  like: <Flame size={16} color="var(--hot)" />,
  comment: <Zap size={16} color="var(--cyan)" />,
  repost: <Trophy size={16} color="#f59e0b" />,
  announcement: <Bell size={16} color="#10b981" />
};

const MSGS = {
  like: 'cheered your workout!',
  comment: 'dropped a tip on your workout log',
  repost: 'highlighted your fitness milestone',
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

  // Filter out social-only notifications like "follow"
  const fitnessNotifs = notifications.filter(n => n.type !== 'follow');

  if (fitnessNotifs.length === 0) {
    return (
      <div className="page-container" style={{ padding: '24px 16px' }}>
        <div style={{ padding: 40, background: 'var(--surface)', borderRadius: 16, textAlign: 'center', border: '1px solid var(--border)' }}>
          <Target size={32} color="var(--text2)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'var(--text1)', marginBottom: 8, fontSize: 18, fontWeight: 800 }}>No Alerts Yet</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>XP gains, level ups, and workout cheers will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '24px 16px', paddingBottom: 100 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>
        Fitness Alerts
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Synthetic "Daily Quest" notification for flavor */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--cyan)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: 10, borderRadius: '50%' }}>
            <Target size={18} color="var(--cyan)" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Daily Quest Available!</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Log today's workout to maintain your streak and earn +100 XP.</div>
          </div>
        </div>

        {fitnessNotifs.map(n => {
          const s = users.find(u => u.id === n.senderId);
          const icon = ICONS[n.type] || <Bell size={16} color="var(--text2)" />;

          return (
            <div
              key={n.id}
              style={{
                background: n.read ? 'var(--bg)' : 'var(--surface)',
                border: `1px solid ${n.read ? 'var(--bg2)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <div style={{ background: 'var(--bg2)', padding: 10, borderRadius: '50%' }}>
                {icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text1)' }}>
                  <strong style={{ color: '#fff', fontWeight: 800 }}>{n.type === 'announcement' ? 'HQ' : (s?.displayName || 'A player')}</strong>{' '}
                  {n.type === 'announcement' ? <span style={{ color: 'var(--cyan)' }}>broadcasted an event</span> : (MSGS[n.type] || 'interacted with your log')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>
                  {timeAgo(n.created)}
                </div>
              </div>

              {!n.read && <div style={{ width: 8, height: 8, background: 'var(--hot)', borderRadius: '50%' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
