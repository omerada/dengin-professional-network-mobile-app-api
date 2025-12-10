// index.js
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './src/App';

/**
 * Firebase Cloud Messaging - Background Message Handler
 * MUST be registered BEFORE app initialization
 * Handles messages when app is in background or quit state
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM] Background message received:', remoteMessage);
  // Process background tasks here (e.g., update local data)
  // Notification display is handled automatically by FCM
});

// Disable LogBox warnings but allow error overlays for debugging
LogBox.ignoreAllLogs(__DEV__ ? false : true);

// In development, show errors but log them
if (__DEV__) {
  // Keep error overlay enabled in development
  console.log('[index.js] Running in development mode with error overlay enabled');
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
