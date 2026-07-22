import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function CreateLoadoutScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Loadout Fields
  const [skin, setSkin] = useState('');
  const [backBling, setBackBling] = useState('');
  const [pickaxe, setPickaxe] = useState('');
  const [glider, setGlider] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'public'|'private'>('public');

  const handleCreate = async () => {
    if (!skin || !pickaxe) {
      Alert.alert('Required', 'Please enter at least a Skin and a Pickaxe.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Store loadout data as JSON in the description field for now to avoid db migrations
      const loadoutData = {
        skin,
        backBling,
        pickaxe,
        glider,
        caption
      };

      const { data, error } = await supabase.from('journey_entries').insert({
        user_id: user.id,
        title: `${skin} Loadout`, // Use Skin as the post title
        description: JSON.stringify(loadoutData),
        entry_type: 'custom',
        platform: 'PC', // Defaulting for simplicity
        visibility,
        moderation_status: 'approved',
      }).select().single();

      if (error) throw error;

      Alert.alert('Success', 'Loadout posted to the Locker Room successfully!', [
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
      <View style={styles.header}>
        <Text style={styles.title}>Post a Loadout</Text>
        <Text style={styles.subtitle}>Show off your drip to the Locker Room</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cosmetics</Text>
        
        <Input
          label="Skin (Outfit)"
          placeholder="e.g. Aura, Peely..."
          value={skin}
          onChangeText={setSkin}
        />

        <Input
          label="Back Bling"
          placeholder="e.g. Sun Sprout..."
          value={backBling}
          onChangeText={setBackBling}
        />

        <Input
          label="Pickaxe"
          placeholder="e.g. Star Wand..."
          value={pickaxe}
          onChangeText={setPickaxe}
        />

        <Input
          label="Glider (Optional)"
          placeholder="e.g. Coral Cruiser..."
          value={glider}
          onChangeText={setGlider}
        />

        <Text style={styles.sectionTitle}>Details</Text>
        <Input
          label="Caption (Optional)"
          placeholder="Why is this loadout fire?"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />

        {/* Visibility */}
        <Text style={styles.label}>Visibility</Text>
        <View style={styles.badgeGrid}>
          <TouchableOpacity
            style={[styles.badge, visibility === 'public' && styles.badgeActive]}
            onPress={() => setVisibility('public')}
          >
            <Text style={[styles.badgeText, visibility === 'public' && styles.badgeTextActive]}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.badge, visibility === 'private' && styles.badgeActive]}
            onPress={() => setVisibility('private')}
          >
            <Text style={[styles.badgeText, visibility === 'private' && styles.badgeTextActive]}>Private</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Publish Loadout"
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
  header: {
    marginBottom: THEME.spacing.md,
  },
  title: {
    color: THEME.colors.text,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
  },
  sectionTitle: {
    color: THEME.colors.secondary,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextActive: {
    color: '#121212',
  },
  publishBtn: {
    marginTop: THEME.spacing.md,
    backgroundColor: THEME.colors.primary,
  },
});
