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
    backgroundColor: '#FFFFFF',
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // ========================================
  // Loading & Error States
  // ========================================
  
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100,
  },

  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },

  errorText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#F59E42',
    borderRadius: 12,
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // ========================================
  // Instagram Header (Avatar + Stats)
  // ========================================
  
  instagramHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  avatarSection: {
    marginRight: 24,
  },

  avatar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 43,
    height: 86,
    width: 86,
  },

  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 43,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },

  avatarInitials: {
    color: '#999999',
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 1,
  },

  statsSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statColumn: {
    alignItems: 'center',
  },

  statValue: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },

  statLabel: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '400',
  },

  // ========================================
  // Name + Bio Section
  // ========================================
  
  infoSection: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 2,
  },

  fullName: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },

  editIconButton: {
    padding: 4,
  },

  professionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
    marginTop: 2,
  },

  professionText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '400',
    marginRight: 4,
  },

  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },

  bioText: {
    color: '#1A1A1A',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
  },

  // ========================================
  // Actions Section
  // ========================================
  
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  editProfileButton: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },

  editProfileButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },

  settingsIconButton: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },

  followButton: {
    alignItems: 'center',
    backgroundColor: '#F59E42',
    borderRadius: 8,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },

  followingButton: {
    backgroundColor: '#F0F0F0',
  },

  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  followingButtonText: {
    color: '#1A1A1A',
  },

  messageButton: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },

  messageButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },

  // ========================================
  // Posts Section
  // ========================================
  
  postsSection: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 16,
  },

  postsSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },

  postsCount: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '600',
  },

  postsLoading: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyPosts: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },

  emptyIcon: {
    marginBottom: 16,
  },

  emptyText: {
    color: '#999999',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  postsList: {
    gap: 0,
  },

  loadMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  loadMoreButtonInner: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
  },

  loadMoreText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
});
