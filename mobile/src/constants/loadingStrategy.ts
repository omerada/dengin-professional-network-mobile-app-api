// src/constants/loadingStrategy.ts
// Loading State Strategy - Production Ready
// Defines which loading component to use for each screen type

/**
 * LOADING STRATEGY CONFIGURATION
 *
 * Determines optimal loading UX per screen type:
 * - skeleton: Content placeholder (best for list/feed screens)
 * - spinner: Activity indicator (best for detail screens)
 * - inline: Inline loader (best for actions/buttons)
 * - overlay: Full screen overlay (best for critical operations)
 */

export type LoadingStrategy = 'skeleton' | 'spinner' | 'inline' | 'overlay';

export const LOADING_STRATEGY: Record<string, LoadingStrategy> = {
  // ============================================================================
  // List/Feed Screens - Use Skeleton
  // ============================================================================
  feed: 'skeleton',
  conversations: 'skeleton',
  notifications: 'skeleton',
  followers: 'skeleton',
  following: 'skeleton',

  // ============================================================================
  // Detail Screens - Use Spinner
  // ============================================================================
  postDetail: 'spinner',
  profile: 'spinner',
  chat: 'spinner',
  settings: 'spinner',

  // ============================================================================
  // Action Screens - Use Overlay
  // ============================================================================
  createPost: 'overlay',
  editProfile: 'overlay',
  verification: 'overlay',

  // ============================================================================
  // Auth Screens - Use Spinner
  // ============================================================================
  login: 'spinner',
  register: 'spinner',
  forgotPassword: 'spinner',
} as const;

/**
 * Get loading strategy for screen
 *
 * @param screenName - Name of the screen
 * @returns Loading strategy type
 *
 * @example
 * const strategy = getLoadingStrategy('feed');
 * // Returns 'skeleton'
 */
export function getLoadingStrategy(screenName: string): LoadingStrategy {
  return LOADING_STRATEGY[screenName] || 'spinner'; // Default to spinner
}

/**
 * Loading message configuration
 * User-friendly messages per screen type
 */
export const LOADING_MESSAGES: Record<string, string> = {
  feed: 'Gönderiler yükleniyor...',
  postDetail: 'Gönderi yükleniyor...',
  profile: 'Profil yükleniyor...',
  chat: 'Mesajlar yükleniyor...',
  conversations: 'Sohbetler yükleniyor...',
  notifications: 'Bildirimler yükleniyor...',
  createPost: 'Gönderi paylaşılıyor...',
  editProfile: 'Profil güncelleniyor...',
  login: 'Giriş yapılıyor...',
  register: 'Hesap oluşturuluyor...',
  verification: 'Doğrulama yapılıyor...',
  default: 'Yükleniyor...',
} as const;

/**
 * Get loading message for screen
 *
 * @param screenName - Name of the screen
 * @returns User-friendly loading message
 *
 * @example
 * const message = getLoadingMessage('feed');
 * // Returns 'Gönderiler yükleniyor...'
 */
export function getLoadingMessage(screenName: string): string {
  return LOADING_MESSAGES[screenName] || LOADING_MESSAGES.default;
}
