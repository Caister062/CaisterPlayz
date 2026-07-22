import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { THEME } from '../../lib/theme';
import { Heart as IHeart, Shield as IShield, Sparkles as ISparkles } from 'lucide-react-native';
const Heart = IHeart as any;
const Shield = IShield as any;
const Sparkles = ISparkles as any;

// Mock data for Phase 1
const MOCK_LOADOUTS = [
  {
    id: '1',
    user: 'NinjaFan99',
    skin: 'Raven',
    backBling: 'Iron Cage',
    pickaxe: 'Reaper',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    user: 'SweatyBuilder',
    skin: 'Aura',
    backBling: 'Sun Sprout',
    pickaxe: 'Star Wand',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800'
  }
];

export default function DiscoverScreen() {
  const [loadouts, setLoadouts] = useState(MOCK_LOADOUTS);

  const handleRate = (id: string) => {
    // Mock rating action
  };

  const renderLoadoutCard = ({ item }: { item: typeof MOCK_LOADOUTS[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.username}>@{item.user}</Text>
        <View style={styles.ratingBadge}>
          <Sparkles size={14} color={THEME.colors.gold} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <Image source={{ uri: item.image }} style={styles.image} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Skin:</Text>
          <Text style={[styles.itemValue, { color: THEME.colors.warning }]}>{item.skin}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Back Bling:</Text>
          <Text style={[styles.itemValue, { color: THEME.colors.secondary }]}>{item.backBling}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Pickaxe:</Text>
          <Text style={[styles.itemValue, { color: THEME.colors.primary }]}>{item.pickaxe}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.rateButton} onPress={() => handleRate(item.id)}>
          <Heart size={20} color="#fff" />
          <Text style={styles.rateButtonText}>Rate "W"</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rateButton, styles.lButton]} onPress={() => handleRate(item.id)}>
          <Shield size={20} color="#fff" />
          <Text style={styles.rateButtonText}>Rate "L"</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>The Locker Room</Text>
        <Text style={styles.subtitle}>Rate today's top loadouts</Text>
      </View>
      <FlatList
        data={loadouts}
        keyExtractor={item => item.id}
        renderItem={renderLoadoutCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: THEME.spacing.lg,
    paddingTop: 60,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
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
  list: {
    padding: THEME.spacing.md,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.surfaceLighter,
  },
  username: {
    color: THEME.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: THEME.colors.gold,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: THEME.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingBottom: 4,
  },
  itemLabel: {
    color: THEME.colors.textMuted,
    fontWeight: 'bold',
  },
  itemValue: {
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    padding: THEME.spacing.md,
    paddingTop: 0,
    gap: THEME.spacing.md,
  },
  rateButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: THEME.colors.success,
    padding: THEME.spacing.md,
    borderRadius: THEME.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  lButton: {
    backgroundColor: THEME.colors.danger,
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  }
});
