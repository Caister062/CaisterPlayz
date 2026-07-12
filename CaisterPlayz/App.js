import React, { useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef(null);
  const CAISTER_URL = 'https://caister062.github.io/CaisterPlayz/';

  if (Platform.OS === 'web') {
    return (
      <iframe
        src={CAISTER_URL}
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          backgroundColor: '#050811',
        }}
        title="CaisterPlayz"
      />
    );
  }

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
          injectedJavaScript={`window.isNativeWrapper = true; true;`}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050811',
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
