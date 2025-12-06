// __tests__/setup.ts
// Jest setup file for React Native testing

import '@testing-library/jest-native/extend-expect';
import React from 'react';

// Mock zustand middleware - properly wrap the state creator
jest.mock('zustand/middleware/immer', () => ({
  immer: (fn: Function) => (set: Function, get: Function, store: any) => {
    const immerSet = (partial: any) => {
      if (typeof partial === 'function') {
        set((state: any) => {
          const draft = { ...state };
          partial(draft);
          return draft;
        });
      } else {
        set(partial);
      }
    };
    return fn(immerSet, get, store);
  },
}));

// Mock ThemeContext to avoid async loading issues
jest.mock('../src/contexts/ThemeContext', () => {
  const React = require('react');
  const { light } = require('../src/theme');

  const mockThemeValue = {
    theme: light,
    themeMode: 'light' as const,
    setThemeMode: jest.fn(),
    toggleTheme: jest.fn(),
    isDark: false,
  };

  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => mockThemeValue,
  };
});

// Mock react-native-config
jest.mock('react-native-config', () => ({
  Config: {
    API_BASE_URL: 'https://api.test.com',
    ENV: 'test',
  },
  default: {
    API_BASE_URL: 'https://api.test.com',
    ENV: 'test',
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useAnimatedRef: jest.fn(),
  useAnimatedStyle: jest.fn(() => ({})),
  useDerivedValue: jest.fn((fn: () => any) => ({ value: fn() })),
  useAnimatedScrollHandler: jest.fn(),
  useSharedValue: jest.fn((val: any) => ({ value: val })),
  useAnimatedGestureHandler: jest.fn(),
  withTiming: jest.fn((val: any) => val),
  withSpring: jest.fn((val: any) => val),
  withDelay: jest.fn((delay: number, val: any) => val),
  withSequence: jest.fn((...vals: any[]) => vals[0]),
  withRepeat: jest.fn((val: any) => val),
  cancelAnimation: jest.fn(),
  runOnUI: jest.fn((fn: Function) => fn),
  interpolate: jest.fn(),
  interpolateColor: jest.fn(),
  Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  createAnimatedComponent: (component: any) => component,
  View: require('react-native').View,
  Text: require('react-native').Text,
  Image: require('react-native').Image,
  ScrollView: require('react-native').ScrollView,
  FlatList: require('react-native').FlatList,
  Layout: {},
  FadeIn: {},
  FadeOut: {},
  SlideInRight: {},
  SlideOutRight: {},
  default: {
    call: jest.fn(),
    createAnimatedComponent: (component: any) => component,
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn((val: any) => ({ value: val })),
  },
}));

jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
  useWorklet: jest.fn(),
  createWorklet: jest.fn(),
  runOnUI: jest.fn((fn: Function) => fn),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    Directions: {},
    GestureHandlerRootView: View,
  };
});

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaConsumer: ({ children }: { children: (insets: typeof inset) => React.ReactNode }) =>
      children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-biometrics
const BiometryTypes = {
  FaceID: 'FaceID',
  TouchID: 'TouchID',
  Biometrics: 'Biometrics',
};

jest.mock('react-native-biometrics', () => {
  const BiometryTypes = {
    FaceID: 'FaceID',
    TouchID: 'TouchID',
    Biometrics: 'Biometrics',
  };

  const ReactNativeBiometrics = jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn().mockResolvedValue({
      available: true,
      biometryType: 'FaceID',
    }),
    simplePrompt: jest.fn().mockResolvedValue({ success: true }),
    createKeys: jest.fn().mockResolvedValue({ publicKey: 'mock-public-key' }),
    biometricKeysExist: jest.fn().mockResolvedValue({ keysExist: false }),
    deleteKeys: jest.fn().mockResolvedValue({ keysDeleted: true }),
    createSignature: jest.fn().mockResolvedValue({ success: true, signature: 'mock-signature' }),
  }));

  ReactNativeBiometrics.BiometryTypes = BiometryTypes;

  return {
    __esModule: true,
    default: ReactNativeBiometrics,
    BiometryTypes,
  };
});

// Mock @react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

// Mock AsyncStorage with immediate resolution for theme
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStorage = require('@react-native-async-storage/async-storage/jest/async-storage-mock');
  return {
    ...mockStorage,
    getItem: jest.fn().mockImplementation((key: string) => {
      // Return null immediately for theme to avoid loading state
      if (key === 'meslektas_theme') {
        return Promise.resolve(null);
      }
      return mockStorage.getItem(key);
    }),
  };
});

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
    onMessage: jest.fn().mockReturnValue(jest.fn()),
    onNotificationOpenedApp: jest.fn().mockReturnValue(jest.fn()),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    subscribeToTopic: jest.fn().mockResolvedValue(undefined),
    unsubscribeFromTopic: jest.fn().mockResolvedValue(undefined),
    requestPermission: jest.fn().mockResolvedValue(1),
    hasPermission: jest.fn().mockResolvedValue(1),
    setBackgroundMessageHandler: jest.fn(),
    onTokenRefresh: jest.fn().mockReturnValue(jest.fn()),
    deleteToken: jest.fn().mockResolvedValue(undefined),
  }),
  FirebaseMessagingTypes: {
    AuthorizationStatus: {
      NOT_DETERMINED: -1,
      DENIED: 0,
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
  },
}));

// Note: @react-native-firebase/analytics and @react-native-firebase/crashlytics
// are mocked via moduleNameMapper in jest.config.js

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    displayNotification: jest.fn().mockResolvedValue(undefined),
    createChannel: jest.fn().mockResolvedValue('channel-id'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    onForegroundEvent: jest.fn().mockReturnValue(jest.fn()),
    onBackgroundEvent: jest.fn(),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
    getBadgeCount: jest.fn().mockResolvedValue(0),
    requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  },
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
    NONE: 0,
  },
  EventType: {
    DISMISSED: 0,
    PRESS: 1,
    ACTION_PRESS: 2,
    DELIVERED: 3,
  },
}));

// Mock @stomp/stompjs
jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(() => ({
    activate: jest.fn(),
    deactivate: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    publish: jest.fn(),
    connected: false,
    onConnect: jest.fn(),
    onDisconnect: jest.fn(),
    onStompError: jest.fn(),
  })),
}));

// Mock sockjs-client
jest.mock('sockjs-client', () => {
  return jest.fn().mockImplementation(() => ({
    close: jest.fn(),
    onopen: jest.fn(),
    onclose: jest.fn(),
    onmessage: jest.fn(),
    send: jest.fn(),
    readyState: 1,
  }));
});

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn().mockResolvedValue({
    assets: [{ uri: 'file://mock-image.jpg', type: 'image/jpeg', fileName: 'mock-image.jpg' }],
  }),
  launchCamera: jest.fn().mockResolvedValue({
    assets: [{ uri: 'file://mock-photo.jpg', type: 'image/jpeg', fileName: 'mock-photo.jpg' }],
  }),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      NOTIFICATIONS: 'ios.permission.NOTIFICATIONS',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  request: jest.fn().mockResolvedValue('granted'),
  check: jest.fn().mockResolvedValue('granted'),
  requestMultiple: jest.fn().mockResolvedValue({}),
  checkMultiple: jest.fn().mockResolvedValue({}),
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockResolvedValue('mock-device-id'),
  getDeviceId: jest.fn().mockReturnValue('mock-device-id'),
  getModel: jest.fn().mockReturnValue('iPhone 14'),
  getSystemVersion: jest.fn().mockReturnValue('16.0'),
  getVersion: jest.fn().mockReturnValue('1.0.0'),
  getBuildNumber: jest.fn().mockReturnValue('1'),
  getBrand: jest.fn().mockReturnValue('Apple'),
  isEmulator: jest.fn().mockResolvedValue(false),
  hasNotch: jest.fn().mockReturnValue(true),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue({ username: 'user', password: 'pass' }),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  getSupportedBiometryType: jest.fn().mockResolvedValue('FaceID'),
  ACCESS_CONTROL: {
    USER_PRESENCE: 'UserPresence',
    BIOMETRY_ANY: 'BiometryAny',
    BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
    DEVICE_PASSCODE: 'DevicePasscode',
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
    BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BiometryCurrentSetOrDevicePasscode',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
    ALWAYS: 'AccessibleAlways',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'AccessibleWhenPasscodeSetThisDeviceOnly',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly',
    ALWAYS_THIS_DEVICE_ONLY: 'AccessibleAlwaysThisDeviceOnly',
  },
  AUTHENTICATION_TYPE: {
    DEVICE_PASSCODE_OR_BIOMETRICS: 'AuthenticationWithBiometricsDevicePasscode',
    BIOMETRICS: 'AuthenticationWithBiometrics',
  },
  BIOMETRY_TYPE: {
    TOUCH_ID: 'TouchID',
    FACE_ID: 'FaceID',
    FINGERPRINT: 'Fingerprint',
    FACE: 'Face',
    IRIS: 'Iris',
  },
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn().mockReturnValue(jest.fn()),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
  useNetInfo: jest.fn().mockReturnValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(true),
  canOpenURL: jest.fn().mockResolvedValue(true),
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

// Mock console methods to reduce noise in tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('act(...)'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
