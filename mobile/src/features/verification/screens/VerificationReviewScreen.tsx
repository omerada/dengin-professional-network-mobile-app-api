// src/features/verification/screens/VerificationReviewScreen.tsx
// Doğrulama önizleme ekranı
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography, fontSize, borderRadius } from '@theme';
import { Button, SuccessCelebration } from '@shared/components';
import { useVerificationStore } from '../stores';
import { StepIndicator, ImagePreview } from '../components';
import type { VerificationStackParamList } from '@shared/types/navigation.types';

type NavigationProp = NativeStackNavigationProp<VerificationStackParamList, 'VerificationReview'>;

/**
 * Doğrulama önizleme ekranı
 */
export const VerificationReviewScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();

  const { data, currentStep, setStep, setDocumentFront, setDocumentBack, setSelfie } =
    useVerificationStore();

  const [showSuccess, setShowSuccess] = React.useState(false);

  /**
   * Belge ön yüzünü tekrar çek
   */
  const handleRetakeDocumentFront = useCallback(() => {
    setDocumentFront(null as any);
    setStep('document_front');
    navigation.navigate('DocumentCapture', { documentType: 'DIPLOMA', side: 'front' });
  }, [navigation, setDocumentFront, setStep]);

  /**
   * Belge arka yüzünü tekrar çek
   */
  const handleRetakeDocumentBack = useCallback(() => {
    setDocumentBack(null as any);
    setStep('document_back');
    navigation.navigate('DocumentCapture', { documentType: 'DIPLOMA', side: 'back' });
  }, [navigation, setDocumentBack, setStep]);

  /**
   * Selfie tekrar çek
   */
  const handleRetakeSelfie = useCallback(() => {
    setSelfie(null as any);
    setStep('selfie');
    navigation.navigate('SelfieCapture');
  }, [navigation, setSelfie, setStep]);

  /**
   * Doğrulamayı gönder
   */
  const handleSubmit = useCallback(() => {
    // Tüm görüntülerin mevcut olduğunu kontrol et
    if (!data.documentFront || !data.documentBack || !data.selfie) {
      Alert.alert('Eksik Belge', 'Lütfen tüm belgeleri çekin.', [{ text: 'Tamam' }]);
      return;
    }

    setStep('uploading');
    setShowSuccess(true);
  }, [data, setStep]);

  /**
   * İptal et
   */
  const handleCancel = useCallback(() => {
    Alert.alert(
      'İptal Et',
      'Doğrulama işlemini iptal etmek istediğinizden emin misiniz? Çekilen fotoğraflar silinecek.',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: () => {
            navigation.popToTop();
          },
        },
      ],
    );
  }, [navigation]);

  const isComplete = data.documentFront && data.documentBack && data.selfie;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Adım göstergesi */}
        <StepIndicator currentStep={currentStep} style={styles.stepIndicator} />

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Belgeleri Kontrol Edin</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Yüklemeden önce tüm belgelerin net ve okunaklı olduğundan emin olun.
          </Text>
        </View>

        {/* Görüntü önizlemeleri */}
        <View style={styles.previewSection}>
          {/* Belge ön yüz */}
          <View style={styles.previewItem}>
            <ImagePreview
              image={data.documentFront}
              label="Belge Ön Yüzü"
              onRetake={handleRetakeDocumentFront}
              fullWidth
            />
          </View>

          {/* Belge arka yüz */}
          <View style={styles.previewItem}>
            <ImagePreview
              image={data.documentBack}
              label="Belge Arka Yüzü"
              onRetake={handleRetakeDocumentBack}
              fullWidth
            />
          </View>

          {/* Selfie */}
          <View style={styles.previewItem}>
            <ImagePreview
              image={data.selfie}
              label="Selfie"
              onRetake={handleRetakeSelfie}
              fullWidth
            />
          </View>
        </View>

        {/* Kontrol listesi */}
        <View style={[styles.checklistContainer, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.checklistTitle, { color: colors.text.primary }]}>
            Kontrol Listesi
          </Text>

          <View style={styles.checklistItem}>
            <Text style={styles.checkIcon}>{data.documentFront ? '✅' : '⬜️'}</Text>
            <Text style={[styles.checkText, { color: colors.text.secondary }]}>
              Belge ön yüzü net ve okunaklı
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <Text style={styles.checkIcon}>{data.documentBack ? '✅' : '⬜️'}</Text>
            <Text style={[styles.checkText, { color: colors.text.secondary }]}>
              Belge arka yüzü net ve okunaklı
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <Text style={styles.checkIcon}>{data.selfie ? '✅' : '⬜️'}</Text>
            <Text style={[styles.checkText, { color: colors.text.secondary }]}>
              Selfie'de yüzünüz net görünüyor
            </Text>
          </View>
        </View>

        {/* Uyarı */}
        <View style={[styles.warningContainer, { backgroundColor: colors.status.warning + '20' }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={[styles.warningText, { color: colors.status.warning }]}>
            Belgeleriniz AI tarafından analiz edilecek ve sonuç 2-5 dakika içinde bildirilecektir.
          </Text>
        </View>
      </ScrollView>

      {/* Alt butonlar */}
      <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
        <Button
          title="İptal"
          variant="outline"
          onPress={handleCancel}
          style={styles.cancelButton}
        />
        <Button
          title="Gönder"
          onPress={handleSubmit}
          disabled={!isComplete}
          style={styles.submitButton}
          accessibilityLabel="Doğrulama belgelerini gönder"
        />
      </View>

      {/* Success Celebration */}
      <SuccessCelebration
        visible={showSuccess}
        type="checkmark"
        onComplete={() => {
          setShowSuccess(false);
          navigation.navigate('VerificationStatus');
        }}
      />
    </SafeAreaView>
  );
});

VerificationReviewScreen.displayName = 'VerificationReviewScreen';

const styles = StyleSheet.create({
  cancelButton: {
    flex: 1,
  },
  checkIcon: {
    fontSize: fontSize.base,
    marginRight: spacing.sm,
  },
  checkText: {
    ...typography.bodySmall,
    flex: 1,
  },
  checklistContainer: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  checklistItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  checklistTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  container: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  previewItem: {
    alignItems: 'center',
  },
  previewSection: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  stepIndicator: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  submitButton: {
    flex: 2,
  },
  subtitle: {
    ...typography.body,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  warningContainer: {
    alignItems: 'flex-start',
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    padding: spacing.md,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  warningText: {
    ...typography.bodySmall,
    flex: 1,
  },
});

// Wrap with Error Boundary for production safety
import { ErrorBoundary } from '@core/components';

export default function VerificationReviewScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <VerificationReviewScreen />
    </ErrorBoundary>
  );
}
