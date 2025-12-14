// src/features/feed/components/FeedHeader/FeedHeader.styles.ts
// Dengin Design System - FeedHeader Styles
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import { StyleSheet } from 'react-native';

/**
 * FeedHeader styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  centerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  leftSection: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 44,
  },
  professionIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  professionSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 44,
  },
});
