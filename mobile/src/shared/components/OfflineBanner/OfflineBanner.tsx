// src/shared/components/OfflineBanner/OfflineBanner.tsx
// Production-ready Offline Mode Banner
// Oku: mobile-development-guide/ui-ux-modernization/12-OFFLINE-MODE.md

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

// ============================================================================
// OfflineBanner Component
// ============================================================================

/**
 * Global Offline Mode Banner
 *
 * Appears at the top of the screen when device goes offline.
 * Instagram/WhatsApp style notification banner.
 *
 * Features:
 * - Slide-down entrance animation
 * - Auto-dismisses when back online
 * - Safe area aware
 * - Non-blocking UI
 *
 * Usage:
 * ```tsx
 * // In App.tsx or RootNavigator
 * import NetInfo from '@react-native-community/netinfo';
 *
 * const [isOffline, setIsOffline] = useState(false);
 *
 * useEffect(() => {
 *   const unsubscribe = NetInfo.addEventListener(state => {
 *     setIsOffline(!state.isConnected);
 *   });
 *   return unsubscribe;
 * }, []);
 *
 * return (
 *   <>
 *     {isOffline && <OfflineBanner />}
 *     <AppNavigator />
 *   </>
 * );
 * ```
 */
export const OfflineBanner: React.FC = memo(() => {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Slide down animation
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 200 });

    return () => {
      // Cleanup animation
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    };
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.status.error,
          paddingTop: insets.top + spacing.xs,
        },
        animatedStyle,
      ]}>
      <View style={styles.content}>
        <Icon name="cloud-offline" size={20} color="#FFFFFF" />
        <Text style={styles.text}>Çevrimdışısınız</Text>
      </View>
    </Animated.View>
  );
});

OfflineBanner.displayName = 'OfflineBanner';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  text: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
