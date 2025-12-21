// src/features/feed/components/PostCard/PostCard.styles.ts
// Dengin Design System - PostCard Styles
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 0;
export const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;

// Color constants (to avoid inline literals)
const OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.5)';
const WHITE = '#FFFFFF';

/**
 * PostCard styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },

  actionCount: {
    fontSize: 14,
    fontWeight: '500',
  },

  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
  },

  authorContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },

  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },

  authorName: {
    fontSize: 15,
    fontWeight: '600',
  },

  bookmarkAction: {
    padding: 8,
  },

  container: {
    marginBottom: 8,
    paddingVertical: 12,
    width: CARD_WIDTH,
  },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  leftActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },

  menuButton: {
    borderRadius: 16,
    padding: 8,
  },

  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },

  metadata: {
    fontSize: 13,
  },

  moreButton: {
    marginTop: 4,
  },

  moreButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  verifiedIcon: {
    marginLeft: 2,
  },
});

/**
 * PostImages styles - Alphabetically sorted
 */
export const imageStyles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 16,
  },

  // P3: Error placeholder
  errorPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridContainer: {
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    overflow: 'hidden',
  },

  gridImage: {
    borderRadius: 4,
    flex: 1,
  },

  gridImageContainer: {
    flex: 1,
  },

  gridItemLarge: {
    height: 200,
    width: '49%' as unknown as number,
  },

  gridItemMedium: {
    height: 150,
    width: '49%' as unknown as number,
  },

  gridItemSmall: {
    height: 200,
    width: '32%' as unknown as number,
  },

  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: OVERLAY_BACKGROUND,
    justifyContent: 'center',
  },

  moreText: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '700',
  },

  singleImage: {
    borderRadius: 12,
    height: 300,
    width: '100%',
  },

  // P3: Loading skeleton
  skeleton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
  },
});
