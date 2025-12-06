// src/features/messaging/components/MessageBubble/MessageBubble.styles.ts
// MessageBubble stilleri - Modern design system
// Instagram/WhatsApp kalitesinde

import { StyleSheet, Dimensions } from 'react-native';
import { spacing, fontSize, borderRadius } from '@theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const BUBBLE_MAX_WIDTH = SCREEN_WIDTH * 0.75;
export const SWIPE_THRESHOLD = 80;

export const styles = StyleSheet.create({
  // Avatar
  avatarContainer: {
    marginRight: spacing['2'],
  },
  avatarPlaceholder: {
    marginRight: spacing['2'],
    width: 28,
  },

  // Bubble
  bubble: {
    borderRadius: 18,
    maxWidth: BUBBLE_MAX_WIDTH,
    minWidth: 80,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
  },

  // Container
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
  },

  // Content
  content: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  // File Attachment
  fileContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    marginBottom: spacing['1'],
    padding: spacing['2'],
  },
  fileInfo: {
    flex: 1,
    marginLeft: spacing['2'],
  },
  fileName: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 10,
    marginTop: 2,
  },

  // Image Attachment
  image: {
    borderRadius: borderRadius.md,
    height: 150,
    width: 200,
  },
  imageContainer: {
    borderRadius: borderRadius.md,
    marginBottom: spacing['1'],
    overflow: 'hidden',
  },

  // Meta (time + status)
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing['1'],
  },

  // Container variants
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  pressed: {
    opacity: 0.9,
  },

  // Reactions
  reactionEmoji: {
    fontSize: 12,
  },
  reactionsContainer: {
    borderRadius: 12,
    bottom: -8,
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    right: 8,
  },

  // Reply Icon (swipe-to-reply)
  replyIconContainer: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    width: 32,
  },
  replyIconOtherSide: {
    right: -40,
  },
  replyIconOwnSide: {
    left: -40,
  },

  // Reply Preview
  replyPreview: {
    borderLeftWidth: 2,
    marginBottom: spacing['2'],
    opacity: 0.8,
    paddingLeft: spacing['2'],
  },
  replyPreviewName: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },

  // Retry button (for failed messages)
  retryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing['1'],
    paddingVertical: spacing['1'],
  },
  retryText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    marginLeft: spacing['1'],
  },

  // Status
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: spacing['1'],
  },
  time: {
    fontSize: fontSize.xs,
  },
});
