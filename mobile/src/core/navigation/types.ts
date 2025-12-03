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
};

/**
 * Auth Stack
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
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
  NotificationsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/**
 * Feed Stack
 */
export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
};

/**
 * Messaging Stack
 */
export type MessagingStackParamList = {
  ConversationList: undefined;
  Chat: { conversationId: string };
};

/**
 * Profile Stack
 */
export type ProfileStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
};

/**
 * Declare global navigation types for type-safe navigation
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
