// src/features/feed/components/AITrendInsightCard/AITrendInsightCard.styles.ts
// Styles for AITrendInsightCard component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 797-810

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },

  iconContainer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },

  trendList: {
    marginBottom: 12,
  },

  trendItem: {
    alignItems: 'flex-start',
    borderRadius: 10,
    flexDirection: 'row',
    paddingVertical: 12,
  },

  trendNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
    width: 28,
  },

  trendText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },

  moreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },

  moreButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Loading state
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
