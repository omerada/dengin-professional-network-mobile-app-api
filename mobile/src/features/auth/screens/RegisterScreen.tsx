// src/features/auth/screens/RegisterScreen.tsx
// Modern Register Screen - Kayıt ekranı
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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button, Input } from '@shared/components';
import { ProfessionSelector } from '../components';
import { useRegister } from '../hooks';
import { registerSchema, RegisterSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';
import { getErrorMessage } from '@core/utils/errorUtils';

/**
 * Modern Register Screen
 * New user registration form
 * Features:
 * - Smart profession selector with dropdown
 * - Custom profession support with profanity filter
 * - Clickable Terms & Privacy links (can be reopened)
 * - Auto-login after registration
 * - Professional UX
 */
export const RegisterScreen: React.FC = () => {
  const colors = useColors();
  const { t } = useLocale();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { register, isLoading, error, isError, reset } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      professionId: undefined,
      customProfession: '',
      acceptTerms: false,
    },
  });

  const onSubmit = useCallback(
    (data: RegisterSchemaType) => {
      reset();
      register(data);
    },
    [register, reset],
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleTermsPress = useCallback(() => {
    navigation.navigate('Terms');
  }, [navigation]);

  const handlePrivacyPress = useCallback(() => {
    navigation.navigate('Privacy');
  }, [navigation]);

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
              <Text style={[styles.backButtonText, { color: colors.text.primary }]}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('auth.createAccount')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Bilgilerinizi girerek hesabınızı oluşturun
            </Text>
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
            {/* Name Fields */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label={t('auth.firstName')}
                      placeholder="Adınız"
                      autoCapitalize="words"
                      autoComplete="given-name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.firstName?.message}
                      required
                    />
                  )}
                />
              </View>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label={t('auth.lastName')}
                      placeholder="Soyadınız"
                      autoCapitalize="words"
                      autoComplete="family-name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.lastName?.message}
                      required
                    />
                  )}
                />
              </View>
            </View>

            {/* Email */}
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

            {/* Profession Selector */}
            <Controller
              control={control}
              name="professionId"
              render={({ field: { value } }) => (
                <Controller
                  control={control}
                  name="customProfession"
                  render={({ field: { value: customValue } }) => (
                    <ProfessionSelector
                      value={value}
                      customValue={customValue}
                      onSelect={(professionId: number | null, customText?: string) => {
                        if (professionId !== null) {
                          setValue('professionId', professionId, { shouldValidate: true });
                        }
                        setValue('customProfession', customText || '');
                      }}
                      error={errors.professionId?.message || errors.customProfession?.message}
                    />
                  )}
                />
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.password')}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  hint="En az 8 karakter, büyük/küçük harf ve rakam içermeli"
                  required
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.confirmPassword')}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  required
                />
              )}
            />

            {/* Terms Acceptance */}
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.termsContainer,
                    {
                      backgroundColor: colors.background.secondary,
                      borderRadius: 12,
                      padding: spacing.md,
                    },
                  ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{
                        false: colors.border.default,
                        true: colors.interactive.subtle,
                      }}
                      thumbColor={value ? colors.interactive.default : colors.background.primary}
                      accessible={true}
                      accessibilityRole="switch"
                      accessibilityLabel="Kullanım koşullarını kabul et"
                      accessibilityState={{ checked: value }}
                    />
                    <View style={styles.termsTextContainer}>
                      <Text style={[styles.termsText, { color: colors.text.secondary }]}>
                        <Text
                          style={[styles.link, { color: colors.interactive.default }]}
                          onPress={handleTermsPress}>
                          Kullanım Koşulları
                        </Text>{' '}
                        ve{' '}
                        <Text
                          style={[styles.link, { color: colors.interactive.default }]}
                          onPress={handlePrivacyPress}>
                          Gizlilik Politikası
                        </Text>{' '}
                        'nı okudum ve kabul ediyorum.
                      </Text>
                    </View>
                  </View>
                  {errors.acceptTerms && (
                    <Text
                      style={[
                        styles.errorSmall,
                        { color: colors.status.error, marginTop: spacing.xs, marginLeft: 44 },
                      ]}>
                      {errors.acceptTerms.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Register Button */}
          <View style={styles.actions}>
            <Button
              title={t('auth.register')}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={{ color: colors.text.secondary }}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel="Giriş yap">
              <Text style={[styles.loginLink, { color: colors.interactive.default }]}>
                {t('auth.login')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginBottom: spacing.xl,
  },
  backButton: {
    height: 48,
    justifyContent: 'center',
    width: 48,
    alignItems: 'flex-start',
    paddingLeft: 0,
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    borderRadius: 8,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  errorSmall: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.md,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  header: {
    height: 56,
    justifyContent: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  loginLink: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    fontSize: 16,
  },
  termsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    marginBottom: spacing['2xl'],
  },
});
