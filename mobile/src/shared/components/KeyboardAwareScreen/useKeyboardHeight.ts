// src/shared/components/KeyboardAwareScreen/useKeyboardHeight.ts
// Custom hook for tracking keyboard height with animation

import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * useKeyboardHeight Hook
 *
 * Tracks keyboard height with smooth animation.
 * Syncs with native keyboard show/hide events.
 *
 * @returns Animated keyboard height value
 */
export const useKeyboardHeight = () => {
  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    // iOS: Use will show/hide for smooth animation sync
    // Android: Use did show/hide (no will events)
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: any) => {
      const height = event.endCoordinates.height;
      const duration = event.duration || 250;

      keyboardHeight.value = withTiming(height, {
        duration: Platform.OS === 'ios' ? duration : 250,
      });
    };

    const handleKeyboardHide = (event: any) => {
      const duration = event.duration || 250;

      keyboardHeight.value = withTiming(0, {
        duration: Platform.OS === 'ios' ? duration : 250,
      });
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardHeight;
};
