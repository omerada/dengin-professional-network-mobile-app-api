// __mocks__/react-native-image-resizer.js

module.exports = {
  __esModule: true,
  default: {
    createResizedImage: jest.fn().mockResolvedValue({
      uri: 'file://resized-image.jpg',
      path: '/path/to/resized-image.jpg',
      name: 'resized-image.jpg',
      size: 1024,
      width: 800,
      height: 600,
    }),
  },
};
