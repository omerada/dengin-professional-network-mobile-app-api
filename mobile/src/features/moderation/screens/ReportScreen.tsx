// src/features/moderation/screens/ReportScreen.tsx
// Report/complaint screen
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { Button, Input } from '@shared/components';
import { spacing, typography } from '@theme';
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
  const { theme } = useTheme();
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
      Alert.alert('Hata', 'Lütfen bir neden seçin');
      return;
    }

    try {
      await createReport.mutateAsync({
        type,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      Alert.alert(
        'Teşekkürler',
        'Şikayetiniz alındı. Ekibimiz en kısa sürede inceleyecektir.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('Hata', 'Şikayet gönderilirken bir hata oluştu');
    }
  }, [selectedReason, description, type, targetId, createReport, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      edges={['bottom']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Neden şikayet ediyorsunuz?
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Size en uygun olan nedeni seçin
        </Text>

        <View style={styles.reasons}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonItem,
                {
                  backgroundColor:
                    selectedReason === reason.value
                      ? theme.colors.primary[50]
                      : theme.colors.background.secondary,
                  borderColor:
                    selectedReason === reason.value
                      ? theme.colors.primary[500]
                      : theme.colors.border.light,
                },
              ]}
              onPress={() => setSelectedReason(reason.value)}
            >
              <Icon
                name={reason.icon}
                size={24}
                color={
                  selectedReason === reason.value
                    ? theme.colors.primary[500]
                    : theme.colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.reasonText,
                  {
                    color:
                      selectedReason === reason.value
                        ? theme.colors.primary[500]
                        : theme.colors.text.primary,
                  },
                ]}
              >
                {reason.label}
              </Text>
              {selectedReason === reason.value && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary[500]}
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

      <View style={[styles.footer, { borderTopColor: theme.colors.border.light }]}>
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
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  reasons: {
    gap: spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginLeft: spacing.md,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  descriptionSection: {
    marginTop: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});
