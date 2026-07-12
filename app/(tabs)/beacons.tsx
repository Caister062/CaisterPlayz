import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { MatchBeacon, Game } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Users as IUsers, Plus as IPlus, Check as ICheck, CircleDot as ICircleDot } from 'lucide-react-native';
const Users = IUsers as any;
const Plus = IPlus as any;
const Check = ICheck as any;
const CircleDot = ICircleDot as any;

export default function BeaconsExplorerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [beacons, setBeacons] = useState<MatchBeacon[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form Fields
  const [selectedGameId, setSelectedGameId] = useState('');
  const [mode, setMode] = useState('');
  const [platform, setPlatform] = useState('PC');
  const [region, setRegion] = useState('North America');
  const [playStyle, setPlayStyle] = useState('casual');
  const [skillPref, setSkillPref] = useState('Any');
  const [micPref, setMicPref] = useState(false);
  const [maxGroupSize, setMaxGroupSize] = useState('4');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends_only'>('public');

  const fetchBeacons = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Filter blocks
      const { data: blocks } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
      const blockedIds = blocks?.map(b => b.blocked_id) || [];

      const { data, error } = await supabase
        .from('match_beacons')
        .select('*, profiles(*), games(*)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (data) {
        const filtered = (data as MatchBeacon[]).filter(b => !blockedIds.includes(b.creator_id));
        setBeacons(filtered);
      }

      const { data: gamesData } = await supabase.from('games').select('*');
      if (gamesData) setGames(gamesData);

    } catch {
      // Fail silently in development
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeacons();
  }, []);

  const handleCreateBeacon = async () => {
    if (!selectedGameId || !mode || !maxGroupSize) {
      Alert.alert('Required', 'Please fill game, mode, and max group size fields.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const size = parseInt(maxGroupSize, 10);
      if (isNaN(size) || size < 2 || size > 20) {
        Alert.alert('Error', 'Group size must be between 2 and 20.');
        setLoading(false);
        return;
      }

      const { data: beacon, error } = await supabase.from('match_beacons').insert({
        creator_id: user.id,
        game_id: selectedGameId,
        mode,
        platform,
        region,
        play_style: playStyle,
        skill_preference: skillPref,
        mic_preference: micPref,
        max_group_size: size,
        description,
        visibility,
        start_time: new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours expiration
      }).select().single();

      if (error) throw error;

      // Add creator to beacon_members immediately
      await supabase.from('beacon_members').insert({
        beacon_id: beacon.id,
        user_id: user.id,
        is_ready: true,
        coordination_status: 'ready',
      });

      // Reward ledger
      await supabase.from('xp_ledger').insert({
        user_id: user.id,
        amount: 30, // 30 XP for hosting beacons
        source: 'match_beacon_host',
        source_id: beacon.id,
        idempotency_key: `beacon_host_${beacon.id}`,
      });

      setShowCreateForm(false);
      Alert.alert('Success', 'Match Beacon Broadcasted! (+30 XP)', [
        { text: 'Enter Lobby', onPress: () => router.push(`/beacons/${beacon.id}`) }
      ]);
      fetchBeacons();

    } catch (e: any) {
      Alert.alert('Failed to Broadcast', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && beacons.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showCreateForm ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Broadcast Match Beacon</Text>

          <Text style={styles.formLabel}>Select Target Game</Text>
          <View style={styles.badgeGrid}>
            {games.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.formBadge, selectedGameId === g.id && styles.formBadgeActive]}
                onPress={() => setSelectedGameId(g.id)}
              >
                <Text style={[styles.badgeText, selectedGameId === g.id && styles.badgeTextActive]}>
                  {g.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Game Mode (e.g. Competitive, Custom Co-op)" placeholder="e.g. Duos, Rank Grinding" value={mode} onChangeText={setMode} />
          
          <Input label="Max Group Size" placeholder="4" keyboardType="numeric" value={maxGroupSize} onChangeText={setMaxGroupSize} />

          <Input label="Session Description" placeholder="Looking for chills, mics, ready to push keys now..." value={description} onChangeText={setDescription} />

          {/* Mic */}
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setMicPref(!micPref)}
          >
            <View style={[styles.checkbox, micPref && styles.checkboxActive]}>
              {micPref && <Check size={14} color="#050814" />}
            </View>
            <Text style={{ color: '#ffffff', marginLeft: 8 }}>Microphone Required</Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <Button title="Cancel" variant="outline" onPress={() => setShowCreateForm(false)} style={{ flex: 1, marginRight: 8 }} />
            <Button title="Broadcast Beacon" onPress={handleCreateBeacon} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.header}>
            <Text style={styles.description}>
              Match Beacon connects you directly with players seeking active teammates. Broadcast your beacon lobby or request to join others!
            </Text>
            <Button
              title="Broadcast Match Beacon"
              onPress={() => setShowCreateForm(true)}
              style={styles.broadcastBtn}
            />
          </View>

          <Text style={styles.sectionHeader}>Active Broadcast Lobbies</Text>

          {beacons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={32} color={THEME.colors.textMuted} />
              <Text style={{ color: THEME.colors.textMuted, marginTop: 8 }}>No active lobbies broadcasted. Be the first!</Text>
            </View>
          ) : (
            beacons.map((beacon) => (
              <TouchableOpacity
                key={beacon.id}
                style={styles.beaconCard}
                onPress={() => router.push(`/beacons/${beacon.id}`)}
              >
                <View style={styles.beaconHeader}>
                  <View>
                    <Text style={styles.beaconGame}>{beacon.games?.title}</Text>
                    <Text style={styles.beaconMode}>{beacon.mode}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <CircleDot size={12} color={THEME.colors.primary} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>

                {beacon.description && (
                  <Text style={styles.beaconDescription}>{beacon.description}</Text>
                )}

                <View style={styles.beaconFooter}>
                  <Text style={styles.hostText}>Host: @{beacon.profiles?.username}</Text>
                  <Text style={styles.slotsText}>Slots: Max {beacon.max_group_size}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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
  header: {
    marginBottom: THEME.spacing.lg,
  },
  description: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: THEME.spacing.md,
  },
  broadcastBtn: {
    width: '100%',
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  beaconCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  beaconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  beaconGame: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  beaconMode: {
    color: THEME.colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveText: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  beaconDescription: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    marginVertical: THEME.spacing.sm,
    lineHeight: 18,
  },
  beaconFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: THEME.colors.border,
    borderTopWidth: 1,
    paddingTop: THEME.spacing.sm,
    marginTop: THEME.spacing.sm,
  },
  hostText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  slotsText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
  },
  formTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  formLabel: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: THEME.spacing.md,
  },
  formBadge: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  formBadgeActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  badgeText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  badgeTextActive: {
    color: '#050814',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: THEME.spacing.lg,
  },
});
