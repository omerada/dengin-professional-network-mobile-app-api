// src/features/profile/services/professionApi.ts
// Profession API service - Backend ProfessionController ile %100 uyumlu
// Backend: com.meslektas.identity.api.ProfessionController

import { apiClient, API_ENDPOINTS } from '@core/api';

/**
 * API Response wrapper - Backend ApiResponse<T> formatı
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Profession Category - Backend ProfessionCategory enum
 */
export type ProfessionCategory =
  | 'HEALTHCARE'
  | 'ENGINEERING'
  | 'LAW'
  | 'EDUCATION'
  | 'FINANCE'
  | 'IT'
  | 'ARTS'
  | 'SCIENCE'
  | 'TRADES'
  | 'OTHER';

/**
 * Profession Response - Backend ProfessionResponse record
 */
export interface ProfessionResponse {
  id: number;
  name: string;
  category: ProfessionCategory;
  description?: string;
  requiresVerification: boolean;
  iconUrl?: string;
  displayOrder?: number;
}

/**
 * Profession Stats Response
 */
export interface ProfessionStatsResponse {
  professionId: number;
  professionName: string;
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
}

/**
 * Profession API Service
 *
 * Backend Endpoints:
 * - GET /api/professions - List all professions
 * - GET /api/professions/{id} - Get profession by ID
 * - GET /api/professions/category/{category} - Get professions by category
 * - GET /api/professions/search - Search professions
 * - GET /api/professions/verification-required - Get professions requiring verification
 * - GET /api/professions/stats - Get profession statistics
 */
export const professionApi = {
  /**
   * Get all professions
   * GET /api/professions
   *
   * Backend: ProfessionController.getAllProfessions()
   */
  getAll: async (): Promise<ProfessionResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProfessionResponse[]>>(
      API_ENDPOINTS.PROFESSIONS.LIST,
    );
    return response.data.data;
  },

  /**
   * Get profession by ID
   * GET /api/professions/{id}
   *
   * Backend: ProfessionController.getProfessionById()
   */
  getById: async (id: number): Promise<ProfessionResponse> => {
    const response = await apiClient.get<ApiResponse<ProfessionResponse>>(
      API_ENDPOINTS.PROFESSIONS.BY_ID(id),
    );
    return response.data.data;
  },

  /**
   * Get professions by category
   * GET /api/professions/category/{category}
   *
   * Backend: ProfessionController.getProfessionsByCategory()
   */
  getByCategory: async (category: ProfessionCategory): Promise<ProfessionResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProfessionResponse[]>>(
      API_ENDPOINTS.PROFESSIONS.BY_CATEGORY(category),
    );
    return response.data.data;
  },

  /**
   * Search professions
   * GET /api/professions/search?q={searchTerm}
   *
   * Backend: ProfessionController.searchProfessions()
   */
  search: async (searchTerm: string): Promise<ProfessionResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProfessionResponse[]>>(
      API_ENDPOINTS.PROFESSIONS.SEARCH,
      { params: { q: searchTerm } },
    );
    return response.data.data;
  },

  /**
   * Get professions that require AI verification
   * GET /api/professions/verification-required
   *
   * Backend: ProfessionController.getProfessionsRequiringVerification()
   */
  getVerificationRequired: async (): Promise<ProfessionResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProfessionResponse[]>>(
      API_ENDPOINTS.PROFESSIONS.VERIFICATION_REQUIRED,
    );
    return response.data.data;
  },

  /**
   * Get profession statistics
   * GET /api/professions/stats
   *
   * Backend: ProfessionController.getProfessionStats()
   */
  getStats: async (): Promise<ProfessionStatsResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProfessionStatsResponse[]>>(
      API_ENDPOINTS.PROFESSIONS.STATS,
    );
    return response.data.data;
  },
};

export default professionApi;
