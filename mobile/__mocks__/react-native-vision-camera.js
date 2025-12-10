// __mocks__/react-native-vision-camera.js
// Expo Go için mock - EAS Build'de gerçek kamera çalışır

export const useCameraDevice = () => null;

export const useCameraPermission = () => ({
  hasPermission: false,
  requestPermission: async () => false,
});

export const Camera = () => null;

export const useCodeScanner = () => ({});

export const CameraRuntimeError = class extends Error {};

export const VisionCameraProxy = {
  initFrameProcessorPlugin: () => {},
};
