import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { THEME } from '../../lib/theme';
import { ShoppingCart as IShoppingCart, Clock as IClock } from 'lucide-react-native';
const ShoppingCart = IShoppingCart as any;
const Clock = IClock as any;

// Mock Data for the Item Shop since we don't have an API key yet
const MOCK_SHOP_ITEMS = [
  {
    id: '1',
    name: 'Brite Bomber',
    type: 'Outfit',
    rarity: 'Rare',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400',
    color: THEME.colors.primary,
  },
  {
    id: '2',
    name: 'Rainbow Smash',
    type: 'Pickaxe',
    rarity: 'Epic',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1560421272-b7b514b8f047?auto=format&fit=crop&q=80&w=400',
    color: THEME.colors.secondary,
  },
  {
    id: '3',
    name: 'Floss',
    type: 'Emote',
    rarity: 'Rare',
    price: 500,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    color: THEME.colors.primary,
  },
  {
    id: '4',
    name: 'Midas',
    type: 'Outfit',
    rarity: 'Mythic',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400',
    color: THEME.colors.gold,
  }
];

export default function ShopScreen() {
  const renderShopItem = ({ item }: { item: typeof MOCK_SHOP_ITEMS[0] }) => (
    <TouchableOpacity style={[styles.itemCard, { borderColor: item.color }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={[styles.itemFooter, { backgroundColor: item.color }]}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.itemType}>{item.type}</Text>
          <Text style={styles.itemPrice}>{item.price} V</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Shop</Text>
          <Text style={styles.subtitle}>Rotates in 12h 45m</Text>
        </View>
        <Clock size={24} color={THEME.colors.gold} />
      </View>

      <FlatList
        data={MOCK_SHOP_ITEMS}
        keyExtractor={item => item.id}
        renderItem={renderShopItem}
        numColumns={2}
        contentContainerStyle={styles.grid}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: THEME.colors.gold,
    fontSize: 14,
    fontWeight: 'bold',
  },
  grid: {
    padding: THEME.spacing.sm,
  },
  itemCard: {
    flex: 1,
    margin: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.md,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  itemFooter: {
    padding: THEME.spacing.sm,
  },
  itemName: {
    color: '#121212',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemType: {
    color: '#121212',
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  itemPrice: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '900',
  }
});
