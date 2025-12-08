// src/features/feed/services/suggestionService.ts
// User Suggestion API Service
// Backend: GET /api/users/suggested

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';

/**
 * Suggested User Response from Backend
 * Backend: SuggestedUserResponse.java
 *
 * Replaces:
 * - mockExperts.ts (MOCK_SUGGESTED_EXPERTS)
 * - NoFollowingEmptyState.types.ts (MOCK_SUGGESTED_EXPERTS)
 */
export interface SuggestedUserResponse {
  id: number;
  fullName: string;
  profession: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isFollowing: boolean;
  followerCount: number;
}

/**
 * Get suggested users for current user
 *
 * @param limit - Number of suggestions (default: 8, max: 20)
 * @returns List of suggested users
 *
 * Backend:
 * - Endpoint: GET /api/users/suggested?limit={limit}
 * - Service: SuggestionService.java
 * - Algorithm: Profession (50%) + Engagement (30%) + Verified (20%)
 * - Cache: 5 minutes per user
 * - Rate Limit: 60 requests/hour
 *
 * Replaces: mockExperts.ts (MOCK_SUGGESTED_EXPERTS)
 */
export async function getSuggestedUsers(limit: number = 8): Promise<SuggestedUserResponse[]> {
  const response = await apiClient.get<SuggestedUserResponse[]>(API_ENDPOINTS.USER_SUGGESTIONS, {
    params: { limit },
  });
  return response.data;
}
