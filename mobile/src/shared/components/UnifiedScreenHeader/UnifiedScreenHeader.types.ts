// src/shared/components/UnifiedScreenHeader/UnifiedScreenHeader.types.ts

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

/**
 * Unified Screen Header Variants
 */
export type UnifiedScreenHeaderVariant = 'default' | 'feed' | 'chat' | 'search' | 'profile';

/**
 * Feed Header Props
 */
export interface FeedHeaderProps {
  sector?: {
    name: string;
    code: string;
  };
  unreadCount: number;
  onSectorPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

/**
 * Chat Header Props
 */
export interface ChatHeaderProps {
  avatar?: string;
  name: string;
  subtitle?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  onProfilePress?: () => void;
  onOptionsPress?: () => void;
}

/**
 * Search Header Props
 */
export interface SearchHeaderProps {
  placeholder?: string;
  value?: string;
  onSearch?: (text: string) => void;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  autoFocus?: boolean;
}

/**
 * Profile Header Props
 */
export interface ProfileHeaderProps {
  userId: number;
  avatar?: string;
  name: string;
  profession?: string;
  isVerified?: boolean;
  stats?: {
    postCount: number;
    followerCount: number;
    followingCount: number;
  };
}

/**
 * Unified Screen Header Props
 */
export interface UnifiedScreenHeaderProps {
  /** Header variant */
  variant?: UnifiedScreenHeaderVariant;

  /** Title (for default, search variants) */
  title?: string;

  /** Subtitle (for default variant) */
  subtitle?: string;

  /** Show back button */
  showBackButton?: boolean;

  /** Custom back button press handler */
  onBackPress?: () => void;

  /** Right side element (for default variant) */
  rightElement?: ReactNode;

  /** Show bottom border */
  showBorder?: boolean;

  /** Custom background color */
  backgroundColor?: string;

  /** Feed variant props */
  feedProps?: FeedHeaderProps;

  /** Chat variant props */
  chatProps?: ChatHeaderProps;

  /** Search variant props */
  searchProps?: SearchHeaderProps;

  /** Profile variant props */
  profileProps?: ProfileHeaderProps;

  /** Additional container styles */
  style?: ViewStyle;

  /** Test ID */
  testID?: string;
}
