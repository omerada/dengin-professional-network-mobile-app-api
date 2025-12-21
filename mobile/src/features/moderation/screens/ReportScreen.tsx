// src/features/moderation/screens/ReportScreen.tsx
// Report/complaint screen
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { Button, Input } from '@shared/components';
import { spacing, fontSize } from '@theme';
import { showSuccess, showValidationError, showOperationError } from '@shared/utils';
import { useSemanticHaptic, useHaptic } from '@shared/hooks';
import { useCreateReport } from '../hooks';
import { REPORT_REASONS } from '../types';
import type { ReportReason, ReportType } from '../types';

/**
 * ReportScreen
 *
 * Screen for reporting users, posts, comments, or messages.
 * Shows a list of report reasons and optional description field.
 */
export const ReportScreen: React.FC = () => {
  const colors = useColors();
  const toast = useToast();
  const { trigger } = useHaptic();
  const { triggerSystem } = useSemanticHaptic();
  const navigation = useNavigation();
  const route = useRoute();

  const { type, targetId } = route.params as {
    type: ReportType;
    targetId: string | number;
  };

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');

  const createReport = useCreateReport();

  const handleSubmit = useCallback(async () => {
    if (!selectedReason) {
      showValidationError(toast, 'Lütfen bir neden seçin', { trigger });
      return;
    }

    try {
      await createReport.mutateAsync({
        type,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      showSuccess(
        toast,
        { trigger },
        'Şikayetiniz alındı. Ekibimiz en kısa sürede inceleyecektir.',
      );
      navigation.goBack();
    } catch (error) {
      showOperationError(toast, { trigger }, 'Şikayet gönderilirken bir hata oluştu');
    }
  }, [selectedReason, description, type, targetId, createReport, navigation, toast, triggerSystem]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Neden şikayet ediyorsunuz?
        </Text>

        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Size en uygun olan nedeni seçin
        </Text>

        <View style={styles.reasons}>
          {REPORT_REASONS.map(reason => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonItem,
                {
                  backgroundColor:
                    selectedReason === reason.value
                      ? colors.interactive.subtle
                      : colors.background.secondary,
                  borderColor:
                    selectedReason === reason.value
                      ? colors.interactive.default
                      : colors.border.default,
                },
              ]}
              onPress={() => setSelectedReason(reason.value)}>
              <Icon
                name={reason.icon}
                size={24}
                color={
                  selectedReason === reason.value
                    ? colors.interactive.default
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.reasonText,
                  {
                    color:
                      selectedReason === reason.value
                        ? colors.interactive.default
                        : colors.text.primary,
                  },
                ]}>
                {reason.label}
              </Text>
              {selectedReason === reason.value && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={colors.interactive.default}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedReason === 'OTHER' && (
          <View style={styles.descriptionSection}>
            <Input
              label="Açıklama (Opsiyonel)"
              value={description}
              onChangeText={setDescription}
              placeholder="Daha fazla bilgi verin..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
        <Button
          title="Şikayet Gönder"
          onPress={handleSubmit}
          loading={createReport.isPending}
          disabled={!selectedReason}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  checkIcon: {
    marginLeft: spacing.sm,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  descriptionSection: {
    marginTop: spacing.xl,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  reasonItem: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  reasonText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
    marginLeft: spacing.md,
  },
  reasons: {
    gap: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});
