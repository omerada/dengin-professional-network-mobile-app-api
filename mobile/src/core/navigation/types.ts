// src/core/navigation/types.ts
// UNIFIED Navigation Types - Single Source of Truth
// Oku: mobile-development-guide/core/09-NAVIGATION.md

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';

/**
 * Root Stack Parameter List
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Verification: NavigatorScreenParams<VerificationStackParamList>;
  // Deep link screens (top-level for direct navigation)
  NotificationSettings: undefined;
  VerificationStatus: undefined;
  PostDetail: { postId: number };
  Profile: { userId?: number };
  Chat: { conversationId: string };
  MatchDetail: { matchId: string };
};

/**
 * Auth Stack Parameter List
 */
export type AuthStackParamList = {
  Onboarding: { initialSlide?: number } | undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  WelcomeSuccess: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
  Terms: undefined;
  Privacy: undefined;
  BiometricSetup: undefined;
};

/**
 * Verification Stack Parameter List
 */
export type VerificationStackParamList = {
  VerificationIntro: undefined;
  DocumentType: undefined;
  DocumentCapture: { documentType: string; side: 'front' | 'back' };
  SelfieCapture: undefined;
  VerificationReview: undefined;
  VerificationStatus: undefined;
  UploadStatus: undefined;
};

/**
 * Main Tab Parameter List
 */
export type MainTabParamList = {
  FeedTab: NavigatorScreenParams<FeedStackParamList>;
  MessagingTab: NavigatorScreenParams<MessagingStackParamList>;
  CreatePostTab: undefined;
  ActivityTab: undefined;
  NotificationsTab: NavigatorScreenParams<NotificationsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/**
 * Feed Stack Parameter List - Backend API uyumlu
 */
export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { postId: number }; // Backend API: postId: number
  CreatePost: undefined;
  UserProfile: { userId: number }; // Backend API: userId: number
  Comments: { postId: number }; // Backend API: postId: number
  Notifications: undefined;
  NotificationSettings: undefined;
  VerificationStatus: undefined;
  NewConversation: undefined; // Kullanıcı arama ekranı
};

/**
 * Messaging Stack Parameter List
 */
export type MessagingStackParamList = {
  ConversationList: undefined;
  MessagingList: undefined; // Alias for ConversationList
  Chat: {
    conversationId: string;
    userId?: string;
    participantName?: string;
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
 * Notifications Stack Parameter List
 */
export type NotificationsStackParamList = {
  Notifications: undefined;
  NotificationSettings: undefined;
};

/**
 * Profile Stack Parameter List
 */
export type ProfileStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  BlockedUsers: undefined;
  About: undefined;
  AccountDeletion: undefined;
  BiometricSettings: undefined;
};

// ============================================================================
// Navigation Prop Types
// ============================================================================

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type FeedStackNavigationProp = NativeStackNavigationProp<FeedStackParamList>;
export type MessagingStackNavigationProp = NativeStackNavigationProp<MessagingStackParamList>;
export type NotificationsStackNavigationProp =
  NativeStackNavigationProp<NotificationsStackParamList>;
export type ProfileStackNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;
export type VerificationStackNavigationProp = NativeStackNavigationProp<VerificationStackParamList>;

// ============================================================================
// Route Prop Types
// ============================================================================

export type AuthStackRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;
export type FeedStackRouteProp<T extends keyof FeedStackParamList> = RouteProp<
  FeedStackParamList,
  T
>;
export type MessagingStackRouteProp<T extends keyof MessagingStackParamList> = RouteProp<
  MessagingStackParamList,
  T
>;
export type NotificationsStackRouteProp<T extends keyof NotificationsStackParamList> = RouteProp<
  NotificationsStackParamList,
  T
>;
export type ProfileStackRouteProp<T extends keyof ProfileStackParamList> = RouteProp<
  ProfileStackParamList,
  T
>;
export type VerificationStackRouteProp<T extends keyof VerificationStackParamList> = RouteProp<
  VerificationStackParamList,
  T
>;

/**
 * Declare global navigation types for type-safe navigation
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
