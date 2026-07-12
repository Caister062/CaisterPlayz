import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Game, JourneyEntryType, JourneyVisibility } from '../../lib/types';

export default function CreateJourneyEntryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);

  // Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [entryType, setEntryType] = useState<JourneyEntryType>('achievement');
  const [platform, setPlatform] = useState('PC');
  const [visibility, setVisibility] = useState<JourneyVisibility>('public');

  const typesList: { key: JourneyEntryType; label: string }[] = [
    { key: 'achievement', label: 'Achievement' },
    { key: 'personal_record', label: 'Personal Record' },
    { key: 'rank_milestone', label: 'Rank Milestone' },
    { key: 'first_time', label: 'First-time Experience' },
    { key: 'completed_game', label: 'Completed Game' },
    { key: 'screenshot_memory', label: 'Screenshot Memory' },
    { key: 'tournament_result', label: 'Tournament Result' },
    { key: 'team_accomplishment', label: 'Team Accomplishment' },
    { key: 'custom', label: 'Custom Gaming Memory' },
  ];

  const platformsList = ['PC', 'PS5', 'Xbox Series X', 'PS4', 'Xbox One', 'Switch', 'iOS', 'Android'];
  const visibilities: { key: JourneyVisibility; label: string }[] = [
    { key: 'public', label: 'Public' },
    { key: 'followers_only', label: 'Followers-only' },
    { key: 'private', label: 'Private' },
  ];

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase.from('games').select('*');
      if (data) setGames(data);
    };
    fetchGames();
  }, []);

  const handleCreate = async () => {
    if (!title) {
      Alert.alert('Required', 'Please enter a title.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('journey_entries').insert({
        user_id: user.id,
        title,
        description,
        game_id: selectedGameId || null,
        entry_type: entryType,
        platform,
        visibility,
        moderation_status: 'approved', // Automatic approved mock for development, moderate-text checks flag terms
      }).select().single();

      if (error) throw error;

      // Ledger Reward Trigger for creating posts
      await supabase.from('xp_ledger').insert({
        user_id: user.id,
        amount: 25, // 25 XP for posting a journey milestone
        source: 'journey_post',
        source_id: data.id,
        idempotency_key: `post_${data.id}`,
      });

      Alert.alert('Success', 'Journey accomplishment posted successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/profile') }
      ]);

    } catch (e: any) {
      Alert.alert('Failed to Post', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Input
          label="Title"
          placeholder="e.g. Cleared Elden Beast Solo!"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Description"
          placeholder="Details on build, play tactics, or personal memory..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        {/* Entry Type */}
        <Text style={styles.label}>Entry Category</Text>
        <View style={styles.badgeGrid}>
          {typesList.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[styles.badge, entryType === type.key && styles.badgeActive]}
              onPress={() => setEntryType(type.key)}
            >
              <Text style={[styles.badgeText, entryType === type.key && styles.badgeTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Games list dropdown replacement */}
        <Text style={styles.label}>Game (Optional)</Text>
        <View style={styles.badgeGrid}>
          <TouchableOpacity
            style={[styles.badge, !selectedGameId && styles.badgeActive]}
            onPress={() => setSelectedGameId('')}
          >
            <Text style={[styles.badgeText, !selectedGameId && styles.badgeTextActive]}>None</Text>
          </TouchableOpacity>
          {games.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.badge, selectedGameId === g.id && styles.badgeActive]}
              onPress={() => setSelectedGameId(g.id)}
            >
              <Text style={[styles.badgeText, selectedGameId === g.id && styles.badgeTextActive]}>
                {g.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Platform */}
        <Text style={styles.label}>Platform</Text>
        <View style={styles.badgeGrid}>
          {platformsList.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.badge, platform === p && styles.badgeActive]}
              onPress={() => setPlatform(p)}
            >
              <Text style={[styles.badgeText, platform === p && styles.badgeTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visibility */}
        <Text style={styles.label}>Accomplishment Visibility</Text>
        <View style={styles.badgeGrid}>
          {visibilities.map((v) => (
            <TouchableOpacity
              key={v.key}
              style={[styles.badge, visibility === v.key && styles.badgeActive]}
              onPress={() => setVisibility(v.key)}
            >
              <Text style={[styles.badgeText, visibility === v.key && styles.badgeTextActive]}>
                {v.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Publish to Timeline (+25 XP)"
          onPress={handleCreate}
          loading={loading}
          style={styles.publishBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
  },
  label: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: THEME.spacing.sm,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: THEME.spacing.md,
  },
  badge: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  badgeText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeTextActive: {
    color: '#050814',
  },
  publishBtn: {
    marginTop: THEME.spacing.md,
  },
});
