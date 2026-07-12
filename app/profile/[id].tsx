import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Profile, JourneyEntry, UserBadge } from '../../lib/types';
import TimelineEntryCard from '../../components/TimelineEntry';
import { ShieldCheck as IShieldCheck, UserPlus as IUserPlus, UserMinus as IUserMinus, ShieldAlert as IShieldAlert, Award as IAward, Ban as IBan } from 'lucide-react-native';
const ShieldCheck = IShieldCheck as any;
const UserPlus = IUserPlus as any;
const UserMinus = IUserMinus as any;
const ShieldAlert = IShieldAlert as any;
const Award = IAward as any;
const Ban = IBan as any;

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [timeline, setTimeline] = useState<JourneyEntry[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState<'pending' | 'accepted' | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.id === id) {
        // Redirect to my tab if viewing myself
        router.replace('/(tabs)/profile');
        return;
      }

      // Check blocks
      const { data: blockCheck } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', user.id)
        .eq('blocked_id', id)
        .maybeSingle();

      if (blockCheck) {
        setIsBlocked(true);
        setLoading(false);
        return;
      }

      // Fetch follow relationship status
      const { data: followCheck } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .maybeSingle();

      if (followCheck) {
        setIsFollowing(true);
        setFollowStatus(followCheck.status);
      } else {
        setIsFollowing(false);
        setFollowStatus(null);
      }

      // Fetch Profile Details
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profileErr || !profileData) {
        Alert.alert('Profile Not Found', 'This user might have deactivated their account.');
        router.back();
        return;
      }

      setProfile(profileData as Profile);

      // Verify privacy constraint
      const canViewEntries = 
        !profileData.is_private || 
        (followCheck && followCheck.status === 'accepted');

      if (canViewEntries) {
        // Fetch Journey entries
        const { data: journeyData } = await supabase
          .from('journey_entries')
          .select('*, profiles(*), games(*)')
          .eq('user_id', id)
          .eq('visibility', 'public')
          .eq('moderation_status', 'approved')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        setTimeline(journeyData as JourneyEntry[] || []);
      }

      // Fetch Badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', id);
      setBadges(badgesData as UserBadge[] || []);

    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);

        if (!error) {
          setIsFollowing(false);
          setFollowStatus(null);
          Alert.alert('Unfollowed', `You unfollowed @${profile?.username}`);
          fetchProfileData();
        }
      } else {
        // Follow
        const status = profile?.is_private ? 'pending' : 'accepted';
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: id,
            status,
          });

        if (!error) {
          setIsFollowing(true);
          setFollowStatus(status);
          Alert.alert(
            status === 'pending' ? 'Request Sent' : 'Followed',
            status === 'pending'
              ? `Follow request sent to @${profile?.username}`
              : `You are now following @${profile?.username}`
          );
          fetchProfileData();
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block @${profile?.username}? This will hide all mutual content and prevent interactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('blocks').insert({
              blocker_id: user.id,
              blocked_id: id,
            });

            if (!error) {
              Alert.alert('User Blocked', 'You will no longer see content from this user.');
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleReportUser = () => {
    Alert.prompt(
      'Report User',
      'Please explain why you are reporting this account (e.g. harassment, impersonation, hate speech):',
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
              content_type: 'profile',
              content_id: id,
              reported_user_id: id,
              reason: reason,
              status: 'pending',
            });

            if (!error) {
              Alert.alert('Report Submitted', 'Thank you. A moderator will review this profile.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  if (isBlocked) {
    return (
      <View style={styles.blockedContainer}>
        <Ban size={48} color={THEME.colors.danger} />
        <Text style={styles.blockedTitle}>User Blocked</Text>
        <Text style={styles.blockedSubtitle}>You have blocked this profile or are unable to view their timeline.</Text>
      </View>
    );
  }

  const isPrivateAndNotFollowing = profile?.is_private && followStatus !== 'accepted';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.bannerBlock} />

      <View style={styles.profileDetails}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {profile?.display_name?.charAt(0).toUpperCase() || 'G'}
          </Text>
        </View>

        <Text style={styles.displayName}>{profile?.display_name}</Text>
        <Text style={styles.username}>@{profile?.username}</Text>

        {profile?.bio && <Text style={styles.bioText}>{profile.bio}</Text>}

        {/* Level tag */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL {profile?.level || 1} • {profile?.xp || 0} XP</Text>
        </View>

        {/* Action Buttons row */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, isFollowing && styles.actionBtnActive]}
            onPress={handleFollowToggle}
          >
            {isFollowing ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <UserMinus size={16} color={THEME.colors.textMuted} />
                <Text style={styles.actionBtnTextActive}>
                  {followStatus === 'pending' ? 'Requested' : 'Following'}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <UserPlus size={16} color="#050814" />
                <Text style={styles.actionBtnText}>Follow</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={handleBlockUser}>
            <Ban size={16} color={THEME.colors.danger} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={handleReportUser}>
            <ShieldAlert size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Badges */}
        {badges.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.sectionHeader}>Gamer Badges</Text>
            <View style={styles.badgesRow}>
              {badges.map((b) => (
                <View key={b.badge_id} style={styles.badgeItem}>
                  <Award size={14} color={THEME.colors.primary} />
                  <Text style={styles.badgeText}>{b.badges?.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timeline representation */}
        <Text style={styles.sectionHeader}>Timeline Entries</Text>
        
        {isPrivateAndNotFollowing ? (
          <View style={styles.privateCard}>
            <ShieldCheck size={28} color={THEME.colors.textMuted} />
            <Text style={styles.privateTitle}>This profile is private</Text>
            <Text style={styles.privateDesc}>Follow this gamer to see their gaming accomplishments and journey timeline.</Text>
          </View>
        ) : timeline.length === 0 ? (
          <Text style={styles.emptyText}>No public journey achievements posted yet.</Text>
        ) : (
          <View style={{ width: '100%' }}>
            {timeline.map((entry) => (
              <TimelineEntryCard key={entry.id} entry={entry} onRefresh={fetchProfileData} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors.background,
    paddingBottom: THEME.spacing.xl,
  },
  bannerBlock: {
    height: 100,
    backgroundColor: THEME.colors.surfaceLighter,
  },
  profileDetails: {
    alignItems: 'center',
    marginTop: -40,
    paddingHorizontal: THEME.spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.primary,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: THEME.colors.primary,
    fontWeight: 'bold',
    fontSize: 32,
  },
  displayName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: THEME.spacing.sm,
  },
  username: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  bioText: {
    color: THEME.colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    marginVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  levelBadge: {
    backgroundColor: THEME.colors.surfaceLighter,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: THEME.spacing.xs,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  actionBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.md,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  actionBtnActive: {
    backgroundColor: THEME.colors.surfaceLighter,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  actionBtnText: {
    color: '#050814',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  actionBtnTextActive: {
    color: THEME.colors.text,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  badgesSection: {
    width: '100%',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: THEME.spacing.xs,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  privateCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    width: '100%',
    marginVertical: THEME.spacing.md,
  },
  privateTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: THEME.spacing.sm,
  },
  privateDesc: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginVertical: 20,
  },
  blockedContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  blockedTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: THEME.spacing.md,
  },
  blockedSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
