// src/shared/components/ListItem/ListItem.styles.ts
// Dengin Design System - ListItem Styles

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  leftContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    position: 'absolute',
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  swipeAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  swipeActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
