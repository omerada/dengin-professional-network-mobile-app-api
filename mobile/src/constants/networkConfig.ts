// src/constants/networkConfig.ts
// Network Configuration Constants
// Centralized network timeouts and retry configuration

/**
 * Network configuration constants
 * Use these for consistent timeout and retry behavior across the app
 */
export const NETWORK_CONFIG = {
  /**
   * Default network timeout duration
   * Used for API requests and data fetching
   * @default 30000ms (30 seconds)
   */
  TIMEOUT_DURATION: 30000,

  /**
   * Number of retry attempts for failed requests
   * @default 3
   */
  RETRY_ATTEMPTS: 3,

  /**
   * Delay between retry attempts
   * @default 1000ms (1 second)
   */
  RETRY_DELAY: 1000,

  /**
   * Exponential backoff multiplier
   * Each retry will wait RETRY_DELAY * (BACKOFF_MULTIPLIER ^ attempt)
   * @default 2
   */
  BACKOFF_MULTIPLIER: 2,
} as const;
