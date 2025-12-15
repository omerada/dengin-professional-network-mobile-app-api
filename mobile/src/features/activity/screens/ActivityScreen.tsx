// src/features/activity/screens/ActivityScreen.tsx
// Dengin Etkinlik Ekranı - Gamification & Challenges
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 788-875

import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { SCREEN_ANIMATIONS } from '@constants';
import { useColors } from '@contexts/ThemeContext';
import { UnifiedEmptyState } from '@shared/components';

/**
 * ActivityScreen - Gamification & Challenges Hub (Placeholder)
 *
 * Planned Features:
 * - Weekly/Monthly challenges
 * - Achievement badges
 * - Leaderboard
 * - Progress tracking
 * - Rewards system
 *
 * Design: MOBILE-APP-HOME-SCREEN.md Lines 788-875
 *
 * Current Status: Placeholder screen showing upcoming features
 */
export const ActivityScreen: React.FC = memo(() => {
  const colors = useColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={styles.content}>
        <UnifiedEmptyState
          icon="activity"
          title="Yakında Geliyor"
          description="Etkinlikler, yarışmalar ve rozetler çok yakında burada olacak!"
        />
      </Animated.View>
    </SafeAreaView>
  );
});

ActivityScreen.displayName = 'ActivityScreen';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ActivityScreen;
