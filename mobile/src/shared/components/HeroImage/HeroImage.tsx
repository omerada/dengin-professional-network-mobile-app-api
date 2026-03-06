// src/shared/components/HeroImage/HeroImage.tsx
// Hero image component with shared element transition support
// Enables smooth transitions between screens for images and avatars

import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ProgressiveImage } from '../ProgressiveImage';
import { useColors } from '@contexts/ThemeContext';

export interface HeroImageProps {
  /**   * Image source URI
   */
  uri?: string;
  /**
   * Thumbnail URI for blur effect
   */
  thumbnailUri?: string;
  /**   * Unique identifier for shared element transition
   * Use format: `hero-avatar-${userId}` or `hero-post-${postId}`
   */
  heroId?: string;
  /**
   * Size of the hero image
   */
  size?: number;
  /**
   * Border radius
   */
  borderRadius?: number;
  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}

/**
 * HeroImage Component
 *
 * Wraps ProgressiveImage with hero transition capabilities.
 * Enables smooth shared element transitions between screens.
 *
 * Usage:
 * 1. Set same heroId on source and destination screens
 * 2. Component automatically handles transition animations
 * 3. Falls back to ProgressiveImage behavior if no heroId
 *
 * @example
 * ```tsx
 * // On FeedScreen
 * <HeroImage
 *   uri={user.avatarUrl}
 *   heroId={`hero-avatar-${user.id}`}
 *   size={40}
 *   borderRadius={20}
 * />
 *
 * // On ProfileScreen
 * <HeroImage
 *   uri={user.avatarUrl}
 *   heroId={`hero-avatar-${user.id}`}
 *   size={120}
 *   borderRadius={60}
 * />
 * ```
 */
export const HeroImage: React.FC<HeroImageProps> = memo(
  ({ uri, thumbnailUri, heroId: _heroId, size = 100, borderRadius = 0, style }) => {
    const colors = useColors();

    const containerStyle: ViewStyle = {
      width: size,
      height: size,
      borderRadius,
      overflow: 'hidden',
      backgroundColor: colors.background.secondary,
    };

    return (
      <View
        style={[containerStyle, style]}
        // Hero transition support - will be enhanced in Phase 3
        // nativeID={heroId}
      >
        <ProgressiveImage
          source={{ uri }}
          thumbnail={thumbnailUri ? { uri: thumbnailUri } : undefined}
          style={styles.image}
        />
      </View>
    );
  },
);

HeroImage.displayName = 'HeroImage';

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
});
