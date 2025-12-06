// src/features/auth/screens/RegisterScreen.tsx
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md
// Oku: mobile-development-guide/ui/19-FORMS.md

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
import { useRegister } from '../hooks';
import { registerSchema, RegisterSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';
import { getErrorMessage } from '@core/utils/errorUtils';

/**
 * Register Screen
 * New user registration form
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
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched', // Validate only after user touches field
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      profession: '',
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
              style={styles.backButton}>
              <Text style={{ color: colors.text.primary, fontSize: 24 }}>←</Text>
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

            {/* Phone (Optional) */}
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.phone')}
                  placeholder="5XX XXX XX XX"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phoneNumber?.message}
                  hint="Opsiyonel"
                />
              )}
            />

            {/* Profession (Optional) */}
            <Controller
              control={control}
              name="profession"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.profession')}
                  placeholder="Mesleğiniz"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.profession?.message}
                  hint="Opsiyonel"
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
                <View style={styles.termsContainer}>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{
                      false: colors.border.default,
                      true: colors.interactive.subtle,
                    }}
                    thumbColor={value ? colors.interactive.default : colors.background.secondary}
                    accessible={true}
                    accessibilityRole="switch"
                    accessibilityLabel="Kullanım koşullarını kabul et"
                    accessibilityState={{ checked: value }}
                  />
                  <View style={styles.termsTextContainer}>
                    <Text style={[styles.termsText, { color: colors.text.secondary }]}>
                      <Text
                        style={{ color: colors.interactive.default }}
                        onPress={() => {
                          /* Open terms */
                        }}>
                        Kullanım Koşulları
                      </Text>
                      'nı ve{' '}
                      <Text
                        style={{ color: colors.interactive.default }}
                        onPress={() => {
                          /* Open privacy */
                        }}>
                        Gizlilik Politikası
                      </Text>
                      'nı okudum ve kabul ediyorum.
                    </Text>
                    {errors.acceptTerms && (
                      <Text style={[styles.errorSmall, { color: colors.status.error }]}>
                        {errors.acceptTerms.message}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            />
          </View>

          {/* Register Button */}
          <View style={styles.actions}>
            <Button
              title={t('auth.register')}
              onPress={handleSubmit(onSubmit as any)}
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
              <Text style={{ color: colors.interactive.default, fontWeight: '600' }}>
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
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    height: 56,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
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
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.sm,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorSmall: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
