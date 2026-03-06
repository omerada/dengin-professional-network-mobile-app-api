// src/features/profile/components/ParallaxProfileHeader/ParallaxProfileHeader.styles.ts
// Dengin Design System - ParallaxProfileHeader Styles
// Oku: mobile-development-guide/ui-ux-modernization/10-PROFILE-EXPERIENCE.md

import { StyleSheet } from 'react-native';
import { HEADER_CONSTANTS } from './ParallaxProfileHeader.types';

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  // Cover image
  coverContainer: {
    height: HEADER_CONSTANTS.MAX_HEIGHT * 0.6,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  coverImage: {
    height: '100%',
    width: '100%',
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  stickyName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  topBarButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },

  // Avatar section
  avatarContainer: {
    bottom: 80,
    left: 16,
    position: 'absolute',
    zIndex: 5,
  },
  avatarBorder: {
    borderRadius: (HEADER_CONSTANTS.AVATAR_SIZE + 8) / 2,
    borderWidth: 4,
  },
  avatar: {
    borderRadius: HEADER_CONSTANTS.AVATAR_SIZE / 2,
    height: HEADER_CONSTANTS.AVATAR_SIZE,
    width: HEADER_CONSTANTS.AVATAR_SIZE,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 36,
    fontWeight: '700',
  },
  verificationBadge: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 28,
  },

  // Profile info
  profileInfo: {
    bottom: 0,
    left: 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
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
    marginBottom: 4,
    marginLeft: HEADER_CONSTANTS.AVATAR_SIZE + 24,
  },
  profession: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    marginLeft: HEADER_CONSTANTS.AVATAR_SIZE + 24,
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
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },

  // Spacer for top bar
  spacer: {
    width: 40,
  },
});
