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
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

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

    // Handle image picker response
    const handlePickerResponse = useCallback(
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Hata', response.errorMessage || 'Resim seçilirken bir hata oluştu.');
          return;
        }

        const asset = response.assets?.[0];
        if (asset?.uri) {
          setPreviewUri(asset.uri);
          onImageSelected(asset.uri);
        }
      },
      [onImageSelected],
    );

    // Open camera
    const handleTakePhoto = useCallback(() => {
      const options = {
        mediaType: 'photo' as MediaType,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8 as const,
        cameraType: 'front' as const,
      };

      launchCamera(options, handlePickerResponse);
    }, [handlePickerResponse]);

    // Open gallery
    const handleChooseFromGallery = useCallback(() => {
      const options = {
        mediaType: 'photo' as MediaType,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8 as const,
        selectionLimit: 1,
      };

      launchImageLibrary(options, handlePickerResponse);
    }, [handlePickerResponse]);

    // Remove avatar
    const handleRemove = useCallback(() => {
      Alert.alert('Fotoğrafı Kaldır', 'Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => {
            setPreviewUri(null);
            onRemove?.();
          },
        },
      ]);
    }, [onRemove]);

    // Show options
    const handlePress = useCallback(() => {
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
    }, [displayUri, handleTakePhoto, handleChooseFromGallery, handleRemove, onRemove]);

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
                backgroundColor: colors.surface.overlay,
                borderRadius: size / 2,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <>
                <Icon name="camera" size={24} color="#FFFFFF" />
                <Text style={styles.overlayText}>Değiştir</Text>
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
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  hint: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});
