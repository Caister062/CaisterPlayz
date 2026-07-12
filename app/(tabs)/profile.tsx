import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Profile, JourneyEntry, UserBadge } from '../../lib/types';
import TimelineEntryCard from '../../components/TimelineEntry';
import { Settings as ISettings, Shield as IShield, Award as IAward, Calendar as ICalendar, MapPin as IMapPin, Gamepad as IGamepad } from 'lucide-react-native';
const Settings = ISettings as any;
const Shield = IShield as any;
const Award = IAward as any;
const Calendar = ICalendar as any;
const MapPin = IMapPin as any;
const Gamepad = IGamepad as any;

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [timeline, setTimeline] = useState<JourneyEntry[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isModerator, setIsModerator] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
        
        // Mock check for moderator capabilities using server metadata or a basic check
        if (user.email?.includes('admin') || user.email?.includes('mod')) {
          setIsModerator(true);
        }
      }

      // 2. Fetch Journey entries
      const { data: journeyData } = await supabase
        .from('journey_entries')
        .select('*, profiles(*), games(*)')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      setTimeline(journeyData as JourneyEntry[] || []);

      // 3. Fetch Badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id);
      setBadges(badgesData as UserBadge[] || []);

    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  // Next level threshold mock
  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  const prevLevelXP = Math.pow(currentLevel - 1, 2) * 100;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100)
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={timeline}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TimelineEntryCard entry={item} onRefresh={fetchProfileData} />
        )}
        ListHeaderComponent={
          <View style={{ paddingBottom: THEME.spacing.md }}>
            {/* Banner block */}
            <View style={styles.bannerBlock}>
              <View style={styles.headerButtons}>
                {isModerator && (
                  <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => router.push('/moderator/index')}
                  >
                    <Shield size={20} color={THEME.colors.warning} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.headerBtn}
                  onPress={() => router.push('/settings/index')}
                >
                  <Settings size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Avatar & Metadata */}
            <View style={styles.profileDetails}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {profile?.display_name?.charAt(0).toUpperCase() || 'G'}
                </Text>
              </View>

              <Text style={styles.displayName}>{profile?.display_name}</Text>
              <Text style={styles.username}>@{profile?.username}</Text>

              {profile?.bio && <Text style={styles.bioText}>{profile.bio}</Text>}

              {/* Badges row */}
              {badges.length > 0 && (
                <View style={styles.badgesRow}>
                  {badges.map((b) => (
                    <View key={b.badge_id} style={styles.badgeItem}>
                      <Award size={14} color={THEME.colors.primary} />
                      <Text style={styles.badgeText}>{b.badges?.name || 'Badge'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Stats Modules */}
              <View style={styles.statsCard}>
                <View style={styles.statsCol}>
                  <Text style={styles.statsVal}>{timeline.length}</Text>
                  <Text style={styles.statsLabel}>Journeys</Text>
                </View>
                <View style={styles.statsCol}>
                  <Text style={styles.statsVal}>{profile?.xp || 0}</Text>
                  <Text style={styles.statsLabel}>XP Points</Text>
                </View>
                <View style={styles.statsCol}>
                  <Text style={styles.statsVal}>Lvl {profile?.level || 1}</Text>
                  <Text style={styles.statsLabel}>Gamer Level</Text>
                </View>
              </View>

              {/* Progress Slider */}
              <View style={styles.progressBlock}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressLabel}>Level {currentLevel} Progress</Text>
                  <Text style={styles.progressVal}>{currentXP} / {nextLevelXP} XP</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>

              {/* Play style tag items */}
              <View style={styles.metadataTags}>
                <View style={styles.metaTag}>
                  <MapPin size={12} color={THEME.colors.primary} />
                  <Text style={styles.metaTagText}>{profile?.region || 'Global'}</Text>
                </View>
                <View style={styles.metaTag}>
                  <Gamepad size={12} color={THEME.colors.primary} />
                  <Text style={styles.metaTagText}>{profile?.play_style || 'Casual'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.timelineSectionTitle}>My Journey Timeline</Text>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          <View style={styles.emptyTimeline}>
            <Calendar size={36} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>Your timeline is empty</Text>
            <Text style={styles.emptyDesc}>Start posting accomplishments, Milestones, and Memories to build your timeline!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xl,
  },
  bannerBlock: {
    height: 120,
    backgroundColor: THEME.colors.surfaceLighter,
    position: 'relative',
  },
  headerButtons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(5, 8, 20, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileDetails: {
    alignItems: 'center',
    marginTop: -50,
    paddingHorizontal: THEME.spacing.md,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.primary,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  avatarInitial: {
    color: THEME.colors.primary,
    fontWeight: '900',
    fontSize: 42,
  },
  displayName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: THEME.spacing.sm,
  },
  username: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  bioText: {
    color: THEME.colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    marginTop: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: THEME.spacing.md,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    margin: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    paddingVertical: THEME.spacing.md,
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: THEME.spacing.sm,
  },
  statsCol: {
    alignItems: 'center',
  },
  statsVal: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  progressBlock: {
    width: '100%',
    marginVertical: THEME.spacing.sm,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressVal: {
    color: THEME.colors.primary,
    fontSize: 11,
  },
  barBg: {
    height: 8,
    backgroundColor: THEME.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  barFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  metadataTags: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: THEME.spacing.sm,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  metaTagText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginLeft: 4,
  },
  timelineSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: THEME.spacing.xl,
  },
  emptyTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: THEME.spacing.sm,
  },
  emptyDesc: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
