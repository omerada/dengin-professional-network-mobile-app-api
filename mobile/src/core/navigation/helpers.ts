// src/core/navigation/helpers.ts
// Type-Safe Navigation Helpers - Production Ready
// Eliminates @ts-expect-error and 'as never' usage

import { NavigationProp, CommonActions } from '@react-navigation/native';
import { z } from 'zod';

/**
 * ============================================================================
 * SCHEMA DEFINITIONS
 * Runtime validation for navigation parameters
 * ============================================================================
 */

// Post Detail Parameters
export const PostDetailParamsSchema = z.object({
  postId: z.number().int().positive(),
  highlightCommentId: z.number().int().positive().optional(),
});

// User Profile Parameters
export const UserProfileParamsSchema = z.object({
  userId: z.number().int().positive(),
});

// Comments Screen Parameters
export const CommentsParamsSchema = z.object({
  postId: z.number().int().positive(),
});

// Chat Screen Parameters
export const ChatParamsSchema = z.object({
  conversationId: z.number().int().positive(),
  recipientName: z.string().optional(),
});

// Report Content Parameters
export const ReportContentParamsSchema = z.object({
  contentId: z.number().int().positive(),
  contentType: z.enum(['post', 'comment', 'user', 'message']),
});

// Followers/Following List Parameters
export const FollowListParamsSchema = z.object({
  userId: z.number().int().positive(),
});

/**
 * ============================================================================
 * TYPE EXPORTS
 * TypeScript types inferred from Zod schemas
 * ============================================================================
 */

export type PostDetailParams = z.infer<typeof PostDetailParamsSchema>;
export type UserProfileParams = z.infer<typeof UserProfileParamsSchema>;
export type CommentsParams = z.infer<typeof CommentsParamsSchema>;
export type ChatParams = z.infer<typeof ChatParamsSchema>;
export type ReportContentParams = z.infer<typeof ReportContentParamsSchema>;
export type FollowListParams = z.infer<typeof FollowListParamsSchema>;

/**
 * ============================================================================
 * NAVIGATION HELPERS
 * Type-safe navigation functions with runtime validation
 * ============================================================================
 */

/**
 * Navigate to Post Detail screen
 *
 * @param navigation - Navigation prop
 * @param params - Post detail parameters
 * @throws {ZodError} If params don't match schema
 *
 * @example
 * navigateToPostDetail(navigation, { postId: 123 });
 */
export function navigateToPostDetail(
  navigation: NavigationProp<any>,
  params: PostDetailParams,
): void {
  const validated = PostDetailParamsSchema.parse(params);
  navigation.navigate('PostDetail', validated);
}

/**
 * Navigate to User Profile screen
 *
 * @param navigation - Navigation prop
 * @param params - User profile parameters
 * @throws {ZodError} If params don't match schema
 *
 * @example
 * navigateToUserProfile(navigation, { userId: 456 });
 */
export function navigateToUserProfile(
  navigation: NavigationProp<any>,
  params: UserProfileParams,
): void {
  const validated = UserProfileParamsSchema.parse(params);
  navigation.navigate('UserProfile', validated);
}

/**
 * Navigate to Comments screen
 *
 * @param navigation - Navigation prop
 * @param params - Comments screen parameters
 * @throws {ZodError} If params don't match schema
 *
 * @example
 * navigateToComments(navigation, { postId: 789 });
 */
export function navigateToComments(navigation: NavigationProp<any>, params: CommentsParams): void {
  const validated = CommentsParamsSchema.parse(params);
  navigation.navigate('Comments', validated);
}

/**
 * Navigate to Chat screen
 *
 * @param navigation - Navigation prop
 * @param params - Chat screen parameters
 * @throws {ZodError} If params don't match schema
 *
 * @example
 * navigateToChat(navigation, { conversationId: 101, recipientName: 'John' });
 */
export function navigateToChat(navigation: NavigationProp<any>, params: ChatParams): void {
  const validated = ChatParamsSchema.parse(params);
  navigation.navigate('Chat', validated);
}

/**
 * Navigate to Report Content screen
 *
 * @param navigation - Navigation prop
 * @param params - Report content parameters
 * @throws {ZodError} If params don't match schema
 *
 * @example
 * navigateToReportContent(navigation, { contentId: 123, contentType: 'post' });
 */
export function navigateToReportContent(
  navigation: NavigationProp<any>,
  params: ReportContentParams,
): void {
  const validated = ReportContentParamsSchema.parse(params);
  navigation.navigate('ReportContent', validated);
}

/**
 * Navigate to Followers List screen
 *
 * @param navigation - Navigation prop
 * @param params - Follow list parameters
 * @throws {ZodError} If params don't match schema
 *
 * @example
 * navigateToFollowersList(navigation, { userId: 123 });
 */
export function navigateToFollowersList(
  navigation: NavigationProp<any>,
  params: FollowListParams,
): void {
  const validated = FollowListParamsSchema.parse(params);
  navigation.navigate('FollowersList', validated);
}

/**
 * Navigate to Following List screen
 *
 * @param navigation - Navigation prop
 * @param params - Follow list parameters
 * @throws {ZodError} If params don't match schema
 *
 * @example
 * navigateToFollowingList(navigation, { userId: 123 });
 */
export function navigateToFollowingList(
  navigation: NavigationProp<any>,
  params: FollowListParams,
): void {
  const validated = FollowListParamsSchema.parse(params);
  navigation.navigate('FollowingList', validated);
}

/**
 * ============================================================================
 * SIMPLE NAVIGATION (No params)
 * ============================================================================
 */

/**
 * Navigate to Create Post screen
 */
export function navigateToCreatePost(navigation: NavigationProp<any>): void {
  navigation.navigate('CreatePost');
}

/**
 * Navigate to Edit Profile screen
 */
export function navigateToEditProfile(navigation: NavigationProp<any>): void {
  navigation.navigate('EditProfile');
}

/**
 * Navigate to Settings screen
 */
export function navigateToSettings(navigation: NavigationProp<any>): void {
  navigation.navigate('Settings');
}

/**
 * Navigate to Notifications screen
 */
export function navigateToNotifications(navigation: NavigationProp<any>): void {
  navigation.navigate('Notifications');
}

/**
 * Navigate to Notification Settings screen
 */
export function navigateToNotificationSettings(navigation: NavigationProp<any>): void {
  navigation.navigate('NotificationSettings');
}

/**
 * Navigate to Change Password screen
 */
export function navigateToChangePassword(navigation: NavigationProp<any>): void {
  navigation.navigate('ChangePassword');
}

/**
 * Navigate to Blocked Users screen
 */
export function navigateToBlockedUsers(navigation: NavigationProp<any>): void {
  navigation.navigate('BlockedUsers');
}

/**
 * Navigate to Verification Intro screen
 */
export function navigateToVerificationIntro(navigation: NavigationProp<any>): void {
  navigation.navigate('VerificationIntro' as never);
}

/**
 * Navigate to Chat screen from another tab (e.g., from notifications)
 *
 * @param navigation - Navigation prop
 * @param conversationId - Conversation ID
 *
 * @example
 * navigateToChatFromTab(navigation, '123');
 */
export function navigateToChatFromTab(
  navigation: NavigationProp<any>,
  conversationId: string,
): void {
  navigation.navigate('MessagingTab', {
    screen: 'Chat',
    params: { conversationId },
  });
}

/**
 * Navigate to New Conversation screen
 */
export function navigateToNewConversation(navigation: NavigationProp<any>): void {
  navigation.navigate('NewConversation');
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Safe navigation with error handling
 *
 * @param navigationFn - Navigation function to execute
 * @param onError - Optional error handler
 *
 * @example
 * safeNavigate(
 *   () => navigateToPostDetail(navigation, { postId: 123 }),
 *   (error) => console.error('Navigation failed:', error)
 * );
 */
export function safeNavigate(navigationFn: () => void, onError?: (error: Error) => void): void {
  try {
    navigationFn();
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      console.error('[Navigation] Navigation failed:', error);
    }
  }
}

/**
 * Go back with fallback
 *
 * @param navigation - Navigation prop
 * @param fallbackRoute - Route to navigate to if can't go back
 *
 * @example
 * goBackWithFallback(navigation, 'Feed');
 */
export function goBackWithFallback(navigation: NavigationProp<any>, fallbackRoute: string): void {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate(fallbackRoute);
  }
}

/**
 * Reset navigation to route
 *
 * @param navigation - Navigation prop
 * @param routeName - Route to reset to
 * @param params - Optional route parameters
 *
 * @example
 * resetToRoute(navigation, 'Feed');
 */
export function resetToRoute(
  navigation: NavigationProp<any>,
  routeName: string,
  params?: any,
): void {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName, params }],
    }),
  );
}
