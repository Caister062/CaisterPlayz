import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { JourneyEntry } from '../lib/types';
import { THEME } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { MessageSquare as IMessageSquare, Flame as IFlame, Trophy as ITrophy, Award as IAward, Heart as IHeart, HelpCircle as IHelpCircle, AlertTriangle as IAlertTriangle, Pin as IPin } from 'lucide-react-native';
const MessageSquare = IMessageSquare as any;
const Flame = IFlame as any;
const Trophy = ITrophy as any;
const Award = IAward as any;
const Heart = IHeart as any;
const HelpCircle = IHelpCircle as any;
const AlertTriangle = IAlertTriangle as any;
const Pin = IPin as any;

interface TimelineEntryProps {
  entry: JourneyEntry;
  onRefresh?: () => void;
  currentUserBlockedList?: string[];
}

export default function TimelineEntryCard({ entry, onRefresh, currentUserBlockedList = [] }: TimelineEntryProps) {
  const router = useRouter();
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    'GG': 0,
    '🔥': 0,
    '🏆': 0,
    '❤️': 0,
  });
  
  // Skip rendering if owner is blocked
  if (currentUserBlockedList.includes(entry.user_id)) {
    return null;
  }

  const handleReaction = async (emoji: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('journey_reactions').upsert({
        entry_id: entry.id,
        user_id: user.id,
        emoji,
      });

      if (!error) {
        setReactions(prev => ({
          ...prev,
          [emoji]: (prev[emoji] || 0) + 1
        }));
      }
    } catch {
      // Handle silently
    }
  };

  const handleReport = () => {
    Alert.prompt(
      'Report Content',
      'Please state the reason for reporting this entry (spam, harassment, inappropriate media, copyrighted work):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          onPress: async (reason) => {
            if (!reason) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('reports').insert({
              reporter_id: user.id,
              content_type: 'journey_entry',
              content_id: entry.id,
              reported_user_id: entry.user_id,
              reason: reason,
              status: 'pending',
            });

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Report Submitted', 'Thank you. A moderator will review this entry.');
            }
          },
        },
      ]
    );
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy size={16} color={THEME.colors.gold} />;
      case 'challenge_completion':
        return <Award size={16} color={THEME.colors.primary} />;
      case 'completed_game':
        return <Flame size={16} color={THEME.colors.secondary} />;
      default:
        return <Heart size={16} color={THEME.colors.danger} />;
    }
  };

  const formattedType = entry.entry_type.replace('_', ' ').toUpperCase();

  return (
    <View style={styles.cardContainer}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileInfo}
          onPress={() => router.push(`/profile/${entry.user_id}`)}
        >
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {entry.profiles?.display_name?.charAt(0).toUpperCase() || 'G'}
            </Text>
          </View>
          <View style={{ marginLeft: THEME.spacing.sm }}>
            <Text style={styles.displayName}>{entry.profiles?.display_name || 'Gamer'}</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.username}>@{entry.profiles?.username || 'user'}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>LVL {entry.profiles?.level || 1}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {entry.is_pinned && <Pin size={16} color={THEME.colors.primary} style={{ marginRight: 8 }} />}
          <TouchableOpacity onPress={handleReport}>
            <AlertTriangle size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Entry Title & Description */}
      <TouchableOpacity 
        style={styles.body}
        onPress={() => router.push(`/journey/${entry.id}`)}
      >
        <View style={styles.entryTypeRow}>
          {getEntryIcon(entry.entry_type)}
          <Text style={styles.entryTypeText}>{formattedType}</Text>
          {entry.games && (
            <Text style={styles.gameTag}> • {entry.games.title}</Text>
          )}
        </View>

        <Text style={styles.title}>{entry.title}</Text>
        {entry.description && (
          <Text style={styles.description}>{entry.description}</Text>
        )}

        {/* Media simulation card */}
        <View style={styles.mediaCard}>
          <Text style={styles.mediaText}>[ Gaming Screenshot Memory ]</Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Engagement Actions */}
      <View style={styles.footer}>
        <View style={styles.reactionsContainer}>
          {(['GG', '🔥', '🏆', '❤️'] as const).map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionBtn}
              onPress={() => handleReaction(emoji)}
            >
              <Text style={styles.reactionText}>{emoji} {reactions[emoji] || 0}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.commentBtn}
          onPress={() => router.push(`/journey/${entry.id}`)}
        >
          <MessageSquare size={16} color={THEME.colors.textMuted} />
          <Text style={styles.commentCount}>Discuss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surfaceLighter,
    borderColor: THEME.colors.primary,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: THEME.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  displayName: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  username: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  levelBadge: {
    backgroundColor: THEME.colors.secondary,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    marginVertical: THEME.spacing.sm,
  },
  entryTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryTypeText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  gameTag: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  mediaCard: {
    height: 120,
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  mediaText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: THEME.colors.border,
    borderTopWidth: 1,
    paddingTop: THEME.spacing.sm,
    marginTop: THEME.spacing.sm,
  },
  reactionsContainer: {
    flexDirection: 'row',
  },
  reactionBtn: {
    backgroundColor: THEME.colors.surfaceLighter,
    borderRadius: THEME.roundness.sm,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    marginRight: 6,
  },
  reactionText: {
    color: THEME.colors.text,
    fontSize: 11,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
});
