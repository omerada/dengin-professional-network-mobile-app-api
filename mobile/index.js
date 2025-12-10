// index.js
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import { LogBox, Platform } from 'react-native';
import Constants from 'expo-constants';
import App from './src/App';

/**
 * Firebase Cloud Messaging - Background Message Handler
 * Only works in EAS Build, not in Expo Go
 */
const isExpoGo = Constants.appOwnership === 'expo';
if (!isExpoGo) {
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('[FCM] Background message received:', remoteMessage);
    });
  } catch (error) {
    console.log('[FCM] Not available in Expo Go - use EAS Build for FCM support');
  }
}

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
