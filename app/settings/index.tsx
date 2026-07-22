import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Profile, Block, Mute } from '../../lib/types';
import { Shield as IShield, Eye as IEye, Bell as IBell, LogOut as ILogOut, Trash as ITrash, AlertTriangle as IAlertTriangle } from 'lucide-react-native';
const Shield = IShield as any;
const Eye = IEye as any;
const Bell = IBell as any;
const LogOut = ILogOut as any;
const Trash = ITrash as any;
const AlertTriangle = IAlertTriangle as any;

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Settings states
  const [isPrivate, setIsPrivate] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);
  
  // Mutes & Blocks count
  const [blocksCount, setBlocksCount] = useState(0);
  const [mutesCount, setMutesCount] = useState(0);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        setIsPrivate(data.is_private);
        setHideActivity(data.hide_activity);
      }

      // Count blocks & mutes
      const { count: blocks } = await supabase
        .from('blocks')
        .select('*', { count: 'exact', head: true })
        .eq('blocker_id', user.id);
      setBlocksCount(blocks || 0);

      const { count: mutes } = await supabase
        .from('mutes')
        .select('*', { count: 'exact', head: true })
        .eq('muter_id', user.id);
      setMutesCount(mutes || 0);

    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTogglePrivacy = async (val: boolean) => {
    setIsPrivate(val);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ is_private: val })
      .eq('id', user.id);
  };

  const handleToggleActivity = async (val: boolean) => {
    setHideActivity(val);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ hide_activity: val })
      .eq('id', user.id);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/(auth)/login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Privacy Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Eye size={18} color={THEME.colors.primary} />
          <Text style={styles.sectionTitle}>Profile & Privacy</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Private Profile</Text>
            <Text style={styles.settingDesc}>Only approved followers can view your journey timeline achievements.</Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={handleTogglePrivacy}
            trackColor={{ false: THEME.colors.border, true: THEME.colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Hide Online Status</Text>
            <Text style={styles.settingDesc}>Do not show your active presence state to matchmakers.</Text>
          </View>
          <Switch
            value={hideActivity}
            onValueChange={handleToggleActivity}
            trackColor={{ false: THEME.colors.border, true: THEME.colors.primary }}
          />
        </View>
      </View>

      {/* Safety List management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={18} color={THEME.colors.primary} />
          <Text style={styles.sectionTitle}>Safety & Blocks</Text>
        </View>

        <TouchableOpacity 
          style={styles.settingRowClickable}
          onPress={() => Alert.alert('Blocked Gamers', `You have blocked ${blocksCount} users.`)}
        >
          <Text style={styles.settingLabel}>Blocked Users list ({blocksCount})</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingRowClickable}
          onPress={() => Alert.alert('Muted Gamers', `You have muted ${mutesCount} users.`)}
        >
          <Text style={styles.settingLabel}>Muted Users list ({mutesCount})</Text>
        </TouchableOpacity>
      </View>

      {/* Epic Games Disclaimer */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={18} color={THEME.colors.warning} />
          <Text style={styles.sectionTitle}>Disclaimer</Text>
        </View>
        <Text style={styles.settingDesc}>
          This app is not affiliated with, maintained, sponsored, or endorsed by Epic Games, Inc. 
          "Fortnite" and related trademarks are the property of Epic Games.
        </Text>
      </View>

      {/* Account actions */}
      <View style={styles.section}>
        <Button
          title="Sign Out Account"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutBtn}
        />

        <Button
          title="Permanently Delete Account"
          variant="danger"
          onPress={() => router.push('/settings/delete-account')}
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
  },
  section: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    borderBottomColor: THEME.colors.border,
    borderBottomWidth: 1,
    paddingBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  settingRowClickable: {
    paddingVertical: THEME.spacing.sm,
    borderBottomColor: THEME.colors.border,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingDesc: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
    paddingRight: THEME.spacing.md,
  },
  signOutBtn: {
    borderColor: THEME.colors.primary,
    marginBottom: 8,
  },
  deleteBtn: {
    borderColor: THEME.colors.danger,
  },
});
