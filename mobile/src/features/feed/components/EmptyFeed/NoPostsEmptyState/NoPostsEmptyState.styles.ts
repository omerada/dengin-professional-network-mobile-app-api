// src/features/feed/components/EmptyFeed/NoPostsEmptyState/NoPostsEmptyState.styles.ts
// Styles for NoPostsEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1634-1657

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
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  trendsContainer: {
    width: '100%',
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  trendIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  trendInfo: {
    flex: 1,
  },

  trendTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },

  trendCategory: {
    fontSize: 13,
  },

  trendArrow: {
    marginLeft: 8,
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
