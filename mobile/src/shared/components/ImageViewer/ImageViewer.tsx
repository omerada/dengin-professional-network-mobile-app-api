// src/shared/components/ImageViewer/ImageViewer.tsx
// Dengin Design System - Full Screen Image Viewer
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Modal,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

export interface ImageViewerProps {
  /** Image source URI */
  uri: string;
  /** Whether the viewer is visible */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional image alt text */
  alt?: string;
  /** Show download button */
  showDownload?: boolean;
  /** Download handler */
  onDownload?: () => void;
  /** Show share button */
  showShare?: boolean;
  /** Share handler */
  onShare?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ImageViewer - Full screen zoomable image viewer with gestures
 *
 * Features:
 * - Pinch to zoom
 * - Double tap to zoom
 * - Pan when zoomed
 * - Swipe down to close
 * - Fade background on drag
 *
 * @example
 * <ImageViewer
 *   uri={imageUrl}
 *   visible={isVisible}
 *   onClose={() => setVisible(false)}
 *   showDownload
 *   onDownload={handleDownload}
 * />
 */
export const ImageViewer = memo<ImageViewerProps>(function ImageViewer({
  uri,
  visible,
  onClose,
  alt,
  showDownload = false,
  onDownload,
  showShare = false,
  onShare,
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trigger: triggerHaptic } = useHaptic();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);

  // Reset animations
  const resetAnimations = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, spring.gentle);
    translateX.value = withSpring(0, spring.gentle);
    translateY.value = withSpring(0, spring.gentle);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    backgroundOpacity.value = withTiming(1, { duration: 200 });
  }, [
    scale,
    translateX,
    translateY,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    backgroundOpacity,
  ]);

  // Close with animation
  const handleClose = useCallback(() => {
    triggerHaptic('light');
    onClose();
    // Reset after modal closes
    setTimeout(() => {
      resetAnimations();
      setLoading(true);
      setError(false);
    }, 300);
  }, [onClose, triggerHaptic, resetAnimations]);

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = Math.max(0.5, Math.min(savedScale.value * event.scale, 5));
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, spring.gentle);
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (scale.value > 1) {
        // When zoomed, allow panning
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      } else {
        // When not zoomed, only allow vertical drag to dismiss
        translateY.value = event.translationY;
        backgroundOpacity.value = interpolate(
          Math.abs(event.translationY),
          [0, 200],
          [1, 0.3],
          Extrapolate.CLAMP,
        );
      }
    })
    .onEnd(event => {
      if (scale.value > 1) {
        // Bound the pan within limits
        const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
        const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

        translateX.value = withSpring(
          Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value)),
          spring.gentle,
        );
        translateY.value = withSpring(
          Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value)),
          spring.gentle,
        );
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      } else {
        // Check if should dismiss
        if (Math.abs(event.translationY) > 100 || Math.abs(event.velocityY) > 1000) {
          translateY.value = withTiming(event.translationY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT, {
            duration: 200,
          });
          backgroundOpacity.value = withTiming(0, { duration: 200 });
          scheduleOnRN(handleClose);
        } else {
          translateY.value = withSpring(0, spring.gentle);
          backgroundOpacity.value = withTiming(1, { duration: 200 });
        }
      }
    });

  // Double tap gesture
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(event => {
      if (scale.value > 1) {
        // Zoom out
        scale.value = withSpring(1, spring.gentle);
        translateX.value = withSpring(0, spring.gentle);
        translateY.value = withSpring(0, spring.gentle);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom in to 2x at tap point
        scale.value = withSpring(2.5, spring.gentle);
        savedScale.value = 2.5;

        // Center zoom at tap point
        const tapX = event.x - SCREEN_WIDTH / 2;
        const tapY = event.y - SCREEN_HEIGHT / 2;
        translateX.value = withSpring(-tapX, spring.gentle);
        translateY.value = withSpring(-tapY, spring.gentle);
        savedTranslateX.value = -tapX;
        savedTranslateY.value = -tapY;
      }
      scheduleOnRN(() => triggerHaptic('light'));
    });

  // Combine gestures
  const composedGestures = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, panGesture),
  );

  // Animated styles
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <GestureHandlerRootView style={styles.container}>
        {/* Background */}
        <Animated.View style={[styles.background, backgroundAnimatedStyle]} />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={handleClose}
            style={styles.headerButton}
            hitSlop={16}
            accessibilityLabel="Close"
            accessibilityRole="button">
            <Icon name="close" size={28} color={colors.text.inverse} />
          </Pressable>

          <View style={styles.headerActions}>
            {showShare && onShare && (
              <Pressable
                onPress={onShare}
                style={styles.headerButton}
                hitSlop={16}
                accessibilityLabel="Share"
                accessibilityRole="button">
                <Icon name="share-outline" size={24} color={colors.text.inverse} />
              </Pressable>
            )}
            {showDownload && onDownload && (
              <Pressable
                onPress={onDownload}
                style={styles.headerButton}
                hitSlop={16}
                accessibilityLabel="Download"
                accessibilityRole="button">
                <Icon name="download-outline" size={24} color={colors.text.inverse} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Image */}
        <GestureDetector gesture={composedGestures}>
          <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.text.inverse} />
              </View>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Icon name="image-outline" size={48} color={colors.text.inverse} />
                <Text style={[styles.errorText, { color: colors.text.inverse }]}>
                  Resim yüklenemedi
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri }}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => setLoading(true)}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
                accessibilityLabel={alt || 'Full screen image'}
              />
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
});

// ============================================================================
// Styles
// ============================================================================

// Color constants for ImageViewer (dark overlay theme)
const OVERLAY_BG = '#000000';
const OVERLAY_BG_TRANSLUCENT = 'rgba(0, 0, 0, 0.5)';

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_BG,
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingBottom: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: OVERLAY_BG_TRANSLUCENT,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  image: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
