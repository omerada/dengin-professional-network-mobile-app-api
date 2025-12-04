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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { Button, Input } from '@shared/components';
import { spacing, typography } from '@theme';
import { useDeleteAccount } from '../hooks';
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
  const { theme } = useTheme();
  const navigation = useNavigation();
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
              const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Hesap silme işlemi başarısız';

              if (errorMessage.toLowerCase().includes('password')) {
                setErrors(prev => ({ ...prev, password: 'Şifre yanlış' }));
              } else {
                Alert.alert('Hata', errorMessage);
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
        size="small"
        onPress={() => setSelectedReason(isSelected ? null : id)}
        style={styles.reasonButton}
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Warning Card */}
          <View style={[styles.warningCard, { backgroundColor: theme.colors.error.background }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningTitle, { color: theme.colors.error.main }]}>
              Dikkat! Bu işlem geri alınamaz
            </Text>
            <Text style={[styles.warningText, { color: theme.colors.error.dark }]}>
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
                  <Text style={[styles.warningBullet, { color: theme.colors.error.main }]}>•</Text>
                  <Text style={[styles.warningItemText, { color: theme.colors.error.dark }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reason Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Neden ayrılıyorsunuz? (Opsiyonel)
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
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
                style={styles.customReasonInput}
              />
            )}
          </View>

          {/* Password Verification */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Şifrenizi Girin
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
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
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
          </View>

          {/* Confirmation Text */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Onay Metni
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
              Devam etmek için aşağıya{' '}
              <Text style={[styles.confirmTextHighlight, { color: theme.colors.error.main }]}>
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
          <View style={[styles.infoCard, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              ℹ️ Hesabınız 30 gün boyunca geri alınabilir durumda kalacaktır. Bu süre içinde 
              tekrar giriş yaparsanız hesabınız yeniden aktifleştirilir.
            </Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  warningCard: {
    padding: spacing.lg,
    borderRadius: spacing.md,
    marginBottom: spacing.xl,
  },
  warningIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  warningTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.body2,
    marginBottom: spacing.sm,
  },
  warningList: {
    marginTop: spacing.sm,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  warningBullet: {
    ...typography.body2,
    marginRight: spacing.xs,
    fontWeight: 'bold',
  },
  warningItemText: {
    ...typography.body2,
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body2,
    marginBottom: spacing.md,
  },
  confirmTextHighlight: {
    fontWeight: 'bold',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reasonButton: {
    marginBottom: spacing.xs,
  },
  customReasonInput: {
    marginTop: spacing.md,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  deleteButton: {
    // Styled via variant="danger"
  },
  cancelButton: {
    // Styled via variant="ghost"
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    lineHeight: 20,
  },
});

export default AccountDeletionScreen;
