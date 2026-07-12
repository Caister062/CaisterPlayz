import React from 'react';
import { Tabs } from 'expo-router';
import { THEME } from '../../lib/theme';
import { Compass as ICompass, Users as IUsers, Trophy as ITrophy, Bell as IBell, User as IUser } from 'lucide-react-native';
const Compass = ICompass as any;
const Users = IUsers as any;
const Trophy = ITrophy as any;
const Bell = IBell as any;
const User = IUser as any;

export default function TabsLayout() {
  return (
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
        tabBarActiveTintColor: THEME.colors.primary,
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
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="beacons"
        options={{
          title: 'Match Beacon',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Journey',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
