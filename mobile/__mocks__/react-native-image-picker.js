// __mocks__/react-native-image-picker.js
// Expo Go için mock - expo-image-picker kullanılmalı

export const launchImageLibrary = async () => ({
  didCancel: true,
  errorCode: 'camera_unavailable',
  errorMessage: 'Use expo-image-picker in Expo Go',
});

export const launchCamera = async () => ({
  didCancel: true,
  errorCode: 'camera_unavailable',
  errorMessage: 'Use expo-image-picker in Expo Go',
});
