// __mocks__/@react-native-firebase/app.js
// Mock for @react-native-firebase/app (used in tests)

const firebase = {
  apps: [],
  app: () => ({
    name: '[DEFAULT]',
    options: {
      projectId: 'dengin-test',
    },
  }),
  initializeApp: jest.fn(),
};

export default firebase;
