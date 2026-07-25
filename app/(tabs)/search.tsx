import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { THEME } from '../../lib/theme';
import { Search as SearchIcon } from 'lucide-react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>
      
      <View style={styles.searchBar}>
        <SearchIcon color="#000" size={20} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="What do you want to listen to?"
          placeholderTextColor="#535353"
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Browse all</Text>
        <View style={styles.grid}>
          {['Podcasts', 'Live Events', 'Made For You', 'New Releases', 'Pop', 'Hip-Hop'].map((item, index) => (
            <View key={index} style={[styles.categoryCard, { backgroundColor: getRandomColor(index) }]}>
              <Text style={styles.categoryTitle}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function getRandomColor(index: number) {
  const colors = ['#E13300', '#7358FF', '#1E3264', '#E8115B', '#8D67AB', '#BA5D07'];
  return colors[index % colors.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47%',
    height: 100,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
