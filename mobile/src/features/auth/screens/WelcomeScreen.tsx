// src/features/auth/screens/WelcomeScreen.tsx
// @deprecated This screen is no longer used in the auth flow (P1 Optimization)
// Onboarding screen now directly navigates to Login/Register
// Kept for potential future use as a landing page
//
// Modern Welcome Screen - İlk giriş ekranı
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button } from '@shared/components';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';
import { SCREEN_ANIMATIONS } from '@constants/animationPresets';

/**
 * @deprecated Screen no longer in use - P1 Auth Flow Optimization
 *
 * Modern Welcome Screen
 * First screen user sees, provides login/register options
 * Features:
 * - Animated entrance
 * - Modern feature list with icons
 * - Clickable terms and privacy links
 * - System theme aware
 */
export const WelcomeScreen: React.FC = () => {
  const colors = useColors();
  const { t } = useLocale();
  const navigation = useNavigation<AuthStackNavigationProp>();

  const handleLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const handleTerms = useCallback(() => {
    navigation.navigate('Terms');
  }, [navigation]);

  const handlePrivacy = useCallback(() => {
    navigation.navigate('Privacy');
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar animated translucent={false} />

      <View style={styles.content}>
        {/* Hero Logo Area - DENGIN Branding */}
        <Animated.View entering={SCREEN_ANIMATIONS.heroEnter} style={styles.heroContainer}>
          <Image
            source={require('../../../../assets/dengin-icon.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: colors.text.primary }]}>Dengin</Text>
          <Text style={[styles.tagline, { color: colors.text.secondary }]}>
            Profesyoneller için güvenli sosyal ağ
          </Text>

          {/* Feature Badges */}
          <View style={styles.featuresRow}>
            <View style={[styles.featureBadge, { backgroundColor: colors.background.secondary }]}>
              <Icon name="shield" size={16} color={colors.text.secondary} />
              <Text style={[styles.featureBadgeText, { color: colors.text.primary }]}>Güvenli</Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: colors.background.secondary }]}>
              <Icon name="check-circle" size={16} color={colors.text.secondary} />
              <Text style={[styles.featureBadgeText, { color: colors.text.primary }]}>
                Doğrulanmış
              </Text>
            </View>
            <View style={[styles.featureBadge, { backgroundColor: colors.background.secondary }]}>
              <Icon name="zap" size={16} color={colors.text.secondary} />
              <Text style={[styles.featureBadgeText, { color: colors.text.primary }]}>
                Profesyonel
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Action Buttons */}
        <Animated.View entering={SCREEN_ANIMATIONS.contentEnter} style={styles.actionsContainer}>
          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            variant="primary"
            size="lg"
            fullWidth
            accessibilityLabel="Giriş yap butonuna tıkla"
            accessibilityHint="Hesabınıza giriş yapmak için tıklayın"
          />

          <View style={styles.buttonSpacer} />

          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            variant="outline"
            size="lg"
            fullWidth
            accessibilityLabel="Kayıt ol butonuna tıkla"
            accessibilityHint="Yeni hesap oluşturmak için tıklayın"
          />
        </Animated.View>

        {/* Terms - Clickable with proper Text nesting */}
        <Animated.View entering={FadeIn.delay(300).duration(300)}>
          <Text style={[styles.termsText, { color: colors.text.secondary }]}>
            Devam ederek{' '}
            <Text
              style={[styles.termsLink, { color: colors.interactive.default }]}
              onPress={handleTerms}>
              Kullanım Koşulları
            </Text>
            {' ve '}
            <Text
              style={[styles.termsLink, { color: colors.interactive.default }]}
              onPress={handlePrivacy}>
              Gizlilik Politikası
            </Text>
            'nı kabul etmiş olursunuz.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  buttonSpacer: {
    height: spacing.md,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
  },
  featureBadge: {
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  featureBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  heroContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  appLogo: {
    height: 100,
    marginBottom: spacing.xl,
    width: 100,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
  },
  spacer: {
    flex: 0.5,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: spacing.xl,
    opacity: 0.8,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
});
