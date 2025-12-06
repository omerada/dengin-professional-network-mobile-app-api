// src/features/profile/components/ProfileActions/ProfileActions.styles.ts
// Meslektaş Design System - ProfileActions Styles
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import { StyleSheet } from 'react-native';

/**
 * ProfileActions styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8, // spacing['2']
    paddingHorizontal: 24, // spacing['6']
    paddingVertical: 16, // spacing['4']
  },

  messageButton: {
    flex: 1,
  },

  moreButton: {
    paddingHorizontal: 16, // spacing['4']
  },

  primaryButton: {
    flex: 2,
  },
});
