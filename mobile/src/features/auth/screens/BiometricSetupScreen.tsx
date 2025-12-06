// src/features/auth/screens/BiometricSetupScreen.tsx
// Biometric setup screen for Face ID / Touch ID
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-COMPLETION.md
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { Button, Loading } from '@shared/components';
import { spacing, typography } from '@theme';
import { biometricService } from '../services/biometricService';
import { useAuthStore } from '../stores';

// Biometric icons (you can replace with actual images)
const BIOMETRIC_ICONS = {
  FaceID: '🔐', // Replace with actual Face ID image asset
  TouchID: '👆', // Replace with actual Touch ID image asset
  Biometrics: '🔒',
};

/**
 * BiometricSetupScreen
 *
 * Allows users to enable/disable biometric authentication.
 * Supports Face ID (iOS), Touch ID (iOS), and Fingerprint (Android).
 *
 * Flow:
 * 1. Check biometric availability
 * 2. Show appropriate UI based on biometric type
 * 3. Enable/disable biometric with user confirmation
 *
 * Security:
 * - Stores encrypted credentials in secure storage
 * - Requires successful biometric auth before enabling
 */
export const BiometricSetupScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();
  const toast = useToast();

  // Auth store
  const { user, refreshToken } = useAuthStore();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [biometricName, setBiometricName] = useState<string>('Biyometrik');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      setIsLoading(true);

      // Check availability
      const { available, biometryType } = await biometricService.isAvailable();
      setIsAvailable(available);
      setBiometricType(biometryType);

      // Get display name
      const name = await biometricService.getBiometricName();
      setBiometricName(name);

      // Check if already enabled
      const enabled = await biometricService.isEnabled();
      setIsEnabled(enabled);
    } catch (error) {
      console.error('[BiometricSetupScreen] Error checking status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle enable biometric
  const handleEnableBiometric = useCallback(async () => {
    if (!user?.email || !refreshToken) {
      Alert.alert('Hata', 'Biyometrik kimlik doğrulama için giriş yapmalısınız.');
      return;
    }

    setIsProcessing(true);

    try {
      // First, verify biometric works
      const { success, error } = await biometricService.authenticate(
        `${biometricName} ile giriş özelliğini etkinleştirmek için kimliğinizi doğrulayın`,
      );

      if (!success) {
        Alert.alert('Doğrulama Başarısız', error || 'Biyometrik doğrulama başarısız oldu.');
        return;
      }

      // Enable biometric login
      const enabled = await biometricService.enable(user.email, refreshToken);

      if (enabled) {
        setIsEnabled(true);
        toast.success(`${biometricName} ile giriş etkinleştirildi`, 'Başarılı');
      } else {
        Alert.alert('Hata', 'Biyometrik giriş etkinleştirilemedi.');
      }
    } catch (error) {
      console.error('[BiometricSetupScreen] Enable error:', error);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  }, [user, refreshToken, biometricName, toast]);

  // Handle disable biometric
  const handleDisableBiometric = useCallback(async () => {
    Alert.alert(
      `${biometricName} Devre Dışı Bırak`,
      `${biometricName} ile giriş özelliğini devre dışı bırakmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Devre Dışı Bırak',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);

            try {
              const disabled = await biometricService.disable();

              if (disabled) {
                setIsEnabled(false);
                toast.info(`${biometricName} ile giriş devre dışı bırakıldı`, 'Devre Dışı');
              } else {
                Alert.alert('Hata', 'Biyometrik giriş devre dışı bırakılamadı.');
              }
            } catch (error) {
              console.error('[BiometricSetupScreen] Disable error:', error);
              Alert.alert('Hata', 'Bir hata oluştu.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  }, [biometricName, toast]);

  // Get biometric icon
  const getBiometricIcon = (): string => {
    if (biometricType === 'FaceID') return BIOMETRIC_ICONS.FaceID;
    if (biometricType === 'TouchID') return BIOMETRIC_ICONS.TouchID;
    return BIOMETRIC_ICONS.Biometrics;
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['bottom']}>
        <Loading size="large" text="Kontrol ediliyor..." />
      </SafeAreaView>
    );
  }

  // Biometric not available
  if (!isAvailable) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['bottom']}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚫</Text>
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Biyometrik Kullanılamıyor
          </Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            Cihazınızda biyometrik kimlik doğrulama (Face ID, Touch ID veya parmak izi)
            desteklenmiyor veya ayarlanmamış.
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.infoTitle, { color: colors.text.primary }]}>
              Nasıl Etkinleştirilir?
            </Text>
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              {Platform.OS === 'ios'
                ? "1. Ayarlar uygulamasını açın\n2. Face ID & Parola veya Touch ID & Parola'ya gidin\n3. Biyometrik kimliğinizi ayarlayın"
                : '1. Ayarlar uygulamasını açın\n2. Güvenlik bölümüne gidin\n3. Parmak izi ekleyin'}
            </Text>
          </View>
          <Button
            title="Geri Dön"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['bottom']}>
      <View style={styles.content}>
        {/* Biometric Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isEnabled ? colors.status.success : colors.background.secondary,
            },
          ]}>
          <Text style={styles.icon}>{getBiometricIcon()}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {biometricName} ile Giriş
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          {isEnabled
            ? `${biometricName} ile hızlı ve güvenli giriş yapabilirsiniz. Şifrenizi girmeden uygulamaya erişebilirsiniz.`
            : `${biometricName} özelliğini etkinleştirerek uygulamaya daha hızlı ve güvenli giriş yapabilirsiniz.`}
        </Text>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isEnabled ? colors.status.success : colors.status.warning,
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color: isEnabled ? colors.status.success : colors.status.warning,
              },
            ]}>
            {isEnabled ? '✓ Etkin' : '○ Devre Dışı'}
          </Text>
        </View>

        {/* Benefits */}
        <View style={[styles.benefitsCard, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.benefitsTitle, { color: colors.text.primary }]}>Avantajlar</Text>
          {[
            { icon: '⚡', text: 'Hızlı giriş - şifre girmeye gerek yok' },
            { icon: '🔒', text: 'Güvenli - biyometrik verileriniz cihazda kalır' },
            { icon: '🔐', text: 'Şifreleriniz güvenli şekilde saklanır' },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={[styles.benefitText, { color: colors.text.secondary }]}>
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEnabled ? (
            <Button
              title={`${biometricName} Devre Dışı Bırak`}
              variant="outline"
              onPress={handleDisableBiometric}
              loading={isProcessing}
              style={styles.actionButton}
            />
          ) : (
            <Button
              title={`${biometricName} Etkinleştir`}
              onPress={handleEnableBiometric}
              loading={isProcessing}
              style={styles.actionButton}
            />
          )}
        </View>

        {/* Security Note */}
        <View style={[styles.noteCard, { borderColor: colors.border.default }]}>
          <Text style={[styles.noteText, { color: colors.text.secondary }]}>
            🔐 Güvenlik Notu: Biyometrik verileriniz asla sunucularımıza gönderilmez. Tüm doğrulama
            işlemleri cihazınızda gerçekleştirilir.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    marginBottom: spacing.xl,
  },
  statusText: {
    ...typography.subtitle2,
  },
  benefitsCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitsTitle: {
    ...typography.subtitle1,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typography.body2,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  actionButton: {
    width: '100%',
  },
  backButton: {
    marginTop: spacing.lg,
  },
  noteCard: {
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
  },
  noteText: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...typography.subtitle1,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    lineHeight: 22,
  },
});

export default BiometricSetupScreen;
