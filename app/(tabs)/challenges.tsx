import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Challenge, JourneyEntry, ChallengeSubmission } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Trophy as ITrophy, Award as IAward, ShieldAlert as IShieldAlert, CheckCircle as ICheckCircle } from 'lucide-react-native';
const Trophy = ITrophy as any;
const Award = IAward as any;
const ShieldAlert = IShieldAlert as any;
const CheckCircle = ICheckCircle as any;

export default function ChallengesScreen() {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [timelineEntries, setTimelineEntries] = useState<JourneyEntry[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<ChallengeSubmission[]>([]);
  const [submittingChallengeId, setSubmittingChallengeId] = useState<string | null>(null);

  const fetchChallengesData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*, games(*)')
        .order('created_at', { ascending: false });
      setChallenges(challengesData as Challenge[] || []);

      // 2. Fetch user's entries (to allow proof submission)
      const { data: journeyData } = await supabase
        .from('journey_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('moderation_status', 'approved');
      setTimelineEntries(journeyData as JourneyEntry[] || []);

      // 3. Fetch existing user submissions
      const { data: submissionsData } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('user_id', user.id);
      setUserSubmissions(submissionsData as ChallengeSubmission[] || []);

    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesData();
  }, []);

  const handleSubmitProof = async (challengeId: string, entryId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentChallenge = challenges.find(c => c.id === challengeId);
      if (!currentChallenge) return;

      // 1. Insert Submission
      const { error: subErr } = await supabase.from('challenge_submissions').insert({
        challenge_id: challengeId,
        user_id: user.id,
        entry_id: entryId,
        status: 'approved', // Auto-approval mock for demo
        xp_awarded: true,
      });

      if (subErr) {
        Alert.alert('Submission Failed', subErr.message);
        return;
      }

      // 2. Credit XP via ledger using database functions
      await supabase.from('xp_ledger').insert({
        user_id: user.id,
        amount: currentChallenge.xp_reward,
        source: 'challenge_completion',
        source_id: challengeId,
        idempotency_key: `challenge_${challengeId}_${user.id}`,
      });

      Alert.alert('Challenge Completed!', `Congratulations! You earned +${currentChallenge.xp_reward} XP!`);
      setSubmittingChallengeId(null);
      fetchChallengesData();

    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading && challenges.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.description}>
        Participate in NEXORA community challenges. Submit a Journey milestone as proof to verify accomplishment and earn cosmetic XP rewards!
      </Text>

      {challenges.map((challenge) => {
        const submission = userSubmissions.find(s => s.challenge_id === challenge.id);
        const isProofSelectorOpen = submittingChallengeId === challenge.id;

        return (
          <View key={challenge.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{challenge.title}</Text>
              <View style={styles.xpBadge}>
                <Trophy size={14} color={THEME.colors.gold} />
                <Text style={styles.xpText}>+{challenge.xp_reward} XP</Text>
              </View>
            </View>

            <Text style={styles.gameTag}>Game: {challenge.games?.title || 'Any'}</Text>
            <Text style={styles.desc}>{challenge.description}</Text>

            {challenge.rules && (
              <View style={styles.rulesBox}>
                <Text style={styles.rulesTitle}>Challenge Rules:</Text>
                <Text style={styles.rulesText}>{challenge.rules}</Text>
              </View>
            )}

            {/* Submission State Display */}
            {submission ? (
              <View style={styles.completedBanner}>
                <CheckCircle size={18} color={THEME.colors.success} />
                <Text style={styles.completedText}>
                  Completed (Awarded +{challenge.xp_reward} XP)
                </Text>
              </View>
            ) : isProofSelectorOpen ? (
              <View style={styles.proofSelector}>
                <Text style={styles.selectLabel}>Select Journey Proof Entry:</Text>
                {timelineEntries.length === 0 ? (
                  <Text style={{ color: THEME.colors.textMuted, fontSize: 12, marginBottom: 8 }}>
                    No journey entries found. Please post a journey timeline entry about this game first!
                  </Text>
                ) : (
                  timelineEntries.map(entry => (
                    <TouchableOpacity
                      key={entry.id}
                      style={styles.proofItem}
                      onPress={() => handleSubmitProof(challenge.id, entry.id)}
                    >
                      <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{entry.title}</Text>
                      <Text style={{ color: THEME.colors.primary, fontSize: 10 }}>Tap to submit proof</Text>
                    </TouchableOpacity>
                  ))
                )}
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setSubmittingChallengeId(null)}
                  style={{ marginTop: 8 }}
                />
              </View>
            ) : (
              <Button
                title="Submit Journey Proof"
                onPress={() => setSubmittingChallengeId(challenge.id)}
                style={styles.submitBtn}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
  },
  description: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: THEME.spacing.lg,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: THEME.spacing.sm,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  gameTag: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  desc: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: THEME.spacing.md,
  },
  rulesBox: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  rulesTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  rulesText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  submitBtn: {
    width: '100%',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    padding: THEME.spacing.sm,
    borderRadius: THEME.roundness.md,
    justifyContent: 'center',
  },
  completedText: {
    color: THEME.colors.success,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  proofSelector: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.sm,
  },
  selectLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6,
  },
  proofItem: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    padding: THEME.spacing.sm,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
