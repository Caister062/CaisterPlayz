import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    try {
      return SecureStore.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      SecureStore.setItem(key, value);
    } catch {
      // Fail silently in development/mock modes
    }
  },
  removeItem: (key: string) => {
    try {
      SecureStore.deleteItemAsync(key);
    } catch {
      // Fail silently
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nexoraplayz-dev.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'mockanonkey';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
