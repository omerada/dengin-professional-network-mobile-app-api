// src/features/auth/screens/WelcomeSuccessScreen.tsx
// Welcome Success Screen - Registration completion celebration
// Shows after successful registration with beautiful welcome animation

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { useColors } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores/authStore';
import { spacing } from '@theme';

/**
 * WelcomeSuccessScreen
 *
 * Celebrates successful registration completion.
 * Shows user's name with a beautiful welcome animation.
 * Professional corporate design with multi-layer animations.
 *
 * Features:
 * - Animated success checkmark with ripple effect
 * - Personalized welcome message with user's first name
 * - Confetti-like celebration elements
 * - Smooth fade & scale animations
 * - Manual continue button (tap anywhere or continue button)
 */
export const WelcomeSuccessScreen: React.FC = () => {
  const colors = useColors();
  const user = useAuthStore(state => state.user);
  const setAuth = useAuthStore(state => state.setAuth);

  // Handle continue button press
  const handleContinue = async () => {
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
  };

  // Animation values
  const bgOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const checkRotate = useSharedValue(-180);
  const ripple1Scale = useSharedValue(0);
  const ripple1Opacity = useSharedValue(0.4);
  const ripple2Scale = useSharedValue(0);
  const ripple2Opacity = useSharedValue(0.3);
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.9);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.8);

  useEffect(() => {
    // Background fade in
    bgOpacity.value = withTiming(1, { duration: 300 });

    // Ripple animations (staggered)
    setTimeout(() => {
      ripple1Scale.value = withTiming(2, { duration: 1000, easing: Easing.out(Easing.cubic) });
      ripple1Opacity.value = withTiming(0, { duration: 1000 });
    }, 200);

    setTimeout(() => {
      ripple2Scale.value = withTiming(2.5, { duration: 1200, easing: Easing.out(Easing.cubic) });
      ripple2Opacity.value = withTiming(0, { duration: 1200 });
    }, 350);

    // Check animation
    setTimeout(() => {
      checkOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 220 }),
        withSpring(1, { damping: 12, stiffness: 180 }),
      );
      checkRotate.value = withSpring(0, { damping: 15, stiffness: 180 });
    }, 400);

    // Title animation
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 500 });
      titleScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 800);

    // Subtitle animation
    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, { duration: 500 });
      subtitleTranslateY.value = withSpring(0, { damping: 15, stiffness: 140 });
    }, 1100);

    // Badge animation
    setTimeout(() => {
      badgeOpacity.value = withTiming(1, { duration: 400 });
      badgeScale.value = withSpring(1, { damping: 12, stiffness: 160 });
    }, 1400);
  }, [
    bgOpacity,
    checkScale,
    checkOpacity,
    checkRotate,
    ripple1Scale,
    ripple1Opacity,
    ripple2Scale,
    ripple2Opacity,
    titleOpacity,
    titleScale,
    subtitleOpacity,
    subtitleTranslateY,
    badgeOpacity,
    badgeScale,
  ]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const checkContainerStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }, { rotate: `${checkRotate.value}deg` }],
  }));

  const ripple1Style = useAnimatedStyle(() => ({
    opacity: ripple1Opacity.value,
    transform: [{ scale: ripple1Scale.value }],
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    opacity: ripple2Opacity.value,
    transform: [{ scale: ripple2Scale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const firstName = user?.name?.split(' ')[0] || user?.name || 'Kullanıcı';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Animated.View style={[styles.content, bgStyle]}>
        {/* Success Icon with Ripples */}
        <View style={styles.iconWrapper}>
          {/* Ripple effects */}
          <Animated.View
            style={[
              styles.ripple,
              ripple1Style,
              {
                backgroundColor: colors.status.success,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ripple,
              ripple2Style,
              {
                backgroundColor: colors.status.success,
              },
            ]}
          />

          {/* Check Icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.status.success,
              },
            ]}>
            <Animated.View style={checkContainerStyle}>
              <Icon name="check" size={72} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>

        {/* Welcome Title */}
        <Animated.View style={titleStyle}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Hoş geldin, {firstName}! 🎉
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={subtitleStyle}>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Hesabın başarıyla oluşturuldu.{'\n'}
            Meslektaş ailesine katıldığın için teşekkürler!
          </Text>
        </Animated.View>

        {/* Success Badge */}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <View style={[styles.badgeInner, { backgroundColor: colors.status.successBg }]}>
            <View style={[styles.badgeDot, { backgroundColor: colors.status.success }]} />
            <Text style={[styles.badgeText, { color: colors.status.success }]}>
              KAYIT TAMAMLANDI
            </Text>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonContainer, badgeStyle]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.interactive.default }]}
            onPress={handleContinue}
            activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>Devam Et</Text>
            <Icon name="arrow-right" size={20} color="#FFFFFF" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleContinue} style={styles.tapAnywhere}>
            <Text style={[styles.tapAnywhereText, { color: colors.text.tertiary }]}>
              veya ekrana dokunun
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  badge: {
    marginTop: spacing['2xl'],
  },
  badgeDot: {
    borderRadius: 4,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  badgeInner: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 90,
    elevation: 20,
    height: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    width: 180,
    zIndex: 3,
  },
  iconWrapper: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
    position: 'relative',
    width: 200,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    width: '100%',
  },
  continueButton: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  arrowIcon: {
    marginLeft: spacing.xs,
  },
  tapAnywhere: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  tapAnywhereText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ripple: {
    borderRadius: 100,
    height: 180,
    left: '50%',
    marginLeft: -90,
    marginTop: -90,
    opacity: 0.3,
    position: 'absolute',
    top: '50%',
    width: 180,
    zIndex: 1,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 26,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
