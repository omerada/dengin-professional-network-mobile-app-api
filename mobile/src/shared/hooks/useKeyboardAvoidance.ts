// src/shared/hooks/useKeyboardAvoidance.ts
// Keyboard avoidance hook for iOS
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Keyboard,
  KeyboardEvent,
  Platform,
  Dimensions,
  LayoutAnimation,
  KeyboardEventName,
} from 'react-native';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  animatedHeight: number;
}

/**
 * Hook for tracking keyboard state
 */
export function useKeyboard(): KeyboardState {
  const [isVisible, setIsVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    const showEvent: KeyboardEventName =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent: KeyboardEventName =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      const keyboardHeight = event.endCoordinates.height;
      
      setIsVisible(true);
      setHeight(keyboardHeight);
      animatedHeight.value = withTiming(keyboardHeight, {
        duration: event.duration || 250,
        easing: Easing.out(Easing.ease),
      });

      // Enable layout animation for iOS
      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(
          LayoutAnimation.create(
            event.duration || 250,
            LayoutAnimation.Types.keyboard,
            LayoutAnimation.Properties.opacity
          )
        );
      }
    };

    const handleKeyboardHide = (event: KeyboardEvent) => {
      setIsVisible(false);
      setHeight(0);
      animatedHeight.value = withTiming(0, {
        duration: event.duration || 250,
        easing: Easing.in(Easing.ease),
      });

      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(
          LayoutAnimation.create(
            event.duration || 250,
            LayoutAnimation.Types.keyboard,
            LayoutAnimation.Properties.opacity
          )
        );
      }
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [animatedHeight]);

  return {
    isVisible,
    height,
    animatedHeight: animatedHeight.value,
  };
}

/**
 * Hook for dismissing keyboard on tap outside
 */
export function useDismissKeyboardOnTap(): () => void {
  return useCallback(() => {
    Keyboard.dismiss();
  }, []);
}

/**
 * Hook for keyboard-aware scroll adjustment
 * Returns the extra scroll offset needed to keep input visible
 */
export function useKeyboardScrollAdjustment(
  inputPosition: number,
  inputHeight: number = 50,
  extraPadding: number = 20
): number {
  const keyboard = useKeyboard();
  const screenHeight = Dimensions.get('window').height;

  if (!keyboard.isVisible) return 0;

  const inputBottom = inputPosition + inputHeight;
  const visibleArea = screenHeight - keyboard.height;

  if (inputBottom > visibleArea) {
    return inputBottom - visibleArea + extraPadding;
  }

  return 0;
}

/**
 * Hook for tracking input focus and keyboard position
 */
export function useInputFocus(): {
  onFocus: (event: any) => void;
  onBlur: () => void;
  inputY: number;
  isFocused: boolean;
} {
  const [inputY, setInputY] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<any>(null);

  const onFocus = useCallback((event: any) => {
    setIsFocused(true);
    
    // Get input position
    event.target.measure?.(
      (_x: number, _y: number, _width: number, _height: number, _pageX: number, pageY: number) => {
        setInputY(pageY);
      }
    );
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
    setInputY(0);
  }, []);

  return {
    onFocus,
    onBlur,
    inputY,
    isFocused,
  };
}

/**
 * Calculate bottom padding based on keyboard height
 * Useful for chat inputs that should stay above keyboard
 */
export function useKeyboardBottomPadding(basePadding: number = 0): number {
  const keyboard = useKeyboard();
  
  if (Platform.OS === 'android') {
    // Android handles keyboard avoidance differently
    return basePadding;
  }

  return keyboard.isVisible ? keyboard.height + basePadding : basePadding;
}
