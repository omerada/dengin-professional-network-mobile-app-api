// src/features/auth/components/GoogleSignInButton.tsx
// Google Sign-In button component
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART6.md

import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { useGoogleSignIn } from '../hooks';

interface GoogleSignInButtonProps {
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
 * GoogleSignInButton Component
 *
 * Renders a Google sign-in button following Google's design guidelines.
 * Handles the complete Google OAuth flow.
 *
 * @example
 * ```tsx
 * <GoogleSignInButton
 *   onSuccess={() => navigation.navigate('Home')}
 *   onError={(error) => Alert.alert('Hata', error.message)}
 * />
 * ```
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = memo(
  ({ onSuccess, onError }) => {
    const colors = useColors();
    const googleSignIn = useGoogleSignIn();

    const handlePress = useCallback(async () => {
      try {
        await googleSignIn.mutateAsync();
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }, [googleSignIn, onSuccess, onError]);

    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.background.primary,
            borderColor: colors.border.default,
          },
        ]}
        onPress={handlePress}
        disabled={googleSignIn.isPending}
        activeOpacity={0.7}>
        {googleSignIn.isPending ? (
          <ActivityIndicator color={colors.text.primary} size="small" />
        ) : (
          <>
            {/* Google "G" icon using custom color */}
            <View style={styles.iconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={[styles.text, { color: colors.text.primary }]}>Google ile devam et</Text>
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
    borderWidth: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4', // Google blue
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

GoogleSignInButton.displayName = 'GoogleSignInButton';
