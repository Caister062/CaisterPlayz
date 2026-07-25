import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../lib/theme';
import { Home as IHome, Search as ISearch, Library as ILibrary } from 'lucide-react-native';

const Home = IHome as any;
const Search = ISearch as any;
const Library = ILibrary as any;

// A placeholder MiniPlayer for now
function MiniPlayer() {
  return (
    <View style={styles.miniPlayerContainer}>
      <Text style={styles.miniPlayerText}>Not Playing</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: THEME.colors.surface,
            borderTopColor: THEME.colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: THEME.colors.primary, // Make sure to use Spotify Green (#1DB954) in theme eventually
          tabBarInactiveTintColor: THEME.colors.textMuted,
          headerStyle: {
            backgroundColor: THEME.colors.surface,
            borderBottomColor: THEME.colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: THEME.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Your Library',
            tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
          }}
        />
      </Tabs>
      
      {/* Absolute positioning to place it above the bottom tab bar */}
      <View style={styles.miniPlayerWrapper}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 60, // Height of tab bar
    left: 0,
    right: 0,
  },
  miniPlayerContainer: {
    height: 56,
    backgroundColor: '#333333',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  miniPlayerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});
