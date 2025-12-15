// src/shared/components/Avatar/Avatar.tsx
// Dengin Design System - Modern Avatar Component
// P3: Optimized with skeleton loading and error handling
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, Text, View, ActivityIndicator } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

import { styles } from './Avatar.styles';
import {
  AVATAR_BACKGROUND_COLORS,
  AVATAR_SIZE_CONFIG,
  STATUS_COLORS,
  type AvatarProps,
  type AvatarStatus,
} from './Avatar.types';

// Create animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern Avatar Component
 *
 * Features:
 * - Image with fallback to initials
 * - Consistent color generation from name
 * - Multiple sizes (xs to 2xl)
 * - Status badge (online, offline, busy, away)
 * - Custom badge content (notification count)
 * - Press animations with spring physics
 * - Edit overlay support
 * - Selection state
 *
 * @example
 * ```tsx
 * // With image
 * <Avatar
 *   uri="https://example.com/avatar.jpg"
 *   name="John Doe"
 *   size="lg"
 *   status="online"
 * />
 *
 * // With initials fallback
 * <Avatar name="Jane Smith" size="md" />
 *
 * // With notification badge
 * <Avatar
 *   name="User"
 *   badgeContent={5}
 *   badgeColor="#FF6B6B"
 * />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = memo(
  ({
    uri,
    source,
    name,
    size = 'md',
    onPress,
    onLongPress,
    status = 'none',
    badgeColor,
    badgeContent,
    showEditOverlay = false,
    animated = true,
    borderColor,
    borderWidth,
    style,
    testID,
    accessibilityLabel,
    selected = false,
    hapticType = 'light',
    verified = false,
  }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // P3: Image loading states
    const [isLoading, setIsLoading] = useState(!!uri || !!source);
    const [hasError, setHasError] = useState(false);

    // Animation values
    const pressed = useSharedValue(0);
    const sizeConfig = AVATAR_SIZE_CONFIG[size];

    // Generate initials from name
    const initials = useMemo(() => {
      if (!name) return '?';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }, [name]);

    // Generate consistent background color from name
    const backgroundColor = useMemo(() => {
      if (!name) return colors.background.tertiary;

      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }

      return AVATAR_BACKGROUND_COLORS[Math.abs(hash) % AVATAR_BACKGROUND_COLORS.length];
    }, [name, colors.background.tertiary]);

    // Get status color
    const statusColor = useMemo(() => {
      if (badgeColor) return badgeColor;
      if (status === 'none') return undefined;
      return STATUS_COLORS[status as Exclude<AvatarStatus, 'none'>];
    }, [status, badgeColor]);

    // Animated press style
    const animatedPressStyle = useAnimatedStyle(() => {
      if (!animated || (!onPress && !onLongPress)) {
        return {};
      }

      const scale = interpolate(pressed.value, [0, 1], [1, 0.96]);
      return { transform: [{ scale }] };
    });

    // Press handlers
    const handlePressIn = useCallback(() => {
      if (!onPress && !onLongPress) return;
      pressed.value = withSpring(1, spring.press);
    }, [onPress, onLongPress, pressed]);

    const handlePressOut = useCallback(() => {
      pressed.value = withSpring(0, spring.press);
    }, [pressed]);

    const handlePress = useCallback(() => {
      if (hapticType !== 'none') {
        trigger(hapticType === 'medium' ? 'impactMedium' : 'impactLight');
      }
      onPress?.();
    }, [hapticType, onPress, trigger]);

    const handleLongPress = useCallback(() => {
      trigger('impactMedium');
      onLongPress?.();
    }, [onLongPress, trigger]);

    // Container styles
    const containerStyles = useMemo(
      () => [
        styles.container,
        {
          backgroundColor,
          borderColor: selected ? colors.interactive.default : borderColor,
          borderRadius: sizeConfig.dimension / 2,
          borderWidth: selected ? 3 : (borderWidth ?? 0),
          height: sizeConfig.dimension,
          width: sizeConfig.dimension,
        },
        style,
      ],
      [
        backgroundColor,
        borderColor,
        borderWidth,
        colors.interactive.default,
        selected,
        sizeConfig.dimension,
        style,
      ],
    );

    // P3: Image load handlers
    const handleLoadStart = useCallback(() => {
      setIsLoading(true);
      setHasError(false);
    }, []);

    const handleLoadEnd = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
    }, []);

    // Render image or initials
    const renderContent = () => {
      const imageSource = source ?? (uri ? { uri } : null);

      // P3: Show initials if error or no image
      if (!imageSource || hasError) {
        return (
          <View style={[styles.placeholder, { backgroundColor }]}>
            <Text
              style={[
                styles.initials,
                { color: colors.text.inverse, fontSize: sizeConfig.fontSize },
              ]}>
              {initials}
            </Text>
          </View>
        );
      }

      return (
        <Animated.View entering={animated ? FadeIn.duration(300) : undefined} style={styles.image}>
          {/* P3: Loading skeleton */}
          {isLoading && (
            <View style={[styles.skeleton, { backgroundColor: colors.background.tertiary }]}>
              <ActivityIndicator size="small" color={colors.text.tertiary} />
            </View>
          )}
          {/* P3: Optimized Image with error handling */}
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
          />
        </Animated.View>
      );
    };

    // Render badge (status or content)
    const renderBadge = () => {
      const showBadge = status !== 'none' || badgeContent !== undefined;
      if (!showBadge) return null;

      const badgeSize =
        badgeContent !== undefined ? sizeConfig.badgeSize * 1.5 : sizeConfig.badgeSize;

      return (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: statusColor ?? colors.status.error,
              borderColor: colors.background.primary,
              borderRadius: badgeSize / 2,
              borderWidth: sizeConfig.badgeBorderWidth,
              height: badgeSize,
              minWidth: badgeSize,
              paddingHorizontal: badgeContent !== undefined ? 4 : 0,
              width: badgeContent !== undefined ? undefined : badgeSize,
            },
          ]}>
          {badgeContent !== undefined && (
            <Text
              style={[
                styles.badgeContent,
                {
                  color: colors.text.inverse,
                  fontSize: sizeConfig.fontSize * 0.5,
                },
              ]}>
              {typeof badgeContent === 'number' && badgeContent > 99 ? '99+' : badgeContent}
            </Text>
          )}
        </View>
      );
    };

    // Render edit overlay
    const renderEditOverlay = () => {
      if (!showEditOverlay) return null;

      return (
        <View style={[styles.editOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
          <Text style={{ color: colors.text.inverse, fontSize: sizeConfig.fontSize }}>📷</Text>
        </View>
      );
    };

    // Render verification badge
    const renderVerificationBadge = () => {
      if (!verified) return null;

      const verificationSize = sizeConfig.badgeSize * 1.8;

      return (
        <View
          style={[
            styles.verificationBadge,
            {
              backgroundColor: '#1DA1F2', // Twitter blue
              borderColor: colors.background.primary,
              borderRadius: verificationSize / 2,
              borderWidth: sizeConfig.badgeBorderWidth,
              height: verificationSize,
              width: verificationSize,
            },
          ]}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: sizeConfig.fontSize * 0.65,
              fontWeight: '700',
            }}>
            ✓
          </Text>
        </View>
      );
    };

    // Accessibility label
    const a11yLabel =
      accessibilityLabel ?? (name ? `${name} profil fotoğrafı` : 'Profil fotoğrafı');

    // Interactive avatar
    if (onPress || onLongPress) {
      return (
        <AnimatedPressable
          style={[containerStyles, animatedPressStyle]}
          onPress={handlePress}
          onLongPress={onLongPress ? handleLongPress : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          testID={testID}
          accessible
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}>
          {renderContent()}
          {renderEditOverlay()}
          {renderBadge()}
          {renderVerificationBadge()}
        </AnimatedPressable>
      );
    }

    // Static avatar
    return (
      <Animated.View
        style={[containerStyles, animatedPressStyle]}
        testID={testID}
        accessible
        accessibilityLabel={a11yLabel}>
        {renderContent()}
        {renderEditOverlay()}
        {renderBadge()}
        {renderVerificationBadge()}
      </Animated.View>
    );
  },
);

Avatar.displayName = 'Avatar';
