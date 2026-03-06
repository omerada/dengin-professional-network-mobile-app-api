// src/features/profile/components/AvatarPicker.tsx
// Avatar selection and upload component
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { ActionSheet } from '@shared/components';
import { spacing, fontSize } from '@theme';
import { useSemanticHaptic, useHaptic } from '@shared/hooks';
import {
  showCameraPermissionError,
  showGalleryPermissionError,
  showOperationError,
} from '@shared/utils';

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
    const toast = useToast();
    const { trigger } = useHaptic();
    const { triggerMedia, triggerSystem } = useSemanticHaptic();
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
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
          showCameraPermissionError(toast, { trigger });
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
          triggerMedia('capture');
        }
      } catch (error) {
        console.error('[AvatarPicker] Camera error:', error);
        showOperationError(toast, { trigger }, 'Kamera açılırken bir hata oluştu.');
      }
    }, [onImageSelected, triggerMedia, trigger]);

    // Open gallery
    const handleChooseFromGallery = useCallback(async () => {
      try {
        // Request media library permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          showGalleryPermissionError(toast, { trigger });
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
          triggerMedia('capture');
        }
      } catch (error) {
        console.error('[AvatarPicker] Gallery error:', error);
        showOperationError(toast, { trigger }, 'Galeri açılırken bir hata oluştu.');
      }
    }, [onImageSelected, triggerMedia, triggerSystem]);

    // Remove avatar
    const handleRemove = useCallback(() => {
      triggerSystem('alert');
      setShowRemoveConfirm(true);
    }, [triggerSystem]);

    const confirmRemove = useCallback(() => {
      setPreviewUri(null);
      onRemove?.();
      triggerSystem('success');
      setShowRemoveConfirm(false);
    }, [onRemove, triggerSystem]);

    // Show options
    const handlePress = useCallback(() => {
      triggerMedia('select');
      setShowActionSheet(true);
    }, [triggerMedia]);

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

        {/* Avatar options ActionSheet */}
        <ActionSheet
          visible={showActionSheet}
          onClose={() => setShowActionSheet(false)}
          title="Profil Fotoğrafı"
          message="Bir seçenek seçin"
          options={[
            {
              id: 'take-photo',
              label: 'Fotoğraf Çek',
              icon: 'camera',
              onPress: () => {
                setShowActionSheet(false);
                handleTakePhoto();
              },
            },
            {
              id: 'choose-gallery',
              label: 'Galeriden Seç',
              icon: 'images',
              onPress: () => {
                setShowActionSheet(false);
                handleChooseFromGallery();
              },
            },
            ...(displayUri && onRemove
              ? [
                  {
                    id: 'remove-photo',
                    label: 'Fotoğrafı Kaldır',
                    icon: 'trash',
                    destructive: true,
                    onPress: () => {
                      setShowActionSheet(false);
                      handleRemove();
                    },
                  },
                ]
              : []),
          ]}
        />

        {/* Remove confirmation ActionSheet */}
        <ActionSheet
          visible={showRemoveConfirm}
          onClose={() => setShowRemoveConfirm(false)}
          title="Fotoğrafı Kaldır"
          message="Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?"
          options={[
            {
              id: 'confirm-remove',
              label: 'Kaldır',
              destructive: true,
              onPress: confirmRemove,
            },
          ]}
          cancelLabel="İptal"
        />
      </View>
    );
  },
);

AvatarPicker.displayName = 'AvatarPicker';

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 3,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  hint: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  initials: {
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  overlayText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
});
