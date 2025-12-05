// src/features/feed/components/EmptyFeed/EmptyFeed.styles.ts
// Meslektaş Design System - EmptyFeed Styles
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import { StyleSheet } from 'react-native';

// Color constant
const WHITE = '#FFFFFF';

/**
 * EmptyFeed styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 24,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  actionLabel: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },

  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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
    textAlign: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
});
