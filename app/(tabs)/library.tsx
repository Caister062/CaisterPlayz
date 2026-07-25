import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { THEME } from '../../lib/theme';

const MOCK_DATA = [
  { id: '1', title: 'Liked Songs', subtitle: 'Playlist • 142 songs', isLiked: true },
  { id: '2', title: 'Discover Weekly', subtitle: 'Playlist • Spotify', isLiked: false },
  { id: '3', title: 'Daily Mix 1', subtitle: 'Playlist • Spotify', isLiked: false },
  { id: '4', title: 'Release Radar', subtitle: 'Playlist • Spotify', isLiked: false },
  { id: '5', title: 'Top Tracks 2026', subtitle: 'Playlist • You', isLiked: false },
];

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Library</Text>
      
      <FlatList
        data={MOCK_DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem}>
            <View style={[styles.imagePlaceholder, item.isLiked && styles.likedImagePlaceholder]}>
              {item.isLiked && <Text style={styles.heartIcon}>♥</Text>}
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
    padding: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#282828',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likedImagePlaceholder: {
    backgroundColor: 'linear-gradient(135deg, #450af5, #c4efd9)',
  },
  heartIcon: {
    color: 'white',
    fontSize: 24,
  },
  listTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 14,
  },
});
