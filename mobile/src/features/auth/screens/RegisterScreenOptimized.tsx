// src/features/auth/screens/RegisterScreenOptimized.tsx
// Optimized 2-Step Registration - Modern UX
// Step 1: Email + Password + Name (Social Login Priority)
// Step 2: Sector + Profession (Optional - "Atla" button)

import React, { useCallback, useState } from 'react';
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
import { SectorSelector, ProfessionSelector } from '../components';
import { useRegister } from '../hooks';
import { registerOptimizedSchema, RegisterOptimizedSchemaType } from '../validation';
import { AuthStackNavigationProp } from '@shared/types';
import { spacing } from '@theme';
import { useSectors } from '@shared/hooks';

/**
 * Password Strength Indicator Component
 */
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const colors = useColors();

  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: colors.text.tertiary };
    if (password.length < 6) return { level: 1, text: 'Zayıf', color: colors.status.error };
    if (password.length < 8) return { level: 2, text: 'Orta', color: colors.status.warning };
    if (!/[A-Z]/.test(password)) return { level: 2, text: 'Orta', color: colors.status.warning };
    return { level: 3, text: 'Güçlü', color: colors.status.success };
  };

  const strength = getStrength();

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        {[1, 2, 3].map(level => (
          <View
            key={level}
            style={[
              styles.strengthBar,
              {
                backgroundColor: level <= strength.level ? strength.color : colors.border.default,
              },
            ]}
          />
        ))}
      </View>
      {strength.text && (
        <Text style={[styles.strengthText, { color: strength.color }]}>{strength.text}</Text>
      )}
    </View>
  );
};

enum Step {
  ESSENTIALS = 1,
  PROFESSIONAL = 2,
}

/**
 * Optimized Register Screen
 * Modern 2-step flow with social login priority
 */
export const RegisterScreenOptimized: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { register, isLoading, error, isError } = useRegister();
  const { data: sectors } = useSectors();

  const [currentStep, setCurrentStep] = useState(Step.ESSENTIALS);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<RegisterOptimizedSchemaType>({
    resolver: zodResolver(registerOptimizedSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      sectorId: undefined,
      professionId: undefined,
      customProfession: '',
    },
  });

  const sectorId = watch('sectorId');

  // Get sector code from sectorId for ProfessionSelector
  const sectorCode = sectorId ? sectors?.find(s => s.id === sectorId)?.code : null;

  /**
   * Step 1 → Step 2 Validation
   */
  const handleNextStep = useCallback(async () => {
    const isValid = await trigger(['email', 'password', 'firstName', 'lastName']);
    if (isValid) {
      setCurrentStep(Step.PROFESSIONAL);
    }
  }, [trigger]);

  /**
   * Final Submit (with professional info)
   */
  const onSubmit = useCallback(
    (data: RegisterOptimizedSchemaType) => {
      register(data);
    },
    [register],
  );

  const handleBack = useCallback(() => {
    if (currentStep === Step.PROFESSIONAL) {
      setCurrentStep(Step.ESSENTIALS);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              {currentStep === Step.ESSENTIALS ? 'Hesap Oluştur' : 'Meslek Bilgileri'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.interactive.default },
                  currentStep === Step.ESSENTIALS ? styles.progressHalf : styles.progressFull,
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text.tertiary }]}>
              Adım {currentStep} / 2
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

          {/* Step Content */}
          {currentStep === Step.ESSENTIALS ? (
            <Animated.View key="step-1" entering={FadeIn} exiting={FadeOut}>
              {/* Social Login Priority */}
              <View style={styles.socialSection}>
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
                        Apple ile Kayıt Ol
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
                      Google ile Kayıt Ol
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

              {/* Name Fields - Side by Side */}
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Ad"
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
                <View style={styles.nameField}>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Soyad"
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
                    label="E-posta"
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
                    leftIcon={<Icon name="mail" size={20} color={colors.text.tertiary} />}
                  />
                )}
              />

              {/* Password with Strength Indicator */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Şifre"
                      placeholder="En az 8 karakter"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      required
                      leftIcon={<Icon name="lock" size={20} color={colors.text.tertiary} />}
                      rightIcon={
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Icon
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.text.tertiary}
                          />
                        </TouchableOpacity>
                      }
                    />
                    <PasswordStrength password={value} />
                  </View>
                )}
              />

              {/* Terms - Compact */}
              <View style={styles.termsContainer}>
                <Text style={[styles.termsText, { color: colors.text.tertiary }]}>
                  Kaydol&apos;a tıklayarak{' '}
                  <Text
                    style={[styles.termsLink, { color: colors.interactive.default }]}
                    onPress={handleTermsPress}>
                    Kullanım Koşulları
                  </Text>
                  {' ve '}
                  <Text
                    style={[styles.termsLink, { color: colors.interactive.default }]}
                    onPress={handlePrivacyPress}>
                    Gizlilik Politikası
                  </Text>
                  &apos;nı kabul etmiş olursunuz.
                </Text>
              </View>

              {/* Next Button */}
              <Button
                title="İleri"
                onPress={handleNextStep}
                size="lg"
                fullWidth
                rightIcon={<Icon name="arrow-right" size={20} color={colors.text.inverse} />}
              />
            </Animated.View>
          ) : (
            <Animated.View key="step-2" entering={FadeIn} exiting={FadeOut}>
              {/* Professional Info (Required) */}
              <View style={styles.stepHeader}>
                <Text style={[styles.stepSubtitle, { color: colors.text.secondary }]}>
                  Mesleğinizi belirtin ve profesyonel ağınıza katılın
                </Text>
                <Text style={[styles.stepDescription, { color: colors.text.tertiary }]}>
                  Sektörünüzden profesyonellerle bağlantı kurun
                </Text>
              </View>

              <Controller
                control={control}
                name="sectorId"
                render={({ field: { onChange, value } }) => (
                  <SectorSelector
                    value={value}
                    onSelect={onChange}
                    error={errors.sectorId?.message}
                  />
                )}
              />

              {sectorId && (
                <Controller
                  control={control}
                  name="professionId"
                  render={({ field: { onChange, value } }) => (
                    <ProfessionSelector
                      sectorCode={sectorCode}
                      value={value}
                      onSelect={onChange}
                      error={errors.professionId?.message}
                    />
                  )}
                />
              )}

              {/* Buttons */}
              <View style={styles.buttonGroup}>
                <Button
                  title={isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
                  onPress={handleSubmit(onSubmit)}
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                />
              </View>
            </Animated.View>
          )}

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.text.secondary }]}>
              Zaten hesabın var mı?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
  backButton: {
    padding: spacing.sm,
  },
  buttonGroup: {
    gap: spacing.md,
    marginTop: spacing.xl,
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
  errorContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  keyboardAvoid: {
    flex: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  loginText: {
    fontSize: 15,
  },
  nameField: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  progressBar: {
    borderRadius: 2,
    height: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressFill: {
    borderRadius: 2,
    height: '100%',
  },
  progressFull: {
    width: '100%',
  },
  progressHalf: {
    width: '50%',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
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
    fontSize: 16,
    fontWeight: '600',
  },
  socialButtonsColumn: {
    gap: spacing.md,
  },
  socialSection: {
    marginBottom: spacing.lg,
  },
  stepHeader: {
    marginBottom: spacing.xl,
  },
  stepSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  strengthBar: {
    borderRadius: 1.5,
    flex: 1,
    height: 3,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  strengthContainer: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  termsContainer: {
    marginVertical: spacing.lg,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
