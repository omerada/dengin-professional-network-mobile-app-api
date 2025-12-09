// src/shared/hooks/useProfessions.ts
// React Query hooks for profession data

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { professionApi, ProfessionCategory } from '@core/api';
import type { Profession } from '@shared/types/api.types';
import type { ProfessionStatsResponse } from '@core/api/professionApi';

/**
 * Query keys for profession data
 * Used for caching and invalidation
 */
export const professionKeys = {
  all: ['professions'] as const,
  lists: () => [...professionKeys.all, 'list'] as const,
  list: (filters?: string) => [...professionKeys.lists(), filters] as const,
  details: () => [...professionKeys.all, 'detail'] as const,
  detail: (id: number) => [...professionKeys.details(), id] as const,
  byCategory: (category: string) => [...professionKeys.all, 'category', category] as const,
  search: (query: string) => [...professionKeys.all, 'search', query] as const,
  verificationRequired: () => [...professionKeys.all, 'verification-required'] as const,
  stats: () => [...professionKeys.all, 'stats'] as const,
};

/**
 * Hook: Get all professions
 *
 * Fetches list of all professions from backend.
 * Data is cached for 10 minutes.
 *
 * @example
 * const { data: professions, isLoading } = useProfessions();
 *
 * @returns Query result with professions array
 */
export function useProfessions(): UseQueryResult<Profession[], Error> {
  return useQuery({
    queryKey: professionKeys.lists(),
    queryFn: professionApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook: Get profession by ID
 *
 * @param id - Profession ID
 * @param enabled - Whether to enable the query (default: true)
 *
 * @example
 * const { data: profession } = useProfession(1);
 */
export function useProfession(
  id: number,
  enabled: boolean = true,
): UseQueryResult<Profession, Error> {
  return useQuery({
    queryKey: professionKeys.detail(id),
    queryFn: () => professionApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook: Get professions by category
 *
 * @param category - Profession category (matches sector code)
 * @param enabled - Whether to enable the query
 *
 * @example
 * const { data: professions } = useProfessionsByCategory('MEDICAL');
 */
export function useProfessionsByCategory(
  category: ProfessionCategory | string,
  enabled: boolean = true,
): UseQueryResult<Profession[], Error> {
  return useQuery({
    queryKey: professionKeys.byCategory(category),
    queryFn: () => professionApi.getByCategory(category),
    enabled: enabled && !!category,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook: Search professions by name
 *
 * @param query - Search query
 * @param enabled - Whether to enable the query
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const { data: results } = useSearchProfessions(searchQuery);
 */
export function useSearchProfessions(
  query: string,
  enabled: boolean = true,
): UseQueryResult<Profession[], Error> {
  return useQuery({
    queryKey: professionKeys.search(query),
    queryFn: () => professionApi.search(query),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes for search results
  });
}

/**
 * Hook: Get professions requiring verification
 *
 * @example
 * const { data: verificationProfessions } = useVerificationRequiredProfessions();
 */
export function useVerificationRequiredProfessions(): UseQueryResult<Profession[], Error> {
  return useQuery({
    queryKey: professionKeys.verificationRequired(),
    queryFn: professionApi.getVerificationRequired,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook: Get profession statistics
 *
 * @example
 * const { data: stats } = useProfessionStats();
 */
export function useProfessionStats(): UseQueryResult<ProfessionStatsResponse, Error> {
  return useQuery({
    queryKey: professionKeys.stats(),
    queryFn: professionApi.getStatistics,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Helper: Check if profession requires verification
 *
 * @param profession - Profession object
 * @returns true if profession requires verification
 */
export function requiresVerification(profession?: Profession): boolean {
  if (!profession) return false;
  return profession.requiresVerification === true;
}
