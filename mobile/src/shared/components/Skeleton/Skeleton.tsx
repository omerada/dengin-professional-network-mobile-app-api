// src/shared/components/Skeleton/Skeleton.tsx
// Shimmer loading placeholder
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  /**
   * Shape variant of the skeleton
   * @default 'text'
   */
  variant?: SkeletonVariant;
  /**
   * Width of the skeleton (number or percentage string)
   * @default '100%'
   */
  width?: number | string;
  /**
   * Height of the skeleton
   */
  height?: number;
  /**
   * Border radius override
   */
  borderRadius?: number;
  /**
   * Additional container styles
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Skeleton Component
 *
 * Shimmer loading placeholder for content loading states.
 * Provides visual feedback while data is being fetched.
 *
 * @example
 * ```tsx
 * // Text skeleton
 * <Skeleton width="80%" height={16} />
 *
 * // Circular skeleton (for avatars)
 * <Skeleton variant="circular" height={40} />
 *
 * // Rectangular skeleton (for images)
 * <Skeleton variant="rectangular" width={100} height={100} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = memo(
  ({ variant = 'text', width = '100%', height, borderRadius, style, testID }) => {
    const { theme } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      );
      animation.start();
      return () => animation.stop();
    }, [shimmerAnim]);

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'circular':
          const size = typeof height === 'number' ? height : 40;
          return {
            width: size,
            height: size,
            borderRadius: size / 2,
          };
        case 'rectangular':
          return {
            width,
            height: height || 100,
            borderRadius: borderRadius || 8,
          };
        case 'text':
        default:
          return {
            width,
            height: height || 16,
            borderRadius: borderRadius || 4,
          };
      }
    };

    const translateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.neutral[200] },
          getVariantStyles(),
          style,
        ]}
        testID={testID}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="İçerik yükleniyor"
        accessibilityState={{ busy: true }}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: theme.colors.neutral[100],
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  },
);

/**
 * SkeletonPost Component
 *
 * Pre-built skeleton layout for post/feed items
 */
export const SkeletonPost: React.FC = memo(() => {
  const { theme } = useTheme();

  return (
    <View
      style={[skeletonStyles.postContainer, { backgroundColor: theme.colors.background.primary }]}>
      <View style={skeletonStyles.header}>
        <Skeleton variant="circular" height={40} />
        <View style={skeletonStyles.headerText}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="30%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
      <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
});

/**
 * SkeletonMessage Component
 *
 * Pre-built skeleton layout for message/chat items
 */
export const SkeletonMessage: React.FC<{ isOwn?: boolean }> = memo(({ isOwn = false }) => {
  return (
    <View style={[skeletonStyles.messageContainer, isOwn && skeletonStyles.ownMessage]}>
      {!isOwn && <Skeleton variant="circular" height={32} style={{ marginRight: 8 }} />}
      <View style={{ flex: 1, alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
        <Skeleton width={isOwn ? '60%' : '70%'} height={36} borderRadius={16} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
  },
});

const skeletonStyles = StyleSheet.create({
  postContainer: {
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  ownMessage: {
    flexDirection: 'row-reverse',
  },
});

Skeleton.displayName = 'Skeleton';
SkeletonPost.displayName = 'SkeletonPost';
SkeletonMessage.displayName = 'SkeletonMessage';
