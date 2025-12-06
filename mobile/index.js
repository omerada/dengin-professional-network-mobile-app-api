// index.js
import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './src/App';

// Disable all console warnings and error overlays on device
// Logs still appear in terminal for debugging
LogBox.ignoreAllLogs(true);

// Disable error overlay in development
if (__DEV__) {
  // Disable React Native's red screen overlay
  const ErrorUtils = global.ErrorUtils;
  if (ErrorUtils) {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Log to console (appears in terminal)
      console.error('Error caught:', error);
      // Call original handler without showing overlay
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
