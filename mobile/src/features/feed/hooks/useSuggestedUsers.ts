// src/features/feed/hooks/useSuggestedUsers.ts
// React Query hook for suggested users
// Backend: SuggestionController, UserSuggestionService

import { useQuery } from '@tanstack/react-query';
import { getSuggestedUsers } from '../services/suggestionService';

/**
 * Hook: Get suggested users for current user
 *
 * @param limit - Number of suggestions (default: 8)
 * @returns React Query result with suggested users
 *
 * Replaces:
 * - mockExperts.ts (MOCK_SUGGESTED_EXPERTS)
 * - NoFollowingEmptyState.types.ts (MOCK_SUGGESTED_EXPERTS)
 *
 * Backend Algorithm:
 * - Same profession: 50% weight
 * - High engagement: 30% weight
 * - Verified users: 20% weight
 * - Excludes already followed users
 * - Cache: 5 minutes per user
 */
export function useSuggestedUsers(limit: number = 8) {
  return useQuery({
    queryKey: ['suggested-users', limit],
    queryFn: () => getSuggestedUsers(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
