// src/features/messaging/screens/ChatScreen.styles.ts
// ChatScreen stilleri - Modern design system
// Instagram DM kalitesinde

import { StyleSheet } from 'react-native';
import { spacing, fontSize } from '@theme';

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  // Keyboard View
  keyboardView: {
    flex: 1,
  },

  // Header container
  headerContainer: {
    // paddingTop handled by safeArea insets
  },

  // Input container
  inputContainer: {
    // paddingBottom handled by safeArea insets
  },

  // Reply bar
  replyBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
  },
  replyContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  replyDismiss: {
    marginLeft: spacing['2'],
    padding: spacing['1'],
  },
  replyIndicator: {
    borderRadius: 2,
    height: '100%',
    marginRight: spacing['2'],
    width: 3,
  },
  replyText: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  replyTextContainer: {
    flex: 1,
  },
  replyTextLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  replyTextPreview: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
  },
  emptyIcon: {
    marginBottom: spacing['4'],
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing['2'],
    textAlign: 'center',
  },
});
