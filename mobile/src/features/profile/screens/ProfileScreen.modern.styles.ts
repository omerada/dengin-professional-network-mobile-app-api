// src/features/profile/screens/ProfileScreen.modern.styles.ts
// Instagram Style Profile Screen
// Design: Clean, minimal, Instagram-like
// Color: Soft Orange (#F59E42)

import { StyleSheet } from 'react-native';

/**
 * Instagram-Style ProfileScreen Styles
 * - Horizontal layout (avatar left, stats right)
 * - Minimal spacing
 * - Clean design
 * - Backend uyumlu
 */
export const modernStyles = StyleSheet.create({
  // ========================================
  // Base Container
  // ========================================
  
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // ========================================
  // Loading & Error States
  // ========================================
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },

  errorText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#F59E42',
    borderRadius: 12,
  },

  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ========================================
  // Instagram Header (Avatar + Stats)
  // ========================================
  
  instagramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  avatarSection: {
    marginRight: 24,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F5F5F5',
  },

  avatarPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitials: {
    fontSize: 32,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 1,
  },

  statsSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  statColumn: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
  },

  // ========================================
  // Name + Bio Section
  // ========================================
  
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  fullName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },

  editIconButton: {
    padding: 4,
  },

  professionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },

  professionText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
    marginRight: 4,
  },

  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bioText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 18,
    marginTop: 4,
  },

  // ========================================
  // Actions Section
  // ========================================
  
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },

  editProfileButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  settingsIconButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  followButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#F59E42',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  followingButton: {
    backgroundColor: '#F0F0F0',
  },

  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  followingButtonText: {
    color: '#1A1A1A',
  },

  messageButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // ========================================
  // Posts Section
  // ========================================
  
  postsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },

  postsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  postsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },

  postsLoading: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  emptyPosts: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyIcon: {
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
  },

  postsList: {
    gap: 0,
  },

  loadMoreButton: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  loadMoreButtonInner: {
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});
