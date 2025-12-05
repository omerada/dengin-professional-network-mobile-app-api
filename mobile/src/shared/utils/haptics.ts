// src/shared/utils/haptics.ts
// Haptic feedback utility fonksiyonları
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import type { HapticFeedbackTypes } from 'react-native-haptic-feedback';

/**
 * Haptic feedback options
 */
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Haptic feedback types
 */
export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'rigid'
  | 'soft';

/**
 * Map custom types to library types
 */
const hapticTypeMap: Record<HapticType, HapticFeedbackTypes> = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
  selection: 'selection',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
  rigid: 'rigid',
  soft: 'soft',
};

/**
 * Trigger haptic feedback
 *
 * @param type - Type of haptic feedback
 *
 * @example
 * ```tsx
 * // On button press
 * <Pressable onPress={() => {
 *   haptic('light');
 *   handlePress();
 * }}>
 *   <Text>Press me</Text>
 * </Pressable>
 * ```
 */
export const haptic = (type: HapticType = 'light'): void => {
  try {
    const feedbackType = hapticTypeMap[type];
    ReactNativeHapticFeedback.trigger(feedbackType, hapticOptions);
  } catch (error) {
    // Silently fail - haptics are optional
    if (__DEV__) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Light haptic feedback - for subtle interactions
 */
export const hapticLight = (): void => haptic('light');

/**
 * Medium haptic feedback - for standard button presses
 */
export const hapticMedium = (): void => haptic('medium');

/**
 * Heavy haptic feedback - for significant actions
 */
export const hapticHeavy = (): void => haptic('heavy');

/**
 * Selection haptic feedback - for selection changes
 */
export const hapticSelection = (): void => haptic('selection');

/**
 * Success haptic feedback - for successful operations
 */
export const hapticSuccess = (): void => haptic('success');

/**
 * Warning haptic feedback - for warning states
 */
export const hapticWarning = (): void => haptic('warning');

/**
 * Error haptic feedback - for error states
 */
export const hapticError = (): void => haptic('error');

/**
 * Create a press handler with haptic feedback
 *
 * @param handler - The original press handler
 * @param type - Type of haptic feedback
 * @returns A new handler that triggers haptic feedback before calling the original
 *
 * @example
 * ```tsx
 * <Pressable onPress={withHaptic(handleSubmit, 'medium')}>
 *   <Text>Submit</Text>
 * </Pressable>
 * ```
 */
export const withHaptic = <T extends (...args: any[]) => any>(
  handler: T,
  type: HapticType = 'light',
): T => {
  return ((...args: Parameters<T>) => {
    haptic(type);
    return handler(...args);
  }) as T;
};

/**
 * Hook for haptic feedback
 *
 * @returns Object with haptic functions
 *
 * @example
 * ```tsx
 * const { trigger, light, success } = useHaptics();
 *
 * const handlePress = () => {
 *   light();
 *   // do something
 * };
 * ```
 */
export const useHaptics = () => {
  return {
    trigger: haptic,
    light: hapticLight,
    medium: hapticMedium,
    heavy: hapticHeavy,
    selection: hapticSelection,
    success: hapticSuccess,
    warning: hapticWarning,
    error: hapticError,
    withHaptic,
  };
};

export default {
  haptic,
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSelection,
  hapticSuccess,
  hapticWarning,
  hapticError,
  withHaptic,
  useHaptics,
};
