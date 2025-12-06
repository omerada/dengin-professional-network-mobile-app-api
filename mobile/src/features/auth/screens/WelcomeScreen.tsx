// src/features/auth/screens/WelcomeScreen.tsx
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button } from '@shared/components';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing, borderRadius } from '@theme';

/**
 * Welcome Screen
 * First screen user sees, provides login/register options
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <View style={styles.content}>
        {/* Logo/Brand Area */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.interactive.subtle }]}>
            <Text style={[styles.logoText, { color: colors.interactive.default }]}>M</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text.primary }]}>Meslektaş</Text>
          <Text style={[styles.tagline, { color: colors.text.secondary }]}>
            Profesyoneller için güvenli sosyal ağ
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <FeatureItem icon="✓" text="Kimlik doğrulaması ile güvenli topluluk" colors={colors} />
          <FeatureItem icon="✓" text="Meslektaşlarınızla bağlantı kurun" colors={colors} />
          <FeatureItem icon="✓" text="Profesyonel içerik paylaşın" colors={colors} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
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
        </View>

        {/* Terms */}
        <Text style={[styles.termsText, { color: colors.text.secondary }]}>
          Devam ederek <Text style={{ color: colors.interactive.default }}>Kullanım Koşulları</Text>{' '}
          ve <Text style={{ color: colors.interactive.default }}>Gizlilik Politikası</Text>
          'nı kabul etmiş olursunuz.
        </Text>
      </View>
    </SafeAreaView>
  );
};

/**
 * Feature item component
 */
interface FeatureItemProps {
  icon: string;
  text: string;
  colors: ReturnType<typeof useColors>;
}

const FeatureItem: React.FC<FeatureItemProps> = React.memo(({ icon, text, colors }) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, { backgroundColor: colors.status.success }]}>
      <Text style={{ color: colors.status.success }}>{icon}</Text>
    </View>
    <Text style={[styles.featureText, { color: colors.text.secondary }]}>{text}</Text>
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: spacing['4xl'],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  actionsContainer: {
    marginBottom: spacing.xl,
  },
  buttonSpacer: {
    height: spacing.md,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
