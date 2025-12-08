// src/features/feed/hooks/useAITrends.ts
// React Query hook for AI-generated trends
// Backend: TrendController, OpenRouter AI

import { useQuery } from '@tanstack/react-query';
import { getTrendsByProfession } from '../services/trendService';
import type { ProfessionCategory } from '@shared/types';

/**
 * Hook: Get AI-generated trends for profession category
 *
 * @param category - Profession category (MEDICAL, LEGAL, etc.)
 * @returns React Query result with 3 AI trends
 *
 * Replaces: mockTrends.ts (getTrendsByProfession)
 *
 * Backend:
 * - OpenRouter AI generation (Turkish)
 * - 1-hour cache per profession
 * - Fallback to static trends if AI fails
 */
export function useAITrends(category: ProfessionCategory | undefined) {
  return useQuery({
    queryKey: ['ai-trends', category],
    queryFn: () => {
      if (!category) {
        throw new Error('Profession category is required');
      }
      return getTrendsByProfession(category);
    },
    enabled: !!category,
    staleTime: 60 * 60 * 1000, // 1 hour (matches backend cache)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 2,
  });
}
