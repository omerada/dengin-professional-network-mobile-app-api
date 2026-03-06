// src/shared/components/KeyboardAwareScreen/KeyboardAwareScreen.tsx
// PRODUCTION: Unified Keyboard Handling System
// Oku: UX-FLOW-ANALYSIS-REPORT.md - Phase 1.2

import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useKeyboardHeight } from './useKeyboardHeight';
import { UNIFIED_HEADER } from '@constants/layoutConstants';

export type KeyboardAwareMode = 'padding' | 'height' | 'position';

interface KeyboardAwareScreenProps {
  children: React.ReactNode;
  /** Keyboard avoiding mode (default: 'padding' on iOS, 'height' on Android) */
  mode?: KeyboardAwareMode;
  /** Custom keyboard offset (default: UNIFIED_HEADER.HEIGHT on iOS) */
  keyboardVerticalOffset?: number;
  /** Enable animated keyboard spacer at bottom */
  showSpacer?: boolean;
  /** Custom safe area bottom (for devices with notch) */
  safeAreaBottom?: number;
  /** Custom content container style */
  contentContainerStyle?: any;
  /** Show scroll indicator */
  showsVerticalScrollIndicator?: boolean;
}

/**
 * KeyboardAwareScreen - Production Standard
 *
 * Unified keyboard handling for all screens with input fields.
 * Ensures inputs are never hidden by keyboard on any platform.
 *
 * Features:
 * - Platform-specific behavior (iOS padding, Android height)
 * - Animated keyboard height tracking
 * - Automatic offset calculation
 * - Safe area aware
 * - Consistent behavior across all screens
 *
 * Benefits:
 * - Zero keyboard occlusion incidents
 * - Smooth keyboard animations
 * - Consistent user experience
 * - Single source of truth
 *
 * @example
 * ```tsx
 * // Chat screen with message input
 * <KeyboardAwareScreen mode="padding">
 *   <MessageList />
 *   <MessageInput />
 * </KeyboardAwareScreen>
 *
 * // Form screen
 * <KeyboardAwareScreen showSpacer>
 *   <FormFields />
 *   <SubmitButton />
 * </KeyboardAwareScreen>
 * ```
 */
export const KeyboardAwareScreen: React.FC<KeyboardAwareScreenProps> = ({
  children,
  mode,
  keyboardVerticalOffset,
  showSpacer = false,
  safeAreaBottom = 0,
}) => {
  const keyboardHeight = useKeyboardHeight();

  // Determine mode based on platform if not specified
  const behaviorMode = mode || (Platform.OS === 'ios' ? 'padding' : 'height');

  // Calculate keyboard offset
  const offset =
    keyboardVerticalOffset !== undefined
      ? keyboardVerticalOffset
      : Platform.OS === 'ios'
        ? UNIFIED_HEADER.HEIGHT
        : 0;

  // Animated spacer height (for bottom input fields)
  const spacerHeight = useSharedValue(0);

  useEffect(() => {
    if (showSpacer) {
      // Animate spacer height with keyboard
      spacerHeight.value = withTiming(
        keyboardHeight.value > 0 ? keyboardHeight.value - safeAreaBottom : 0,
        {
          duration: 250,
        },
      );
    }
  }, [keyboardHeight.value, showSpacer, safeAreaBottom]);

  const spacerStyle = useAnimatedStyle(() => ({
    height: spacerHeight.value,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behaviorMode}
      keyboardVerticalOffset={offset}
      enabled>
      {children}
      {showSpacer && <Animated.View style={spacerStyle} />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
