// src/features/profile/screens/AccountDeletionScreen.tsx
// Account deletion screen - Backend UserController.deleteAccount() ile uyumlu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-COMPLETION.md

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { Button, Input } from '@shared/components';
import { spacing, typography } from '@theme';
import { useDeleteAccount } from '../hooks';
import { getErrorMessage } from '@core/utils/errorUtils';
import type { DeleteAccountRequest } from '../types';

/**
 * Deletion reasons for analytics
 */
const DELETION_REASONS = [
  { id: 'not_using', label: 'Artık kullanmıyorum' },
  { id: 'privacy', label: 'Gizlilik endişeleri' },
  { id: 'too_many_notifications', label: 'Çok fazla bildirim' },
  { id: 'found_alternative', label: 'Başka bir uygulama buldum' },
  { id: 'not_useful', label: 'İşime yaramıyor' },
  { id: 'other', label: 'Diğer' },
];

/**
 * AccountDeletionScreen
 *
 * Features:
 * - Clear warning about irreversible action
 * - Password verification
 * - Optional reason selection
 * - Confirmation flow
 *
 * Backend: DELETE /api/users/me
 *
 * Business Rules:
 * - Soft delete (user data anonymized but kept for 30 days)
 * - All sessions invalidated
 * - Email can be reused after 30 days
 */
export const AccountDeletionScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();
  const toast = useToast();
  const deleteAccount = useDeleteAccount();

  // Form state
  const [password, setPassword] = useState('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation text that user must type
  const CONFIRM_TEXT = 'HESABIMI SİL';

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password.trim()) {
      newErrors.password = 'Şifrenizi girin';
    }

    if (confirmText !== CONFIRM_TEXT) {
      newErrors.confirmText = `"${CONFIRM_TEXT}" yazmanız gerekiyor`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [password, confirmText]);

  // Get final reason string
  const getFinalReason = useCallback((): string | undefined => {
    if (!selectedReason) return undefined;

    if (selectedReason === 'other' && customReason.trim()) {
      return customReason.trim();
    }

    const reason = DELETION_REASONS.find(r => r.id === selectedReason);
    return reason?.label;
  }, [selectedReason, customReason]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    // Final confirmation
    Alert.alert(
      '⚠️ Son Onay',
      'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir. Devam etmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            const request: DeleteAccountRequest = {
              password,
              reason: getFinalReason(),
            };

            try {
              await deleteAccount.mutateAsync(request);
              // User will be logged out automatically by the hook
            } catch (error: any) {
              const errorMessage = getErrorMessage(error);

              if (errorMessage.toLowerCase().includes('password')) {
                setErrors(prev => ({ ...prev, password: 'Şifre yanlış' }));
              } else {
                toast.error(errorMessage, 'Hesap Silinemedi');
              }
            }
          },
        },
      ],
    );
  }, [validateForm, password, getFinalReason, deleteAccount]);

  // Reason button component
  const ReasonButton: React.FC<{ id: string; label: string }> = ({ id, label }) => {
    const isSelected = selectedReason === id;
    return (
      <Button
        title={label}
        variant={isSelected ? 'primary' : 'outline'}
        size="sm"
        onPress={() => setSelectedReason(isSelected ? null : id)}
        style={styles.reasonButton}
      />
    );
  };

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
          {/* Warning Card */}
          <View style={[styles.warningCard, { backgroundColor: colors.status.errorBg }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningTitle, { color: colors.status.error }]}>
              Dikkat! Bu işlem geri alınamaz
            </Text>
            <Text style={[styles.warningText, { color: colors.status.error }]}>
              Hesabınızı sildiğinizde:
            </Text>
            <View style={styles.warningList}>
              {[
                'Tüm paylaşımlarınız silinecek',
                'Takipçileriniz ve takip ettikleriniz kaldırılacak',
                'Mesajlarınız erişilemez olacak',
                'Doğrulanmış meslek bilginiz geçersiz olacak',
                'Bu e-posta ile 30 gün boyunca yeni hesap açılamayacak',
              ].map((item, index) => (
                <View key={index} style={styles.warningItem}>
                  <Text style={[styles.warningBullet, { color: colors.status.error }]}>•</Text>
                  <Text style={[styles.warningItemText, { color: colors.status.error }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reason Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Neden ayrılıyorsunuz? (Opsiyonel)
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
              Geri bildiriminiz uygulamamızı geliştirmemize yardımcı olur
            </Text>
            <View style={styles.reasonsContainer}>
              {DELETION_REASONS.map(reason => (
                <ReasonButton key={reason.id} {...reason} />
              ))}
            </View>

            {/* Custom Reason Input */}
            {selectedReason === 'other' && (
              <Input
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Nedeninizi yazın..."
                multiline
                numberOfLines={3}
                containerStyle={styles.customReasonInput}
              />
            )}
          </View>

          {/* Password Verification */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Şifrenizi Girin
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
              Kimliğinizi doğrulamak için şifrenizi girin
            </Text>
            <Input
              value={password}
              onChangeText={text => {
                setPassword(text);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder="Şifreniz"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.password}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </Pressable>
              }
            />
          </View>

          {/* Confirmation Text */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Onay Metni</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
              Devam etmek için aşağıya{' '}
              <Text style={[styles.confirmTextHighlight, { color: colors.status.error }]}>
                {CONFIRM_TEXT}
              </Text>{' '}
              yazın
            </Text>
            <Input
              value={confirmText}
              onChangeText={text => {
                setConfirmText(text.toUpperCase());
                setErrors(prev => ({ ...prev, confirmText: '' }));
              }}
              placeholder={CONFIRM_TEXT}
              autoCapitalize="characters"
              autoCorrect={false}
              error={errors.confirmText}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Hesabımı Kalıcı Olarak Sil"
              variant="danger"
              onPress={handleDeleteAccount}
              loading={deleteAccount.isPending}
              disabled={!password || confirmText !== CONFIRM_TEXT}
              style={styles.deleteButton}
            />
            <Button
              title="Vazgeç"
              variant="ghost"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
          </View>

          {/* Info Note */}
          <View style={[styles.infoCard, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              ℹ️ Hesabınız 30 gün boyunca geri alınabilir durumda kalacaktır. Bu süre içinde tekrar
              giriş yaparsanız hesabınız yeniden aktifleştirilir.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cancelButton: {
    // Styled via variant="ghost"
  },
  confirmTextHighlight: {
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  customReasonInput: {
    marginTop: spacing.md,
  },
  deleteButton: {
    // Styled via variant="danger"
  },
  infoCard: {
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  infoText: {
    ...typography.caption,
    lineHeight: 20,
  },
  keyboardView: {
    flex: 1,
  },
  reasonButton: {
    marginBottom: spacing.xs,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionSubtitle: {
    ...typography.body2,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  warningBullet: {
    ...typography.body2,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  warningCard: {
    borderRadius: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  warningIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  warningItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  warningItemText: {
    ...typography.body2,
    flex: 1,
  },
  warningList: {
    marginTop: spacing.sm,
  },
  warningText: {
    ...typography.body2,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default AccountDeletionScreen;
