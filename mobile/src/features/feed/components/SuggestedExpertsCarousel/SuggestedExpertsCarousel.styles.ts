// src/features/feed/components/SuggestedExpertsCarousel/SuggestedExpertsCarousel.styles.ts
// Styles for SuggestedExpertsCarousel component
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  scrollView: {
    paddingLeft: 16,
  },

  scrollViewContent: {
    paddingRight: 16,
  },
});
