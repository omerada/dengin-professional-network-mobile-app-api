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

// Date utilities
export {
  formatRelativeTime,
  formatDate,
  formatDateTime,
  formatTime,
  formatMessageTime,
} from './dateUtils';

// Number utilities
export {
  formatCompactNumber,
  formatFollowerCount,
  formatEngagementCount,
  formatWithSeparators,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatPhoneNumber,
  formatOrdinal,
  clamp,
  lerp,
  roundTo,
  isValidNumber,
} from './numberUtils';
export type { FormatNumberOptions } from './numberUtils';

// Share utilities
export { shareContent, sharePost, shareProfile, copyToClipboard } from './share';

// String utilities
export {
  truncate,
  truncateMiddle,
  capitalize,
  capitalizeWords,
  titleCase,
  slugify,
  normalizeWhitespace,
  isBlank,
  isNotBlank,
  getInitials,
  generateUsername,
  maskEmail,
  maskPhone,
  getHighlightedParts,
  escapeRegex,
  removeEmoji,
  wordCount,
  charCount,
  extractHashtags,
  extractMentions,
  stripHtml,
  formatUsername,
  cleanUsername,
} from './stringUtils';
export type { HighlightPart } from './stringUtils';

// Validation utilities
export {
  isValidEmail,
  validateEmail,
  isValidPhoneNumber,
  validatePhone,
  checkPasswordStrength,
  validatePassword,
  validatePasswordConfirm,
  isValidUsername,
  validateUsername,
  validateName,
  validateBio,
  isValidUrl,
  validateUrl,
  validateOtp,
  required,
  minLength,
  maxLength,
  validate,
  combineValidators,
} from './validationUtils';
export type { ValidationResult, ValidationRule, PasswordStrength } from './validationUtils';

// Unified feedback utilities
export {
  showSuccess,
  showInfo,
  showWarning,
  showError,
  useUnifiedFeedback,
  UnifiedFeedbackUtils,
} from './unifiedFeedback';

// Error message utilities
export * from './errorMessages';
