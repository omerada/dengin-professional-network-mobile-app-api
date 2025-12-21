// src/features/moderation/components/ReportForm.tsx
// Report form bileşeni - Şikayet formu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { Button, Input } from '@shared/components';
import { spacing, fontSize, borderRadius } from '@theme';
import { REPORT_REASONS } from '../types';
import type { ReportReason, ReportType, CreateReportRequest } from '../types';

/**
 * ReportForm props
 */
interface ReportFormProps {
  /** Report type */
  type: ReportType;
  /** Target ID to report */
  targetId: string | number;
  /** Submit handler */
  onSubmit: (data: CreateReportRequest) => Promise<void>;
  /** Cancel handler */
  onCancel?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Show cancel button */
  showCancel?: boolean;
  /** Custom submit button text */
  submitText?: string;
  /** Test ID */
  testID?: string;
}

/**
 * ReportForm component
 *
 * Reusable form for reporting users, posts, comments, or messages.
 * Provides reason selection and optional description input.
 */
export const ReportForm = React.memo<ReportFormProps>(
  ({
    type,
    targetId,
    onSubmit,
    onCancel,
    isLoading = false,
    showCancel = true,
    submitText = 'Şikayet Gönder',
    testID,
  }) => {
    const colors = useColors();
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleReasonSelect = useCallback((reason: ReportReason) => {
      setSelectedReason(reason);
      setError(null);
      // Announce selection for accessibility
      AccessibilityInfo.announceForAccessibility(
        `${REPORT_REASONS.find(r => r.value === reason)?.label} seçildi`,
      );
    }, []);

    const handleSubmit = useCallback(async () => {
      if (!selectedReason) {
        setError('Lütfen bir neden seçin');
        AccessibilityInfo.announceForAccessibility('Hata: Lütfen bir neden seçin');
        return;
      }

      try {
        await onSubmit({
          type,
          targetId,
          reason: selectedReason,
          description: description.trim() || undefined,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
        setError(errorMessage);
      }
    }, [selectedReason, description, type, targetId, onSubmit]);

    const getTypeLabel = (reportType: ReportType): string => {
      const labels: Record<ReportType, string> = {
        USER: 'Kullanıcı',
        POST: 'Gönderi',
        COMMENT: 'Yorum',
        MESSAGE: 'Mesaj',
      };
      return labels[reportType];
    };

    return (
      <View
        style={styles.container}
        testID={testID}
        accessible={true}
        accessibilityLabel={`${getTypeLabel(type)} şikayet formu`}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]} accessibilityRole="header">
              Neden şikayet ediyorsunuz?
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {getTypeLabel(type)} için en uygun nedeni seçin
            </Text>
          </View>

          {/* Error message */}
          {error && (
            <View
              style={[styles.errorContainer, { backgroundColor: colors.status.errorBg }]}
              accessibilityRole="alert">
              <Icon name="alert-circle" size={20} color={colors.status.error} />
              <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
            </View>
          )}

          {/* Reason selection */}
          <View
            style={styles.reasonsContainer}
            accessibilityRole="radiogroup"
            accessibilityLabel="Şikayet nedenleri">
            {REPORT_REASONS.map(reason => {
              const isSelected = selectedReason === reason.value;
              return (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor: isSelected
                        ? colors.interactive.subtle
                        : colors.background.secondary,
                      borderColor: isSelected ? colors.interactive.default : colors.border.default,
                    },
                  ]}
                  onPress={() => handleReasonSelect(reason.value)}
                  disabled={isLoading}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={reason.label}
                  accessibilityHint={`${reason.label} nedenini seçmek için dokunun`}
                  testID={`report-reason-${reason.value}`}>
                  <View style={styles.reasonLeft}>
                    <Icon
                      name={reason.icon}
                      size={24}
                      color={isSelected ? colors.interactive.default : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.reasonLabel,
                        {
                          color: isSelected ? colors.interactive.pressed : colors.text.primary,
                        },
                      ]}>
                      {reason.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Icon name="checkmark-circle" size={24} color={colors.interactive.default} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description input */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionLabel, { color: colors.text.primary }]}>
              Ek bilgi (isteğe bağlı)
            </Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Şikayetinizle ilgili daha fazla detay ekleyebilirsiniz..."
              multiline
              numberOfLines={4}
              maxLength={500}
              editable={!isLoading}
              accessibilityLabel="Ek bilgi"
              accessibilityHint="Şikayetiniz hakkında ek detay girin"
              testID="report-description-input"
            />
            <Text style={[styles.charCount, { color: colors.text.tertiary }]}>
              {description.length}/500
            </Text>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={[styles.actions, { borderTopColor: colors.border.default }]}>
          {showCancel && onCancel && (
            <Button
              title="İptal"
              variant="ghost"
              onPress={onCancel}
              disabled={isLoading}
              style={styles.cancelButton}
              testID="report-cancel-button"
            />
          )}
          <Button
            title={submitText}
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!selectedReason || isLoading}
            style={styles.submitButton}
            testID="report-submit-button"
          />
        </View>
      </View>
    );
  },
);

ReportForm.displayName = 'ReportForm';

const styles = StyleSheet.create({
  actions: {
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  charCount: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  descriptionContainer: {
    marginBottom: spacing.md,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  descriptionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  errorContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  header: {
    marginBottom: spacing.lg,
  },
  reasonItem: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  reasonLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  reasonLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
  },
  reasonsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  submitButton: {
    flex: 2,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
});

export default ReportForm;
