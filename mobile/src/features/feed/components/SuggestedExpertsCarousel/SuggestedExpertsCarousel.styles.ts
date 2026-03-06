// src/features/feed/components/SuggestedExpertsCarousel/SuggestedExpertsCarousel.styles.ts
// Styles for SuggestedExpertsCarousel component
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  scrollView: {
    paddingLeft: 16,
  },

  scrollViewContent: {
    paddingRight: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
