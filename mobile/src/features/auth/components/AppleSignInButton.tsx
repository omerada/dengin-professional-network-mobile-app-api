// src/features/auth/components/AppleSignInButton.tsx
// Apple Sign-In button component (iOS only)
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART6.md

import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { useAppleSignIn } from '../hooks';

interface AppleSignInButtonProps {
  /**
   * Called when sign-in succeeds
   */
  onSuccess?: () => void;
  /**
   * Called when sign-in fails
   */
  onError?: (error: Error) => void;
}

/**
 * AppleSignInButton Component
 *
 * Renders an Apple sign-in button following Apple's Human Interface Guidelines.
 * Dark button on light mode, light button on dark mode.
 *
 * @example
 * ```tsx
 * {Platform.OS === 'ios' && (
 *   <AppleSignInButton
 *     onSuccess={() => navigation.navigate('Home')}
 *     onError={(error) => Alert.alert('Hata', error.message)}
 *   />
 * )}
 * ```
 */
export const AppleSignInButton: React.FC<AppleSignInButtonProps> = memo(
  ({ onSuccess, onError }) => {
    const { isDarkMode } = useTheme();
    const appleSignIn = useAppleSignIn();

    const handlePress = useCallback(async () => {
      try {
        await appleSignIn.mutateAsync();
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }, [appleSignIn, onSuccess, onError]);

    // Apple design guidelines: dark button on light mode, light button on dark mode
    const buttonBackgroundColor = isDarkMode ? '#FFFFFF' : '#000000';
    const textColor = isDarkMode ? '#000000' : '#FFFFFF';

    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
        onPress={handlePress}
        disabled={appleSignIn.isPending}
        activeOpacity={0.7}
      >
        {appleSignIn.isPending ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            <Icon name="logo-apple" size={20} color={textColor} style={styles.icon} />
            <Text style={[styles.text, { color: textColor }]}>
              Apple ile devam et
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

AppleSignInButton.displayName = 'AppleSignInButton';

