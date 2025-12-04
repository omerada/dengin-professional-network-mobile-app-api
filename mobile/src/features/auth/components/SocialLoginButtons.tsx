// src/features/auth/components/SocialLoginButtons.tsx
// Social login buttons container
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART6.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AppleSignInButton } from './AppleSignInButton';

interface SocialLoginButtonsProps {
  /**
   * Called when any social login succeeds
   */
  onSuccess?: () => void;
  /**
   * Called when any social login fails
   */
  onError?: (error: Error) => void;
}

/**
 * SocialLoginButtons Component
 *
 * Container for social login buttons with a divider.
 * Shows Google on all platforms, Apple only on iOS.
 *
 * @example
 * ```tsx
 * <SocialLoginButtons
 *   onSuccess={() => navigation.navigate('Home')}
 *   onError={(error) => Alert.alert('Hata', error.message)}
 * />
 * ```
 */
export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = memo(
  ({ onSuccess, onError }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.container}>
        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border.light }]}
          />
          <Text style={[styles.dividerText, { color: theme.colors.text.tertiary }]}>
            veya
          </Text>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border.light }]}
          />
        </View>

        {/* Social Buttons */}
        <View style={styles.buttons}>
          <GoogleSignInButton onSuccess={onSuccess} onError={onError} />

          {Platform.OS === 'ios' && (
            <AppleSignInButton onSuccess={onSuccess} onError={onError} />
          )}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  buttons: {
    gap: spacing.md,
  },
});

SocialLoginButtons.displayName = 'SocialLoginButtons';

