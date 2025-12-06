// src/features/auth/screens/ForgotPasswordScreen.tsx
// Modern Forgot Password Screen - Şifre sıfırlama
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button, Input } from '@shared/components';
import { useForgotPassword } from '../hooks';
import { forgotPasswordSchema, ForgotPasswordSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing, borderRadius } from '@theme';

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
    navigation.goBack();
  }, [navigation]);

  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

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
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Geri dön"
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: 32,
                  fontWeight: '300',
                  lineHeight: 32,
                }}>
                ←
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('auth.forgotPassword')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </Text>
          </View>

          {/* Error Message */}
          {isError && error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>
                {(error as Error).message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu'}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
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
          </View>

          {/* Submit Button */}
          <View style={styles.actions}>
            <Button
              title="Sıfırlama Bağlantısı Gönder"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={handleBackToLogin}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="Giriş sayfasına dön"
            style={styles.backToLogin}>
            <Text style={{ color: colors.interactive.default }}>← Giriş sayfasına dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 0,
  },
  titleContainer: {
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl + spacing.md,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  backToLogin: {
    alignItems: 'center',
    padding: spacing.md,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 3,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
});
