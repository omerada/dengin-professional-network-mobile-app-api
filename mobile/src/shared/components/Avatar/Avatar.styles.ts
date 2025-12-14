// src/shared/components/Avatar/Avatar.styles.ts
// Dengin Design System - Avatar Styles
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { StyleSheet } from 'react-native';

/**
 * Static avatar styles
 */
export const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
  },

  badgeContent: {
    fontWeight: '600',
    textAlign: 'center',
  },

  container: {
    overflow: 'hidden',
  },

  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    height: '100%',
    width: '100%',
  },

  initials: {
    fontWeight: '600',
  },

  placeholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  selected: {
    borderWidth: 3,
  },
});
