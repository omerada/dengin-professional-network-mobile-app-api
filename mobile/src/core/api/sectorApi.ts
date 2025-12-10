// src/core/api/sectorApi.ts
// Sector API Client - Sprint 1: Sector-based community structure
// Backend: SectorController.java endpoints

import { apiClient } from './client';
import type { Sector, ProfessionGroup, SectorStats } from '@shared/types/api.types';

/**
 * Backend ApiResponse wrapper type
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

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
 * Backend wraps responses in ApiResponse<T> { success, data, timestamp }
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
    const response = await apiClient.get<ApiResponse<Sector[]>>('/api/sectors');
    return response.data.data; // Unwrap ApiResponse
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
    const response = await apiClient.get<ApiResponse<Sector>>(`/api/sectors/${id}`);
    return response.data.data; // Unwrap ApiResponse
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
    const response = await apiClient.get<ApiResponse<Sector>>(
      `/api/sectors/code/${code.toUpperCase()}`,
    );
    return response.data.data; // Unwrap ApiResponse
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
    const response = await apiClient.get<ApiResponse<Sector[]>>('/api/sectors/search', {
      params: { q: query },
    });
    return response.data.data; // Unwrap ApiResponse
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
    const response = await apiClient.get<ApiResponse<Sector[]>>('/api/sectors/popular', {
      params: { limit },
    });
    return response.data.data; // Unwrap ApiResponse
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
    const response = await apiClient.get<ApiResponse<SectorStats>>('/api/sectors/stats');
    return response.data.data; // Unwrap ApiResponse
  },
};

/**
 * Profession Group API Service (Sprint 3)
 *
 * Status: ✅ Production-ready - Backend fully implemented
 *
 * Backend Implementation Complete:
 * - ✅ Domain: ProfessionGroup.java entity
 * - ✅ Repository: ProfessionGroupRepository.java (JPA)
 * - ✅ DTO: ProfessionGroupResponse.java
 * - ✅ Mapper: ProfessionGroupMapper.java (MapStruct)
 * - ✅ Service: ProfessionGroupService.java (business logic, caching)
 * - ✅ Controller: ProfessionGroupController.java (REST endpoints)
 *
 * Available endpoints:
 * - GET /api/profession-groups?sectorId={id} - Get active groups by sector
 * - GET /api/profession-groups/{id} - Get group by ID
 * - GET /api/profession-groups/search?sectorId={id}&q={query} - Search in sector
 *
 * All methods are production-ready and cached for performance.
 *
 * @since Sprint 3 - Profession group management
 */
export const professionGroupApi = {
  /**
   * Get profession groups by sector
   * @param sectorId - Sector ID
   * @returns List of profession groups in sector
   * @future Sprint 3
   */
  getBySector: async (sectorId: number): Promise<ProfessionGroup[]> => {
    const response = await apiClient.get<ApiResponse<ProfessionGroup[]>>('/api/profession-groups', {
      params: { sectorId },
    });
    return response.data.data; // Unwrap ApiResponse
  },

  /**
   * Get profession group by ID
   * @param id - Profession group ID
   * @returns Profession group details
   * @future Sprint 3
   */
  getById: async (id: number): Promise<ProfessionGroup> => {
    const response = await apiClient.get<ApiResponse<ProfessionGroup>>(
      `/api/profession-groups/${id}`,
    );
    return response.data.data; // Unwrap ApiResponse
  },
};
