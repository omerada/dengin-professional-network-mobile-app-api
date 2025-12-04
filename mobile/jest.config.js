// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/__tests__/setup.ts',
  ],
  moduleNameMapper: {
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@theme$': '<rootDir>/src/theme',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@contexts$': '<rootDir>/src/contexts',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@config$': '<rootDir>/src/config',
    '^@services/(.*)$': '<rootDir>/src/core/$1',
    '^react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    '^@react-native-google-signin/google-signin$':
      '<rootDir>/__mocks__/@react-native-google-signin/google-signin.js',
    '^@invertase/react-native-apple-authentication$':
      '<rootDir>/__mocks__/@invertase/react-native-apple-authentication.js',
    '^react-native-image-resizer$': '<rootDir>/__mocks__/react-native-image-resizer.js',
    '^react-native-fs$': '<rootDir>/__mocks__/react-native-fs.js',
    '^@react-native-firebase/crashlytics$':
      '<rootDir>/__mocks__/@react-native-firebase/crashlytics.js',
    '^@react-native-firebase/analytics$': '<rootDir>/__mocks__/@react-native-firebase/analytics.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-firebase|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|@react-native-async-storage|expo-secure-store|react-native-biometrics|@notifee|sockjs-client|@stomp|react-native-vector-icons|immer)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/__tests__/setup.ts',
    '/__tests__/utils/',
    '/__tests__/.*/index\\.ts$',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.types.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
