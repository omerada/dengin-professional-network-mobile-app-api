// src/features/messaging/components/ConversationItem/ConversationItem.styles.ts
// ConversationItem stilleri - Modern design system
// Instagram DM kalitesinde

import { StyleSheet } from 'react-native';
import { spacing, fontSize } from '@theme';

const AVATAR_SIZE = 52;

export const styles = StyleSheet.create({
  // Avatar
  avatar: {
    borderRadius: AVATAR_SIZE / 2,
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: AVATAR_SIZE / 2,
    height: AVATAR_SIZE,
    justifyContent: 'center',
    width: AVATAR_SIZE,
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },

  // Badge (unread count)
  badge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    marginLeft: spacing['2'],
    minWidth: 20,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Container
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing['1'],
  },

  // Header
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Name
  name: {
    fontSize: fontSize.md,
  },
  nameBold: {
    fontWeight: '600',
  },
  nameContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: spacing['2'],
  },

  // Online indicator
  onlineIndicator: {
    borderColor: '#FFFFFF',
    borderRadius: 7,
    borderWidth: 2,
    bottom: 0,
    height: 14,
    position: 'absolute',
    right: 0,
    width: 14,
  },

  // Preview (last message)
  preview: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  previewBold: {
    fontWeight: '500',
  },
  previewTyping: {
    fontStyle: 'italic',
  },

  // Profession
  profession: {
    fontSize: fontSize.xs,
  },

  // SubHeader
  subHeader: {
    marginTop: 2,
  },

  // Time
  time: {
    fontSize: fontSize.xs,
  },

  // Verified badge
  verifiedBadge: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    top: -2,
    width: 16,
  },
});
