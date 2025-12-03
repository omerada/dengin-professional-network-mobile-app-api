// src/shared/hooks/useBackHandler.ts
// Android back button handler hook
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { useEffect, useCallback, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

type BackHandlerResult = boolean;
type BackHandlerCallback = () => BackHandlerResult;

/**
 * Hook for handling Android back button
 * @param handler - Custom back handler function, return true to prevent default behavior
 * @param deps - Dependencies array for the handler
 */
export function useBackHandler(
  handler: BackHandlerCallback,
  deps: any[] = []
): void {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (Platform.OS !== 'android' || !isFocused) return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handler
    );

    return () => subscription.remove();
  }, [isFocused, ...deps]);
}

/**
 * Hook for preventing back navigation
 * Useful for modals or confirmation dialogs
 */
export function usePreventBack(
  shouldPrevent: boolean,
  onBack?: () => void
): void {
  const handler = useCallback(() => {
    if (shouldPrevent) {
      onBack?.();
      return true; // Prevent default back behavior
    }
    return false;
  }, [shouldPrevent, onBack]);

  useBackHandler(handler, [shouldPrevent, onBack]);
}

/**
 * Hook for double back to exit
 * Common pattern in Android apps
 */
export function useDoubleBackToExit(
  enabled: boolean = true,
  timeoutMs: number = 2000,
  onShowToast?: () => void
): void {
  const lastBackPress = useRef<number>(0);

  const handler = useCallback(() => {
    if (!enabled) return false;

    const now = Date.now();
    const timeSinceLastPress = now - lastBackPress.current;

    if (timeSinceLastPress < timeoutMs) {
      // Exit app
      BackHandler.exitApp();
      return true;
    }

    lastBackPress.current = now;
    onShowToast?.();
    return true;
  }, [enabled, timeoutMs, onShowToast]);

  useBackHandler(handler, [enabled, timeoutMs, onShowToast]);
}

/**
 * Hook for handling back with navigation
 * Provides default navigation.goBack() behavior with custom override option
 */
export function useNavigationBackHandler(
  customHandler?: BackHandlerCallback
): void {
  const navigation = useNavigation();

  const handler = useCallback(() => {
    // If custom handler is provided and returns true, use it
    if (customHandler && customHandler()) {
      return true;
    }

    // Default: navigate back if possible
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }

    return false;
  }, [customHandler, navigation]);

  useBackHandler(handler, [customHandler]);
}

/**
 * Hook for exit confirmation dialog
 */
export function useExitConfirmation(
  options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
  } = {}
): void {
  const {
    title = 'Çıkış',
    message = 'Uygulamadan çıkmak istediğinizden emin misiniz?',
    confirmText = 'Evet',
    cancelText = 'Hayır',
  } = options;

  const handler = useCallback(() => {
    const { Alert } = require('react-native');

    Alert.alert(title, message, [
      {
        text: cancelText,
        style: 'cancel',
      },
      {
        text: confirmText,
        onPress: () => BackHandler.exitApp(),
      },
    ]);

    return true;
  }, [title, message, confirmText, cancelText]);

  useBackHandler(handler);
}
