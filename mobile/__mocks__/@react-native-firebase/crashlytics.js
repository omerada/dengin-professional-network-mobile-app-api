// __mocks__/@react-native-firebase/crashlytics.js
const mockCrashlytics = {
  recordError: jest.fn(),
  log: jest.fn(),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setAttribute: jest.fn().mockResolvedValue(undefined),
  setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
};

export default () => mockCrashlytics;
