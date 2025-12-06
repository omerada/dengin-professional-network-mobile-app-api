// src/features/profile/screens/ProfileScreen.styles.ts
// Meslektaş Design System - ProfileScreen Styles
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import { StyleSheet } from 'react-native';

/**
 * ProfileScreen styles - Alphabetically sorted
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 32, // spacing['8']
  },

  emptyText: {
    fontSize: 14,
  },

  loadMoreButton: {
    marginVertical: 16, // spacing['4']
  },

  logoutButton: {
    marginTop: 16, // spacing['4']
  },

  ownProfileActions: {
    paddingHorizontal: 24, // spacing['6']
    paddingVertical: 16, // spacing['4']
  },

  postsLoading: {
    alignItems: 'center',
    paddingVertical: 32, // spacing['8']
  },

  postsSection: {
    flex: 1,
    paddingHorizontal: 16, // spacing['4']
    paddingTop: 24, // spacing['6']
  },

  scrollContent: {
    flexGrow: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16, // spacing['4']
  },
});
