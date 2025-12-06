// src/features/auth/screens/WelcomeScreen.tsx
// Modern Welcome Screen - İlk giriş ekranı
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button } from '@shared/components';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing, borderRadius } from '@theme';

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
        {/* Logo/Brand Area */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.brandContainer}>
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
        </Animated.View>

        {/* Features List */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.featuresContainer}>
          <FeatureItem icon="✓" text="AI destekli kimlik doğrulama" colors={colors} delay={300} />
          <FeatureItem icon="🔒" text="Güvenli ve şifreli iletişim" colors={colors} delay={400} />
          <FeatureItem
            icon="👥"
            text="Doğrulanmış profesyoneller topluluğu"
            colors={colors}
            delay={500}
          />
          <FeatureItem icon="🚀" text="Kariyerinizi geliştirin" colors={colors} delay={600} />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.actionsContainer}>
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

/**
 * Feature item component with animation
 */
interface FeatureItemProps {
  icon: string;
  text: string;
  colors: ReturnType<typeof useColors>;
  delay: number;
}

const FeatureItem: React.FC<FeatureItemProps> = React.memo(({ icon, text, colors, delay }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.featureItem}>
    <View style={[styles.featureIconContainer, { backgroundColor: colors.background.secondary }]}>
      <Text style={styles.featureIcon}>{icon}</Text>
    </View>
    <Text style={[styles.featureText, { color: colors.text.secondary }]}>{text}</Text>
  </Animated.View>
));

FeatureItem.displayName = 'FeatureItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing['2xl'],
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: borderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: spacing['4xl'],
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  actionsContainer: {
    marginBottom: spacing.xl,
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
