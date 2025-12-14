// src/features/feed/components/DoubleTapLike.tsx
// Dengin Design System - Instagram Style Double Tap Like
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useTheme } from '@contexts/ThemeContext';

// ============================================================================
// Types
// ============================================================================

interface DoubleTapLikeProps {
  /** Child content (usually an image or video) */
  children: React.ReactNode;
  /** Whether the content is already liked */
  isLiked: boolean;
  /** Callback when double-tap triggers a like */
  onDoubleTap: () => void;
  /** Optional single tap callback */
  onSingleTap?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Heart icon size */
  heartSize?: number;
  /** Heart icon color */
  heartColor?: string;
  /** Duration before heart fades out (ms) */
  heartDuration?: number;
  /** Disable double tap */
  disabled?: boolean;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// DoubleTapLike Component
// ============================================================================

/**
 * Instagram-style Double Tap Like Component
 *
 * Features:
 * - Double tap to like with animated heart
 * - Supports single tap for other actions
 * - Heavy haptic feedback on like
 * - Smooth spring animations
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <DoubleTapLike
 *   isLiked={post.isLiked}
 *   onDoubleTap={() => likePost(post.id)}
 *   onSingleTap={() => navigateToPost(post.id)}
 * >
 *   <Image source={post.image} style={styles.image} />
 * </DoubleTapLike>
 * ```
 */
export const DoubleTapLike = memo<DoubleTapLikeProps>(
  ({
    children,
    isLiked,
    onDoubleTap,
    onSingleTap,
    style,
    heartSize = 100,
    heartColor,
    heartDuration = 1000,
    disabled = false,
    testID,
  }) => {
    const { colors } = useTheme();
    const { heavy } = useHaptic();

    // Animation values
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);
    const heartRotation = useSharedValue(0);

    // Track tap position for heart placement
    const tapX = useSharedValue(0);
    const tapY = useSharedValue(0);

    // Resolved heart color
    const resolvedHeartColor = heartColor ?? colors.status.error;

    // Animate heart appearance
    const showHeart = useCallback(() => {
      // Only trigger if not already liked
      if (!isLiked) {
        heavy(); // Instagram-style heavy haptic
      }

      // Reset values
      heartRotation.value = -10;
      heartOpacity.value = 1;

      // Animate in with spring
      heartScale.value = withSequence(
        withSpring(1.2, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 }),
      );

      // Slight rotation wobble
      heartRotation.value = withSequence(
        withSpring(10, { damping: 6, stiffness: 200 }),
        withSpring(-5, { damping: 8, stiffness: 200 }),
        withSpring(0, { damping: 10, stiffness: 200 }),
      );

      // Fade out after duration
      heartOpacity.value = withDelay(heartDuration, withTiming(0, { duration: 300 }));

      heartScale.value = withDelay(heartDuration, withTiming(0, { duration: 300 }));

      // Trigger callback
      onDoubleTap();
    }, [heavy, isLiked, heartScale, heartOpacity, heartRotation, heartDuration, onDoubleTap]);

    // Handle single tap
    const handleSingleTap = useCallback(() => {
      if (onSingleTap) {
        onSingleTap();
      }
    }, [onSingleTap]);

    // Double tap gesture - using .runOnJS(true) for modern pattern
    const doubleTapGesture = useMemo(
      () =>
        Gesture.Tap()
          .numberOfTaps(2)
          .enabled(!disabled)
          .runOnJS(true)
          .onStart(event => {
            tapX.value = event.x;
            tapY.value = event.y;
          })
          .onEnd(() => {
            showHeart();
          }),
      [disabled, tapX, tapY, showHeart],
    );

    // Single tap gesture - using .runOnJS(true) for modern pattern
    const singleTapGesture = useMemo(
      () =>
        Gesture.Tap()
          .numberOfTaps(1)
          .enabled(!disabled && !!onSingleTap)
          .requireExternalGestureToFail(doubleTapGesture)
          .runOnJS(true)
          .onEnd(() => {
            handleSingleTap();
          }),
      [disabled, onSingleTap, doubleTapGesture, handleSingleTap],
    );

    // Compose gestures
    const composedGesture = useMemo(
      () => Gesture.Exclusive(doubleTapGesture, singleTapGesture),
      [doubleTapGesture, singleTapGesture],
    );

    // Animated heart style
    const heartAnimatedStyle = useAnimatedStyle(() => ({
      opacity: heartOpacity.value,
      transform: [
        { translateX: tapX.value - heartSize / 2 },
        { translateY: tapY.value - heartSize / 2 },
        { scale: heartScale.value },
        { rotate: `${heartRotation.value}deg` },
      ],
    }));

    return (
      <GestureDetector gesture={composedGesture}>
        <View
          style={[styles.container, style]}
          testID={testID}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Beğenmek için çift tıkla"
          accessibilityHint="Gönderiyi beğenmek için çift tıklayın">
          {children}

          {/* Heart overlay */}
          <Animated.View style={[styles.heartContainer, heartAnimatedStyle]} pointerEvents="none">
            <Icon
              name="heart"
              size={heartSize}
              color={resolvedHeartColor}
              style={styles.heartShadow}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  },
);

DoubleTapLike.displayName = 'DoubleTapLike';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
  },
  heartShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

export default DoubleTapLike;
