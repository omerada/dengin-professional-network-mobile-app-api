// src/features/profile/components/ProfileBio/index.tsx
// Dengin Design System - Modern ProfileBio Component
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import React, { memo, useState, useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

import { styles } from './ProfileBio.styles';
import { MAX_BIO_LENGTH, type ProfileBioProps } from './ProfileBio.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern ProfileBio Component
 *
 * Features:
 * - Animated entrance
 * - Expand/collapse with animation
 * - Haptic feedback on toggle
 *
 * @example
 * ```tsx
 * <ProfileBio
 *   bio="Yazılım mühendisi, mobil uygulama geliştirici..."
 *   maxLines={3}
 * />
 * ```
 */
export const ProfileBio: React.FC<ProfileBioProps> = memo(({ bio, maxLines = 3, testID }) => {
  const colors = useColors();
  const { trigger } = useHaptic();

  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);

  // Animation
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Check if bio needs truncation
  const handleTextLayout = useCallback(
    (e: { nativeEvent: { lines: Array<{ text: string }> } }) => {
      if (e.nativeEvent.lines.length > maxLines || (bio && bio.length > MAX_BIO_LENGTH)) {
        setShouldShowMore(true);
      }
    },
    [maxLines, bio],
  );

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    trigger('selection');
    buttonScale.value = withSpring(0.96, spring.press);
    setTimeout(() => {
      buttonScale.value = withSpring(1, spring.snappy);
    }, 100);
    setIsExpanded(prev => !prev);
  }, [trigger, buttonScale]);

  if (!bio) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(250).duration(400)}
      style={styles.container}
      testID={testID}>
      <Text
        style={[styles.bio, { color: colors.text.primary }]}
        numberOfLines={isExpanded ? undefined : maxLines}
        onTextLayout={handleTextLayout}>
        {bio}
      </Text>

      {shouldShowMore && (
        <AnimatedPressable
          onPress={toggleExpanded}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={buttonAnimatedStyle}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 'Daha az göster' : 'Daha fazla göster'}>
          <Text style={[styles.showMore, { color: colors.interactive.default }]}>
            {isExpanded ? 'Daha az göster' : 'Daha fazla'}
          </Text>
        </AnimatedPressable>
      )}
    </Animated.View>
  );
});

ProfileBio.displayName = 'ProfileBio';

export default ProfileBio;
