// src/features/verification/components/UploadProgress.tsx
// Yükleme ilerleme göstergesi bileşeni
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo } from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useColors } from '@contexts';
import { spacing, typography } from '@theme';
import type { UploadProgress as UploadProgressType } from '../types';

/**
 * Yükleme ilerleme props
 */
interface UploadProgressProps {
  /** İlerleme verisi */
  progress: UploadProgressType;
  /** Özel stil */
  style?: ViewStyle;
}

/**
 * İlerleme çubuğu bileşeni
 */
interface ProgressBarProps {
  label: string;
  progress: number;
  isActive: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = memo(({ label, progress, isActive }) => {
  const colors = useColors();

  const animatedWidth = useAnimatedStyle(() => ({
    width: withSpring(`${progress}%` as unknown as number, {
      damping: 20,
      stiffness: 100,
    }),
  }));

  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text
          style={[
            styles.progressLabel,
            {
              color: isActive ? colors.text.primary : colors.text.secondary,
              fontWeight: isActive ? '600' : '400',
            },
          ]}>
          {label}
        </Text>
        <Text
          style={[
            styles.progressValue,
            { color: isActive ? colors.interactive.default : colors.text.secondary },
          ]}>
          {progress}%
        </Text>
      </View>
      <View
        style={[styles.progressBarBackground, { backgroundColor: colors.background.secondary }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor:
                progress === 100 ? colors.status.success : colors.interactive.default,
            },
            animatedWidth,
          ]}
        />
      </View>
    </View>
  );
});

ProgressBar.displayName = 'ProgressBar';

/**
 * Yükleme durumu metinleri
 */
const STATUS_MESSAGES: Record<UploadProgressType['status'], string> = {
  idle: 'Yükleme hazır',
  uploading: 'Belgeler yükleniyor...',
  processing: 'AI analizi yapılıyor...',
  completed: 'Yükleme tamamlandı!',
  failed: 'Yükleme başarısız oldu',
};

/**
 * Yükleme ilerleme göstergesi
 * Belge yükleme sürecinin detaylı ilerlemesini gösterir
 */
export const UploadProgress: React.FC<UploadProgressProps> = memo(({ progress, style }) => {
  const colors = useColors();

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return colors.status.success;
      case 'failed':
        return colors.status.error;
      case 'processing':
        return colors.status.warning;
      default:
        return colors.interactive.default;
    }
  };

  const isUploading = progress.status === 'uploading' || progress.status === 'processing';

  return (
    <View style={[styles.container, style]}>
      {/* Durum başlığı */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor() },
            isUploading && styles.statusDotAnimated,
          ]}
        />
        <Text style={[styles.statusText, { color: colors.text.primary }]}>
          {STATUS_MESSAGES[progress.status]}
        </Text>
      </View>

      {/* Toplam ilerleme */}
      <View style={styles.totalProgress}>
        <View
          style={[
            styles.totalProgressBackground,
            { backgroundColor: colors.background.secondary },
          ]}>
          <Animated.View
            style={[
              styles.totalProgressFill,
              { backgroundColor: getStatusColor() },
              { width: `${progress.total}%` },
            ]}
          />
        </View>
        <Text style={[styles.totalProgressText, { color: colors.text.secondary }]}>
          {progress.total}%
        </Text>
      </View>

      {/* Detaylı ilerleme */}
      <View style={styles.detailsContainer}>
        <ProgressBar
          label="📄 Belge Ön Yüz"
          progress={progress.documentFront}
          isActive={progress.status === 'uploading' && progress.documentFront < 100}
        />
        <ProgressBar
          label="📄 Belge Arka Yüz"
          progress={progress.documentBack}
          isActive={
            progress.status === 'uploading' &&
            progress.documentFront === 100 &&
            progress.documentBack < 100
          }
        />
        <ProgressBar
          label="🤳 Selfie"
          progress={progress.selfie}
          isActive={
            progress.status === 'uploading' &&
            progress.documentBack === 100 &&
            progress.selfie < 100
          }
        />
      </View>

      {/* AI İşlem bilgisi */}
      {progress.status === 'processing' && (
        <View style={[styles.processingInfo, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.processingText, { color: colors.text.secondary }]}>
            🤖 Belgeleriniz yapay zeka ile analiz ediliyor...
          </Text>
          <Text style={[styles.processingSubtext, { color: colors.text.secondary }]}>
            Bu işlem birkaç dakika sürebilir
          </Text>
        </View>
      )}
    </View>
  );
});

UploadProgress.displayName = 'UploadProgress';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusDotAnimated: {
    // Animasyon için - native driver ile pulse efekti
  },
  statusText: {
    ...typography.h3,
  },
  totalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  totalProgressBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  totalProgressText: {
    ...typography.body,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  detailsContainer: {
    gap: spacing.md,
  },
  progressItem: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.bodySmall,
  },
  progressValue: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  processingInfo: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingText: {
    ...typography.body,
    textAlign: 'center',
  },
  processingSubtext: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default UploadProgress;
