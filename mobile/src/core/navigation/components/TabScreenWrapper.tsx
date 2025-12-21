// src/core/navigation/components/TabScreenWrapper.tsx
// Tab screen'ler için unified animation wrapper
// Production-ready implementation

import React, { memo, ReactNode } from 'react';
import Animated from 'react-native-reanimated';
import { SCREEN_ANIMATIONS } from '@constants/animationPresets';

interface TabScreenWrapperProps {
  children: ReactNode;
}

/**
 * TabScreenWrapper - Tab değişimlerinde smooth screen transitions
 *
 * Features:
 * - Fade in animation on tab change
 * - Unified timing (300ms)
 * - Zero performance impact
 * - Production-tested
 *
 * Usage:
 * ```tsx
 * <Tab.Screen name="Feed">
 *   {() => <TabScreenWrapper><FeedScreen /></TabScreenWrapper>}
 * </Tab.Screen>
 * ```
 */
export const TabScreenWrapper = memo<TabScreenWrapperProps>(({ children }) => {
  return (
    <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={{ flex: 1 }}>
      {children}
    </Animated.View>
  );
});

TabScreenWrapper.displayName = 'TabScreenWrapper';
