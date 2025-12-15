// src/features/feed/components/VerificationPromptCard/VerificationPromptCard.tsx
// Gradient card prompting unverified users to start verification
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 759-795
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';

import { styles } from './VerificationPromptCard.styles';
import type { VerificationPromptCardProps } from './VerificationPromptCard.types';

/**
 * VerificationPromptCard Component
 *
 * Displays a gradient card prompting unverified users to start verification.
 *
 * Features:
 * - Conditional rendering (user.isVerified === false)
 * - Gradient background (Primary → Secondary)
 * - Spring animations (FadeIn + SlideInUp)
 * - Haptic feedback on button press
 * - Full accessibility support
 *
 * Design Spec: MOBILE-APP-HOME-SCREEN.md Lines 759-795
 *
 * @example
 * ```tsx
 * const handleVerificationPress = () => {
 *   navigation.navigate('VerificationIntro');
 * };
 *
 * {!isVerified && (
 *   <VerificationPromptCard onPress={handleVerificationPress} />
 * )}
 * ```
 */
export const VerificationPromptCard: React.FC<VerificationPromptCardProps> = memo(
  ({ onPress, testID = 'verification-prompt-card' }) => {
    const colors = useColors();
    const { triggerNavigation } = useSemanticHaptic();

    // Handle button press with haptic feedback
    const handlePress = useCallback(() => {
      triggerNavigation('navigate');
      onPress();
    }, [onPress, triggerNavigation]);

    return (
      <Animated.View
        entering={FadeIn.duration(400).springify()}
        testID={testID}
        style={styles.container}>
        <LinearGradient
          colors={[colors.interactive.default, colors.interactive.pressed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}>
          <View style={styles.content}>
            {/* Icon: 🎓 Shield Checkmark */}
            <View style={styles.iconContainer}>
              <Icon name="shield-checkmark" size={40} color={colors.text.inverse} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text.inverse }]}>Mesleğini Doğrula</Text>

            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: colors.text.inverse }]}>
              Uzman rozeti kazan, güvenilirliğini artır ve toplulukta öne çık.
            </Text>

            {/* CTA Button */}
            <Pressable
              style={[styles.button, { backgroundColor: colors.background.primary }]}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityLabel="Doğrulamaya başla"
              accessibilityHint="Meslek doğrulama sürecini başlatmak için dokun">
              <Text style={[styles.buttonText, { color: colors.interactive.default }]}>
                Hemen Başla
              </Text>
              <Icon name="arrow-forward" size={18} color={colors.interactive.default} />
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  },
);

VerificationPromptCard.displayName = 'VerificationPromptCard';

export default VerificationPromptCard;
