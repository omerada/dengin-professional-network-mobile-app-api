// src/features/profile/screens/ChangePasswordScreen.tsx
// Change password screen - Backend AuthController.changePassword() ile uyumlu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-COMPLETION.md

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { Button, Input } from '@shared/components';
import { spacing, typography } from '@theme';
import { useChangePassword } from '../hooks';
import { getErrorMessage } from '@core/utils/errorUtils';
import { showSuccess, showPasswordChangeError } from '@shared/utils';
import { useHaptic } from '@shared/hooks';
import type { ChangePasswordRequest } from '../types';

/**
 * Password validation constants
 * Backend validation rules ile uyumlu
 */
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

/**
 * Validate password against rules
 */
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`En az ${PASSWORD_RULES.minLength} karakter olmalı`);
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('En az bir büyük harf içermeli');
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('En az bir küçük harf içermeli');
  }
  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    errors.push('En az bir rakam içermeli');
  }
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('En az bir özel karakter içermeli (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * ChangePasswordScreen
 *
 * Features:
 * - Current password verification
 * - New password with validation
 * - Password confirmation matching
 * - Real-time validation feedback
 *
 * Backend: POST /api/auth/change-password
 */
export const ChangePasswordScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();
  const toast = useToast();
  const { trigger } = useHaptic();
  const changePassword = useChangePassword();

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Current password
    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Mevcut şifre gerekli';
    }

    // New password
    if (!newPassword.trim()) {
      newErrors.newPassword = 'Yeni şifre gerekli';
    } else {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        newErrors.newPassword = passwordValidation.errors[0];
      }
    }

    // Confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Şifre tekrarı gerekli';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      newErrors.newPassword = 'Yeni şifre mevcut şifreden farklı olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentPassword, newPassword, confirmPassword]);

  // Handle password change
  const handleChangePassword = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    const request: ChangePasswordRequest = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    try {
      await changePassword.mutateAsync(request);
      showSuccess(toast, { trigger }, 'Şifreniz başarıyla değiştirildi');
      navigation.goBack();
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);

      if (errorMessage.toLowerCase().includes('current password')) {
        setErrors(prev => ({ ...prev, currentPassword: 'Mevcut şifre yanlış' }));
      } else {
        showPasswordChangeError(toast, { trigger });
      }
    }
  }, [
    validateForm,
    currentPassword,
    newPassword,
    confirmPassword,
    changePassword,
    toast,
    navigation,
  ]);

  // Password strength indicator
  const getPasswordStrength = useCallback(
    (password: string): { level: number; text: string; color: string } => {
      if (!password) {
        return { level: 0, text: '', color: colors.text.tertiary };
      }

      const validation = validatePassword(password);
      const passedRules = 5 - validation.errors.length;

      if (passedRules <= 1) {
        return { level: 1, text: 'Zayıf', color: colors.status.error };
      }
      if (passedRules <= 2) {
        return { level: 2, text: 'Orta', color: colors.status.warning };
      }
      if (passedRules <= 4) {
        return { level: 3, text: 'Güçlü', color: colors.status.success };
      }
      return { level: 4, text: 'Çok Güçlü', color: colors.status.success };
    },
    [colors],
  );

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header Info */}
          <View style={styles.infoCard}>
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              Güvenliğiniz için düzenli olarak şifrenizi değiştirmenizi öneririz. Yeni şifreniz en
              az 8 karakter olmalı ve büyük/küçük harf, rakam ve özel karakter içermelidir.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Mevcut Şifre</Text>
            <Input
              value={currentPassword}
              onChangeText={text => {
                setCurrentPassword(text);
                setErrors(prev => ({ ...prev, currentPassword: '' }));
              }}
              placeholder="Mevcut şifrenizi girin"
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.currentPassword}
              rightIcon={
                <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Icon
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </Pressable>
              }
            />
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Yeni Şifre</Text>
            <Input
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                setErrors(prev => ({ ...prev, newPassword: '' }));
              }}
              placeholder="Yeni şifrenizi girin"
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.newPassword}
              rightIcon={
                <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Icon
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </Pressable>
              }
            />

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map(level => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : colors.border.default,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Yeni Şifre (Tekrar)</Text>
            <Input
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="Yeni şifrenizi tekrar girin"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.confirmPassword}
              rightIcon={
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </Pressable>
              }
            />
          </View>

          {/* Password Requirements */}
          <View style={[styles.requirementsCard, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.requirementsTitle, { color: colors.text.primary }]}>
              Şifre Gereksinimleri:
            </Text>
            <View style={styles.requirementsList}>
              {[
                { text: 'En az 8 karakter', valid: newPassword.length >= 8 },
                { text: 'Bir büyük harf (A-Z)', valid: /[A-Z]/.test(newPassword) },
                { text: 'Bir küçük harf (a-z)', valid: /[a-z]/.test(newPassword) },
                { text: 'Bir rakam (0-9)', valid: /\d/.test(newPassword) },
                {
                  text: 'Bir özel karakter (!@#$%)',
                  valid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
                },
              ].map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementIcon,
                      {
                        color:
                          newPassword.length === 0
                            ? colors.text.tertiary
                            : req.valid
                              ? colors.status.success
                              : colors.status.error,
                      },
                    ]}>
                    {newPassword.length === 0 ? '○' : req.valid ? '✓' : '✗'}
                  </Text>
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color:
                          newPassword.length === 0
                            ? colors.text.tertiary
                            : req.valid
                              ? colors.text.secondary
                              : colors.status.error,
                      },
                    ]}>
                    {req.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title="Şifreyi Değiştir"
            onPress={handleChangePassword}
            loading={changePassword.isPending}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    marginBottom: spacing.xl,
  },
  infoText: {
    ...typography.body2,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  keyboardView: {
    flex: 1,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  requirementIcon: {
    ...typography.body2,
    fontWeight: '600',
    width: 20,
  },
  requirementItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  requirementText: {
    ...typography.body2,
  },
  requirementsCard: {
    borderRadius: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  requirementsList: {
    gap: spacing.xs,
  },
  requirementsTitle: {
    ...typography.subtitle2,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  strengthBar: {
    borderRadius: 2,
    flex: 1,
    height: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.xs,
  },
  strengthContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  strengthText: {
    ...typography.caption,
    marginLeft: spacing.sm,
    textAlign: 'right',
    width: 70,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

export default ChangePasswordScreen;
