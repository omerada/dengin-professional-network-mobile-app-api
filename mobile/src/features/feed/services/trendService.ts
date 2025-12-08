// src/features/feed/services/trendService.ts
// AI Trend API Service
// Backend: GET /api/trends/profession/{category}

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type { ProfessionCategory } from '@shared/types';

/**
 * AI Trend Response from Backend
 * Backend: AITrendResponse.java
 */
export interface AITrendResponse {
  id: string;
  title: string;
  professionCategory: ProfessionCategory;
}

/**
 * Get AI-generated trends for profession category
 *
 * @param category - Profession category (MEDICAL, LEGAL, etc.)
 * @returns List of 3 AI-generated Turkish trend titles
 *
 * Backend:
 * - Endpoint: GET /api/trends/profession/{category}
 * - Service: TrendService.java
 * - AI: OpenRouter API (gpt-4o-mini)
 * - Cache: 1 hour per profession
 * - Rate Limit: 100 requests/hour
 *
 * Replaces: mockTrends.ts (getTrendsByProfession)
 */
export async function getTrendsByProfession(
  category: ProfessionCategory,
): Promise<AITrendResponse[]> {
  const response = await apiClient.get<AITrendResponse[]>(
    `${API_ENDPOINTS.TRENDS}/profession/${category}`,
  );
  return response.data;
}

/**
 * Get all valid profession categories
 * Helper endpoint for development/debugging
 *
 * Backend: GET /api/trends/categories
 */
export async function getProfessionCategories(): Promise<string[]> {
  const response = await apiClient.get<string[]>(`${API_ENDPOINTS.TRENDS}/categories`);
  return response.data;
}
