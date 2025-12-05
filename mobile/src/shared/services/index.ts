// src/shared/services/index.ts
// Shared services exports
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

export { Analytics, AnalyticsEvent, AnalyticsScreen, useScreenTracking } from './analytics';
export type { UserProperties } from './analytics';

// Haptic Feedback Service
export { hapticService } from './HapticService';
export { default as HapticService } from './HapticService';
