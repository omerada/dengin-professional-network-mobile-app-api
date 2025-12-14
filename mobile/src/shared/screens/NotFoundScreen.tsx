// src/shared/screens/NotFoundScreen.tsx
// Production-ready 404 Screen
// Oku: mobile-development-guide/ui-ux-modernization/10-DEEP-LINKING.md

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { EmptyState } from '@shared/components';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

// Type placeholder
type MainStackNavigationProp = StackNavigationProp<any>;

/**
 * NotFoundScreen - 404 Page
 *
 * Shown when:
 * - Invalid deep link URL
 * - Deleted content (post, profile)
 * - Invalid navigation state
 *
 * @example
 * ```tsx
 * // In navigator
 * <Stack.Screen name="NotFound" component={NotFoundScreen} />
 * ```
 */
export const NotFoundScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<MainStackNavigationProp>();

  const handleGoHome = () => {
    // Reset to home (Feed)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Feed' } }],
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom']}>
      <EmptyState
        icon="alert-circle-outline"
        title="Sayfa Bulunamadı"
        description="Aradığınız içerik kaldırılmış veya mevcut değil."
        action={{
          title: 'Ana Sayfaya Dön',
          onPress: handleGoHome,
          variant: 'primary',
        }}
        floatingIcon
        animated
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});

export default NotFoundScreen;
