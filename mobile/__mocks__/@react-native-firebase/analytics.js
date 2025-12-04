// __mocks__/@react-native-firebase/analytics.js
const mockAnalytics = {
  logScreenView: jest.fn().mockResolvedValue(undefined),
  logEvent: jest.fn().mockResolvedValue(undefined),
  logLogin: jest.fn().mockResolvedValue(undefined),
  logSignUp: jest.fn().mockResolvedValue(undefined),
  logShare: jest.fn().mockResolvedValue(undefined),
  logSearch: jest.fn().mockResolvedValue(undefined),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setUserProperties: jest.fn().mockResolvedValue(undefined),
  setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  resetAnalyticsData: jest.fn().mockResolvedValue(undefined),
};

export default () => mockAnalytics;
