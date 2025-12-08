// src/features/feed/components/VerificationPromptCard/VerificationPromptCard.styles.ts
// Styles for VerificationPromptCard component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 759-795

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },

  gradientContainer: {
    borderRadius: 16,
    padding: 20,
    paddingVertical: 20,
    overflow: 'hidden',
  },

  content: {
    alignItems: 'center',
  },

  icon: {
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },

  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
