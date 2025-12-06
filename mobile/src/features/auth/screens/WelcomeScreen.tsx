// src/features/auth/screens/WelcomeScreen.tsx
// Modern Welcome Screen - İlk giriş ekranı
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button } from '@shared/components';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';

/**
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
      <StatusBar
        barStyle={colors.background.primary === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background.primary}
      />

      <View style={styles.content}>
        {/* Hero Logo Area */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.heroContainer}>
          <View
            style={[
              styles.logoPlaceholder,
              {
                backgroundColor: colors.interactive.subtle,
                shadowColor: colors.interactive.default,
              },
            ]}>
            <Text style={[styles.logoText, { color: colors.interactive.default }]}>M</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text.primary }]}>Meslektaş</Text>
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
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionsContainer}>
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

        {/* Terms - Clickable */}
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <Text style={[styles.termsText, { color: colors.text.secondary }]}>
            Devam ederek{' '}
            <Pressable onPress={handleTerms}>
              <Text
                style={{
                  color: colors.interactive.default,
                  fontWeight: '600',
                  textDecorationLine: 'underline',
                }}>
                Kullanım Koşulları
              </Text>
            </Pressable>{' '}
            ve{' '}
            <Pressable onPress={handlePrivacy}>
              <Text
                style={{
                  color: colors.interactive.default,
                  fontWeight: '600',
                  textDecorationLine: 'underline',
                }}>
                Gizlilik Politikası
              </Text>
            </Pressable>
            'nı kabul etmiş olursunuz.
          </Text>
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
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
  },
  heroContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: spacing.md,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: spacing.xl,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  featureBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  featureBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  spacer: {
    flex: 0.5,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  buttonSpacer: {
    height: spacing.md,
  },
  termsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
});
