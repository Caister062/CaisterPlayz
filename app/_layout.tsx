import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { THEME } from '../lib/theme';
import { Session } from '@supabase/supabase-js';

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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkOnboarding(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await checkOnboarding(session.user.id);
      } else {
        setHasOnboarded(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkOnboarding = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', userId)
        .maybeSingle();

      if (data && data.username && !data.username.startsWith('user_')) {
        setHasOnboarded(true);
      } else {
        setHasOnboarded(false);
      }
    } catch {
      setHasOnboarded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session) {
      // Redirect to login if not authenticated and not already in auth screens
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (!hasOnboarded) {
        // Force onboarding if logged in but username not completed
        if (segments[segments.length - 1] !== 'onboarding') {
          router.replace('/(auth)/onboarding');
        }
      } else {
        // Onboarded and logged in
        if (inAuthGroup) {
          router.replace('/(tabs)/discover');
        }
      }
    }
  }, [session, loading, hasOnboarded, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

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
      <Stack.Screen name="journey/[id]" options={{ title: 'Entry Details', headerBackTitle: 'Back' }} />
      <Stack.Screen name="journey/create" options={{ title: 'New Journey Entry', headerBackTitle: 'Back' }} />
      <Stack.Screen name="beacons/[id]" options={{ title: 'Beacon Lobby', headerBackTitle: 'Back' }} />
      <Stack.Screen name="profile/[id]" options={{ title: 'Gamer Journey', headerBackTitle: 'Back' }} />
      <Stack.Screen name="settings/index" options={{ title: 'Settings', headerBackTitle: 'Back' }} />
      <Stack.Screen name="settings/delete-account" options={{ title: 'Delete Account', headerBackTitle: 'Back' }} />
      <Stack.Screen name="moderator/index" options={{ title: 'Moderator Dashboard', headerBackTitle: 'Back' }} />
      <Stack.Screen name="legal/terms" options={{ title: 'Terms of Service', headerBackTitle: 'Back' }} />
      <Stack.Screen name="legal/privacy" options={{ title: 'Privacy Policy', headerBackTitle: 'Back' }} />
      <Stack.Screen name="legal/guidelines" options={{ title: 'Community Guidelines', headerBackTitle: 'Back' }} />
    </Stack>
  );
}
