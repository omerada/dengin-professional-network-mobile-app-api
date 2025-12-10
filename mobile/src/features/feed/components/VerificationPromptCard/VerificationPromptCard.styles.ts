// src/features/feed/components/VerificationPromptCard/VerificationPromptCard.styles.ts
// Styles for VerificationPromptCard component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 759-795

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  gradientContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 24,
  },

  iconContainer: {
    marginBottom: 16,
    opacity: 0.95,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
    opacity: 0.9,
    paddingHorizontal: 4,
    textAlign: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 12,
    textAlign: 'center',
  },
});
