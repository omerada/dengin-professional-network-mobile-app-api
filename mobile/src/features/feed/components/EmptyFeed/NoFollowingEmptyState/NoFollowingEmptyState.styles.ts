// src/features/feed/components/EmptyFeed/NoFollowingEmptyState/NoFollowingEmptyState.styles.ts
// Styles for NoFollowingEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1607-1632

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  expertsPreviewContainer: {
    width: '100%',
    marginBottom: 24,
  },

  expertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  expertAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  expertInfo: {
    flex: 1,
  },

  expertName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },

  expertNameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verifiedBadge: {
    marginLeft: 4,
  },

  expertProfession: {
    fontSize: 13,
  },

  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  followButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  ctaButtonsContainer: {
    width: '100%',
    gap: 12,
  },

  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
