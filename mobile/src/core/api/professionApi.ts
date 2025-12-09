// src/core/api/professionApi.ts
// Profession API Client
// Backend: ProfessionController.java endpoints

import { apiClient } from './client';
import type { Profession } from '@shared/types/api.types';

/**
 * Profession category enum (matches backend)
 */
export enum ProfessionCategory {
  MEDICAL = 'MEDICAL',
  ENGINEERING = 'ENGINEERING',
  LEGAL = 'LEGAL',
  EDUCATION = 'EDUCATION',
  TECH = 'TECH',
  FINANCE = 'FINANCE',
  ARTS = 'ARTS',
  OTHER = 'OTHER',
}

/**
 * Profession statistics response
 */
export interface ProfessionStatsResponse {
  totalProfessions: number;
  professionsRequiringVerification: number;
  professionsPerCategory: Record<string, number>;
}

/**
 * Profession API Service
 *
 * Backend endpoints:
 * - GET /api/professions - Get all professions
 * - GET /api/professions/{id} - Get profession by ID
 * - GET /api/professions/category/{category} - Get by category
 * - GET /api/professions/search?q={query} - Search professions
 * - GET /api/professions/verification-required - Get professions requiring verification
 * - GET /api/professions/stats - Get statistics
 *
 * All endpoints are public (no authentication required)
 */
export const professionApi = {
  /**
   * Get all professions
   *
   * Backend: GET /api/professions
   * Returns: List of all professions
   *
   * @example
   * const professions = await professionApi.getAll();
   */
  getAll: async (): Promise<Profession[]> => {
    const response = await apiClient.get<{ success: boolean; data: Profession[] }>(
      '/api/professions',
    );
    return response.data.data;
  },

  /**
   * Get profession by ID
   *
   * Backend: GET /api/professions/{id}
   * Returns: Single profession
   * Throws: 404 if profession not found
   *
   * @param id - Profession ID
   * @example
   * const profession = await professionApi.getById(1);
   */
  getById: async (id: number): Promise<Profession> => {
    const response = await apiClient.get<{ success: boolean; data: Profession }>(
      `/api/professions/${id}`,
    );
    return response.data.data;
  },

  /**
   * Get professions by category
   *
   * Backend: GET /api/professions/category/{category}
   * Returns: List of professions in the category
   *
   * @param category - Profession category
   * @example
   * const professions = await professionApi.getByCategory('MEDICAL');
   */
  getByCategory: async (category: ProfessionCategory | string): Promise<Profession[]> => {
    const response = await apiClient.get<{ success: boolean; data: Profession[] }>(
      `/api/professions/category/${category.toUpperCase()}`,
    );
    return response.data.data;
  },

  /**
   * Search professions by name
   *
   * Backend: GET /api/professions/search?q={query}
   * Returns: List of matching professions (case-insensitive partial match)
   *
   * @param query - Search query (empty returns all professions)
   * @example
   * const professions = await professionApi.search('doktor');
   */
  search: async (query: string): Promise<Profession[]> => {
    const response = await apiClient.get<{ success: boolean; data: Profession[] }>(
      '/api/professions/search',
      {
        params: { q: query },
      },
    );
    return response.data.data;
  },

  /**
   * Get professions requiring verification
   *
   * Backend: GET /api/professions/verification-required
   * Returns: List of professions that require AI verification
   *
   * @example
   * const professions = await professionApi.getVerificationRequired();
   */
  getVerificationRequired: async (): Promise<Profession[]> => {
    const response = await apiClient.get<{ success: boolean; data: Profession[] }>(
      '/api/professions/verification-required',
    );
    return response.data.data;
  },

  /**
   * Get profession statistics
   *
   * Backend: GET /api/professions/stats
   * Returns: Profession statistics
   *
   * @example
   * const stats = await professionApi.getStatistics();
   */
  getStatistics: async (): Promise<ProfessionStatsResponse> => {
    const response = await apiClient.get<{ success: boolean; data: ProfessionStatsResponse }>(
      '/api/professions/stats',
    );
    return response.data.data;
  },
};
