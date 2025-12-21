// src/shared/components/Skeleton/Skeleton.tsx
// Dengin Design System - Modern Skeleton Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useEffect, useMemo } from 'react';
import { Dimensions, View, type ViewStyle, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '@contexts/ThemeContext';

import { layoutStyles, styles } from './Skeleton.styles';
import type {
  SkeletonCardProps,
  SkeletonGroupProps,
  SkeletonMessageProps,
  SkeletonPostProps,
  SkeletonProps,
} from './Skeleton.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Create animated gradient component
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * Modern Skeleton Component
 *
 * Features:
 * - Multiple animation types (shimmer, pulse, wave)
 * - Configurable variants (text, circular, rectangular, rounded)
 * - Support for multiple skeleton items
 * - Reanimated 3 for smooth 60fps animations
 *
 * @example
 * ```tsx
 * // Basic text skeleton
 * <Skeleton width="80%" height={16} />
 *
 * // Circular skeleton for avatars
 * <Skeleton variant="circular" height={40} />
 *
 * // Multiple skeletons
 * <Skeleton count={3} gap={8} height={16} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = memo(
  ({
    variant = 'text',
    width = '100%',
    height,
    borderRadius,
    animation = 'shimmer',
    animationDuration = 1500,
    count = 1,
    gap = 8,
    style,
    testID,
  }) => {
    const colors = useColors();

    // Animation values
    const shimmerProgress = useSharedValue(0);
    const pulseProgress = useSharedValue(1);

    // Start animations
    useEffect(() => {
      if (animation === 'shimmer' || animation === 'wave') {
        shimmerProgress.value = withRepeat(
          withTiming(1, {
            duration: animationDuration,
            easing: Easing.linear,
          }),
          -1,
          false,
        );
      } else if (animation === 'pulse') {
        pulseProgress.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: animationDuration / 2 }),
            withTiming(1, { duration: animationDuration / 2 }),
          ),
          -1,
          true,
        );
      }
    }, [animation, animationDuration, shimmerProgress, pulseProgress]);

    // Get variant-specific styles
    const getVariantStyles = useMemo((): ViewStyle => {
      switch (variant) {
        case 'circular': {
          const size = typeof height === 'number' ? height : 40;
          return {
            borderRadius: size / 2,
            height: size,
            width: size,
          };
        }
        case 'rectangular':
          return {
            borderRadius: borderRadius ?? 8,
            height: height ?? 100,
            width: width as DimensionValue,
          };
        case 'rounded':
          return {
            borderRadius: borderRadius ?? 12,
            height: height ?? 48,
            width: width as DimensionValue,
          };
        case 'text':
        default:
          return {
            borderRadius: borderRadius ?? 4,
            height: height ?? 16,
            width: width as DimensionValue,
          };
      }
    }, [variant, width, height, borderRadius]);

    // Shimmer animation style
    const shimmerAnimatedStyle = useAnimatedStyle(() => {
      if (animation !== 'shimmer' && animation !== 'wave') {
        return {};
      }

      const translateX = interpolate(shimmerProgress.value, [0, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]);

      return {
        transform: [{ translateX }],
      };
    });

    // Pulse animation style
    const pulseAnimatedStyle = useAnimatedStyle(() => {
      if (animation !== 'pulse') {
        return {};
      }

      return {
        opacity: pulseProgress.value,
      };
    });

    // Render single skeleton
    const renderSkeleton = (index: number) => (
      <Animated.View
        key={index}
        style={[
          styles.container,
          { backgroundColor: colors.background.tertiary },
          getVariantStyles,
          pulseAnimatedStyle,
          style,
        ]}
        testID={count === 1 ? testID : `${testID}-${index}`}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="İçerik yükleniyor"
        accessibilityState={{ busy: true }}>
        {(animation === 'shimmer' || animation === 'wave') && (
          <AnimatedLinearGradient
            colors={['transparent', colors.background.secondary, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.shimmer, shimmerAnimatedStyle]}
          />
        )}
      </Animated.View>
    );

    // Render multiple skeletons
    if (count > 1) {
      return (
        <View style={{ gap }}>{Array.from({ length: count }, (_, i) => renderSkeleton(i))}</View>
      );
    }

    return renderSkeleton(0);
  },
);

/**
 * SkeletonGroup Component
 *
 * Renders multiple skeleton lines with varying widths
 */
export const SkeletonGroup: React.FC<SkeletonGroupProps> = memo(
  ({ lines = 3, gap = 8, widthPattern = ['100%', '80%', '60%'], lineHeight = 14, style }) => {
    return (
      <View style={[layoutStyles.wrapper, { gap }, style]}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} width={widthPattern[i % widthPattern.length]} height={lineHeight} />
        ))}
      </View>
    );
  },
);

/**
 * SkeletonPost Component
 *
 * Pre-built skeleton layout for post/feed items
 */
export const SkeletonPost: React.FC<SkeletonPostProps> = memo(
  ({ showImage = true, showActions = true, style }) => {
    const colors = useColors();

    return (
      <View
        style={[layoutStyles.postContainer, { backgroundColor: colors.background.primary }, style]}>
        {/* Header */}
        <View style={layoutStyles.postHeader}>
          <Skeleton variant="circular" height={40} />
          <View style={layoutStyles.postHeaderText}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="30%" height={12} />
          </View>
        </View>

        {/* Content */}
        <View style={layoutStyles.postContent}>
          <Skeleton width="100%" height={14} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="70%" height={14} />
        </View>

        {/* Image */}
        {showImage && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            borderRadius={12}
            style={layoutStyles.postImage}
          />
        )}

        {/* Actions */}
        {showActions && (
          <View style={layoutStyles.postActions}>
            <Skeleton variant="rounded" width={60} height={32} borderRadius={16} />
            <Skeleton variant="rounded" width={60} height={32} borderRadius={16} />
            <Skeleton variant="rounded" width={60} height={32} borderRadius={16} />
          </View>
        )}
      </View>
    );
  },
);

/**
 * SkeletonMessage Component
 *
 * Pre-built skeleton layout for message/chat items
 */
export const SkeletonMessage: React.FC<SkeletonMessageProps> = memo(
  ({ isOwn = false, showAvatar = true, style }) => {
    return (
      <View style={[layoutStyles.messageContainer, isOwn && layoutStyles.ownMessage, style]}>
        {!isOwn && showAvatar && (
          <Skeleton variant="circular" height={32} style={{ marginRight: 8 }} />
        )}
        <View style={{ flex: 1, alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
          <Skeleton width={isOwn ? '60%' : '70%'} height={36} borderRadius={16} />
        </View>
      </View>
    );
  },
);

/**
 * SkeletonCard Component
 *
 * Pre-built skeleton layout for card items
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = memo(
  ({ showImage = true, imageHeight = 150, lines = 3, style }) => {
    const colors = useColors();

    return (
      <View
        style={[layoutStyles.cardContainer, { backgroundColor: colors.background.primary }, style]}>
        {showImage && (
          <Skeleton variant="rectangular" width="100%" height={imageHeight} borderRadius={8} />
        )}
        <View style={layoutStyles.cardContent}>
          <SkeletonGroup lines={lines} />
        </View>
      </View>
    );
  },
);

/**
 * SkeletonProfile Component
 *
 * Pre-built skeleton layout for profile headers
 */
export const SkeletonProfile: React.FC<{ style?: ViewStyle }> = memo(({ style }) => {
  const colors = useColors();

  return (
    <View
      style={[
        layoutStyles.profileContainer,
        { backgroundColor: colors.background.primary },
        style,
      ]}>
      <Skeleton variant="circular" height={80} />
      <View style={layoutStyles.profileInfo}>
        <Skeleton width={120} height={18} />
        <Skeleton width={80} height={14} />
      </View>
      <View style={layoutStyles.profileStats}>
        <View style={layoutStyles.statItem}>
          <Skeleton width={40} height={16} />
          <Skeleton width={60} height={12} />
        </View>
        <View style={layoutStyles.statItem}>
          <Skeleton width={40} height={16} />
          <Skeleton width={60} height={12} />
        </View>
        <View style={layoutStyles.statItem}>
          <Skeleton width={40} height={16} />
          <Skeleton width={60} height={12} />
        </View>
      </View>
    </View>
  );
});

// Display names
Skeleton.displayName = 'Skeleton';
SkeletonGroup.displayName = 'SkeletonGroup';
SkeletonPost.displayName = 'SkeletonPost';
SkeletonMessage.displayName = 'SkeletonMessage';
SkeletonCard.displayName = 'SkeletonCard';
SkeletonProfile.displayName = 'SkeletonProfile';
