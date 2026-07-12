// NEXORA Root Application Entry
// Polyfills React.use globally BEFORE loading Expo Router to prevent React Navigation v7 compatibility crashes on React 18

import * as React from 'react';

if (typeof React.use !== 'function') {
  React.use = function use(promiseOrContext) {
    // If it's a promise, we let it throw or handle context.
    // React Navigation/Expo Router link components pass context to read global routing.
    return React.useContext(promiseOrContext);
  };
}

// Load the official Expo Router entry point
import 'expo-router/entry';
