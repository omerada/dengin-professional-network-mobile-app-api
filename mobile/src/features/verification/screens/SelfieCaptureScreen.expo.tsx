// src/features/verification/screens/SelfieCaptureScreen.expo.tsx
// Expo Go fallback - expo-image-picker kullanır

import React, { memo, useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
import { Button } from '@shared/components';
import { useVerificationStore } from '../stores';
import type { VerificationStackParamList } from '@shared/types/navigation.types';

type NavigationProp = NativeStackNavigationProp<VerificationStackParamList, 'SelfieCapture'>;

/**
 * Expo Go fallback - Selfie çekimi
 */
export const SelfieCaptureScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();

  const [isLoading, setIsLoading] = useState(false);

  const { setSelfie, setStep } = useVerificationStore();

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekiyor.');
        return;
      }

      setIsLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [3, 4],
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const image = {
          uri: asset.uri,
          path: asset.uri,
          width: asset.width,
          height: asset.height,
          type: 'selfie' as 'front' | 'back' | 'selfie',
          capturedAt: new Date().toISOString(),
        };

        setSelfie(image);
        setStep('review');
        navigation.navigate('VerificationReview');
      }
    } catch (error) {
      console.error('[SelfieCapture] Error:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
        return;
      }

      setIsLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const image = {
          uri: asset.uri,
          path: asset.uri,
          width: asset.width,
          height: asset.height,
          type: 'selfie' as 'front' | 'back' | 'selfie',
          capturedAt: new Date().toISOString(),
        };

        setSelfie(image);
        setStep('review');
        navigation.navigate('VerificationReview');
      }
    } catch (error) {
      console.error('[SelfieCapture] Error:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Selfie Çekimi</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Yüzünüzün net görüneceği bir selfie çekin
        </Text>

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>ℹ️ Expo Go Modu</Text>
          <Text style={[styles.infoSubtext, { color: colors.text.tertiary }]}>
            Vision Camera EAS Build&apos;de çalışır. Şimdilik galeri kullanabilirsiniz.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Kamera ile Çek"
            onPress={handleTakePhoto}
            loading={isLoading}
            disabled={isLoading}
          />
          <Button
            title="Galeriden Seç"
            onPress={handlePickFromGallery}
            loading={isLoading}
            disabled={isLoading}
            variant="secondary"
          />
        </View>

        <Button
          title="Geri"
          onPress={() => navigation.goBack()}
          variant="ghost"
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
});

SelfieCaptureScreen.displayName = 'SelfieCaptureScreen';

const styles = StyleSheet.create({
  buttons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  infoBox: {
    backgroundColor: 'rgba(100, 150, 255, 0.1)',
    borderRadius: 12,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  infoSubtext: {
    ...typography.caption,
  },
  infoText: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
