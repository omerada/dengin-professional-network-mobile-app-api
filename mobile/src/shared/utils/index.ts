// src/shared/utils/index.ts
// Shared utilities exports
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

// Performance utilities
export {
  createMemoComparator,
  useDebouncedCallback,
  useThrottledCallback,
  runAfterInteractions,
  useLazyInit,
  getItemLayout,
  calculateWindowSize,
  chunkArray,
  scheduleIdleTask,
  cancelIdleTask,
  measureRenderTime,
  useListPerformance,
  preloadImages,
  getListOptimizations,
  PlatformOptimizations,
} from './performance';

// Error handling utilities
export {
  ErrorType,
  AppError,
  parseApiError,
  showErrorAlert,
  setupGlobalErrorHandler,
  withErrorBoundary,
  tryCatch,
  retryWithBackoff,
} from './errorHandling';
export type { ErrorFallbackProps } from './errorHandling';
