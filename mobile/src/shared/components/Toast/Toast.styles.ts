// src/shared/components/Toast/Toast.styles.ts
// Dengin Design System - Toast Styles
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { StyleSheet } from 'react-native';

/**
 * Static toast styles
 */
export const styles = StyleSheet.create({
  action: {
    fontWeight: '600',
    marginLeft: 12,
  },

  closeButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    marginLeft: 8,
    width: 24,
  },

  container: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginHorizontal: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    zIndex: 9999,
  },

  content: {
    flex: 1,
    marginHorizontal: 12,
  },

  icon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },

  indicator: {
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },

  message: {
    fontSize: 14,
    lineHeight: 20,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
});
