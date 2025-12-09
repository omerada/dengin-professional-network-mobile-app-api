// src/features/auth/screens/RegisterScreenMultiStep.tsx
// Multi-Step Registration Screen - Production Ready
// 4-step registration flow with smooth UX

import React, { useCallback, useState, useMemo } from 'react';
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
import { Button, Input } from '@shared/components';
import { SectorSelector, ProfessionSelector, StepIndicator } from '../components';
import { useRegister } from '../hooks';
import { registerSchema, RegisterSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';
import { getErrorMessage } from '@core/utils/errorUtils';
import { useSectors } from '@shared/hooks';

/**
 * Registration Steps (3-step flow)
 */
enum Step {
  PERSONAL_INFO = 1,
  PROFESSIONAL_INFO = 2,
  ACCOUNT_INFO = 3,
}

const TOTAL_STEPS = 3;

/**
 * Multi-Step Register Screen (3 Steps)
 *
 * Step 1: Personal Info (firstName, lastName)
 * Step 2: Professional Info (sectorId, professionId/customProfession)
 * Step 3: Account Info (email, password, confirmPassword, acceptTerms)
 *
 * Features:
 * - 3-step registration flow (optimized UX)
 * - Custom profession input for "OTHER" sector
 * - Form validation per step
 * - Progress indicator with vector icons
 * - Auto-login after successful registration
 */
export const RegisterScreenMultiStep: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { register, isLoading, error, isError } = useRegister();
  const [currentStep, setCurrentStep] = useState<Step>(Step.PERSONAL_INFO);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      sectorId: undefined,
      professionId: undefined,
      customProfession: '',
      acceptTerms: false,
    },
  });

  // Watch values for conditional rendering
  const sectorId = watch('sectorId');

  // Get sector name for conditional logic
  const { data: sectors } = useSectors();
  const selectedSector = useMemo(() => {
    return sectors?.find(s => s.id === sectorId);
  }, [sectors, sectorId]);

  const selectedSectorCode = useMemo(() => {
    return selectedSector?.code || null;
  }, [selectedSector]);

  // Check if OTHER sector is selected
  const isOtherSector = useMemo(() => {
    return selectedSector?.code === 'OTHER';
  }, [selectedSector]);

  /**
   * Validate current step fields
   */
  const validateStep = useCallback(
    async (step: Step): Promise<boolean> => {
      let fields: (keyof RegisterSchemaType)[] = [];

      switch (step) {
        case Step.PERSONAL_INFO:
          fields = ['firstName', 'lastName'];
          break;
        case Step.PROFESSIONAL_INFO:
          if (isOtherSector) {
            fields = ['sectorId', 'customProfession'];
          } else {
            fields = ['sectorId', 'professionId'];
          }
          break;
        case Step.ACCOUNT_INFO:
          fields = ['email', 'password', 'confirmPassword', 'acceptTerms'];
          break;
      }

      const result = await trigger(fields);
      return result;
    },
    [trigger, isOtherSector],
  );

  /**
   * Go to next step
   */
  const handleNext = useCallback(async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => (prev + 1) as Step);
    }
  }, [currentStep, validateStep]);

  /**
   * Go to previous step
   */
  const handleBack = useCallback(() => {
    if (currentStep > Step.PERSONAL_INFO) {
      setCurrentStep(prev => (prev - 1) as Step);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  /**
   * Final submit - Register user
   */
  const onSubmit = useCallback(
    (data: RegisterSchemaType) => {
      console.log('========================================');
      console.log('[RegisterScreen] 🚀 SUBMIT CALLED');
      console.log('[RegisterScreen] Form Data:', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        sectorId: data.sectorId,
        professionId: data.professionId,
        customProfession: data.customProfession,
        acceptTerms: data.acceptTerms,
      });
      console.log('[RegisterScreen] Form Errors:', errors);
      console.log('[RegisterScreen] Calling register API...');
      console.log('========================================');

      // Submit registration (reset form only after successful registration in useRegister hook)
      register(data);
    },
    [register, errors],
  );

  /**
   * Handle submit with validation check
   */
  const handleFinalSubmit = useCallback(async () => {
    console.log('[RegisterScreen] 🎯 Submit button clicked');
    console.log('[RegisterScreen] Current step:', currentStep);
    console.log('[RegisterScreen] Triggering validation...');

    const isValid = await trigger();
    console.log('[RegisterScreen] Validation result:', isValid);

    if (!isValid) {
      console.log('[RegisterScreen] ❌ Validation failed, errors:', errors);
      return;
    }

    console.log('[RegisterScreen] ✅ Validation passed, calling handleSubmit(onSubmit)');
    handleSubmit(onSubmit)();
  }, [currentStep, trigger, errors, handleSubmit, onSubmit]);

  const handleTermsPress = useCallback(() => {
    navigation.navigate('Terms');
  }, [navigation]);

  const handlePrivacyPress = useCallback(() => {
    navigation.navigate('Privacy');
  }, [navigation]);

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case Step.PERSONAL_INFO:
        return (
          <View style={styles.stepContent}>
            {/* Step Header with Icon */}
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepIconContainer,
                  { backgroundColor: colors.interactive.default + '15' },
                ]}>
                <Icon name="user" size={32} color={colors.interactive.default} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Tanışalım!</Text>
              <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
                Önce sizi tanıyalım
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.stepForm}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Adınız"
                    placeholder="Adınızı girin"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                    required
                    autoFocus
                    leftIcon={<Icon name="user" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Soyadınız"
                    placeholder="Soyadınızı girin"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.lastName?.message}
                    required
                    leftIcon={<Icon name="user" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />
            </View>
          </View>
        );

      case Step.PROFESSIONAL_INFO:
        return (
          <View style={styles.stepContent}>
            {/* Step Header with Icon */}
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepIconContainer,
                  { backgroundColor: colors.interactive.default + '15' },
                ]}>
                <Icon name="briefcase" size={32} color={colors.interactive.default} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text.primary }]}>
                Profesyonel Bilgiler
              </Text>
              <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
                Size uygun içerikler gösterebilmemiz için
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.stepForm}>
              <Controller
                control={control}
                name="sectorId"
                render={({ field: { value } }) => (
                  <SectorSelector
                    value={value}
                    onSelect={(sectorId: number | null) => {
                      if (sectorId !== null) {
                        setValue('sectorId', sectorId, { shouldValidate: true });
                        // Reset profession when sector changes
                        setValue('professionId', null as any);
                        setValue('customProfession', '');
                      }
                    }}
                    error={errors.sectorId?.message}
                    showDescription={false}
                  />
                )}
              />

              {/* Conditional: Show ProfessionSelector OR CustomProfession Input */}
              {isOtherSector ? (
                <Controller
                  control={control}
                  name="customProfession"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Mesleğiniz"
                      placeholder="Mesleğinizi yazın"
                      autoCapitalize="words"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.customProfession?.message}
                      hint="Örneğin: Grafik Tasarımcı, Emlakçı, vb."
                      required
                    />
                  )}
                />
              ) : (
                <Controller
                  control={control}
                  name="professionId"
                  render={({ field: { value } }) => (
                    <ProfessionSelector
                      value={value}
                      sectorCode={selectedSectorCode}
                      onSelect={(professionId: number | null) => {
                        if (professionId !== null) {
                          setValue('professionId', professionId, { shouldValidate: true });
                        }
                      }}
                      error={errors.professionId?.message}
                      showDescription={false}
                    />
                  )}
                />
              )}
            </View>
          </View>
        );

      case Step.ACCOUNT_INFO:
        return (
          <View style={styles.stepContent}>
            {/* Step Header with Icon */}
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepIconContainer,
                  { backgroundColor: colors.interactive.default + '15' },
                ]}>
                <Icon name="shield" size={32} color={colors.interactive.default} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text.primary }]}>
                Hesabınızı Oluşturun
              </Text>
              <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
                Güvenli bir şifre seçin
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.stepForm}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="E-posta Adresi"
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
                    autoFocus
                    leftIcon={<Icon name="mail" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Şifre"
                    placeholder="••••••••"
                    secureTextEntry={!passwordVisible}
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
                    leftIcon={<Icon name="lock" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Şifre Tekrar"
                    placeholder="••••••••"
                    secureTextEntry={!confirmPasswordVisible}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    required
                    isPasswordVisible={confirmPasswordVisible}
                    onPasswordVisibilityToggle={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    leftIcon={<Icon name="lock" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              {/* Terms & Privacy */}
              <View style={styles.termsContainer}>
                <Controller
                  control={control}
                  name="acceptTerms"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => onChange(!value)}
                      activeOpacity={0.7}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: value
                              ? colors.interactive.default
                              : colors.background.secondary,
                            borderColor: errors.acceptTerms
                              ? colors.status.error
                              : colors.border.default,
                          },
                        ]}>
                        {value && <Icon name="check" size={16} color={colors.text.inverse} />}
                      </View>
                      <View style={styles.termsTextContainer}>
                        <Text style={[styles.termsText, { color: colors.text.secondary }]}>
                          <TouchableOpacity onPress={handleTermsPress}>
                            <Text style={[styles.termsLink, { color: colors.interactive.default }]}>
                              Kullanım Koşulları
                            </Text>
                          </TouchableOpacity>
                          {' ve '}
                          <TouchableOpacity onPress={handlePrivacyPress}>
                            <Text style={[styles.termsLink, { color: colors.interactive.default }]}>
                              Gizlilik Politikası
                            </Text>
                          </TouchableOpacity>
                          {"'nı okudum ve kabul ediyorum"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
                {errors.acceptTerms && (
                  <Text style={[styles.errorText, { color: colors.status.error }]}>
                    {errors.acceptTerms.message}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
    }
  };

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
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={currentStep === Step.PERSONAL_INFO ? 'Geri dön' : 'Önceki adım'}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <View
                style={[styles.backButtonCircle, { backgroundColor: colors.background.secondary }]}>
                <Icon name="chevron-left" size={28} color={colors.text.primary} />
              </View>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Hesap Oluştur</Text>
          </View>

          {/* Step Indicator */}
          <StepIndicator
            totalSteps={TOTAL_STEPS}
            currentStep={currentStep}
            icons={['user', 'briefcase', 'lock']}
            labels={['Bilgiler', 'Meslek', 'Hesap']}
          />

          {/* Error Message */}
          {isError && error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}>
              <Icon name="alert-circle" size={20} color={colors.status.error} />
              <Text style={[styles.errorText, { color: colors.status.error }]}>
                {getErrorMessage(error)}
              </Text>
            </View>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <View style={styles.actions}>
            {currentStep < TOTAL_STEPS ? (
              <Button
                title="Devam Et"
                onPress={handleNext}
                size="lg"
                fullWidth
                rightIcon={<Icon name="arrow-right" size={20} color={colors.text.inverse} />}
              />
            ) : (
              <Button
                title="Hesap Oluştur"
                onPress={handleFinalSubmit}
                loading={isLoading}
                disabled={isLoading}
                size="lg"
                fullWidth
                rightIcon={<Icon name="check-circle" size={20} color={colors.text.inverse} />}
              />
            )}
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
                Giriş Yap
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
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  errorText: {
    fontSize: 14,
    marginLeft: spacing.sm,
    flex: 1,
  },
  stepContent: {
    marginTop: spacing.lg,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  stepForm: {
    gap: spacing.md,
  },
  summaryCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryText: {
    fontSize: 16,
    marginLeft: spacing.md,
  },
  termsContainer: {
    marginTop: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  loginLink: {
    fontWeight: '600',
  },
});
