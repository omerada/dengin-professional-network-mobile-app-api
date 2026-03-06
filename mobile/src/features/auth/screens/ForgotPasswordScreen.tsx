// src/features/auth/screens/ForgotPasswordScreen.tsx
// Modern Forgot Password Screen - Şifre sıfırlama
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { useCallback } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button, Input, UnifiedScreenHeader, KeyboardAwareScreen } from '@shared/components';
import { useSemanticHaptic } from '@shared/hooks';
import { SCREEN_ANIMATIONS } from '@constants';
import { useForgotPassword } from '../hooks';
import { forgotPasswordSchema, ForgotPasswordSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';

/**
 * Modern Forgot Password Screen
 * Request password reset email
 * Features:
 * - Success state with animation
 * - Clear UX guidance
 * - Modern design
 */
export const ForgotPasswordScreen: React.FC = () => {
  const colors = useColors();
  const { t } = useLocale();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { triggerNavigation } = useSemanticHaptic();
  const { requestReset, isLoading, error, isError, isEmailSent, reset } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched', // Validate only after user touches field
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = useCallback(
    (data: ForgotPasswordSchemaType) => {
      reset();
      requestReset(data);
    },
    [requestReset, reset],
  );

  const handleBack = useCallback(() => {
    triggerNavigation('back');
    navigation.goBack();
  }, [navigation, triggerNavigation]);

  const handleBackToLogin = useCallback(() => {
    triggerNavigation('navigate');
    navigation.navigate('Login');
  }, [navigation, triggerNavigation]);

  // Success state
  if (isEmailSent) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top', 'bottom', 'left', 'right']}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.successContent}>
          <Animated.View
            entering={FadeInDown.springify()}
            style={[
              styles.successIcon,
              { backgroundColor: colors.status.successBg, borderColor: colors.status.success },
            ]}>
            <Text style={{ fontSize: 48 }}>✉️</Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(200).springify()}
            style={[styles.successTitle, { color: colors.text.primary }]}>
            E-posta Gönderildi
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={[styles.successText, { color: colors.text.secondary }]}>
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu ve spam
            klasörünüzü kontrol edin.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ width: '100%' }}>
            <Button
              title="Giriş Sayfasına Dön"
              onPress={handleBackToLogin}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: spacing.xl }}
            />
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom', 'left', 'right']}>
      <UnifiedScreenHeader
        variant="default"
        title="Şifremi Unuttum"
        showBackButton
        onBackPress={handleBack}
      />
      <KeyboardAwareScreen contentContainerStyle={styles.scrollContent}>
        {/* Subtitle */}
        <Animated.View
          entering={SCREEN_ANIMATIONS.listItemEnter(0)}
          style={styles.subtitleContainer}>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </Text>
        </Animated.View>

        {/* Error Message */}
        {isError && error && (
          <Animated.View
            entering={SCREEN_ANIMATIONS.listItemEnter(1)}
            style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
            <Icon name="alert-circle" size={18} color={colors.status.error} />
            <Text style={[styles.errorText, { color: colors.status.error }]}>
              {error.message?.includes('not found') || error.message?.includes('bulunamadı')
                ? 'Bu e-posta adresi kayıtlı değil.'
                : 'Bir hata oluştu. Lütfen tekrar deneyin.'}
            </Text>
          </Animated.View>
        )}

        {/* Form */}
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(2)} style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.email')}
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                required
              />
            )}
          />
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(3)} style={styles.actions}>
          <Button
            title="Sıfırlama Bağlantısı Gönder"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            fullWidth
          />
        </Animated.View>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={handleBackToLogin}
          accessible={true}
          accessibilityRole="link"
          accessibilityLabel="Giriş sayfasına dön"
          style={styles.backToLogin}>
          <Text style={{ color: colors.interactive.default }}>← Giriş sayfasına dön</Text>
        </TouchableOpacity>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginBottom: spacing.xl,
  },
  backToLogin: {
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  form: {
    marginBottom: spacing.lg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  subtitleContainer: {
    marginBottom: spacing.xl,
  },
  successContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    alignItems: 'center',
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 120,
  },
  successText: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
