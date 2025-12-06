// src/features/profile/components/ProfileStats/ProfileStats.styles.ts
// Meslektaş Design System - ProfileStats Styles
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import { StyleSheet } from 'react-native';

/**
 * ProfileStats styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24, // spacing['6']
    paddingVertical: 16, // spacing['4']
  },

  divider: {
    height: 32,
    width: 1,
  },

  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24, // spacing['6']
  },

  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
