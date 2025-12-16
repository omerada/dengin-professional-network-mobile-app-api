// src/core/navigation/index.ts
export { AppNavigator } from './AppNavigator';
export { AuthNavigator } from './AuthNavigator';
export { MainNavigator } from './MainNavigator';
export { VerificationNavigator } from './VerificationNavigator';
export { linking } from './linking';
export { navigationRef, navigate, goBack, reset as resetNavigation } from './navigationRef';
export * from './types';

// Type-safe navigation helpers
export {
  navigateToPostDetail,
  navigateToUserProfile,
  navigateToComments,
  navigateToChat,
  navigateToReportContent,
  navigateToFollowersList,
  navigateToFollowingList,
  navigateToCreatePost,
  navigateToEditProfile,
  navigateToSettings,
  navigateToNotifications,
  navigateToNotificationSettings,
  navigateToChangePassword,
  navigateToBlockedUsers,
  navigateToPrivacySettings,
  navigateToBiometricSettings,
  navigateToAccountDeletion,
  navigateToVerificationIntro,
  navigateToNewConversation,
  safeNavigate,
  goBackWithFallback,
  resetToRoute,
  type PostDetailParams,
  type UserProfileParams,
  type CommentsParams,
  type ChatParams,
  type ReportContentParams,
  type FollowListParams,
} from './helpers';
