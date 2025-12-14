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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useColors } from '@contexts/ThemeContext';
import { useLocale } from '@contexts/LocaleContext';
import { Button, Input } from '@shared/components';
import { SectorSelector } from '../components';
import { useRegister } from '../hooks';
import { registerSchema, RegisterSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';

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
  const [passwordVisible, setPasswordVisible] = React.useState(false);

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
      sectorId: undefined, // Sprint 1: Sector field
      professionId: undefined, // Deprecated
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Geri dön"
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <View
                style={[styles.backButtonCircle, { backgroundColor: colors.background.secondary }]}>
                <Icon name="chevron-left" size={28} color={colors.text.primary} />
              </View>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              {t('auth.createAccount')}
            </Text>
          </View>

          {/* Subtitle */}
          <View style={styles.subtitleContainer}>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Bilgilerinizi girerek hesabınızı oluşturun
            </Text>
          </View>

          {/* Error Message - Professional */}
          {isError && error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
              <Icon name="alert-circle" size={18} color={colors.status.error} />
              <Text style={[styles.errorText, { color: colors.status.error }]}>
                {error.message?.includes('email')
                  ? 'Bu e-posta zaten kullanımda. Giriş yapmayı dener misiniz?'
                  : 'Bir hata oluştu. Lütfen tekrar deneyin.'}
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

            {/* Sector Selector - Sprint 1 */}
            <Controller
              control={control}
              name="sectorId"
              render={({ field: { value } }) => (
                <SectorSelector
                  value={value}
                  onSelect={(sectorId: number | null) => {
                    if (sectorId !== null) {
                      setValue('sectorId', sectorId, { shouldValidate: true });
                    }
                  }}
                  error={errors.sectorId?.message}
                  showDescription={false}
                />
              )}
            />

            {/* Profession selection moved to Profile settings - Sprint 1 update */}
            {/* Users will select their specific profession after registration */}

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
                  isPasswordVisible={passwordVisible}
                  onPasswordVisibilityToggle={() => setPasswordVisible(!passwordVisible)}
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
                  isPasswordVisible={passwordVisible}
                  onPasswordVisibilityToggle={() => setPasswordVisible(!passwordVisible)}
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
                      borderWidth: 1,
                      borderColor: errors.acceptTerms ? colors.status.error : colors.border.default,
                    },
                  ]}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => onChange(!value)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="checkbox"
                    accessibilityLabel="Kullanım koşullarını kabul et"
                    accessibilityState={{ checked: value }}>
                    <View
                      style={{
                        width: 48,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: value ? colors.interactive.default : colors.border.default,
                        justifyContent: 'center',
                        alignItems: value ? 'flex-end' : 'flex-start',
                        paddingHorizontal: 3,
                      }}>
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: colors.background.primary,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 2,
                          elevation: 3,
                        }}
                      />
                    </View>
                    <View style={styles.termsTextContainer}>
                      <Text style={[styles.termsText, { color: colors.text.secondary }]}>
                        <Text
                          style={[styles.link, { color: colors.interactive.default }]}
                          onPress={e => {
                            e.stopPropagation();
                            handleTermsPress();
                          }}>
                          Kullanım Koşulları
                        </Text>{' '}
                        ve{' '}
                        <Text
                          style={[styles.link, { color: colors.interactive.default }]}
                          onPress={e => {
                            e.stopPropagation();
                            handlePrivacyPress();
                          }}>
                          Gizlilik Politikası
                        </Text>{' '}
                        'nı okudum ve kabul ediyorum.
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {errors.acceptTerms && (
                    <Text
                      style={[
                        styles.errorSmall,
                        { color: colors.status.error, marginTop: spacing.xs, marginLeft: 52 },
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
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButtonCircle: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.sm,
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
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: spacing.md,
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
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    fontSize: 16,
  },
  subtitleContainer: {
    marginBottom: spacing.xl,
  },
  termsContainer: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
