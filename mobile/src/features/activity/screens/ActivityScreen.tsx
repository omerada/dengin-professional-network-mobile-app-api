// src/features/activity/screens/ActivityScreen.tsx
// Dengin Etkinlik Ekranı - Gamification & Challenges
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 788-875

import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';

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
      <Animated.View entering={FadeIn.duration(300)} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="trophy" size={32} color={colors.interactive.default} />
          <Text style={[styles.title, { color: colors.text.primary }]}>Etkinlik</Text>
        </View>

        {/* Coming Soon Message */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.comingSoon}>
            <Icon name="construct-outline" size={64} color={colors.text.tertiary} />
            <Text style={[styles.comingSoonTitle, { color: colors.text.primary }]}>
              Yakında Gelecek
            </Text>
            <Text style={[styles.comingSoonMessage, { color: colors.text.secondary }]}>
              Etkinlikler, yarışmalar ve rozetler çok yakında burada olacak!
            </Text>
            <Text style={[styles.comingSoonSubtext, { color: colors.text.tertiary }]}>
              • Haftalık ve Aylık Yarışmalar{'\n'}• Başarı Rozetleri{'\n'}• Liderlik Tablosu{'\n'}•
              Ödül Sistemi
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
});

ActivityScreen.displayName = 'ActivityScreen';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  comingSoon: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  comingSoonMessage: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 24,
    textAlign: 'left',
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});

export default ActivityScreen;
