// src/features/verification/components/CaptureButton.tsx
// Yakalama butonu bileşeni
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@contexts';

/**
 * Yakalama butonu props
 */
interface CaptureButtonProps {
  /** Yakalama işleyicisi */
  onCapture: () => void;
  /** Devre dışı durumu */
  disabled?: boolean;
  /** Yükleniyor durumu */
  loading?: boolean;
  /** Buton boyutu */
  size?: 'small' | 'medium' | 'large';
  /** Özel stil */
  style?: ViewStyle;
  /** Erişilebilirlik etiketi */
  accessibilityLabel?: string;
}

/**
 * Boyut değerleri
 */
const SIZES = {
  small: {
    outer: 60,
    inner: 48,
    border: 3,
  },
  medium: {
    outer: 80,
    inner: 64,
    border: 4,
  },
  large: {
    outer: 100,
    inner: 80,
    border: 5,
  },
};

/**
 * Yakalama butonu
 * Kamera için özel tasarlanmış fotoğraf çekme butonu
 */
export const CaptureButton: React.FC<CaptureButtonProps> = memo(
  ({
    onCapture,
    disabled = false,
    loading = false,
    size = 'large',
    style,
    accessibilityLabel = 'Fotoğraf çek',
  }) => {
    const { colors } = useTheme();
    const scale = useSharedValue(1);

    const sizeValues = SIZES[size];

    /**
     * Basma animasyonu
     */
    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.9, {
        damping: 15,
        stiffness: 400,
      });
    }, [scale]);

    /**
     * Bırakma animasyonu
     */
    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });
    }, [scale]);

    /**
     * Yakalama işlemi
     */
    const handleCapture = useCallback(() => {
      if (disabled || loading) return;

      // Pulse animation
      scale.value = withSequence(
        withTiming(0.85, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );

      onCapture();
    }, [disabled, loading, onCapture, scale]);

    /**
     * Animasyonlu stil
     */
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <TouchableOpacity
          onPress={handleCapture}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled: disabled || loading }}
        >
          <View
            style={[
              styles.outerRing,
              {
                width: sizeValues.outer,
                height: sizeValues.outer,
                borderRadius: sizeValues.outer / 2,
                borderWidth: sizeValues.border,
                borderColor: disabled
                  ? colors.textDisabled
                  : colors.background,
              },
            ]}
          >
            <View
              style={[
                styles.innerCircle,
                {
                  width: sizeValues.inner,
                  height: sizeValues.inner,
                  borderRadius: sizeValues.inner / 2,
                  backgroundColor: disabled
                    ? colors.textDisabled
                    : colors.background,
                },
              ]}
            >
              {loading && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

CaptureButton.displayName = 'CaptureButton';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CaptureButton;
