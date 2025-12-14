// src/shared/components/EmptyState/EmptyStatePresets.tsx
// Production-ready EmptyState presets with easy-to-use API
// Oku: UX-FLOW-IYILESTIRME-PLANI.md - Phase 2

import React from 'react';
import { ViewStyle } from 'react-native';
import { EmptyState } from './EmptyState';
import { EMPTY_STATE_PRESETS } from '@constants/emptyStatePresets';

// ============================================================================
// Types
// ============================================================================

export type EmptyStatePresetType = keyof typeof EMPTY_STATE_PRESETS;

export interface EmptyStatePresetProps {
  /** Preset type to use */
  preset: EmptyStatePresetType;
  /** Optional action handler (required if preset has action) */
  onAction?: () => void;
  /** Optional secondary action handler */
  onSecondaryAction?: () => void;
  /** Override title */
  title?: string;
  /** Override description */
  description?: string;
  /** Override icon */
  icon?: string;
  /** Override icon color */
  iconColor?: string;
  /** Additional container styles */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * EmptyStatePreset
 *
 * Easy-to-use wrapper for EmptyState component with standardized presets.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmptyStatePreset preset="emptyFeed" onAction={handleCreatePost} />
 *
 * // With overrides
 * <EmptyStatePreset
 *   preset="networkError"
 *   title="Custom Title"
 *   description="Custom description"
 * />
 *
 * // No action preset
 * <EmptyStatePreset preset="emptyNotifications" />
 * ```
 */
export const EmptyStatePreset: React.FC<EmptyStatePresetProps> = ({
  preset,
  onAction,
  title,
  description,
  icon,
  iconColor,
  style,
  testID,
}) => {
  const presetConfig = EMPTY_STATE_PRESETS[preset];

  if (!presetConfig) {
    console.warn(`EmptyStatePreset: Unknown preset "${preset}"`);
    return null;
  }

  // Build action config
  const action = presetConfig.action
    ? {
        ...presetConfig.action,
        onPress: onAction || (() => {}),
      }
    : undefined;

  return (
    <EmptyState
      icon={icon || presetConfig.icon}
      iconColor={iconColor}
      title={title || presetConfig.title}
      description={description || presetConfig.description}
      action={action}
      animated
      floatingIcon
      style={style}
      testID={testID || `empty-state-${preset}`}
    />
  );
};

// ============================================================================
// Specialized Preset Components
// ============================================================================

/**
 * EmptyFeed - No posts in feed
 */
export const EmptyFeed: React.FC<{
  onCreatePost?: () => void;
  style?: ViewStyle;
}> = ({ onCreatePost, style }) => (
  <EmptyStatePreset preset="emptyFeed" onAction={onCreatePost} style={style} />
);

/**
 * EmptyNotifications - No notifications
 */
export const EmptyNotifications: React.FC<{
  style?: ViewStyle;
}> = ({ style }) => <EmptyStatePreset preset="emptyNotifications" style={style} />;

/**
 * EmptyMessages - No messages
 */
export const EmptyMessages: React.FC<{
  onNewConversation?: () => void;
  style?: ViewStyle;
}> = ({ onNewConversation, style }) => (
  <EmptyStatePreset preset="emptyMessages" onAction={onNewConversation} style={style} />
);

/**
 * EmptyConversations - No conversations
 */
export const EmptyConversations: React.FC<{
  onStartChat?: () => void;
  style?: ViewStyle;
}> = ({ onStartChat, style }) => (
  <EmptyStatePreset preset="emptyConversations" onAction={onStartChat} style={style} />
);

/**
 * SearchNoResults - Search returned no results
 */
export const SearchNoResults: React.FC<{
  query?: string;
  style?: ViewStyle;
}> = ({ query, style }) => (
  <EmptyStatePreset
    preset="searchNoResults"
    description={query ? `"${query}" için sonuç bulunamadı` : undefined}
    style={style}
  />
);

/**
 * EmptyActivity - No activity yet
 */
export const EmptyActivity: React.FC<{
  style?: ViewStyle;
}> = ({ style }) => <EmptyStatePreset preset="emptyActivity" style={style} />;

/**
 * EmptyPosts - User has no posts
 */
export const EmptyPosts: React.FC<{
  isOwnProfile?: boolean;
  onCreatePost?: () => void;
  style?: ViewStyle;
}> = ({ isOwnProfile, onCreatePost, style }) => (
  <EmptyStatePreset
    preset="emptyPosts"
    title={isOwnProfile ? 'Henüz gönderi yok' : undefined}
    description={isOwnProfile ? 'İlk gönderinizi oluşturun' : 'Bu kullanıcının henüz gönderisi yok'}
    onAction={isOwnProfile ? onCreatePost : undefined}
    style={style}
  />
);

/**
 * EmptyFollowers - User has no followers
 */
export const EmptyFollowers: React.FC<{
  style?: ViewStyle;
}> = ({ style }) => <EmptyStatePreset preset="emptyFollowers" style={style} />;

/**
 * EmptyFollowing - User is not following anyone
 */
export const EmptyFollowing: React.FC<{
  onExplore?: () => void;
  style?: ViewStyle;
}> = ({ onExplore, style }) => (
  <EmptyStatePreset preset="emptyFollowing" onAction={onExplore} style={style} />
);

/**
 * NetworkError - No internet connection
 */
export const NetworkError: React.FC<{
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ onRetry, style }) => (
  <EmptyStatePreset
    preset="networkError"
    onAction={onRetry}
    title={onRetry ? 'Bağlantı yok' : undefined}
    description={onRetry ? 'İnternet bağlantınızı kontrol edin ve tekrar deneyin' : undefined}
    style={style}
  />
);

/**
 * ComingSoon - Feature coming soon
 */
export const ComingSoon: React.FC<{
  featureName?: string;
  style?: ViewStyle;
}> = ({ featureName, style }) => (
  <EmptyStatePreset
    preset="comingSoon"
    description={featureName ? `${featureName} özelliği yakında gelecek` : undefined}
    style={style}
  />
);
