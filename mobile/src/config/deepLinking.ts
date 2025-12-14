// src/config/deepLinking.ts
// Production-ready Deep Linking Configuration
// Oku: mobile-development-guide/ui-ux-modernization/10-DEEP-LINKING.md

import { Linking } from 'react-native';
import type { LinkingOptions } from '@react-navigation/native';

/**
 * Deep Linking URL Schemes
 */
export const URL_SCHEMES = {
  /** Production scheme */
  production: 'dengin://',
  /** Development scheme */
  development: 'dengin-dev://',
  /** Web fallback */
  web: 'https://dengin.app',
} as const;

/**
 * URL Path Prefixes
 */
export const URL_PREFIXES = [
  URL_SCHEMES.production,
  URL_SCHEMES.development,
  URL_SCHEMES.web,
  'https://*.dengin.app', // Wildcard for subdomains
];

/**
 * Deep Link Screen Mappings
 *
 * Supported URLs:
 * - dengin://feed
 * - dengin://post/:postId
 * - dengin://profile/:userId
 * - dengin://messaging
 * - dengin://chat/:conversationId
 * - dengin://verification
 * - dengin://settings
 * - https://dengin.app/post/123
 */
export const LINKING_CONFIG: LinkingOptions<any> = {
  prefixes: URL_PREFIXES,
  config: {
    screens: {
      // Auth Stack
      Auth: {
        screens: {
          Onboarding: 'onboarding',
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },

      // Main Stack
      Main: {
        screens: {
          // Feed Tab
          Feed: {
            screens: {
              FeedList: 'feed',
              PostDetail: {
                path: 'post/:postId',
                parse: {
                  postId: (postId: string) => postId,
                },
              },
              CreatePost: 'create-post',
            },
          },

          // Messaging Tab
          Messaging: {
            screens: {
              ConversationList: 'messaging',
              Chat: {
                path: 'chat/:conversationId',
                parse: {
                  conversationId: (conversationId: string) => conversationId,
                },
              },
              NewConversation: 'new-conversation',
            },
          },

          // Activity Tab
          Activity: 'activity',

          // Profile Tab
          Profile: {
            screens: {
              ProfileScreen: {
                path: 'profile/:userId?',
                parse: {
                  userId: (userId: string) => (userId ? userId : undefined),
                },
              },
              EditProfile: 'edit-profile',
              Settings: 'settings',
              FollowersList: {
                path: 'followers/:userId',
                parse: {
                  userId: (userId: string) => userId,
                },
              },
              FollowingList: {
                path: 'following/:userId',
                parse: {
                  userId: (userId: string) => userId,
                },
              },
            },
          },
        },
      },

      // Verification Stack (Modal)
      Verification: {
        screens: {
          VerificationIntro: 'verification',
          DocumentFront: 'verification/document-front',
          DocumentBack: 'verification/document-back',
          Selfie: 'verification/selfie',
          Review: 'verification/review',
        },
      },

      // Not Found (404)
      NotFound: '*',
    },
  },

  // Subscribe to incoming links
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();

    if (url != null) {
      return url;
    }

    // Check if there's a notification that caused the app to open
    // TODO: Integrate with Firebase Messaging
    // const message = await messaging().getInitialNotification();
    // if (message) {
    //   return buildDeepLinkFromNotification(message);
    // }

    return null;
  },

  subscribe(listener) {
    // Listen to incoming links from deep linking
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    // Listen to incoming notifications
    // TODO: Integrate with Firebase Messaging
    // const unsubscribe = messaging().onNotificationOpenedApp(message => {
    //   const url = buildDeepLinkFromNotification(message);
    //   listener(url);
    // });

    return () => {
      linkingSubscription.remove();
      // unsubscribe?.();
    };
  },
};

/**
 * Deep Link Helpers
 */

/**
 * Build deep link URL
 */
export const buildDeepLink = (path: string): string => {
  const scheme = __DEV__ ? URL_SCHEMES.development : URL_SCHEMES.production;
  return `${scheme}${path.startsWith('/') ? path.slice(1) : path}`;
};

/**
 * Build web URL
 */
export const buildWebUrl = (path: string): string => {
  return `${URL_SCHEMES.web}/${path.startsWith('/') ? path.slice(1) : path}`;
};

/**
 * Open deep link
 */
export const openDeepLink = async (path: string): Promise<boolean> => {
  try {
    const url = buildDeepLink(path);
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[DeepLink] Failed to open:', error);
    return false;
  }
};

/**
 * Parse deep link URL
 */
export const parseDeepLink = (
  url: string,
): { screen: string; params: Record<string, string> } | null => {
  try {
    // Remove scheme
    const path = url.replace(/^(dengin|dengin-dev|https?):\/\/(.*\.)?dengin\.app\//, '');

    // Split path into segments
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return { screen: 'Feed', params: {} };
    }

    const [screen, ...rest] = segments;

    // Build params from remaining segments
    const params: Record<string, string> = {};
    for (let i = 0; i < rest.length; i += 2) {
      if (rest[i] && rest[i + 1]) {
        params[rest[i]] = rest[i + 1];
      }
    }

    return { screen, params };
  } catch (error) {
    console.error('[DeepLink] Failed to parse:', error);
    return null;
  }
};

/**
 * Share helpers
 */

/**
 * Generate shareable post URL
 */
export const getShareablePostUrl = (postId: string): string => {
  return buildWebUrl(`post/${postId}`);
};

/**
 * Generate shareable profile URL
 */
export const getShareableProfileUrl = (userId: string): string => {
  return buildWebUrl(`profile/${userId}`);
};
