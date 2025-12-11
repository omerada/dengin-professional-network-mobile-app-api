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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 8,
  },

  divider: {
    display: 'none',
  },

  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },

  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
