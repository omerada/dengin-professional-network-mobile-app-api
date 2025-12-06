// src/features/profile/components/ParallaxProfileHeader/ParallaxProfileHeader.styles.ts
// Meslektaş Design System - ParallaxProfileHeader Styles
// Oku: mobile-development-guide/ui-ux-modernization/10-PROFILE-EXPERIENCE.md

import { StyleSheet } from 'react-native';
import { HEADER_CONSTANTS } from './ParallaxProfileHeader.types';

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  // Cover image
  coverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_CONSTANTS.MAX_HEIGHT * 0.6,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  coverGradient: {
    flex: 1,
  },

  // Blur overlay
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  stickyName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Avatar section
  avatarContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    zIndex: 5,
  },
  avatarBorder: {
    borderWidth: 4,
    borderRadius: (HEADER_CONSTANTS.AVATAR_SIZE + 8) / 2,
  },
  avatar: {
    width: HEADER_CONSTANTS.AVATAR_SIZE,
    height: HEADER_CONSTANTS.AVATAR_SIZE,
    borderRadius: HEADER_CONSTANTS.AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 36,
    fontWeight: '700',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },

  // Profile info
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: HEADER_CONSTANTS.AVATAR_SIZE + 24,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
  },
  username: {
    fontSize: 14,
    marginLeft: HEADER_CONSTANTS.AVATAR_SIZE + 24,
    marginBottom: 4,
  },
  profession: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: HEADER_CONSTANTS.AVATAR_SIZE + 24,
    marginBottom: 12,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  smallActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Spacer for top bar
  spacer: {
    width: 40,
  },
});
