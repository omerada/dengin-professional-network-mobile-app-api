// src/shared/components/ProgressiveImage/ProgressiveImage.tsx
// Progressive image loading with blur effect
// Production-ready implementation with fade transition

import React, { memo, useState, useCallback } from 'react';
import { Image, ImageProps, StyleSheet, View, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';

export interface ProgressiveImageProps extends Omit<ImageProps, 'source'> {
  /** High-resolution image source */
  source: { uri?: string } | number;
  /** Low-resolution thumbnail for blur effect (optional) */
  thumbnail?: { uri?: string } | number;
  /** Fade duration in ms */
  fadeDuration?: number;
  /** Show loading indicator */
  showLoadingIndicator?: boolean;
  /** Fallback placeholder when image fails to load */
  fallbackPlaceholder?: React.ReactNode;
}

/**
 * ProgressiveImage Component
 *
 * Features:
 * - Smooth fade-in animation
 * - Optional thumbnail blur effect
 * - Loading indicator
 * - Error state handling
 * - Unified timing (200ms fade)
 *
 * @example
 * ```tsx
 * <ProgressiveImage
 *   source={{ uri: post.imageUrl }}
 *   thumbnail={{ uri: post.thumbnailUrl }}
 *   style={styles.postImage}
 * />
 * ```
 */
export const ProgressiveImage = memo<ProgressiveImageProps>(
  ({
    source,
    thumbnail,
    fadeDuration = UNIFIED_TIMING.componentEnter, // 200ms
    showLoadingIndicator = true,
    fallbackPlaceholder,
    style,
    ...imageProps
  }) => {
    const colors = useColors();
    const [fullImageLoaded, setFullImageLoaded] = useState(false);
    const [error, setError] = useState(false);

    const handleThumbnailLoad = useCallback(() => {
      // Thumbnail loaded - no state needed for now
    }, []);

    const handleFullImageLoad = useCallback(() => {
      setFullImageLoaded(true);
    }, []);

    const handleError = useCallback(() => {
      setError(true);
    }, []);

    // Error state - show fallback
    if (error) {
      if (fallbackPlaceholder) {
        return <View style={[styles.container, style]}>{fallbackPlaceholder}</View>;
      }
      return (
        <View style={[styles.container, styles.errorContainer, style]}>
          <View style={[styles.placeholderIcon, { backgroundColor: colors.background.secondary }]}>
            <ActivityIndicator size="small" color={colors.text.tertiary} />
          </View>
        </View>
      );
    }

    // No source - show placeholder
    if (!source || (typeof source === 'object' && !source.uri)) {
      if (fallbackPlaceholder) {
        return <View style={[styles.container, style]}>{fallbackPlaceholder}</View>;
      }
      return (
        <View
          style={[
            styles.container,
            styles.placeholderContainer,
            { backgroundColor: colors.background.secondary },
            style,
          ]}
        />
      );
    }

    return (
      <View style={[styles.container, style]}>
        {/* Thumbnail with blur effect */}
        {thumbnail && !fullImageLoaded && (
          <Image
            source={thumbnail}
            style={[styles.image, styles.thumbnail]}
            onLoad={handleThumbnailLoad}
            blurRadius={2}
            fadeDuration={0}
          />
        )}

        {/* Full resolution image */}
        <Animated.Image
          {...imageProps}
          source={source}
          style={[styles.image, style]}
          onLoad={handleFullImageLoad}
          onError={handleError}
          entering={FadeIn.duration(fadeDuration)}
          fadeDuration={0} // Disable default fade, use Reanimated
        />

        {/* Loading indicator */}
        {showLoadingIndicator && !fullImageLoaded && !error && (
          <Animated.View
            entering={FadeIn.duration(150)}
            style={[
              styles.loadingOverlay,
              { backgroundColor: colors.background.overlay || 'rgba(0, 0, 0, 0.3)' },
            ]}>
            <ActivityIndicator size="small" color={colors.text.inverse} />
          </Animated.View>
        )}
      </View>
    );
  },
);

ProgressiveImage.displayName = 'ProgressiveImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  loadingOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  thumbnail: {
    position: 'absolute',
  },
});

export default ProgressiveImage;
