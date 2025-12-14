// src/features/profile/screens/ProfileScreen.styles.ts
// Dengin Design System - ProfileScreen Styles
// Modern Premium Profile Design

import { StyleSheet } from 'react-native';

/**
 * ProfileScreen styles - Modern Premium Design
 */
export const styles = StyleSheet.create({
  avatarGlow: {
    borderRadius: 70,
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
    marginBottom: 20,
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyText: {
    fontSize: 14,
  },

  loadMoreButton: {
    marginVertical: 16,
  },

  postsLoading: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  postsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  premiumAvatar: {
    borderColor: '#fff',
    borderRadius: 60,
    borderWidth: 4,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: 120,
  },

  premiumHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 40,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  profileContent: {
    alignItems: 'center',
    paddingTop: 40,
    width: '100%',
    zIndex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  settingsButtonTop: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    top: 12,
    width: 40,
    zIndex: 10,
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
  },

  statDivider: {
    height: 40,
    width: 1,
  },

  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },

  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 40,
    width: '100%',
  },
});
