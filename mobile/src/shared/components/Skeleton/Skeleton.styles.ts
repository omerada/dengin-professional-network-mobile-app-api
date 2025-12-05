// src/shared/components/Skeleton/Skeleton.styles.ts
// Meslektaş Design System - Skeleton Styles
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { StyleSheet } from 'react-native';

/**
 * Static skeleton styles
 */
export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  shimmer: {
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: 100,
  },
});

/**
 * Skeleton preset layout styles
 */
export const layoutStyles = StyleSheet.create({
  // Card skeleton
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },

  cardContent: {
    gap: 8,
    marginTop: 12,
  },

  // Message skeleton
  messageContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  ownMessage: {
    flexDirection: 'row-reverse',
  },

  // Post skeleton
  postActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },

  postContainer: {
    padding: 16,
  },

  postContent: {
    gap: 8,
    marginTop: 12,
  },

  postHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },

  postHeaderText: {
    flex: 1,
    gap: 4,
  },

  postImage: {
    borderRadius: 12,
    marginTop: 12,
  },

  // Profile skeleton
  profileContainer: {
    alignItems: 'center',
    padding: 24,
  },

  profileInfo: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },

  profileStats: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 24,
  },

  statItem: {
    alignItems: 'center',
    gap: 4,
  },

  // Group skeleton wrapper
  wrapper: {
    gap: 8,
  },
});
