// src/features/auth/services/appleAuth.ts
// Apple Sign-In - iOS only service

import { Platform } from 'react-native';

// Stub types for compatibility
interface AppleCredential {
  identityToken: string;
  authorizationCode: string;
  user: string;
  email: string | null;
  fullName: {
    givenName: string | null;
    familyName: string | null;
  } | null;
}

// Null object pattern for unavailable platforms
const nullAppleAuth = {
  isAvailable: () => false,
  signIn: async (): Promise<AppleCredential> => {
    throw new Error('Apple ile giriş yalnızca iOS cihazlarda kullanılabilir');
  },
  signOut: async () => {},
};

// Check if we're on iOS
const isIOS = Platform.OS === 'ios';

// Create the appropriate implementation
function createAppleAuth() {
  if (!isIOS) {
    return nullAppleAuth;
  }

  // For iOS, try to load the module
  let appleAuthModule: any = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    appleAuthModule = require('@invertase/react-native-apple-authentication').appleAuth;
  } catch (e) {
    console.warn('Apple Auth module not available:', e);
    return nullAppleAuth;
  }

  if (!appleAuthModule || !appleAuthModule.isSupported) {
    return nullAppleAuth;
  }

  return {
    isAvailable: () => true,

    signIn: async (): Promise<AppleCredential> => {
      const appleAuthRequestResponse = await appleAuthModule.performRequest({
        requestedOperation: appleAuthModule.Operation.LOGIN,
        requestedScopes: [appleAuthModule.Scope.FULL_NAME, appleAuthModule.Scope.EMAIL],
      });

      const credentialState = await appleAuthModule.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      if (credentialState === appleAuthModule.State.AUTHORIZED) {
        return {
          identityToken: appleAuthRequestResponse.identityToken || '',
          authorizationCode: appleAuthRequestResponse.authorizationCode || '',
          user: appleAuthRequestResponse.user,
          email: appleAuthRequestResponse.email,
          fullName: appleAuthRequestResponse.fullName,
        };
      }

      throw new Error('Apple kimlik bilgileri alınamadı, lütfen tekrar deneyin');
    },

    signOut: async () => {
      // Apple doesn't provide a sign-out method
      // State should be handled by the app
    },
  };
}

export const appleAuth = createAppleAuth();
export default appleAuth;
