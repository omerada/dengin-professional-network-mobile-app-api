// src/shared/hooks/useSuccessCelebration.ts
// Production Success Celebration Hook
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Phase 2

import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { useHaptic } from './useHaptic';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';

export interface SuccessCelebrationOptions {
  /** Success message to display (optional) */
  message?: string;
  /** Duration in ms before celebration auto-dismisses */
  duration?: number;
  /** Enable haptic feedback */
  enableHaptic?: boolean;
  /** Callback after celebration completes */
  onComplete?: () => void;
}

export interface SuccessCelebrationAnimation {
  /** Scale animation value */
  scale: SharedValue<number>;
  /** Opacity animation value */
  opacity: SharedValue<number>;
  /** Rotation animation value (in degrees) */
  rotation: SharedValue<number>;
}

export interface UseSuccessCelebrationReturn {
  /** Trigger success celebration animation */
  celebrate: (options?: SuccessCelebrationOptions) => void;
  /** Animation values for custom implementations */
  animation: SuccessCelebrationAnimation;
  /** Is celebration currently active */
  isActive: boolean;
}

/**
 * useSuccessCelebration Hook
 *
 * Provides consistent success celebration animations across the app.
 * Includes scale, opacity, rotation animations with haptic feedback.
 *
 * Features:
 * - Unified timing with UNIFIED_TIMING constants
 * - Optional haptic feedback (success pattern)
 * - Customizable duration and message
 * - Automatic cleanup after completion
 * - Reusable animation values
 *
 * @example
 * ```tsx
 * function PostCreatedScreen() {
 *   const { celebrate, animation } = useSuccessCelebration();
 *
 *   const handlePostCreated = () => {
 *     celebrate({
 *       message: 'Gönderi yayınlandı!',
 *       duration: 2000,
 *       enableHaptic: true,
 *       onComplete: () => navigation.goBack(),
 *     });
 *   };
 *
 *   return (
 *     <Animated.View style={[styles.container, animatedStyle]}>
 *       <CheckIcon />
 *     </Animated.View>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // For pre-built component usage
 * function VerificationSuccess() {
 *   const { celebrate } = useSuccessCelebration();
 *
 *   useEffect(() => {
 *     celebrate({
 *       message: 'Hesabınız doğrulandı!',
 *       duration: 3000,
 *     });
 *   }, []);
 *
 *   return <SuccessCelebration />;
 * }
 * ```
 */
export function useSuccessCelebration(): UseSuccessCelebrationReturn {
  const { trigger } = useHaptic();
  const isActiveRef = useRef(false);

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const celebrate = useCallback(
    (options: SuccessCelebrationOptions = {}) => {
      const { duration = 2000, enableHaptic = true, onComplete } = options;

      // Prevent multiple celebrations
      if (isActiveRef.current) return;
      isActiveRef.current = true;

      // Haptic feedback
      if (enableHaptic) {
        trigger('notificationSuccess');
      }

      // Scale animation: 0 → 1.2 → 1
      scale.value = withSequence(
        withTiming(1.2, { duration: UNIFIED_TIMING.componentEnter }),
        withTiming(1, { duration: UNIFIED_TIMING.componentExit }),
      );

      // Opacity animation: 0 → 1 → (stay) → 0
      opacity.value = withSequence(
        withTiming(1, { duration: UNIFIED_TIMING.componentEnter }),
        withTiming(1, {
          duration: duration - UNIFIED_TIMING.componentEnter - UNIFIED_TIMING.componentExit,
        }),
        withTiming(
          0,
          {
            duration: UNIFIED_TIMING.componentExit,
          },
          finished => {
            if (finished) {
              // Reset values
              scale.value = 0;
              rotation.value = 0;
              isActiveRef.current = false;

              // Call onComplete callback
              if (onComplete) {
                runOnJS(onComplete)();
              }
            }
          },
        ),
      );

      // Rotation animation: 0 → 360 (full rotation during enter)
      rotation.value = withTiming(360, {
        duration: UNIFIED_TIMING.componentEnter,
      });
    },
    [scale, opacity, rotation, trigger],
  );

  return {
    celebrate,
    animation: {
      scale,
      opacity,
      rotation,
    },
    isActive: isActiveRef.current,
  };
}

/**
 * Success Celebration Pattern Types
 */
export type SuccessCelebrationPattern =
  | 'verification' // Account verification complete
  | 'post-created' // Post successfully created
  | 'message-sent' // Message delivered
  | 'profile-updated' // Profile changes saved
  | 'connection-made' // New connection established
  | 'achievement' // Achievement unlocked
  | 'payment-success'; // Payment completed

/**
 * Get predefined celebration options for common patterns
 */
export function getSuccessCelebrationPattern(
  pattern: SuccessCelebrationPattern,
): SuccessCelebrationOptions {
  const patterns: Record<SuccessCelebrationPattern, SuccessCelebrationOptions> = {
    verification: {
      message: 'Hesabınız doğrulandı!',
      duration: 3000,
      enableHaptic: true,
    },
    'post-created': {
      message: 'Gönderi yayınlandı!',
      duration: 2000,
      enableHaptic: true,
    },
    'message-sent': {
      message: 'Mesaj gönderildi',
      duration: 1500,
      enableHaptic: true,
    },
    'profile-updated': {
      message: 'Profil güncellendi',
      duration: 2000,
      enableHaptic: true,
    },
    'connection-made': {
      message: 'Bağlantı kuruldu!',
      duration: 2500,
      enableHaptic: true,
    },
    achievement: {
      message: 'Başarı kazanıldı!',
      duration: 3000,
      enableHaptic: true,
    },
    'payment-success': {
      message: 'Ödeme başarılı',
      duration: 2500,
      enableHaptic: true,
    },
  };

  return patterns[pattern];
}
