// src/features/feed/components/FeedHeader/FeedHeader.styles.ts
// Dengin Design System - FeedHeader Styles
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import { StyleSheet } from 'react-native';

/**
 * FeedHeader styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
  },
  professionIconContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  professionSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
