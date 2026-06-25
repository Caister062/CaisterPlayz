import React, { useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef(null);

  // The live GitHub Pages URL for the CaisterPlayz PWA
  const CAISTER_URL = 'https://caister062.github.io/CaisterPlayz/';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050811" />
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: CAISTER_URL }}
          style={styles.webview}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          allowsBackForwardNavigationGestures={true}
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          injectedJavaScript={`window.isNativeWrapper = true; true;`}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050811', // Matches the var(--bg) of the web app
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#050811',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
