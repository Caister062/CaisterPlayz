import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { THEME } from '../lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />
      <AppNavigationState />
    </QueryClientProvider>
  );
}

function AppNavigationState() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    // Bypass authentication for the Spotify UI
    if (inAuthGroup) {
      router.replace('/(tabs)/');
    }
  }, [segments]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: THEME.colors.surface,
        },
        headerTintColor: THEME.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: THEME.colors.background,
        },
      }}
    >
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/forgot-password" options={{ title: 'Reset Password', headerBackTitle: 'Back' }} />
      <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings/index" options={{ title: 'Settings', headerBackTitle: 'Back' }} />
    </Stack>
  );
}
