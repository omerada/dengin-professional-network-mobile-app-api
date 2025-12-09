// src/shared/hooks/useSectors.ts
// React Query hook for sector data
// Sprint 1: Sector-based community structure

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { sectorApi } from '@core/api';
import type { Sector, SectorStats } from '@shared/types/api.types';

/**
 * Query keys for sector data
 * Used for caching and invalidation
 */
export const sectorKeys = {
  all: ['sectors'] as const,
  lists: () => [...sectorKeys.all, 'list'] as const,
  list: (filters?: string) => [...sectorKeys.lists(), filters] as const,
  details: () => [...sectorKeys.all, 'detail'] as const,
  detail: (id: number) => [...sectorKeys.details(), id] as const,
  byCode: (code: string) => [...sectorKeys.all, 'code', code] as const,
  search: (query: string) => [...sectorKeys.all, 'search', query] as const,
  popular: (limit: number) => [...sectorKeys.all, 'popular', limit] as const,
  stats: () => [...sectorKeys.all, 'stats'] as const,
};

/**
 * Hook: Get all active sectors
 *
 * Fetches list of all active sectors from backend.
 * Data is cached for 10 minutes (same as backend cache).
 *
 * @example
 * const { data: sectors, isLoading } = useSectors();
 *
 * @returns Query result with sectors array
 */
export function useSectors(): UseQueryResult<Sector[], Error> {
  return useQuery({
    queryKey: sectorKeys.lists(),
    queryFn: sectorApi.getAllActiveSectors,
    staleTime: 10 * 60 * 1000, // 10 minutes (matches backend cache)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook: Get sector by ID
 *
 * @param id - Sector ID
 * @param enabled - Whether to enable the query (default: true)
 *
 * @example
 * const { data: sector } = useSector(1);
 */
export function useSector(id: number, enabled: boolean = true): UseQueryResult<Sector, Error> {
  return useQuery({
    queryKey: sectorKeys.detail(id),
    queryFn: () => sectorApi.getSectorById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook: Get sector by code
 *
 * @param code - Sector code (e.g., 'MEDICAL')
 * @param enabled - Whether to enable the query
 *
 * @example
 * const { data: sector } = useSectorByCode('MEDICAL');
 */
export function useSectorByCode(
  code: string,
  enabled: boolean = true,
): UseQueryResult<Sector, Error> {
  return useQuery({
    queryKey: sectorKeys.byCode(code),
    queryFn: () => sectorApi.getSectorByCode(code),
    enabled: enabled && !!code,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook: Search sectors by name
 *
 * @param query - Search query
 * @param enabled - Whether to enable the query
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const { data: results } = useSearchSectors(searchQuery);
 */
export function useSearchSectors(
  query: string,
  enabled: boolean = true,
): UseQueryResult<Sector[], Error> {
  return useQuery({
    queryKey: sectorKeys.search(query),
    queryFn: () => sectorApi.searchSectors(query),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes for search results
  });
}

/**
 * Hook: Get popular sectors
 *
 * @param limit - Maximum number of sectors (default: 10)
 *
 * @example
 * const { data: popularSectors } = usePopularSectors(5);
 */
export function usePopularSectors(limit: number = 10): UseQueryResult<Sector[], Error> {
  return useQuery({
    queryKey: sectorKeys.popular(limit),
    queryFn: () => sectorApi.getMostPopular(limit),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook: Get sector statistics
 *
 * @example
 * const { data: stats } = useSectorStats();
 * // stats = { totalSectors: 8, activeSectors: 8 }
 */
export function useSectorStats(): UseQueryResult<SectorStats, Error> {
  return useQuery({
    queryKey: sectorKeys.stats(),
    queryFn: sectorApi.getStatistics,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Helper: Check if sector is professional (requires verification)
 *
 * Professional sectors: MEDICAL, LEGAL, ENGINEERING, EDUCATION
 *
 * @param sectorCode - Sector code
 * @returns true if sector typically requires verification
 */
export function isProfessionalSector(sectorCode?: string): boolean {
  if (!sectorCode) return false;
  const professionalSectors = ['MEDICAL', 'LEGAL', 'ENGINEERING', 'EDUCATION'];
  return professionalSectors.includes(sectorCode.toUpperCase());
}

/**
 * Helper: Check if sector is general (OTHER)
 *
 * @param sectorCode - Sector code
 * @returns true if sector is OTHER
 */
export function isGeneralSector(sectorCode?: string): boolean {
  return sectorCode?.toUpperCase() === 'OTHER';
}
