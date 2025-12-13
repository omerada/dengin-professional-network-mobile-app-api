// src/features/auth/screens/WelcomeSuccessScreen.tsx
// Welcome Success Screen - Modern, Professional & Premium
// Shows after successful registration with balanced, corporate animations

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useColors } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores/authStore';
import { spacing } from '@theme';

/**
 * WelcomeSuccessScreen
 *
 * Modern & Premium registration completion screen.
 * Balanced animations for professional, engaging experience.
 *
 * Features:
 * - Elegant checkmark animation with subtle scale + glow
 * - Staggered content animations (corporate micro-interactions)
 * - Gradient accents for modern premium feel
 * - Personalized welcome with smooth reveal
 * - Professional badge with pulse effect
 * - Smooth button entrance with subtle bounce
 */
export const WelcomeSuccessScreen: React.FC = () => {
  const colors = useColors();
  const user = useAuthStore(state => state.user);
  const setAuth = useAuthStore(state => state.setAuth);

  // Handle continue (auto + manual)
  const handleContinue = useCallback(async () => {
    // Get temporary stored data from registration
    const tempUser = useAuthStore.getState().user;
    const tempAccessToken = (useAuthStore.getState() as any).tempAccessToken;
    const tempRefreshToken = (useAuthStore.getState() as any).tempRefreshToken;

    // Set auth state to trigger navigation to Main
    if (tempUser && tempAccessToken && tempRefreshToken) {
      await setAuth(tempUser, {
        accessToken: tempAccessToken,
        refreshToken: tempRefreshToken,
      });
    }
  }, [setAuth]);

  // Animation values - Balanced & Professional
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-90);
  const checkOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);

  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(15);

  const badgeScale = useSharedValue(0.8);
  const badgeOpacity = useSharedValue(0);

  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  useEffect(() => {
    // 1. Icon entrance - Professional scale with rotation (300ms)
    iconScale.value = withSpring(1, {
      damping: 14,
      stiffness: 90,
    });
    iconRotate.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Check mark draw effect (100ms delay)
    checkOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
    );

    // 3. Subtle glow pulse (200ms delay)
    glowOpacity.value = withDelay(
      200,
      withSequence(withTiming(0.6, { duration: 400 }), withTiming(0.3, { duration: 600 })),
    );

    // 4. Title stagger (250ms delay) - Corporate stagger pattern
    titleOpacity.value = withDelay(
      250,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
    titleTranslateY.value = withDelay(
      250,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );

    // 5. Subtitle stagger (400ms delay)
    subtitleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
    subtitleTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );

    // 6. Badge entrance with subtle bounce (550ms delay)
    badgeOpacity.value = withDelay(550, withTiming(1, { duration: 300 }));
    badgeScale.value = withDelay(
      550,
      withSpring(1, {
        damping: 12,
        stiffness: 100,
      }),
    );

    // 7. Button entrance (700ms delay) - Final CTA
    buttonOpacity.value = withDelay(
      700,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
    buttonTranslateY.value = withDelay(
      700,
      withSpring(0, {
        damping: 14,
        stiffness: 90,
      }),
    );

    // 8. AUTO-CONTINUE: Navigate to main app after 2.5 seconds
    const autoNavigateTimer = setTimeout(() => {
      handleContinue();
    }, 2500);

    return () => clearTimeout(autoNavigateTimer);
  }, [handleContinue]);

  // Animated styles
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotate.value}deg` }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0.3, 0.6], [1, 1.2]) }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const firstName = user?.name?.split(' ')[0] || user?.name || 'Kullanıcı';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        {/* Success Icon - Modern & Premium */}
        <View style={styles.iconWrapper}>
          {/* Glow effect - Subtle premium touch */}
          <Animated.View
            style={[
              styles.glowCircle,
              glowStyle,
              {
                backgroundColor: colors.status.success,
              },
            ]}
          />

          {/* Icon container with rotation + scale */}
          <Animated.View style={iconContainerStyle}>
            <LinearGradient
              colors={[colors.status.success, colors.status.success]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}>
              <Animated.View style={checkStyle}>
                <Icon name="check" size={56} color={colors.text.inverse} />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Welcome Title - Staggered entrance */}
        <Animated.Text style={[styles.title, { color: colors.text.primary }, titleStyle]}>
          Hoş geldin, {firstName}!
        </Animated.Text>

        {/* Subtitle - Staggered entrance */}
        <Animated.Text style={[styles.subtitle, { color: colors.text.secondary }, subtitleStyle]}>
          Hesabın başarıyla oluşturuldu.{'\n'}
          Dengin ailesine katıldığın için teşekkürler.
        </Animated.Text>

        {/* Success Badge - Premium with pulse */}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <LinearGradient
            colors={[colors.status.successBg, colors.status.successBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badgeGradient}>
            <View style={[styles.badgeDot, { backgroundColor: colors.status.success }]} />
            <Text style={[styles.badgeText, { color: colors.status.success }]}>
              Kayıt Tamamlandı
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Skip Button - Optional (auto-navigate after 2.5s) */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity style={styles.skipButton} onPress={handleContinue} activeOpacity={0.7}>
            <Text style={[styles.skipButtonText, { color: colors.text.tertiary }]}>Atla →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Icon styles - Modern & Premium
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  glowCircle: {
    borderRadius: 80,
    height: 160,
    opacity: 0.3,
    position: 'absolute',
    width: 160,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 60,
    elevation: 8,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    width: 120,
  },

  // Text styles
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    marginTop: spacing.md,
    opacity: 0.85,
    textAlign: 'center',
  },

  // Badge styles - Premium
  badge: {
    marginTop: spacing['2xl'],
  },
  badgeGradient: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  badgeDot: {
    borderRadius: 4,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Button styles - Modern CTA
  buttonContainer: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
