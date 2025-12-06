// src/features/verification/screens/VerificationIntroScreen.tsx
// Doğrulama başlangıç ekranı
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
import { Button } from '@shared/components';
import { useVerificationStore } from '../stores';
import { StepIndicator } from '../components';
import type { VerificationStackParamList } from '@shared/types/navigation.types';

type NavigationProp = NativeStackNavigationProp<VerificationStackParamList, 'VerificationIntro'>;

/**
 * Bilgi kartı bileşeni
 */
interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = memo(({ icon, title, description }) => {
  const colors = useColors();

  return (
    <View
      style={[styles.infoCard, { backgroundColor: colors.background.secondary }]}
      accessibilityRole="text">
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={[styles.infoTitle, { color: colors.text.primary }]}>{title}</Text>
        <Text style={[styles.infoDescription, { color: colors.text.secondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
});

InfoCard.displayName = 'InfoCard';

/**
 * Doğrulama başlangıç ekranı
 */
export const VerificationIntroScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();
  const { setStep, currentStep, reset } = useVerificationStore();

  /**
   * Doğrulamayı başlat
   */
  const handleStart = useCallback(() => {
    reset(); // Önceki verileri temizle
    setStep('document_front');
    navigation.navigate('DocumentCapture', { documentType: 'diploma', side: 'front' });
  }, [navigation, reset, setStep]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Adım göstergesi */}
        <StepIndicator currentStep={currentStep} style={styles.stepIndicator} />

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🔐</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>Meslek Doğrulama</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Meslektaşlarınızla güvenle bağlantı kurmak için mesleğinizi doğrulayın
          </Text>
        </View>

        {/* Adımlar */}
        <View style={styles.stepsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Nasıl Çalışır?</Text>

          <InfoCard
            icon="📄"
            title="1. Belge Fotoğrafı"
            description="Diploma veya sertifikanızın ön ve arka yüzünü çekin"
          />

          <InfoCard
            icon="🤳"
            title="2. Selfie"
            description="Kimliğinizi doğrulamak için bir selfie çekin"
          />

          <InfoCard
            icon="🤖"
            title="3. AI Doğrulama"
            description="Yapay zeka ile belgeleriniz otomatik olarak kontrol edilir"
          />

          <InfoCard
            icon="✅"
            title="4. Onay"
            description="Doğrulama tamamlandığında profilinizde rozet görünür"
          />
        </View>

        {/* Gereksinimler */}
        <View style={styles.requirementsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Gereksinimler</Text>

          <View style={[styles.requirementsList, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.requirementItem, { color: colors.text.secondary }]}>
              • Geçerli bir diploma veya sertifika
            </Text>
            <Text style={[styles.requirementItem, { color: colors.text.secondary }]}>
              • İyi aydınlatılmış ortam
            </Text>
            <Text style={[styles.requirementItem, { color: colors.text.secondary }]}>
              • Net ve okunaklı belge fotoğrafı
            </Text>
            <Text style={[styles.requirementItem, { color: colors.text.secondary }]}>
              • Yüzünüzün net göründüğü selfie
            </Text>
          </View>
        </View>

        {/* Güvenlik notu */}
        <View style={[styles.securityNote, { backgroundColor: colors.interactive.subtle }]}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={[styles.securityText, { color: colors.interactive.default }]}>
            Belgeleriniz güvenli şekilde işlenir ve doğrulama sonrası silinir. KVKK uyumlu veri
            işleme politikamız gereği kişisel verileriniz korunur.
          </Text>
        </View>
      </ScrollView>

      {/* Başlat butonu */}
      <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
        <Button
          title="Doğrulamayı Başlat"
          onPress={handleStart}
          fullWidth
          size="lg"
          accessibilityLabel="Meslek doğrulama sürecini başlat"
        />
      </View>
    </SafeAreaView>
  );
});

VerificationIntroScreen.displayName = 'VerificationIntroScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepIndicator: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  stepsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.bodySmall,
  },
  requirementsSection: {
    marginBottom: spacing.xl,
  },
  requirementsList: {
    padding: spacing.md,
    borderRadius: 12,
  },
  requirementItem: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  securityNote: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  securityText: {
    ...typography.bodySmall,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});

export default VerificationIntroScreen;
