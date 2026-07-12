import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Notification } from '../../lib/types';
import { Bell as IBell, Check as ICheck, Trash2 as ITrash2, Heart as IHeart, MessageSquare as IMessageSquare, ShieldAlert as IShieldAlert } from 'lucide-react-native';
const Bell = IBell as any;
const Check = ICheck as any;
const Trash2 = ITrash2 as any;
const Heart = IHeart as any;
const MessageSquare = IMessageSquare as any;
const ShieldAlert = IShieldAlert as any;

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setNotifications(data as Notification[] || []);

    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      Alert.alert('Success', 'All notifications marked as read.');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  const getNotificationIcon = (type: string) => {
    if (type.includes('reaction')) return <Heart size={16} color={THEME.colors.danger} />;
    if (type.includes('comment')) return <MessageSquare size={16} color={THEME.colors.primary} />;
    return <Bell size={16} color={THEME.colors.secondary} />;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Check size={16} color={THEME.colors.primary} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={40} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No new gaming journey notifications or invites.</Text>
        </View>
      ) : (
        notifications.map((notif) => (
          <View 
            key={notif.id} 
            style={[styles.notifCard, !notif.is_read && styles.notifUnread]}
          >
            <View style={styles.iconContainer}>
              {getNotificationIcon(notif.type)}
            </View>
            
            <View style={{ flex: 1, marginLeft: THEME.spacing.sm }}>
              <Text style={styles.messageText}>{notif.message}</Text>
              <Text style={styles.timeText}>
                {new Date(notif.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.actions}>
              {!notif.is_read && (
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleMarkAsRead(notif.id)}
                >
                  <Check size={14} color={THEME.colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => handleDeleteNotification(notif.id)}
              >
                <Trash2 size={14} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: THEME.spacing.md,
  },
  emptySubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  notifCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifUnread: {
    borderColor: THEME.colors.primary,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
  },
  timeText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: THEME.spacing.sm,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
