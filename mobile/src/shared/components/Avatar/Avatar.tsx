// src/shared/components/Avatar/Avatar.tsx
// Kullanıcı avatar komponenti
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@contexts/ThemeContext';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  /**
   * Image URI for the avatar
   */
  uri?: string | null;
  /**
   * User's name for generating initials and background color
   */
  name?: string;
  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * Callback when avatar is pressed
   */
  onPress?: () => void;
  /**
   * Show online/status badge
   */
  showBadge?: boolean;
  /**
   * Badge color (defaults to success color)
   */
  badgeColor?: string;
  /**
   * Additional container styles
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

const SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  '2xl': 120,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
  '2xl': 42,
};

/**
 * Avatar Component
 * 
 * Displays user avatar with image or initials fallback.
 * Supports various sizes, badges, and touch interactions.
 * 
 * @example
 * ```tsx
 * // With image
 * <Avatar uri="https://example.com/avatar.jpg" name="John Doe" size="lg" />
 * 
 * // With initials fallback
 * <Avatar name="Jane Smith" size="md" />
 * 
 * // With online badge
 * <Avatar name="User" showBadge badgeColor="#22C55E" />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = memo(
  ({
    uri,
    name,
    size = 'md',
    onPress,
    showBadge = false,
    badgeColor,
    style,
    testID,
  }) => {
    const { theme } = useTheme();
    const dimension = SIZES[size];
    const fontSize = FONT_SIZES[size];

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
      if (!name) return theme.colors.neutral[300];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colors = [
        theme.colors.primary[400],
        theme.colors.secondary[400],
        theme.colors.success.main,
        theme.colors.warning.main,
        theme.colors.info.main,
      ];
      return colors[Math.abs(hash) % colors.length];
    }, [name, theme]);

    const containerStyle: ViewStyle = {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
      backgroundColor,
      overflow: 'hidden',
    };

    const content = uri ? (
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
    ) : (
      <View style={[styles.placeholder, { backgroundColor }]}>
        <Text style={[styles.initials, { fontSize, color: '#FFFFFF' }]}>
          {initials}
        </Text>
      </View>
    );

    const badge = showBadge && (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor || theme.colors.success.main,
            width: dimension * 0.25,
            height: dimension * 0.25,
            borderRadius: dimension * 0.125,
            borderColor: theme.colors.background.primary,
          },
        ]}
      />
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={[containerStyle, style]}
          onPress={onPress}
          activeOpacity={0.7}
          testID={testID}
          accessibilityLabel={name ? `${name} profil fotoğrafı` : 'Profil fotoğrafı'}
          accessibilityRole="button"
        >
          {content}
          {badge}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[containerStyle, style]} testID={testID}>
        {content}
        {badge}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});

Avatar.displayName = 'Avatar';
