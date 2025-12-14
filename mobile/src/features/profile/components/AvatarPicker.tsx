// src/features/profile/components/AvatarPicker.tsx
// Avatar selection and upload component
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { HAPTIC_TYPES } from '@constants/hapticPresets';
import { useHaptic } from '@shared/hooks/useHaptic';

interface AvatarPickerProps {
  /**
   * Current avatar URL
   */
  currentAvatarUrl: string | null;
  /**
   * User's full name for initials
   */
  fullName: string;
  /**
   * Called when an image is selected
   */
  onImageSelected: (uri: string) => void;
  /**
   * Called when avatar is removed
   */
  onRemove?: () => void;
  /**
   * Whether upload is in progress
   */
  isLoading?: boolean;
  /**
   * Avatar size
   * @default 120
   */
  size?: number;
}

/**
 * AvatarPicker Component
 *
 * Allows users to:
 * - Take a new photo
 * - Choose from gallery
 * - Remove current avatar
 *
 * Integrates with react-native-image-picker
 */
export const AvatarPicker: React.FC<AvatarPickerProps> = memo(
  ({ currentAvatarUrl, fullName, onImageSelected, onRemove, isLoading = false, size = 120 }) => {
    const colors = useColors();
    const haptic = useHaptic();
    const [previewUri, setPreviewUri] = useState<string | null>(null);

    // Generate initials from full name
    const initials = (() => {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0]?.substring(0, 2).toUpperCase() ?? '';
    })();

    const displayUri = previewUri || currentAvatarUrl;

    // Open camera
    const handleTakePhoto = useCallback(async () => {
      try {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera iznine ihtiyacımız var.');
          return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const uri = result.assets[0].uri;
          setPreviewUri(uri);
          onImageSelected(uri);
          haptic.success();
        }
      } catch (error) {
        haptic.error();
        console.error('[AvatarPicker] Camera error:', error);
        Alert.alert('Hata', 'Kamera açılırken bir hata oluştu.');
      }
    }, [onImageSelected]);

    // Open gallery
    const handleChooseFromGallery = useCallback(async () => {
      try {
        // Request media library permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'İzin Gerekli',
            'Galeriden fotoğraf seçmek için medya kütüphanesi iznine ihtiyacımız var.',
          );
          return;
        }

        // Launch image library
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const uri = result.assets[0].uri;
          setPreviewUri(uri);
          onImageSelected(uri);
          haptic.success();
        }
      } catch (error) {
        haptic.error();
        console.error('[AvatarPicker] Gallery error:', error);
        Alert.alert('Hata', 'Galeri açılırken bir hata oluştu.');
      }
    }, [onImageSelected]);

    // Remove avatar
    const handleRemove = useCallback(() => {
      haptic.warning();
      Alert.alert('Fotoğrafı Kaldır', 'Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => {
            setPreviewUri(null);
            onRemove?.();
            haptic.success();
          },
        },
      ]);
    }, [onRemove, haptic]);

    // Show options
    const handlePress = useCallback(() => {
      haptic.trigger(HAPTIC_TYPES.buttonPress);
      const options: {
        text: string;
        onPress?: () => void;
        style?: 'cancel' | 'destructive' | 'default';
      }[] = [
        { text: 'Fotoğraf Çek', onPress: handleTakePhoto },
        { text: 'Galeriden Seç', onPress: handleChooseFromGallery },
      ];

      if (displayUri && onRemove) {
        options.push({
          text: 'Fotoğrafı Kaldır',
          style: 'destructive',
          onPress: handleRemove,
        });
      }

      options.push({ text: 'İptal', style: 'cancel' });

      Alert.alert('Profil Fotoğrafı', 'Bir seçenek seçin', options);
    }, [displayUri, handleTakePhoto, handleChooseFromGallery, handleRemove, onRemove, haptic]);

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}
          onPress={handlePress}
          disabled={isLoading}
          activeOpacity={0.8}>
          {displayUri ? (
            <Image
              source={{ uri: displayUri }}
              style={[
                styles.avatar,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderColor: colors.border.default,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colors.interactive.subtle,
                },
              ]}>
              <Text
                style={[
                  styles.initials,
                  { color: colors.interactive.default, fontSize: size * 0.32 },
                ]}>
                {initials}
              </Text>
            </View>
          )}

          {/* Overlay */}
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: colors.background.overlay,
                borderRadius: size / 2,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} size="large" />
            ) : (
              <>
                <Icon name="camera" size={24} color={colors.text.inverse} />
                <Text style={[styles.overlayText, { color: colors.text.inverse }]}>Değiştir</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: colors.text.secondary }]}>
          Profil fotoğrafı eklemek için dokunun
        </Text>
      </View>
    );
  },
);

AvatarPicker.displayName = 'AvatarPicker';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 3,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  overlayText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  hint: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
