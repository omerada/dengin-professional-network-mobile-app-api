// src/features/profile/screens/ProfileScreen.styles.ts
// Dengin Design System - ProfileScreen Styles
// Modern Premium Profile Design

import { StyleSheet } from 'react-native';
import { shadows, spacing, borderRadius } from '@theme';

/**
 * ProfileScreen styles - Modern Premium Design
 */
export const styles = StyleSheet.create({
  avatarGlow: {
    borderRadius: borderRadius.full,
    height: 140,
    left: -10,
    opacity: 0.15,
    position: 'absolute',
    top: -10,
    width: 140,
  },

  avatarGlowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },

  avatarInitials: {
    fontSize: 40,
    fontWeight: '800',
  },

  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  blurredBackground: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    height: 180,
    left: 0,
    opacity: 0.8,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },

  container: {
    flex: 1,
  },

  editProfileButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  loadMoreButton: {
    marginVertical: spacing.lg,
  },

  postsLoading: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },

  postsSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  premiumAvatar: {
    borderColor: '#fff',
    borderRadius: borderRadius.full,
    borderWidth: 4,
    height: 120,
    width: 120,
    ...shadows.lg,
  },

  premiumHeader: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingTop: spacing.xxl,
    position: 'relative',
  },

  professionTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },

  professionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },

  professionIcon: {
    marginRight: 6,
  },

  professionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
  },

  bioSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  profileContent: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    width: '100%',
    zIndex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },

  settingsButtonTop: {
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    top: spacing.md,
    width: 40,
    zIndex: 10,
  },
});
