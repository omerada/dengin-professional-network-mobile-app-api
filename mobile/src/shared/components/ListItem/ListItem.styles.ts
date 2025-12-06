// src/shared/components/ListItem/ListItem.styles.ts
// Meslektaş Design System - ListItem Styles

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  leftContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  rightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  title: {
    fontWeight: '500',
  },

  subtitle: {
    marginTop: 2,
  },

  description: {
    marginTop: 2,
    opacity: 0.7,
  },

  chevron: {
    opacity: 0.4,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Selected state
  selected: {
    borderRadius: 12,
    marginHorizontal: 8,
    paddingHorizontal: 8,
  },

  // Swipe actions
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  swipeActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
