// src/shared/components/ErrorFallback.tsx
// Dengin Design System - Modern Error Fallback Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks';
import { spring } from '@theme/animations';
import type { ErrorFallbackProps } from '@shared/utils/errorHandling';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern ErrorFallback Component
 *
 * Features:
 * - Animated entrance with staggered elements
 * - Spring-based button animation
 * - Haptic feedback
 * - Debug info in development mode
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = memo(({ error, resetError }) => {
  const colors = useColors();
  const { trigger } = useHaptic();

  // Button animation
  const buttonScale = useSharedValue(1);

  const handleRetry = useCallback(() => {
    trigger('medium');
    buttonScale.value = withSequence(withSpring(0.96, spring.press), withSpring(1, spring.snappy));
    setTimeout(() => resetError(), 150);
  }, [resetError, trigger, buttonScale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.content}>
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={[styles.iconContainer, { backgroundColor: colors.status.errorBackground }]}>
          <Icon name="warning-outline" size={48} color={colors.status.error} />
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(200).duration(400)}
          style={[styles.title, { color: colors.text.primary }]}>
          Bir Şeyler Yanlış Gitti
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.message, { color: colors.text.secondary }]}>
          Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </Animated.Text>

        {__DEV__ && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={[styles.errorBox, { backgroundColor: colors.background.tertiary }]}>
            <Text style={[styles.errorText, { color: colors.status.error }]}>{error.message}</Text>
          </Animated.View>
        )}

        <AnimatedPressable
          entering={FadeInUp.delay(500).duration(400)}
          onPress={handleRetry}
          style={[
            styles.button,
            { backgroundColor: colors.interactive.default },
            buttonAnimatedStyle,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Tekrar Dene">
          <Icon name="refresh" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Tekrar Dene</Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorBox: {
    borderRadius: 8,
    marginBottom: 24,
    padding: 12,
    width: '100%',
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: 24,
    width: 96,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default ErrorFallback;
