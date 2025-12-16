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
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button, Input, ShakeAnimation, UnifiedScreenHeader } from '@shared/components';
import { SAFE_AREA_EDGES, SCREEN_ANIMATIONS } from '@constants';
import { useLogin, useBiometricLogin } from '../hooks';
import { useAuthStore } from '../stores';
import { loginSchema, LoginSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing, fontSize } from '@theme';

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
      edges={SAFE_AREA_EDGES.full}>
      <UnifiedScreenHeader
        variant="default"
        title="Giriş Yap"
        showBackButton={false}
        showBorder={false}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          {/* Hero Section - DENGIN Branding */}
          <Animated.View entering={SCREEN_ANIMATIONS.heroEnter} style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={[styles.logoText, { color: colors.interactive.default }]}>DENGIN</Text>
            </View>

            {/* Slogan */}
            <Text style={[styles.slogan, { color: colors.text.secondary }]}>
              Profesyoneller için güvenli sosyal ağ
            </Text>
          </Animated.View>

          {/* Social Login - Priority (Üstte) */}
          <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(0)} style={styles.socialSection}>
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
          <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(1)} style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
            <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>veya</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
          </Animated.View>

          {/* Error Message - Professional */}
          {isError && error && (
            <ShakeAnimation trigger={isError}>
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
            </ShakeAnimation>
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
          </Animated.View>

          {/* Login Button */}
          <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(3)} style={styles.actions}>
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
          </Animated.View>

          {/* Register Link */}
          <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(4)} style={styles.registerContainer}>
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
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginBottom: spacing.xl,
  },
  container: {
    flex: 1,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: spacing.lg,
  },
  errorAction: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    alignItems: 'flex-start',
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  form: {
    marginBottom: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  keyboardAvoid: {
    flex: 1,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  slogan: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  socialButtonLarge: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  socialButtonLargeText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  socialButtonsColumn: {
    gap: spacing.md,
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
});
