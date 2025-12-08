// src/features/feed/components/AITrendInsightCard/AITrendInsightCard.types.ts
// Type definitions for AITrendInsightCard
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 797-810

import type { ProfessionCategory } from '@shared/types';

/**
 * AITrendInsightCard component props
 */
export interface AITrendInsightCardProps {
  /**
   * Profession category for AI trends
   * Values: MEDICAL, LEGAL, ENGINEERING, EDUCATION, SERVICE, CREATIVE, BUSINESS, OTHER
   *
   * Replaces: profession (string) with professionCategory (ProfessionCategory enum)
   */
  professionCategory?: ProfessionCategory;

  /**
   * Callback when a trend item is pressed
   */
  onTrendPress?: (trendId: string) => void;

  /**
   * Callback when "Daha Fazla Gör" button is pressed
   */
  onMorePress?: () => void;

  /**
   * Test ID for testing
   */
  testID?: string;
}
