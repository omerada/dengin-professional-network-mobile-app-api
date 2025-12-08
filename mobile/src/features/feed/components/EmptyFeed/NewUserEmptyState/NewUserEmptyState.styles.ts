// src/features/feed/components/EmptyFeed/NewUserEmptyState/NewUserEmptyState.styles.ts
// Styles for NewUserEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1564-1604

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
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  checklistContainer: {
    width: '100%',
    marginBottom: 24,
  },

  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },

  checklistItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkmarkCompleted: {
    backgroundColor: '#10B981', // green-500
  },

  checkmarkIncomplete: {
    borderWidth: 2,
  },

  itemIcon: {
    marginRight: 12,
  },

  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  itemXP: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },

  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
