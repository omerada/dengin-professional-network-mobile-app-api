// __mocks__/react-native-worklets.js
module.exports = {
  __esModule: true,
  default: {},
  useWorklet: jest.fn(),
  createWorklet: jest.fn(),
  runOnUI: jest.fn(fn => fn),
};
