// src/features/auth/services/biometricService.ts
// Biometric authentication service
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/best-practices/31-SECURITY.md

import { Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { secureStorage, SECURE_KEYS, asyncStorage, STORAGE_KEYS } from '@core/storage';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

/**
 * Biometric type names for UI display
 */
const BIOMETRIC_NAMES: Record<string, string> = {
  FaceID: 'Face ID',
  TouchID: 'Touch ID',
  Biometrics: 'Biyometrik',
};

/**
 * Biometric authentication service
 */
export const biometricService = {
  /**
   * Check if biometric authentication is available
   */
  isAvailable: async (): Promise<{ available: boolean; biometryType: string | null }> => {
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
