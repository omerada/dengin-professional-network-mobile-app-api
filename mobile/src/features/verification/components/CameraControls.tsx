// src/features/verification/components/CameraControls.tsx
// Kamera kontrol butonları bileşeni
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import type { CameraSettings } from '../types';

/**
 * Kamera kontrolleri props
 */
interface CameraControlsProps {
  /** Mevcut ayarlar */
  settings: CameraSettings;
  /** Ayar değişikliği işleyicisi */
  onSettingsChange: (settings: Partial<CameraSettings>) => void;
  /** Kamera çevirme */
  onFlipCamera?: () => void;
  /** Galeriden seç */
  onSelectFromGallery?: () => void;
  /** Kamera çevirme göster */
  showFlip?: boolean;
  /** Galeri seçimi göster */
  showGallery?: boolean;
  /** Özel stil */
  style?: ViewStyle;
}

/**
 * Flaş ikon metinleri
 */
const FLASH_ICONS: Record<CameraSettings['flash'], string> = {
  off: '⚡️',
  on: '⚡️',
  auto: '⚡️A',
};

/**
 * Flaş durumu metinleri
 */
const FLASH_LABELS: Record<CameraSettings['flash'], string> = {
  off: 'Flaş Kapalı',
  on: 'Flaş Açık',
  auto: 'Otomatik',
};

/**
 * Kamera kontrolleri
 * Flaş, kamera çevirme ve galeri seçimi butonları
 */
export const CameraControls: React.FC<CameraControlsProps> = memo(
  ({
    settings,
    onSettingsChange,
    onFlipCamera,
    onSelectFromGallery,
    showFlip = true,
    showGallery = false,
    style,
  }) => {
    const colors = useColors();

    /**
     * Flaş modunu değiştir
     */
    const handleFlashToggle = useCallback(() => {
      const modes: CameraSettings['flash'][] = ['off', 'on', 'auto'];
      const currentIndex = modes.indexOf(settings.flash);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      onSettingsChange({ flash: nextMode });
    }, [settings.flash, onSettingsChange]);

    return (
      <View style={[styles.container, style]}>
        {/* Sol kontroller */}
        <View style={styles.leftControls}>
          {showGallery && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.background.secondary }]}
              onPress={onSelectFromGallery}
              accessibilityRole="button"
              accessibilityLabel="Galeriden seç">
              <Text style={styles.controlIcon}>🖼️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Orta boşluk (capture button için) */}
        <View style={styles.centerSpace} />

        {/* Sağ kontroller */}
        <View style={styles.rightControls}>
          {/* Flaş butonu */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor:
                  settings.flash === 'on'
                    ? colors.interactive.default
                    : colors.background.secondary,
              },
            ]}
            onPress={handleFlashToggle}
            accessibilityRole="button"
            accessibilityLabel={`Flaş: ${FLASH_LABELS[settings.flash]}`}>
            <Text style={[styles.controlIcon, settings.flash === 'off' && styles.flashOff]}>
              {FLASH_ICONS[settings.flash]}
            </Text>
          </TouchableOpacity>

          {/* Kamera çevirme butonu */}
          {showFlip && onFlipCamera && (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.background.secondary }]}
              onPress={onFlipCamera}
              accessibilityRole="button"
              accessibilityLabel="Kamerayı çevir">
              <Text style={styles.controlIcon}>🔄</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
);

CameraControls.displayName = 'CameraControls';

const styles = StyleSheet.create({
  centerSpace: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  controlButton: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  controlIcon: {
    fontSize: 20,
  },
  flashOff: {
    opacity: 0.5,
  },
  leftControls: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-start',
  },
  rightControls: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
});

export default CameraControls;
