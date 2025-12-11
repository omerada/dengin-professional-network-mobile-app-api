// src/features/profile/components/ProfileHeader/ProfileHeader.styles.ts
// Meslektaş Design System - ProfileHeader Styles
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import { StyleSheet } from 'react-native';

/**
 * ProfileHeader styles - Alphabetically sorted
 * Note: Color values should be passed via theme colors, not hard-coded
 */
export const styles = StyleSheet.create({
  avatar: {
    borderRadius: 50,
    borderWidth: 3,
    height: 100,
    width: 100,
  },

  avatarContainer: {
    marginBottom: 16, // spacing['4']
    position: 'relative',
  },

  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    alignItems: 'center',
    paddingHorizontal: 24, // spacing['6']
    paddingVertical: 32, // spacing['8']
  },

  editButton: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },

  editOverlay: {
    alignItems: 'center',
    borderRadius: 16,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
  },

  infoContainer: {
    alignItems: 'center',
  },

  initials: {
    fontSize: 32,
    fontWeight: '700',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
  },

  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8, // spacing['2']
  },

  profession: {
    fontSize: 14,
  },

  professionIcon: {
    marginRight: 4, // spacing['1']
  },

  professionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4, // spacing['1']
  },

  verifiedBadge: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 24,
  },

  verifiedLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  verifiedText: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4, // spacing['1']
    marginLeft: 8, // spacing['2']
    paddingHorizontal: 8, // spacing['2']
    paddingVertical: 2,
  },
});
