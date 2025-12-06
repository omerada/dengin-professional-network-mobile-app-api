// src/features/social/hooks/useUserSearch.ts
// User search hook for finding users
// Oku: mobile-development-guide/features/04-SOCIAL-MODULE.md

import { useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@core/api';
import type { UserSummary } from '@features/messaging/types';

/**
 * Backend search response
 */
interface UserSearchResponse {
  content: UserSearchDto[];
  totalElements: number;
  hasNext: boolean;
}

interface UserSearchDto {
  id: number;
  fullName: string;
  profileImageUrl: string | null;
  professionName: string | null;
  verified: boolean;
}

/**
 * Search params
 */
interface UserSearchParams {
  query: string;
  page?: number;
  size?: number;
}

/**
 * Map backend response to UserSummary
 */
function mapToUserSummary(dto: UserSearchDto): UserSummary {
  return {
    id: String(dto.id),
    displayName: dto.fullName,
    avatarUrl: dto.profileImageUrl,
  };
}

/**
 * Search users API
 */
async function searchUsers(params: UserSearchParams): Promise<UserSummary[]> {
  const response = await apiClient.get<UserSearchResponse>(API_ENDPOINTS.USER.SEARCH, {
    params: {
      q: params.query,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });
  return response.data.content.map(mapToUserSummary);
}

/**
 * Hook for searching users
 * @param query - Search query (minimum 2 characters)
 * @param enabled - Whether to enable the query
 */
export function useUserSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => searchUsers({ query }),
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: [],
  });
}
