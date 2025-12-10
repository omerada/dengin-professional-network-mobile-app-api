// src/features/feed/components/FeedHeader/FeedHeader.styles.ts
// Meslektaş Design System - FeedHeader Styles
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import { StyleSheet } from 'react-native';

/**
 * FeedHeader styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  filterButton: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  filterIcon: {
    marginRight: 6,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  filters: {
    flex: 1,
    flexDirection: 'row',
  },
});
