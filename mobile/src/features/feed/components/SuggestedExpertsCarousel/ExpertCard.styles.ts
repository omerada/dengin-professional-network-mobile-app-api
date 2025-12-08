// src/features/feed/components/SuggestedExpertsCarousel/ExpertCard.styles.ts
// Styles for ExpertCard component
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 140,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nameContainer: {
    width: '100%',
    marginBottom: 4,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifiedBadge: {
    marginLeft: 3,
  },

  profession: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },

  followButton: {
    width: '100%',
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
