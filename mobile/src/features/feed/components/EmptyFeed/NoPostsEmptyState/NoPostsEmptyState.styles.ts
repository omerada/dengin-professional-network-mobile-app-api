// src/features/feed/components/EmptyFeed/NoPostsEmptyState/NoPostsEmptyState.styles.ts
// Styles for NoPostsEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1634-1657

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

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  trendArrow: {
    marginLeft: 8,
  },

  trendCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 16,
  },

  trendCategory: {
    fontSize: 13,
  },

  trendIconContainer: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },

  trendInfo: {
    flex: 1,
  },

  trendTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },

  trendsContainer: {
    marginBottom: 24,
    width: '100%',
  },
});
