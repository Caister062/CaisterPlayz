import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldAlert as IShieldAlert, Trash2 as ITrash2 } from 'lucide-react-native';
const ShieldAlert = IShieldAlert as any;
const Trash2 = ITrash2 as any;

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmation.toLowerCase() !== 'delete nexora') {
      Alert.alert('Required', 'Please input "delete nexora" to confirm.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call Edge Function or Cascade Local Database trigger
      // 1. Delete username registry
      await supabase.from('usernames').delete().eq('user_id', user.id);

      // 2. Cascade delete will erase profiles, follows, comments, reactions, notifications, match_beacons, beacon_join_requests, user_games, xp_ledger
      const { error: profileErr } = await supabase.from('profiles').delete().eq('id', user.id);
      
      if (profileErr) throw profileErr;

      // 3. Clear sessions and sign out
      await supabase.auth.signOut();

      Alert.alert(
        'Account Deleted',
        'Your NEXORA profile and association credentials have been successfully removed.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );

    } catch (e: any) {
      Alert.alert('Failed to Delete', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.warningCard}>
        <ShieldAlert size={48} color={THEME.colors.danger} style={{ alignSelf: 'center', marginBottom: 12 }} />
        <Text style={styles.title}>Permanently Delete Account</Text>
        <Text style={styles.desc}>
          This action is irreversible. All of your gaming accomplishments, pinned journey entries, Match Beacons, badges earned, comments, and profile preferences will be permanently erased.
        </Text>
      </View>

      <View style={styles.confirmationCard}>
        <Text style={styles.label}>Type "delete nexora" below to confirm deletion:</Text>
        <Input
          placeholder="delete nexora"
          value={confirmation}
          onChangeText={setConfirmation}
          autoCapitalize="none"
        />

        <Button
          title="Permanently Delete My Data"
          variant="danger"
          onPress={handleDelete}
          loading={loading}
          style={styles.deleteBtn}
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
    justifyContent: 'center',
  },
  warningCard: {
    backgroundColor: 'rgba(239, 71, 111, 0.08)',
    borderColor: THEME.colors.danger,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  desc: {
    color: THEME.colors.text,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  confirmationCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
  },
  label: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  deleteBtn: {
    marginTop: THEME.spacing.sm,
  },
});
