// src/features/verification/screens/VerificationReviewScreen.tsx
// Doğrulama önizleme ekranı
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@contexts';
import { spacing, typography } from '@theme';
import { Button } from '@shared/components';
import { useVerificationStore } from '../stores';
import { StepIndicator, ImagePreview } from '../components';
import type { VerificationStackParamList } from '@shared/types/navigation.types';

type NavigationProp = NativeStackNavigationProp<VerificationStackParamList, 'VerificationReview'>;

/**
 * Doğrulama önizleme ekranı
 */
export const VerificationReviewScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { colors } = theme;

  const { data, currentStep, setStep, setDocumentFront, setDocumentBack, setSelfie } =
    useVerificationStore();

  /**
   * Belge ön yüzünü tekrar çek
   */
  const handleRetakeDocumentFront = useCallback(() => {
    setDocumentFront(null as any);
    setStep('document_front');
    navigation.navigate('DocumentCapture', { side: 'front' });
  }, [navigation, setDocumentFront, setStep]);

  /**
   * Belge arka yüzünü tekrar çek
   */
  const handleRetakeDocumentBack = useCallback(() => {
    setDocumentBack(null as any);
    setStep('document_back');
    navigation.navigate('DocumentCapture', { side: 'back' });
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
    navigation.navigate('UploadStatus');
  }, [data, navigation, setStep]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Adım göstergesi */}
        <StepIndicator currentStep={currentStep} style={styles.stepIndicator} />

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Belgeleri Kontrol Edin</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
        <View style={[styles.checklistContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.checklistTitle, { color: colors.text }]}>Kontrol Listesi</Text>

          <View style={styles.checklistItem}>
            <Text style={styles.checkIcon}>{data.documentFront ? '✅' : '⬜️'}</Text>
            <Text style={[styles.checkText, { color: colors.textSecondary }]}>
              Belge ön yüzü net ve okunaklı
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <Text style={styles.checkIcon}>{data.documentBack ? '✅' : '⬜️'}</Text>
            <Text style={[styles.checkText, { color: colors.textSecondary }]}>
              Belge arka yüzü net ve okunaklı
            </Text>
          </View>

          <View style={styles.checklistItem}>
            <Text style={styles.checkIcon}>{data.selfie ? '✅' : '⬜️'}</Text>
            <Text style={[styles.checkText, { color: colors.textSecondary }]}>
              Selfie'de yüzünüz net görünüyor
            </Text>
          </View>
        </View>

        {/* Uyarı */}
        <View style={[styles.warningContainer, { backgroundColor: colors.warningLight }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={[styles.warningText, { color: colors.warning }]}>
            Belgeleriniz AI tarafından analiz edilecek ve sonuç 2-5 dakika içinde bildirilecektir.
          </Text>
        </View>
      </ScrollView>

      {/* Alt butonlar */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
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
    </SafeAreaView>
  );
});

VerificationReviewScreen.displayName = 'VerificationReviewScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  stepIndicator: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
  },
  previewSection: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  previewItem: {
    alignItems: 'center',
  },
  checklistContainer: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  checklistTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  checkText: {
    ...typography.bodySmall,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  warningText: {
    ...typography.bodySmall,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default VerificationReviewScreen;
