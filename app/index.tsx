import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { THEME } from '../lib/theme';

export default function IndexScreen() {
  // The global app layout (_layout.tsx) handles the authentication logic
  // and will redirect the user to either /(auth)/login or /(tabs)/discover
  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={THEME.colors.primary} />
    </View>
  );
}
