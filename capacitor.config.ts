import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caisterplayz.app',
  appName: 'CaisterPlayz',
  webDir: 'dist',
  server: {
    // For development, use your local IP. For production, set your hosted PocketBase URL.
    // url: 'https://your-pocketbase-url.pockethost.io',
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'CaisterPlayz',
  },
};

export default config;
