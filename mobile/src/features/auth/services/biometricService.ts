// src/features/auth/services/biometricService.ts
// Web compatible biometric authentication service
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/best-practices/31-SECURITY.md

import { Platform } from 'react-native';
import { secureStorage, SECURE_KEYS, asyncStorage, STORAGE_KEYS } from '@core/storage';

// Biometric types for compatibility
const BiometryTypes = {
  FaceID: 'FaceID',
  TouchID: 'TouchID',
  Biometrics: 'Biometrics',
};

// Native module'ü sadece native platformlarda yükle
let rnBiometrics: any = null;

if (Platform.OS !== 'web') {
  try {
    const ReactNativeBiometrics = require('react-native-biometrics').default;
    rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
  } catch (e) {
    console.log('[BiometricService] Native module not available');
  }
}

/**
 * Biometric type names for UI display
 */
const BIOMETRIC_NAMES: Record<string, string> = {
  [BiometryTypes.FaceID]: 'Face ID',
  [BiometryTypes.TouchID]: 'Touch ID',
  [BiometryTypes.Biometrics]: 'Biyometrik',
};

/**
 * Biometric authentication service - Web compatible
 */
export const biometricService = {
  /**
   * Check if biometric authentication is available
   */
  isAvailable: async (): Promise<{ available: boolean; biometryType: string | null }> => {
    // Web'de biometrik desteklenmez
    if (Platform.OS === 'web' || !rnBiometrics) {
      return { available: false, biometryType: null };
    }

    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return {
        available,
        biometryType: biometryType || null,
      };
    } catch (error) {
      console.error('[BiometricService] Error checking availability:', error);
      return { available: false, biometryType: null };
    }
  },

  /**
   * Get biometric type display name
   */
  getBiometricName: async (): Promise<string> => {
    const { biometryType } = await biometricService.isAvailable();
    if (biometryType && BIOMETRIC_NAMES[biometryType]) {
      return BIOMETRIC_NAMES[biometryType];
    }
    return Platform.OS === 'ios' ? 'Biyometrik' : 'Parmak İzi';
  },

  /**
   * Prompt user for biometric authentication
   */
  authenticate: async (promptMessage?: string): Promise<{ success: boolean; error?: string }> => {
    // Web'de biometrik desteklenmez
    if (Platform.OS === 'web' || !rnBiometrics) {
      return { success: false, error: 'Biyometrik doğrulama bu platformda desteklenmiyor' };
    }

    try {
      const { available } = await biometricService.isAvailable();

      if (!available) {
        return { success: false, error: 'Biyometrik doğrulama kullanılamıyor' };
      }

      const { success, error } = await rnBiometrics.simplePrompt({
        promptMessage: promptMessage || 'Kimliğinizi doğrulayın',
        cancelButtonText: 'İptal',
      });

      if (success) {
        return { success: true };
      }

      return { success: false, error: error || 'Kimlik doğrulama başarısız' };
    } catch (error) {
      console.error('[BiometricService] Authentication error:', error);
      return { success: false, error: 'Biyometrik doğrulama hatası' };
    }
  },

  /**
   * Enable biometric authentication for user
   * Stores encrypted credentials for biometric login
   */
  enable: async (email: string, refreshToken: string): Promise<boolean> => {
    // Web'de biometrik desteklenmez
    if (Platform.OS === 'web' || !rnBiometrics) {
      return false;
    }

    try {
      const { available } = await biometricService.isAvailable();

      if (!available) {
        return false;
      }

      // Store credentials for biometric login
      const credentials = JSON.stringify({ email, refreshToken });
      await secureStorage.set(SECURE_KEYS.BIOMETRIC_KEY, credentials);
      await asyncStorage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, true);

      return true;
    } catch (error) {
      console.error('[BiometricService] Enable error:', error);
      return false;
    }
  },

  /**
   * Disable biometric authentication
   */
  disable: async (): Promise<boolean> => {
    try {
      await secureStorage.remove(SECURE_KEYS.BIOMETRIC_KEY);
      await asyncStorage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, false);
      return true;
    } catch (error) {
      console.error('[BiometricService] Disable error:', error);
      return false;
    }
  },

  /**
   * Check if biometric is enabled for current user
   */
  isEnabled: async (): Promise<boolean> => {
    // Web'de biometrik desteklenmez
    if (Platform.OS === 'web') {
      return false;
    }

    const enabled = await asyncStorage.get<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return enabled === true;
  },

  /**
   * Get stored credentials for biometric login
   * Returns null if biometric auth fails
   */
  getStoredCredentials: async (): Promise<{
    email: string;
    refreshToken: string;
  } | null> => {
    // Web'de biometrik desteklenmez
    if (Platform.OS === 'web' || !rnBiometrics) {
      return null;
    }

    try {
      // First verify biometric
      const { success } = await biometricService.authenticate('Giriş yapmak için doğrulayın');

      if (!success) {
        return null;
      }

      // Get stored credentials
      const credentialsJson = await secureStorage.get(SECURE_KEYS.BIOMETRIC_KEY);

      if (!credentialsJson) {
        return null;
      }

      return JSON.parse(credentialsJson);
    } catch (error) {
      console.error('[BiometricService] Get credentials error:', error);
      return null;
    }
  },
};
