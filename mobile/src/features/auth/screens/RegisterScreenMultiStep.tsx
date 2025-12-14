// src/features/auth/screens/RegisterScreenMultiStep.tsx
// Multi-Step Registration Screen - Production Ready
// 3-step registration flow with smooth UX and success animations

import React, { useCallback, useState, useMemo, useEffect } from 'react';
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
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { Button, Input } from '@shared/components';
import { StepSuccess } from '@shared/components/StepSuccess';
import { SectorSelector, ProfessionSelector, StepIndicator } from '../components';
import { useRegister } from '../hooks';
import { useRegistrationStore } from '../stores';
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

  // Zustand store for persistent form data
  const { formData, currentStep, updateField, setStep, getSubmitData } = useRegistrationStore();

  // Step success animation state
  const [showStepSuccess, setShowStepSuccess] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  const {
    control,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  // CRITICAL: Sync store data to form for validation
  useEffect(() => {
    console.log('[RegisterScreen] Syncing store to form for validation');
    setValue('firstName', formData.firstName);
    setValue('lastName', formData.lastName);
    setValue('email', formData.email);
    setValue('password', formData.password);
    setValue('confirmPassword', formData.confirmPassword);
    setValue('sectorId', formData.sectorId as any);
    setValue('professionId', formData.professionId as any);
    setValue('customProfession', formData.customProfession);
    setValue('acceptTerms', formData.acceptTerms);
  }, [formData, setValue]);

  // Watch values for conditional rendering
  const sectorId = formData.sectorId;

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
    console.log('========================================');
    console.log('[RegisterScreen] 📍 HANDLE NEXT - Step:', currentStep);
    console.log('[RegisterScreen] Store data:', formData);
    console.log('========================================');

    const isValid = await validateStep(currentStep);

    if (!isValid) {
      console.log('[RegisterScreen] ❌ Step validation failed');
      return;
    }

    console.log('[RegisterScreen] ✅ Step validation passed');

    // Show success animation for step completion
    if (currentStep < TOTAL_STEPS) {
      setPendingStep(currentStep + 1);
      setShowStepSuccess(true);
    }
  }, [currentStep, validateStep, formData]);

  /**
   * Handle step success animation completion
   */
  const handleStepSuccessComplete = useCallback(() => {
    setShowStepSuccess(false);
    if (pendingStep !== null) {
      setStep(pendingStep);
      setPendingStep(null);
    }
  }, [pendingStep, setStep]);

  /**
   * Go to previous step
   */
  const handleBack = useCallback(() => {
    if (currentStep > Step.PERSONAL_INFO) {
      setStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation, setStep]);

  /**
   * Final submit - Register user
   */
  const onSubmit = useCallback(() => {
    console.log('========================================');
    console.log('[RegisterScreen] 🚀 SUBMIT CALLED');
    const submitData = getSubmitData();
    console.log('[RegisterScreen] Submit Data:', submitData);
    console.log('========================================');
    register({
      ...submitData,
      sectorId: submitData.sectorId!,
      professionId: submitData.professionId || undefined,
    });
  }, [register, getSubmitData]);

  /**
   * Handle submit with validation check
   */
  const handleFinalSubmit = useCallback(async () => {
    console.log('========================================');
    console.log('[RegisterScreen] 🎯 SUBMIT BUTTON CLICKED');
    console.log('[RegisterScreen] Current step:', currentStep);
    console.log('[RegisterScreen] 📋 STORE DATA:', formData);
    console.log('========================================');

    const isValid = await trigger();
    console.log('[RegisterScreen] Validation result:', isValid);

    if (!isValid) {
      console.log('[RegisterScreen] ❌ VALIDATION FAILED');
      console.log('[RegisterScreen] Errors:', errors);
      return;
    }

    console.log('[RegisterScreen] ✅ VALIDATION PASSED');
    onSubmit();
  }, [currentStep, formData, trigger, errors, onSubmit]);

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
          <Animated.View
            key="step-1"
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(150)}
            style={styles.stepContent}>
            {/* Step Header */}
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Tanışalım!</Text>
              <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
                Önce sizi tanıyalım
              </Text>
            </View>

            {/* Error Message */}
            {isError && error && (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: colors.status.errorBg,
                    marginTop: spacing.xs,
                    marginBottom: spacing.xl,
                  },
                ]}>
                <Icon name="alert-circle" size={20} color={colors.status.error} />
                <Text style={[styles.errorText, { color: colors.status.error }]}>
                  {getErrorMessage(error)}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.stepForm}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur } }) => (
                  <Input
                    label="Adınız"
                    placeholder="Adınızı girin"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChangeText={text => {
                      onChange(text);
                      updateField('firstName', text);
                    }}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                    required
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      // Focus next field (lastName) - handled by React Hook Form
                    }}
                    leftIcon={<Icon name="user" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur } }) => (
                  <Input
                    label="Soyadınız"
                    placeholder="Soyadınızı girin"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChangeText={text => {
                      onChange(text);
                      updateField('lastName', text);
                    }}
                    onBlur={onBlur}
                    error={errors.lastName?.message}
                    required
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    leftIcon={<Icon name="user" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />
            </View>
          </Animated.View>
        );

      case Step.PROFESSIONAL_INFO:
        return (
          <Animated.View
            key="step-2"
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(150)}
            style={styles.stepContent}>
            {/* Step Header */}
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Mesleğiniz</Text>
              <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
                Hangi sektörde çalışıyorsunuz?
              </Text>
            </View>

            {/* Error Message */}
            {isError && error && (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: colors.status.errorBg,
                    marginTop: spacing.xs,
                    marginBottom: spacing.xl,
                  },
                ]}>
                <Icon name="alert-circle" size={20} color={colors.status.error} />
                <Text style={[styles.errorText, { color: colors.status.error }]}>
                  {getErrorMessage(error)}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.stepForm}>
              <Controller
                control={control}
                name="sectorId"
                render={() => (
                  <SectorSelector
                    value={formData.sectorId}
                    onSelect={(sectorId: number | null) => {
                      if (sectorId !== null) {
                        setValue('sectorId', sectorId, { shouldValidate: true });
                        updateField('sectorId', sectorId);
                        // Reset profession when sector changes
                        setValue('professionId', null as any);
                        setValue('customProfession', '');
                        updateField('professionId', null);
                        updateField('customProfession', '');
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
                  render={({ field: { onChange, onBlur } }) => (
                    <Input
                      label="Mesleğiniz"
                      placeholder="Mesleğinizi yazın"
                      autoCapitalize="words"
                      value={formData.customProfession}
                      onChangeText={text => {
                        onChange(text);
                        updateField('customProfession', text);
                      }}
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
                  render={() => (
                    <ProfessionSelector
                      value={formData.professionId}
                      sectorCode={selectedSectorCode}
                      onSelect={(professionId: number | null) => {
                        if (professionId !== null) {
                          setValue('professionId', professionId, { shouldValidate: true });
                          updateField('professionId', professionId);
                        }
                      }}
                      error={errors.professionId?.message}
                      showDescription={false}
                    />
                  )}
                />
              )}
            </View>
          </Animated.View>
        );

      case Step.ACCOUNT_INFO:
        return (
          <Animated.View
            key="step-3"
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(150)}
            style={styles.stepContent}>
            {/* Step Header */}
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.text.primary }]}>
                Hesabınızı Oluşturun
              </Text>
              <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
                Güvenli bir şifre seçin
              </Text>
            </View>

            {/* Error Message */}
            {isError && error && (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: colors.status.errorBg,
                    marginTop: spacing.xs,
                    marginBottom: spacing.xl,
                  },
                ]}>
                <Icon name="alert-circle" size={20} color={colors.status.error} />
                <Text style={[styles.errorText, { color: colors.status.error }]}>
                  {getErrorMessage(error)}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.stepForm}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur } }) => (
                  <Input
                    label="E-posta Adresi"
                    placeholder="ornek@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    value={formData.email}
                    onChangeText={text => {
                      onChange(text);
                      updateField('email', text);
                    }}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    required
                    autoFocus
                    returnKeyType="next"
                    leftIcon={<Icon name="mail" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur } }) => (
                  <Input
                    label="Şifre"
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    value={formData.password}
                    onChangeText={text => {
                      onChange(text);
                      updateField('password', text);
                    }}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    hint="En az 8 karakter, büyük/küçük harf ve rakam içermeli"
                    required
                    returnKeyType="next"
                    leftIcon={<Icon name="lock" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur } }) => (
                  <Input
                    label="Şifre Tekrar"
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChangeText={text => {
                      onChange(text);
                      updateField('confirmPassword', text);
                    }}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    required
                    returnKeyType="done"
                    onSubmitEditing={handleFinalSubmit}
                    leftIcon={<Icon name="lock" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              {/* Terms & Privacy */}
              <View style={styles.termsContainer}>
                <Controller
                  control={control}
                  name="acceptTerms"
                  render={({ field: { onChange } }) => (
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        const newValue = !formData.acceptTerms;
                        onChange(newValue);
                        updateField('acceptTerms', newValue);
                      }}
                      activeOpacity={0.7}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: formData.acceptTerms
                              ? colors.interactive.default
                              : colors.background.secondary,
                            borderColor: errors.acceptTerms
                              ? colors.status.error
                              : colors.border.default,
                          },
                        ]}>
                        {formData.acceptTerms && (
                          <Icon name="check" size={16} color={colors.text.inverse} />
                        )}
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
          </Animated.View>
        );
      default:
        return null;
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
          </View>

          {/* Step Indicator */}
          <StepIndicator
            totalSteps={TOTAL_STEPS}
            currentStep={currentStep}
            icons={['user', 'briefcase', 'lock']}
            labels={['Bilgiler', 'Meslek', 'Hesap']}
          />

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
              <>
                <Button
                  title="Hesap Oluştur"
                  onPress={handleFinalSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                  size="lg"
                  fullWidth
                  rightIcon={<Icon name="check-circle" size={20} color={colors.text.inverse} />}
                />

                {/* Social Sign Up - Reference design */}
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
                      style={[
                        styles.socialButton,
                        { backgroundColor: colors.background.secondary },
                      ]}
                      disabled={true}>
                      <FAIcon name="apple" size={18} color={colors.text.secondary} />
                      <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
                        Apple
                      </Text>
                    </TouchableOpacity>
                  )}

                  {Platform.OS === 'android' && (
                    <TouchableOpacity
                      style={[
                        styles.socialButton,
                        { backgroundColor: colors.background.secondary },
                      ]}
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
              </>
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

      {/* Step Success Animation Overlay */}
      {showStepSuccess && <StepSuccess onComplete={handleStepSuccessComplete} duration={1200} />}
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
    paddingHorizontal: spacing.md,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  loginLink: {
    fontWeight: '600',
  },
});
