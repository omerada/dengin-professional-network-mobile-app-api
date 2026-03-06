// src/core/navigation/linking.ts
// Oku: mobile-development-guide/core/09-NAVIGATION.md

import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '@shared/types';
import { APP_CONFIG } from '@config/app';

/**
 * Deep linking configuration
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [APP_CONFIG.DEEP_LINK.PREFIX, 'https://dengin.com', 'https://app.dengin.com'],

  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
          VerifyEmail: 'verify-email/:email',
        },
      },
      Main: {
        screens: {
          FeedTab: {
            screens: {
              Feed: 'feed',
              PostDetail: 'post/:postId',
              CreatePost: 'create-post',
              UserProfile: 'user/:userId',
              Comments: 'post/:postId/comments',
            },
          },
          MessagingTab: {
            screens: {
              ConversationList: 'messages',
              Chat: 'chat/:conversationId',
              NewChat: 'new-chat',
            },
          },
          NotificationsTab: {
            screens: {
              Notifications: 'notifications',
              NotificationSettings: 'notification-settings',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile/:userId?',
              EditProfile: 'edit-profile',
              Settings: 'settings',
              ChangePassword: 'change-password',
              PrivacySettings: 'privacy-settings',
              BlockedUsers: 'blocked-users',
              About: 'about',
            },
          },
        },
      },
      Verification: {
        screens: {
          VerificationIntro: 'verification',
          DocumentType: 'verification/document-type',
          DocumentCapture: 'verification/document/:documentType/:side',
          SelfieCapture: 'verification/selfie',
          VerificationReview: 'verification/review',
          VerificationStatus: 'verification/status',
        },
      },
    },
  },
};
