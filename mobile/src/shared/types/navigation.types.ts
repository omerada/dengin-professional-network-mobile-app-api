// src/shared/types/navigation.types.ts
// Oku: mobile-development-guide/core/09-NAVIGATION.md

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

/**
 * Root Stack Parameter List
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Verification: NavigatorScreenParams<VerificationStackParamList>;
};

/**
 * Auth Stack Parameter List
 */
export type AuthStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  WelcomeSuccess: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
  Terms: undefined;
  Privacy: undefined;
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
  Notifications: undefined; // Bildirimler ekranı
  NotificationSettings: undefined; // Bildirim ayarları
  VerificationStatus: undefined; // Doğrulama durumu
  NewConversation: undefined; // Kullanıcı arama ekranı (Ana Sayfa'dan erişim için)
};

/**
 * Messaging Stack Parameter List
 */
export type MessagingStackParamList = {
  ConversationList: undefined;
  Chat: { conversationId: string; participantName?: string };
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
};

// Navigation Prop Types
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type FeedStackNavigationProp = NativeStackNavigationProp<FeedStackParamList>;
export type MessagingStackNavigationProp = NativeStackNavigationProp<MessagingStackParamList>;
export type ProfileStackNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;
export type VerificationStackNavigationProp = NativeStackNavigationProp<VerificationStackParamList>;

// Route Prop Types
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
export type ProfileStackRouteProp<T extends keyof ProfileStackParamList> = RouteProp<
  ProfileStackParamList,
  T
>;
export type VerificationStackRouteProp<T extends keyof VerificationStackParamList> = RouteProp<
  VerificationStackParamList,
  T
>;
