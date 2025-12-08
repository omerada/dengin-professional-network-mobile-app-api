// src/features/feed/components/AITrendInsightCard/AITrendInsightCard.types.ts
// Type definitions for AITrendInsightCard
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 797-810

import type { TrendItem } from './mockTrends';

/**
 * AITrendInsightCard component props
 */
export interface AITrendInsightCardProps {
  /**
   * User's profession name (for profession-based trends)
   */
  profession?: string;

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

// Re-export TrendItem for convenience
export type { TrendItem };
