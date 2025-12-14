// src/shared/utils/share.ts
// Share utility for posts and content
// Uses React Native's built-in Share API

import { Share, Platform, Alert } from 'react-native';
import analyticsService, { AnalyticsEvent } from '../services/analytics';

export interface ShareContentOptions {
  title?: string;
  message: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  activity?: string;
  error?: string;
}

/**
 * Share content using native share dialog
 */
export async function shareContent(content: ShareContentOptions): Promise<ShareResult> {
  try {
    const shareOptions: { message: string; title?: string; url?: string } = {
      message: content.message,
    };

    if (content.title) {
      shareOptions.title = content.title;
    }

    // iOS supports separate URL field
    if (Platform.OS === 'ios' && content.url) {
      shareOptions.url = content.url;
    } else if (content.url) {
      // Android includes URL in message
      shareOptions.message = `${content.message}\n\n${content.url}`;
    }

    const result = await Share.share(shareOptions, {
      dialogTitle: content.title || 'Paylaş',
    });

    if (result.action === Share.sharedAction) {
      return {
        success: true,
        activity: result.activityType || undefined,
      };
    } else if (result.action === Share.dismissedAction) {
      return {
        success: false,
        error: 'dismissed',
      };
    }

    return { success: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Paylaşım başarısız';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Share a post
 */
export async function sharePost(post: {
  postId: number;
  content: string;
  author: { fullName?: string; name?: string; surname?: string };
}): Promise<ShareResult> {
  // Deep link URL for the post (adjust based on your app's deep link scheme)
  const postUrl = `dengin://post/${post.postId}`;

  // Get author display name
  const authorName =
    post.author.fullName ||
    (post.author.name && post.author.surname
      ? `${post.author.name} ${post.author.surname}`
      : 'Anonim');

  // Truncate content for sharing
  const maxLength = 200;
  const truncatedContent =
    post.content.length > maxLength ? `${post.content.substring(0, maxLength)}...` : post.content;

  const options: ShareContentOptions = {
    title: `${authorName} - Dengin`,
    message: truncatedContent,
    url: postUrl,
  };

  const result = await shareContent(options);

  if (result.success) {
    analyticsService.logEvent(AnalyticsEvent.POST_SHARED, {
      postId: post.postId,
      activity: result.activity,
    });
  }

  return result;
}

/**
 * Share user profile
 */
export async function shareProfile(profile: {
  userId: number;
  fullName: string;
  profession?: string;
}): Promise<ShareResult> {
  const profileUrl = `dengin://profile/${profile.userId}`;

  const message = profile.profession
    ? `${profile.fullName} - ${profile.profession} | Dengin`
    : `${profile.fullName} | Dengin`;

  const options: ShareContentOptions = {
    title: profile.fullName,
    message,
    url: profileUrl,
  };

  return shareContent(options);
}

/**
 * Copy text to clipboard and show feedback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Use React Native's Clipboard from @react-native-clipboard/clipboard
    // If not available, fallback to console log
    const { Clipboard } = await import('react-native');
    if (Clipboard && typeof Clipboard.setString === 'function') {
      Clipboard.setString(text);
      return true;
    }
    console.log('Clipboard not available');
    return false;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Show share error alert
 */
export function showShareError(): void {
  Alert.alert(
    'Paylaşım Başarısız',
    'İçerik paylaşılırken bir hata oluştu. Lütfen tekrar deneyin.',
    [{ text: 'Tamam' }],
  );
}
