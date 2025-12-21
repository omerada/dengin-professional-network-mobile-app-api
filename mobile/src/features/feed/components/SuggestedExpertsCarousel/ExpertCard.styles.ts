// src/features/feed/components/SuggestedExpertsCarousel/ExpertCard.styles.ts
// Styles for ExpertCard component
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: 8,
    width: 60,
  },

  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 140,
    marginRight: 12,
    padding: 12,
    width: 120,
  },

  followButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: '100%',
  },

  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  nameContainer: {
    marginBottom: 4,
    width: '100%',
  },

  nameWithBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  profession: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },

  verifiedBadge: {
    marginLeft: 3,
  },
});
