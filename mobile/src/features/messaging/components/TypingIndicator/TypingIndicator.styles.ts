// src/features/messaging/components/TypingIndicator/TypingIndicator.styles.ts
// TypingIndicator stilleri - Modern design system

import { StyleSheet } from 'react-native';
import { spacing, fontSize } from '@theme';

export const styles = StyleSheet.create({
  // Container
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
  },

  // Dot
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },

  // Dots container
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: 20,
  },

  // Text
  text: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
});
