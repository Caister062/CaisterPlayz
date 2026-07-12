import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { JourneyEntry, MatchBeacon, Challenge } from '../../lib/types';
import TimelineEntryCard from '../../components/TimelineEntry';
import { Compass as ICompass, Plus as IPlus, SlidersHorizontal as ISlidersHorizontal } from 'lucide-react-native';
const Compass = ICompass as any;
const Plus = IPlus as any;
const SlidersHorizontal = ISlidersHorizontal as any;

export default function DiscoverScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState<JourneyEntry[]>([]);
  const [beacons, setBeacons] = useState<MatchBeacon[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  
  // Filters
  const [activeFilter, setActiveFilter] = useState<'all' | 'achievement' | 'milestone' | 'media'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch user blocks to filter them out
      const { data: blocksData } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id);
      
      const blockedIds = blocksData?.map(b => b.blocked_id) || [];
      setBlockedUserIds(blockedIds);

      // 2. Fetch Journey Entries
      let journeyQuery = supabase
        .from('journey_entries')
        .select('*, profiles(*), games(*)')
        .eq('visibility', 'public')
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (activeFilter === 'achievement') {
        journeyQuery = journeyQuery.eq('entry_type', 'achievement');
      } else if (activeFilter === 'milestone') {
        journeyQuery = journeyQuery.eq('entry_type', 'rank_milestone');
      } else if (activeFilter === 'media') {
        journeyQuery = journeyQuery.eq('entry_type', 'screenshot_memory');
      }

      const { data: journeysData } = await journeyQuery;
      
      // Filter out blocked users' posts
      const filteredJourneys = (journeysData as JourneyEntry[] || []).filter(
        item => !blockedIds.includes(item.user_id)
      );
      setJourneys(filteredJourneys);

      // 3. Fetch Beacons
      const { data: beaconsData } = await supabase
        .from('match_beacons')
        .select('*, profiles(*), games(*)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      const filteredBeacons = (beaconsData as MatchBeacon[] || []).filter(
        item => !blockedIds.includes(item.creator_id)
      );
      setBeacons(filteredBeacons.slice(0, 4));

      // 4. Fetch Challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*, games(*)')
        .order('created_at', { ascending: false });
      setChallenges(challengesData as Challenge[] || []);

    } catch {
      // Fail silently in development
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating Plus button to post a journey entry */}
      <TouchableOpacity 
        style={styles.floatingBtn}
        onPress={() => router.push('/journey/create')}
      >
        <Plus color="#050814" size={24} />
      </TouchableOpacity>

      <FlatList
        data={journeys}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TimelineEntryCard 
            entry={item} 
            currentUserBlockedList={blockedUserIds} 
            onRefresh={fetchData}
          />
        )}
        ListHeaderComponent={
          <View style={{ paddingBottom: THEME.spacing.md }}>
            {/* Active Beacons Horiz list */}
            {beacons.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Active Match Beacons</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
                  {beacons.map((beacon) => (
                    <TouchableOpacity
                      key={beacon.id}
                      style={styles.beaconCard}
                      onPress={() => router.push(`/beacons/${beacon.id}`)}
                    >
                      <Text style={styles.beaconTitle}>{beacon.games?.title || 'Game Session'}</Text>
                      <Text style={styles.beaconDesc} numberOfLines={1}>{beacon.description || 'LFG Now'}</Text>
                      <View style={styles.beaconMeta}>
                        <Text style={styles.beaconMetaText}>{beacon.platform || 'Crossplay'}</Text>
                        <Text style={styles.beaconMetaText}>• {beacon.region || 'Any'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Active Challenges list */}
            {challenges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Featured Challenges</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
                  {challenges.map((challenge) => (
                    <TouchableOpacity
                      key={challenge.id}
                      style={styles.challengeCard}
                      onPress={() => router.push(`/(tabs)/challenges`)}
                    >
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <View style={styles.xpRewardBadge}>
                        <Text style={styles.xpRewardText}>+{challenge.xp_reward} XP</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Timeline header & Filters */}
            <View style={styles.timelineHeader}>
              <Text style={styles.sectionHeader}>Gaming Journeys</Text>
              <View style={styles.filterRow}>
                {(['all', 'achievement', 'milestone', 'media'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterBadge, activeFilter === filter && styles.filterBadgeActive]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                      {filter.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.scrollContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Compass size={40} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to publish a new Gaming Journey entry!</Text>
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
  scrollContainer: {
    padding: THEME.spacing.md,
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  horizScroll: {
    paddingRight: THEME.spacing.md,
  },
  beaconCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginRight: THEME.spacing.sm,
    width: 180,
  },
  beaconTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  beaconDesc: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  beaconMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconMetaText: {
    color: THEME.colors.primary,
    fontSize: 10,
    marginRight: 4,
  },
  challengeCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginRight: THEME.spacing.sm,
    width: 200,
    justifyContent: 'space-between',
    height: 100,
  },
  challengeTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  xpRewardBadge: {
    backgroundColor: THEME.colors.secondary,
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 8,
  },
  xpRewardText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineHeader: {
    marginTop: THEME.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: THEME.spacing.xs,
  },
  filterBadge: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    marginRight: 6,
  },
  filterBadgeActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#050814',
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
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: THEME.spacing.xl,
  },
});
