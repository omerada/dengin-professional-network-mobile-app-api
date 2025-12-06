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
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UserSearchDto {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  profession: {
    id: number;
    name: string;
  } | null;
  isProfessionVerified: boolean;
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
    id: String(dto.id), // Backend number döndürüyor, string'e çeviriyoruz
    displayName: dto.fullName,
    avatarUrl: dto.avatarUrl || null,
    profession: dto.profession?.name,
    verified: dto.isProfessionVerified,
  };
}

/**
 * Search users API
 */
async function searchUsers(params: UserSearchParams): Promise<UserSummary[]> {
  const response = await apiClient.get<{ data: UserSearchResponse }>(API_ENDPOINTS.USER.SEARCH, {
    params: {
      q: params.query,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });

  // Backend ApiResponse<PagedResponse<UserResponse>> formatında döndürüyor
  const pagedData = response.data.data || response.data;
  return (pagedData.content || []).map(mapToUserSummary);
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
