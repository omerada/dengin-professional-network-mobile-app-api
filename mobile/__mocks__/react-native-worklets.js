// __mocks__/react-native-worklets.js
module.exports = {
  __esModule: true,
  default: {},
  useWorklet: jest.fn(),
  createWorklet: jest.fn(),
  runOnJS: jest.fn(fn => fn),
  runOnUI: jest.fn(fn => fn),
};
