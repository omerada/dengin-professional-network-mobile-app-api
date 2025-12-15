// src/features/profile/components/AvatarPicker.tsx
// Modern Avatar Picker - Instagram-style with Bottom Sheet
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
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
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

    // Show bottom sheet
    const [sheetVisible, setSheetVisible] = useState(false);

    const handlePress = useCallback(() => {
      haptic.light();
      setSheetVisible(true);
    }, [haptic]);

    const handleCloseSheet = useCallback(() => {
      setSheetVisible(false);
    }, []);

    const handleSelectCamera = useCallback(() => {
      handleCloseSheet();
      setTimeout(() => handleTakePhoto(), 300);
    }, [handleTakePhoto, handleCloseSheet]);

    const handleSelectGallery = useCallback(() => {
      handleCloseSheet();
      setTimeout(() => handleChooseFromGallery(), 300);
    }, [handleChooseFromGallery, handleCloseSheet]);

    const handleSelectRemove = useCallback(() => {
      handleCloseSheet();
      setTimeout(() => handleRemove(), 300);
    }, [handleRemove, handleCloseSheet]);

    return (
      <>
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
                    borderColor: colors.border.subtle,
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
        </View>

        {/* Modern Bottom Sheet */}
        <Modal
          visible={sheetVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseSheet}>
          <Pressable style={styles.modalOverlay} onPress={handleCloseSheet}>
            <Pressable
              style={[styles.sheetContainer, { backgroundColor: colors.background.primary }]}
              onPress={e => e.stopPropagation()}>
              {/* Handle Bar */}
              <View style={[styles.handleBar, { backgroundColor: colors.border.default }]} />

              {/* Title */}
              <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>
                Profil Fotoğrafı
              </Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {/* Camera */}
                <Pressable
                  style={[styles.option, { borderBottomColor: colors.border.subtle }]}
                  onPress={handleSelectCamera}>
                  <View style={[styles.optionIcon, { backgroundColor: colors.interactive.subtle }]}>
                    <Icon name="camera" size={24} color={colors.interactive.default} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                      Fotoğraf Çek
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                      Kamera ile yeni fotoğraf çek
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
                </Pressable>

                {/* Gallery */}
                <Pressable
                  style={[styles.option, { borderBottomColor: colors.border.subtle }]}
                  onPress={handleSelectGallery}>
                  <View style={[styles.optionIcon, { backgroundColor: colors.interactive.subtle }]}>
                    <Icon name="images" size={24} color={colors.interactive.default} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                      Galeriden Seç
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                      Mevcut fotoğraflarından seç
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
                </Pressable>

                {/* Remove (only if avatar exists) */}
                {displayUri && onRemove && (
                  <Pressable
                    style={styles.option}
                    onPress={handleSelectRemove}>
                    <View style={[styles.optionIcon, { backgroundColor: '#FEE2E2' }]}>
                      <Icon name="trash" size={24} color={colors.status.error} />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionTitle, { color: colors.status.error }]}>
                        Fotoğrafı Kaldır
                      </Text>
                      <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                        Profil fotoğrafını sil
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
                  </Pressable>
                )}
              </View>

              {/* Cancel Button */}
              <Pressable
                style={[styles.cancelButton, { backgroundColor: colors.background.secondary }]}
                onPress={handleCloseSheet}>
                <Text style={[styles.cancelText, { color: colors.text.secondary }]}>
                  İptal
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  },
);

AvatarPicker.displayName = 'AvatarPicker';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 4,
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
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // ==================== BOTTOM SHEET ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  optionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  cancelButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
