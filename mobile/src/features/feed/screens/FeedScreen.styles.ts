// src/features/feed/screens/FeedScreen.styles.ts
// Dengin Design System - FeedScreen Styles
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import { StyleSheet } from 'react-native';

/**
 * FeedScreen styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  skeletonItem: {
    marginBottom: 16,
  },
});
