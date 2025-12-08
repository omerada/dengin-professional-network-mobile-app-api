// src/features/feed/components/AITrendInsightCard/AITrendInsightCard.styles.ts
// Styles for AITrendInsightCard component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 797-810

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  icon: {
    marginRight: 8,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  trendList: {
    marginBottom: 12,
  },

  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },

  trendNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },

  trendText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  moreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },

  moreButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
