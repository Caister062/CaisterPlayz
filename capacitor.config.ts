import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caisterplayz200.caimo',
  appName: 'CaisterPlayz',
  webDir: 'dist',
  server: {
    // For development, use your local IP. For production, set your hosted PocketBase URL.
    // url: 'https://your-pocketbase-url.pockethost.io',
    androidScheme: 'http',
    iosScheme: 'http',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 3000,
      backgroundColor: '#000000',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
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
