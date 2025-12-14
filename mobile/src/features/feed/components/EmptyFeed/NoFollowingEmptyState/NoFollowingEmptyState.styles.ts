// src/features/feed/components/EmptyFeed/NoFollowingEmptyState/NoFollowingEmptyState.styles.ts
// Styles for NoFollowingEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1607-1632

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  ctaButtonsContainer: {
    gap: 12,
    width: '100%',
  },

  expertAvatar: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },

  expertCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
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
    alignItems: 'center',
    flexDirection: 'row',
  },

  expertProfession: {
    fontSize: 13,
  },

  expertsPreviewContainer: {
    marginBottom: 24,
    width: '100%',
  },

  followButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  followButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  iconContainer: {
    marginBottom: 24,
  },

  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },

  verifiedBadge: {
    marginLeft: 4,
  },
});
