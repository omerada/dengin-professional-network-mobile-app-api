// src/core/navigation/types.ts
// Navigation tipler
// Oku: mobile-development-guide/core/09-NAVIGATION.md

import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root Stack
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Verification: NavigatorScreenParams<VerificationStackParamList>;
  // Deep link screens
  NotificationSettings: undefined;
  VerificationStatus: undefined;
  PostDetail: { postId: string };
  Profile: { userId?: string };
  Chat: { conversationId: string };
  MatchDetail: { matchId: string };
};

/**
 * Auth Stack
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  WelcomeSuccess: undefined;
  ForgotPassword: undefined;
  BiometricSetup: undefined;
};

/**
 * Verification Stack
 */
export type VerificationStackParamList = {
  VerificationIntro: undefined;
  DocumentCapture: undefined;
  SelfieCapture: undefined;
  VerificationReview: undefined;
  UploadStatus: undefined;
};

/**
 * Main Tabs
 */
export type MainTabParamList = {
  FeedTab: NavigatorScreenParams<FeedStackParamList>;
  MessagingTab: NavigatorScreenParams<MessagingStackParamList>;
  CreatePostTab: undefined;
  NotificationsTab: NavigatorScreenParams<NotificationStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/**
 * Feed Stack
 */
export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
  Profile: { userId: string };
};

/**
 * Messaging Stack
 */
export type MessagingStackParamList = {
  ConversationList: undefined;
  MessagingList: undefined; // Alias for ConversationList
  Chat: {
    conversationId: string;
    userId?: string;
    participant?: {
      userId: number;
      fullName: string;
      profession: string;
      profileImageUrl: string | null;
      verified: boolean;
      online: boolean;
      lastSeenAt: string | null;
    };
    conversation?: {
      conversationId: string;
      participant: {
        userId: number;
        fullName: string;
        profession: string;
        profileImageUrl: string | null;
        verified: boolean;
        online: boolean;
        lastSeenAt: string | null;
      };
      lastMessage: any;
      unreadCount: number;
      updatedAt: string;
      createdAt: string;
    };
  };
  NewConversation: undefined;
};

/**
 * Notification Stack
 */
export type NotificationStackParamList = {
  Notifications: undefined;
  NotificationSettings: undefined;
  VerificationStatus: undefined;
};

/**
 * Profile Stack
 */
export type ProfileStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  AccountDeletion: undefined;
  BiometricSettings: undefined;
  BlockedUsers: undefined;
  PrivacySettings: undefined;
};

/**
 * Declare global navigation types for type-safe navigation
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
