// src/features/feed/components/FeedHeader/professionConfig.ts
// Dengin Design System - Profession Icon & Color Configuration
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 692-780

import type { ProfessionCategory } from '@shared/types/api.types';

export type { ProfessionCategory };

/**
 * Profession icon mapping (Ionicons)
 */
export const PROFESSION_ICONS: Record<ProfessionCategory, string> = {
  MEDICAL: 'medical',
  LEGAL: 'scale',
  ENGINEERING: 'construct',
  EDUCATION: 'school',
  SERVICE: 'briefcase',
  CREATIVE: 'color-palette',
  BUSINESS: 'trending-up',
  OTHER: 'people',
};

/**
 * Profession color mapping (Material Design palette)
 */
export const PROFESSION_COLORS: Record<ProfessionCategory, string> = {
  MEDICAL: '#4CAF50', // Green (🏥)
  LEGAL: '#2196F3', // Blue (⚖️)
  ENGINEERING: '#FF9800', // Orange (🔧)
  EDUCATION: '#9C27B0', // Purple (🎓)
  SERVICE: '#00BCD4', // Cyan (💼)
  CREATIVE: '#E91E63', // Pink (🎨)
  BUSINESS: '#607D8B', // Blue Grey (📈)
  OTHER: '#9E9E9E', // Grey (👥)
};

/**
 * Get profession icon name
 */
export const getProfessionIcon = (category?: ProfessionCategory): string => {
  if (!category) return PROFESSION_ICONS.OTHER;
  return PROFESSION_ICONS[category] || PROFESSION_ICONS.OTHER;
};

/**
 * Get profession color
 */
export const getProfessionColor = (category?: ProfessionCategory): string => {
  if (!category) return PROFESSION_COLORS.OTHER;
  return PROFESSION_COLORS[category] || PROFESSION_COLORS.OTHER;
};
