// src/features/feed/components/VerificationPromptCard/VerificationPromptCard.types.ts
// Type definitions for VerificationPromptCard
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 759-795

/**
 * VerificationPromptCard component props
 */
export interface VerificationPromptCardProps {
  /**
   * Callback when "Doğrulamaya Başla" button pressed
   * Should navigate to verification screen
   */
  onPress: () => void;

  /**
   * Test ID for testing
   */
  testID?: string;
}
