// src/features/auth/screens/LoginScreen.tsx
// Modern Login Screen - Giriş ekranı
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { useCallback, useEffect } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { useSemanticHaptic } from '@shared/hooks';
import {
  Button,
  Input,
  ShakeAnimation,
  UnifiedScreenHeader,
  KeyboardAwareScreen,
} from '@shared/components';
import { SAFE_AREA_EDGES, SCREEN_ANIMATIONS } from '@constants';
import { useLogin, useBiometricLogin } from '../hooks';
import { useAuthStore } from '../stores';
import { loginSchema, LoginSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';
import { styles } from './LoginScreen.styles';

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
  const { triggerSystem, triggerNavigation } = useSemanticHaptic();

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
      triggerSystem('confirm');
      reset();
      login(data);
    },
    [login, reset, triggerSystem],
  );

  const handleForgotPassword = useCallback(() => {
    triggerNavigation('navigate');
    navigation.navigate('ForgotPassword');
  }, [navigation, triggerNavigation]);

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
      <KeyboardAwareScreen mode="padding">
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
        </Animated.View>

        {/* Divider */}
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(1)} style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
          <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>veya email ile</Text>
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
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(1)} style={styles.actions}>
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

        {/* Footer: Register CTA */}
        <View style={styles.footer}>
          <Animated.View
            entering={SCREEN_ANIMATIONS.listItemEnter(4)}
            style={styles.registerContainer}>
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
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
};
