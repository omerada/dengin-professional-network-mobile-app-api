// src/core/api/sectorApi.ts
// Sector API Client - Sprint 1: Sector-based community structure
// Backend: SectorController.java endpoints

import { apiClient } from './client';
import type { Sector, ProfessionGroup, SectorStats } from '@shared/types/api.types';

/**
 * Sector API Service
 *
 * Backend endpoints:
 * - GET /api/sectors - Get all active sectors
 * - GET /api/sectors/{id} - Get sector by ID
 * - GET /api/sectors/code/{code} - Get sector by code
 * - GET /api/sectors/search?q={query} - Search sectors
 * - GET /api/sectors/popular?limit={limit} - Get popular sectors
 * - GET /api/sectors/stats - Get sector statistics
 *
 * All endpoints are public (no authentication required)
 *
 * @since Sprint 1
 */
export const sectorApi = {
  /**
   * Get all active sectors
   *
   * Backend: GET /api/sectors
   * Returns: List of active sectors ordered by displayOrder
   *
   * @example
   * const sectors = await sectorApi.getAllActiveSectors();
   * // sectors = [{ id: 1, code: 'MEDICAL', name: 'Sağlık', ... }, ...]
   */
  getAllActiveSectors: async (): Promise<Sector[]> => {
    const response = await apiClient.get<Sector[]>('/api/sectors');
    return response.data;
  },

  /**
   * Get sector by ID
   *
   * Backend: GET /api/sectors/{id}
   * Returns: Single sector with member count
   * Throws: 404 if sector not found
   *
   * @param id - Sector ID
   * @example
   * const sector = await sectorApi.getSectorById(1);
   * // sector = { id: 1, code: 'MEDICAL', name: 'Sağlık', memberCount: 150, ... }
   */
  getSectorById: async (id: number): Promise<Sector> => {
    const response = await apiClient.get<Sector>(`/api/sectors/${id}`);
    return response.data;
  },

  /**
   * Get sector by code
   *
   * Backend: GET /api/sectors/code/{code}
   * Returns: Single sector
   * Throws: 404 if sector not found
   *
   * @param code - Sector code (e.g., 'MEDICAL', 'LEGAL')
   * @example
   * const sector = await sectorApi.getSectorByCode('MEDICAL');
   * // sector = { id: 1, code: 'MEDICAL', name: 'Sağlık', ... }
   */
  getSectorByCode: async (code: string): Promise<Sector> => {
    const response = await apiClient.get<Sector>(`/api/sectors/code/${code.toUpperCase()}`);
    return response.data;
  },

  /**
   * Search sectors by name
   *
   * Backend: GET /api/sectors/search?q={query}
   * Returns: List of matching sectors (case-insensitive partial match)
   *
   * @param query - Search query (empty returns all active sectors)
   * @example
   * const sectors = await sectorApi.searchSectors('sağ');
   * // sectors = [{ id: 1, code: 'MEDICAL', name: 'Sağlık', ... }]
   */
  searchSectors: async (query: string): Promise<Sector[]> => {
    const response = await apiClient.get<Sector[]>('/api/sectors/search', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get most popular sectors
   *
   * Backend: GET /api/sectors/popular?limit={limit}
   * Returns: List of sectors ordered by member count (descending)
   *
   * @param limit - Maximum number of sectors (default: 10)
   * @example
   * const popularSectors = await sectorApi.getMostPopular(5);
   * // Returns top 5 sectors by member count
   */
  getMostPopular: async (limit: number = 10): Promise<Sector[]> => {
    const response = await apiClient.get<Sector[]>('/api/sectors/popular', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get sector statistics
   *
   * Backend: GET /api/sectors/stats
   * Returns: Sector system statistics
   *
   * @example
   * const stats = await sectorApi.getStatistics();
   * // stats = { totalSectors: 8, activeSectors: 8 }
   */
  getStatistics: async (): Promise<SectorStats> => {
    const response = await apiClient.get<SectorStats>('/api/sectors/stats');
    return response.data;
  },
};

/**
 * Profession Group API Service (Future - Sprint 3)
 *
 * TODO: Implement when profession groups are needed
 * Backend endpoints:
 * - GET /api/profession-groups?sectorId={id}
 * - GET /api/profession-groups/{id}
 *
 * @since Sprint 3 (placeholder)
 */
export const professionGroupApi = {
  /**
   * Get profession groups by sector
   * @param sectorId - Sector ID
   * @returns List of profession groups in sector
   * @future Sprint 3
   */
  getBySector: async (sectorId: number): Promise<ProfessionGroup[]> => {
    // TODO: Implement in Sprint 3
    const response = await apiClient.get<ProfessionGroup[]>('/api/profession-groups', {
      params: { sectorId },
    });
    return response.data;
  },

  /**
   * Get profession group by ID
   * @param id - Profession group ID
   * @returns Profession group details
   * @future Sprint 3
   */
  getById: async (id: number): Promise<ProfessionGroup> => {
    // TODO: Implement in Sprint 3
    const response = await apiClient.get<ProfessionGroup>(`/api/profession-groups/${id}`);
    return response.data;
  },
};
