import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../../lib/theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Good morning</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Played</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.card}>
              <View style={styles.cardImage} />
              <Text style={styles.cardTitle}>Album {item}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Made For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.card}>
              <View style={styles.cardImage} />
              <Text style={styles.cardTitle}>Daily Mix {item}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 16,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  card: {
    width: 140,
    marginRight: 16,
  },
  cardImage: {
    width: 140,
    height: 140,
    backgroundColor: '#282828', // placeholder for images
    marginBottom: 8,
  },
  cardTitle: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '600',
  }
});
