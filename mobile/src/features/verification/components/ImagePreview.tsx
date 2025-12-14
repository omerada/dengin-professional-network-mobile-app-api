// src/features/verification/components/ImagePreview.tsx
// Yakalanan görüntü önizleme bileşeni
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
import type { CapturedImage } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Görüntü önizleme props
 */
interface ImagePreviewProps {
  /** Yakalanan görüntü */
  image: CapturedImage | null;
  /** Görüntü türü etiketi */
  label: string;
  /** Tekrar çek işleyicisi */
  onRetake?: () => void;
  /** Yükleniyor durumu */
  loading?: boolean;
  /** Tam boyut göster */
  fullWidth?: boolean;
  /** Özel stil */
  style?: ViewStyle;
}

/**
 * Görüntü önizleme
 * Yakalanan fotoğrafı önizleme ve tekrar çekme seçeneği sunar
 */
export const ImagePreview: React.FC<ImagePreviewProps> = memo(
  ({ image, label, onRetake, loading = false, fullWidth = false, style }) => {
    const colors = useColors();

    const imageWidth = fullWidth ? SCREEN_WIDTH - spacing.lg * 2 : 150;
    const imageHeight = imageWidth * 0.63; // ID kart oranı

    if (!image) {
      return (
        <View
          style={[
            styles.placeholder,
            {
              width: imageWidth,
              height: imageHeight,
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.default,
            },
            style,
          ]}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={[styles.placeholderText, { color: colors.text.secondary }]}>{label}</Text>
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={[styles.container, style]}>
        <View
          style={[
            styles.imageContainer,
            {
              width: imageWidth,
              height: imageHeight,
              borderColor: colors.border.default,
            },
          ]}>
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`${label} önizlemesi`}
          />

          {/* Yükleniyor overlay */}
          {loading && (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.background.overlay }]}>
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          )}

          {/* Etiket */}
          <View style={[styles.labelContainer, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
          </View>
        </View>

        {/* Tekrar çek butonu */}
        {onRetake && !loading && (
          <TouchableOpacity
            style={[styles.retakeButton, { backgroundColor: colors.background.secondary }]}
            onPress={onRetake}
            accessibilityRole="button"
            accessibilityLabel={`${label} tekrar çek`}>
            <Text style={[styles.retakeText, { color: colors.interactive.default }]}>
              Tekrar Çek
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  },
);

ImagePreview.displayName = 'ImagePreview';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelContainer: {
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: 'white',
    fontWeight: '600',
  },
  placeholder: {
    alignItems: 'center',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  placeholderText: {
    ...typography.bodySmall,
  },
  retakeButton: {
    borderRadius: 16,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  retakeText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});

export default ImagePreview;
