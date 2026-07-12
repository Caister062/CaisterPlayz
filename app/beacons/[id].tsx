import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { MatchBeacon, BeaconJoinRequest, BeaconMember } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Check as ICheck, X as IX, ShieldAlert as IShieldAlert, LogOut as ILogOut, Sparkles as ISparkles } from 'lucide-react-native';
const Check = ICheck as any;
const X = IX as any;
const ShieldAlert = IShieldAlert as any;
const LogOut = ILogOut as any;
const Sparkles = ISparkles as any;

export default function BeaconLobbyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [beacon, setBeacon] = useState<MatchBeacon | null>(null);
  const [members, setMembers] = useState<BeaconMember[]>([]);
  const [requests, setRequests] = useState<BeaconJoinRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  const fetchLobbyDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUser({ id: user.id });

      // 1. Fetch Beacon Info
      const { data: beaconData, error } = await supabase
        .from('match_beacons')
        .select('*, profiles(*), games(*)')
        .eq('id', id)
        .maybeSingle();

      if (error || !beaconData) {
        Alert.alert('Beacon Expired', 'This Match Beacon has expired or was removed by the host.');
        router.back();
        return;
      }
      setBeacon(beaconData as MatchBeacon);

      // 2. Fetch Members
      const { data: membersData } = await supabase
        .from('beacon_members')
        .select('*, profiles(*)')
        .eq('beacon_id', id);
      setMembers(membersData as BeaconMember[] || []);

      // 3. Fetch Join Requests (only visible to creator)
      if (user && beaconData.creator_id === user.id) {
        const { data: requestsData } = await supabase
          .from('beacon_join_requests')
          .select('*, profiles(*)')
          .eq('beacon_id', id)
          .eq('status', 'pending');
        setRequests(requestsData as BeaconJoinRequest[] || []);
      }

    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbyDetails();

    // Subscribe to realtime updates for this beacon's members
    const channel = supabase
      .channel(`beacon-lobby-${id}`)
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'beacon_members', filter: `beacon_id=eq.${id}` } as any,
        () => fetchLobbyDetails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleRequestJoin = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase.from('beacon_join_requests').insert({
        beacon_id: id,
        user_id: currentUser.id,
        status: 'pending',
      });

      if (error) {
        Alert.alert('Request Failed', error.message);
      } else {
        Alert.alert('Request Sent', 'Your request to join has been sent to the host.');
        fetchLobbyDetails();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAcceptRequest = async (reqId: string, joinerId: string) => {
    try {
      // 1. Accept request
      await supabase
        .from('beacon_join_requests')
        .update({ status: 'accepted' })
        .eq('id', reqId);

      // 2. Add to members
      await supabase.from('beacon_members').insert({
        beacon_id: id,
        user_id: joinerId,
        is_ready: false,
        coordination_status: 'none',
      });

      fetchLobbyDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    await supabase
      .from('beacon_join_requests')
      .update({ status: 'rejected' })
      .eq('id', reqId);
    fetchLobbyDetails();
  };

  const handleCoordination = async (status: string) => {
    if (!currentUser) return;
    await supabase
      .from('beacon_members')
      .update({ coordination_status: status, is_ready: status === 'ready' })
      .eq('beacon_id', id)
      .eq('user_id', currentUser.id);
    fetchLobbyDetails();
  };

  const handleLeaveBeacon = async () => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('beacon_members')
      .delete()
      .eq('beacon_id', id)
      .eq('user_id', currentUser.id);

    if (!error) {
      Alert.alert('Lobby Left', 'You left the Match Beacon session.');
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  if (!beacon) return null;

  const isHost = currentUser?.id === beacon.creator_id;
  const isMember = members.some((m) => m.user_id === currentUser?.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.detailsCard}>
        <Text style={styles.gameTitle}>{beacon.games?.title}</Text>
        <Text style={styles.modeText}>{beacon.mode} Session</Text>
        
        {beacon.description && (
          <Text style={styles.desc}>{beacon.description}</Text>
        )}

        <View style={styles.metaGrid}>
          <Text style={styles.metaLabel}>Platform: <Text style={styles.metaVal}>{beacon.platform}</Text></Text>
          <Text style={styles.metaLabel}>Region: <Text style={styles.metaVal}>{beacon.region}</Text></Text>
          <Text style={styles.metaLabel}>Mic Req: <Text style={styles.metaVal}>{beacon.mic_preference ? 'Required' : 'Optional'}</Text></Text>
          <Text style={styles.metaLabel}>Size Limit: <Text style={styles.metaVal}>{members.length} / {beacon.max_group_size}</Text></Text>
        </View>

        {/* Member Action buttons */}
        {!isMember ? (
          <Button title="Request to Join Beacon" onPress={handleRequestJoin} style={styles.actionBtn} />
        ) : (
          <View style={styles.memberBox}>
            <Text style={styles.boxTitle}>Lobby Console</Text>
            
            {/* Quick Coordination buttons */}
            <View style={styles.coordButtons}>
              {[
                { key: 'ready', label: 'Ready' },
                { key: 'joining_soon', label: 'Soon' },
                { key: 'need_five', label: 'Need 5m' },
                { key: 'invite_sent', label: 'Invited' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={styles.coordBtn}
                  onPress={() => handleCoordination(c.key)}
                >
                  <Text style={styles.coordBtnText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Leave Match Beacon"
              variant="danger"
              onPress={handleLeaveBeacon}
              style={styles.leaveBtn}
            />
          </View>
        )}
      </View>

      {/* Host requests queue */}
      {isHost && requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Join Requests ({requests.length})</Text>
          {requests.map((req) => (
            <View key={req.id} style={styles.requestRow}>
              <Text style={styles.requestUser}>@{req.profiles?.username} (Lvl {req.profiles?.level})</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  style={[styles.smallIconBtn, { backgroundColor: THEME.colors.success }]}
                  onPress={() => handleAcceptRequest(req.id, req.user_id)}
                >
                  <Check size={14} color="#050814" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.smallIconBtn, { backgroundColor: THEME.colors.danger }]}
                  onPress={() => handleRejectRequest(req.id)}
                >
                  <X size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Active members list */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Lobby Members ({members.length})</Text>
        {members.map((member) => (
          <View key={member.user_id} style={styles.memberRow}>
            <View>
              <Text style={styles.memberUser}>@{member.profiles?.username}</Text>
              <Text style={styles.memberStatus}>Status: {member.coordination_status.replace('_', ' ').toUpperCase()}</Text>
            </View>
            {member.is_ready ? (
              <View style={styles.readyBadge}>
                <Text style={styles.readyText}>READY</Text>
              </View>
            ) : (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>PENDING</Text>
              </View>
            )}
          </View>
        ))}
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
  detailsCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  gameTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modeText: {
    color: THEME.colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },
  desc: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: THEME.spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopColor: THEME.colors.border,
    borderTopWidth: 1,
    paddingTop: THEME.spacing.sm,
    marginTop: THEME.spacing.sm,
  },
  metaLabel: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    width: '48%',
    marginBottom: 6,
  },
  metaVal: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  actionBtn: {
    marginTop: THEME.spacing.md,
  },
  memberBox: {
    borderTopColor: THEME.colors.border,
    borderTopWidth: 1,
    paddingTop: THEME.spacing.md,
    marginTop: THEME.spacing.md,
  },
  boxTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: THEME.spacing.sm,
  },
  coordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  coordBtn: {
    backgroundColor: THEME.colors.surfaceLighter,
    borderRadius: THEME.roundness.sm,
    paddingVertical: 8,
    width: '23%',
    alignItems: 'center',
  },
  coordBtnText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  leaveBtn: {
    marginTop: 8,
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    padding: THEME.spacing.sm,
    marginBottom: 6,
  },
  requestUser: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  smallIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    padding: THEME.spacing.sm,
    marginBottom: 6,
  },
  memberUser: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  memberStatus: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  readyBadge: {
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  readyText: {
    color: THEME.colors.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingText: {
    color: THEME.colors.warning,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
