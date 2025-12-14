// src/shared/components/SuccessCelebration/SuccessCelebration.tsx
// Success Celebration Component - Production Ready
// Başarılı işlemler için celebration animation

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useColors } from '@contexts/ThemeContext';

type CelebrationType = 'checkmark' | 'heart' | 'star' | 'trophy';

interface SuccessCelebrationProps {
  /** Show/hide celebration */
  visible: boolean;
  /** Celebration type */
  type?: CelebrationType;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Auto-hide duration (ms) */
  duration?: number;
}

const CELEBRATION_ICONS: Record<CelebrationType, string> = {
  checkmark: 'checkmark-circle',
  heart: 'heart',
  star: 'star',
  trophy: 'trophy',
} as const;

/**
 * Success Celebration Component
 *
 * Başarılı işlemler için visual celebration ve haptic feedback.
 *
 * KULLANIM:
 *
 * ```tsx
 * const [showSuccess, setShowSuccess] = useState(false);
 *
 * const handlePostCreate = async () => {
 *   await createPost(data);
 *   setShowSuccess(true);
 * };
 *
 * return (
 *   <View>
 *     <Button onPress={handlePostCreate} />
 *
 *     <SuccessCelebration
 *       visible={showSuccess}
 *       type="checkmark"
 *       onComplete={() => {
 *         setShowSuccess(false);
 *         navigation.goBack();
 *       }}
 *     />
 *   </View>
 * );
 * ```
 */
export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  visible,
  type = 'checkmark',
  onComplete,
  duration = 1500,
}) => {
  const colors = useColors();
  const { success } = useHaptic();
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      success(); // Haptic feedback

      // Animation sequence: scale up → bounce → scale down
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 300 }),
        withDelay(duration - 500, withSpring(0, { damping: 15 })),
      );

      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, duration, onComplete, success, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[StyleSheet.absoluteFill, styles.container]}
      pointerEvents="none">
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <View style={[styles.iconBackground, { backgroundColor: colors.status.success }]}>
          <Icon name={CELEBRATION_ICONS[type]} size={80} color="#FFFFFF" />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
