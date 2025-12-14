// src/core/navigation/index.ts
export { AppNavigator, navigationRef, navigate, goBack, resetNavigation } from './AppNavigator';
export { AuthNavigator } from './AuthNavigator';
export { MainNavigator } from './MainNavigator';
export { VerificationNavigator } from './VerificationNavigator';
export { linking } from './linking';

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
  navigateToVerificationIntro,
  navigateToChatFromTab,
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
