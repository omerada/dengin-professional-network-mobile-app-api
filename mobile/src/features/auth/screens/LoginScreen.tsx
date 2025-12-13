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
import { getErrorMessage } from '@core/utils/errorUtils';

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
          {/* Hero Section - DENGIN Branding */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={[styles.logoText, { color: colors.interactive.default }]}>DENGIN</Text>
            </View>

            {/* Slogan */}
            <Text style={[styles.slogan, { color: colors.text.secondary }]}>
              Profesyoneller için güvenli sosyal ağ
            </Text>

            {/* Feature Badges */}
            <View style={styles.badgesContainer}>
              <View style={[styles.badge, { backgroundColor: colors.background.secondary }]}>
                <Icon name="shield" size={14} color={colors.interactive.default} />
                <Text style={[styles.badgeText, { color: colors.text.secondary }]}>Güvenli</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.background.secondary }]}>
                <Icon name="check-circle" size={14} color={colors.interactive.default} />
                <Text style={[styles.badgeText, { color: colors.text.secondary }]}>
                  Doğrulanmış
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.background.secondary }]}>
                <Icon name="zap" size={14} color={colors.interactive.default} />
                <Text style={[styles.badgeText, { color: colors.text.secondary }]}>
                  Profesyonel
                </Text>
              </View>
            </View>
          </View>

          {/* Error Message */}
          {isError && error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
              <Text style={[styles.errorText, { color: colors.status.error }]}>
                {getErrorMessage(error)}
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
              title={t('auth.login')}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading || isBiometricLoading}
              size="lg"
              fullWidth
            />

            {/* Social Login - Inspired by reference design */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
              <Text style={[styles.dividerText, { color: colors.text.secondary }]}>
                Or Sign in with
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
            </View>

            <View style={styles.socialButtonsRow}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: colors.background.secondary }]}
                  disabled={true}>
                  <FAIcon name="apple" size={18} color={colors.text.secondary} />
                  <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                    Apple
                  </Text>
                </TouchableOpacity>
              )}

              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: colors.background.secondary }]}
                  disabled={true}>
                  <FAIcon name="google" size={18} color={colors.text.secondary} />
                  <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                    Google
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: colors.background.secondary }]}
                disabled={true}>
                <FAIcon name="facebook" size={18} color={colors.text.secondary} />
                <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                  Facebook
                </Text>
              </TouchableOpacity>
            </View>

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
    paddingTop: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  titleContainer: {
    marginBottom: spacing['2xl'],
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
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
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
