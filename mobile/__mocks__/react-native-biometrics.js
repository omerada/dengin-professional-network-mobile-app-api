// __mocks__/react-native-biometrics.js
// Expo Go için mock - expo-local-authentication kullanılmalı

export default class ReactNativeBiometrics {
  constructor() {}

  isSensorAvailable() {
    return Promise.resolve({ available: false, biometryType: 'None' });
  }

  createKeys() {
    return Promise.resolve({ publicKey: 'mock-key' });
  }

  biometricKeysExist() {
    return Promise.resolve({ keysExist: false });
  }

  deleteKeys() {
    return Promise.resolve({ keysDeleted: true });
  }

  createSignature(options) {
    return Promise.resolve({ success: false, error: 'Not available in Expo Go' });
  }

  simplePrompt(options) {
    return Promise.resolve({ success: false, error: 'Not available in Expo Go' });
  }
}

export const BiometryTypes = {
  TouchID: 'TouchID',
  FaceID: 'FaceID',
  Biometrics: 'Biometrics',
};
