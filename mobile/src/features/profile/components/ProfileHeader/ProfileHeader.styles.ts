// src/features/profile/components/ProfileHeader/ProfileHeader.styles.ts
// Dengin Design System - ProfileHeader Styles
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import { StyleSheet } from 'react-native';

/**
 * ProfileHeader styles - Alphabetically sorted
 * Note: Color values should be passed via theme colors, not hard-coded
 */
export const styles = StyleSheet.create({
  avatar: {
    borderRadius: 40,
    borderWidth: 2,
    height: 80,
    width: 80,
  },

  avatarContainer: {
    marginRight: 20,
    position: 'relative',
  },

  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    alignItems: 'flex-start',
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
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
  },

  initials: {
    fontSize: 28,
    fontWeight: '700',
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  profession: {
    fontSize: 13,
  },

  professionIcon: {
    marginRight: 4,
  },

  professionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
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
