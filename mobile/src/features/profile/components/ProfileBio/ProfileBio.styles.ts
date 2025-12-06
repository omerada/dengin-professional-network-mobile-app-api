// src/features/profile/components/ProfileBio/ProfileBio.styles.ts
// Meslektaş Design System - ProfileBio Styles
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import { StyleSheet } from 'react-native';

/**
 * ProfileBio styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  bio: {
    fontSize: 15,
    lineHeight: 22,
  },

  container: {
    paddingHorizontal: 24, // spacing['6']
    paddingVertical: 16, // spacing['4']
  },

  showMore: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4, // spacing['1']
  },
});
