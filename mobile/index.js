// index.js
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './src/App';

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
