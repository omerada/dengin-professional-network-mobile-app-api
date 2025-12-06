// src/features/auth/services/googleAuth.ts
// Google Sign-In - Native only service

import { Platform } from 'react-native';

// Stub types for web compatibility
interface GoogleUser {
  idToken: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    photo: string | null;
  };
}

interface GoogleTokens {
  accessToken: string;
  idToken: string;
}

// Null object pattern for unavailable platforms
const nullGoogleAuth = {
  isAvailable: () => false,
  configure: (_webClientId: string) => {
    console.warn('Google Sign-In is not available on this platform');
  },
  signIn: async (): Promise<{ userInfo: GoogleUser; tokens: GoogleTokens }> => {
    throw new Error('Google ile giriş bu cihazda desteklenmiyor');
  },
  signOut: async () => {},
  isSignInError: (_error: any, _type: 'cancelled' | 'inProgress' | 'playServices') => false,
};

// Check if we're on a native platform
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Create the appropriate implementation
function createGoogleAuth() {
  if (!isNative) {
    return nullGoogleAuth;
  }

  // For native platforms, try to load the module
  let GoogleSignin: any = null;
  let statusCodes: any = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const googleModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleModule.GoogleSignin;
    statusCodes = googleModule.statusCodes;
  } catch (e) {
    console.warn('Google Sign-In module not available:', e);
    return nullGoogleAuth;
  }

  if (!GoogleSignin) {
    return nullGoogleAuth;
  }

  return {
    isAvailable: () => true,

    configure: (webClientId: string) => {
      GoogleSignin.configure({
        webClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
    },

    signIn: async (): Promise<{ userInfo: GoogleUser; tokens: GoogleTokens }> => {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      return { userInfo, tokens };
    },

    signOut: async () => {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (error) {
        console.warn('Google sign out warning:', error);
      }
    },

    isSignInError: (error: any, type: 'cancelled' | 'inProgress' | 'playServices') => {
      if (!statusCodes) return false;

      switch (type) {
        case 'cancelled':
          return error?.code === statusCodes.SIGN_IN_CANCELLED;
        case 'inProgress':
          return error?.code === statusCodes.IN_PROGRESS;
        case 'playServices':
          return error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE;
        default:
          return false;
      }
    },
  };
}

export const googleAuth = createGoogleAuth();
export default googleAuth;
