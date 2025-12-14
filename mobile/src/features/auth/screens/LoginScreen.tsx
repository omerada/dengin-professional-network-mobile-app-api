// src/features/auth/screens/LoginScreen.tsx
// Modern Login Screen - Giriş ekranı
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { useCallback, useEffect } from 'react';
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
import Icon from 'react-native-vector-icons/Feather';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button, Input } from '@shared/components';
import { useLogin, useBiometricLogin } from '../hooks';
import { useAuthStore } from '../stores';
import { loginSchema, LoginSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';

/**
 * Modern Login Screen
 * Email/password login with biometric option
 * Features:
 * - Animated entrance
 * - Biometric authentication
 * - Remember last email
 * - Modern, clean UX
 */
export const LoginScreen: React.FC = () => {
  const colors = useColors();
  const { t } = useLocale();
  const navigation = useNavigation<AuthStackNavigationProp>();

  const lastLoginEmail = useAuthStore(state => state.lastLoginEmail);
  const { login, isLoading, error, isError, reset } = useLogin();
  const {
    loginWithBiometric,
    isLoading: isBiometricLoading,
    isBiometricAvailable,
    biometricName,
  } = useBiometricLogin();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched', // Validate only after user touches field
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Pre-fill email if available
  useEffect(() => {
    if (lastLoginEmail) {
      setValue('email', lastLoginEmail);
    }
  }, [lastLoginEmail, setValue]);

  const onSubmit = useCallback(
    (data: LoginSchemaType) => {
      reset();
      login(data);
    },
    [login, reset],
  );

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.replace('Welcome');
                }
              }}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Icon name="arrow-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Giriş Yap</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Hero Section - DENGIN Branding */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={[styles.logoText, { color: colors.interactive.default }]}>DENGIN</Text>
            </View>

            {/* Slogan */}
            <Text style={[styles.slogan, { color: colors.text.secondary }]}>
              Profesyoneller için güvenli sosyal ağ
            </Text>
          </View>

          {/* Social Login - Priority (Üstte) */}
          <View style={styles.socialSection}>
            <Text style={[styles.socialTitle, { color: colors.text.primary }]}>Hızlı Giriş</Text>
            <View style={styles.socialButtonsColumn}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[
                    styles.socialButtonLarge,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                  disabled={true}>
                  <FAIcon name="apple" size={20} color={colors.text.primary} />
                  <Text style={[styles.socialButtonLargeText, { color: colors.text.primary }]}>
                    Apple ile Giriş Yap
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.socialButtonLarge,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                  },
                ]}
                disabled={true}>
                <FAIcon name="google" size={20} color={colors.text.primary} />
                <Text style={[styles.socialButtonLargeText, { color: colors.text.primary }]}>
                  Google ile Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
            <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>veya</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
          </View>

          {/* Error Message - Professional */}
          {isError && error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
              <Icon name="alert-circle" size={18} color={colors.status.error} />
              <View style={styles.errorContent}>
                <Text style={[styles.errorText, { color: colors.status.error }]}>
                  {error.message?.includes('credentials') || error.message?.includes('password')
                    ? 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
                    : error.message?.includes('network') || error.message?.includes('connection')
                      ? 'Bağlantı sorunu. İnternet bağlantınızı kontrol edin.'
                      : 'Bir hata oluştu. Lütfen tekrar deneyin.'}
                </Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={[styles.errorAction, { color: colors.interactive.default }]}>
                    Şifremi Unuttum
                  </Text>
                </TouchableOpacity>
              </View>
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

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.password')}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  required
                />
              )}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel="Şifremi unuttum"
              style={styles.forgotPassword}>
              <Text style={{ color: colors.interactive.default, fontSize: 14 }}>
                {t('auth.forgotPassword')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <View style={styles.actions}>
            <Button
              title={isLoading ? 'Giriş yapılıyor...' : t('auth.login')}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading || isBiometricLoading}
              size="lg"
              fullWidth
            />

            {/* Biometric Login */}
            {isBiometricAvailable && (
              <Button
                title={`${biometricName} ile Giriş`}
                onPress={loginWithBiometric}
                loading={isBiometricLoading}
                disabled={isLoading || isBiometricLoading}
                variant="ghost"
                size="md"
                fullWidth
                style={{ marginTop: spacing.md }}
              />
            )}
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={{ color: colors.text.secondary }}>Hesabınız yok mu? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel="Kayıt ol">
              <Text style={{ color: colors.interactive.default, fontWeight: '600' }}>
                {t('auth.register')}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  socialSection: {
    marginBottom: spacing.lg,
  },
  socialTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  socialButtonsColumn: {
    gap: spacing.md,
  },
  socialButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
  },
  socialButtonLargeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  errorAction: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  form: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    fontSize: 13,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
