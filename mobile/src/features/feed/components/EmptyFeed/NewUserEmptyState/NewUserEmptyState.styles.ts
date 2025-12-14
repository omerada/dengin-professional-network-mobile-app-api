// src/features/feed/components/EmptyFeed/NewUserEmptyState/NewUserEmptyState.styles.ts
// Styles for NewUserEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1564-1604

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  checklistContainer: {
    marginBottom: 24,
    width: '100%',
  },

  checklistItem: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  checklistItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },

  checkmarkCompleted: {
    backgroundColor: '#10B981', // green-500
  },

  checkmarkContainer: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: 12,
    width: 24,
  },

  checkmarkIncomplete: {
    borderWidth: 2,
  },

  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  ctaButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },

  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  iconContainer: {
    marginBottom: 24,
  },

  itemIcon: {
    marginRight: 12,
  },

  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  itemXP: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  progressBarFill: {
    borderRadius: 4,
    height: '100%',
  },

  progressBarTrack: {
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },

  progressContainer: {
    marginBottom: 24,
    width: '100%',
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

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
    textAlign: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },

  xpBadge: {
    borderRadius: 12,
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
