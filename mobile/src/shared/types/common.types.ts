// src/shared/types/common.types.ts
// Oku: mobile-development-guide/architecture/01-MOBILE-ARCHITECTURE.md

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Cursor-based pagination response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Generic error type
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Loading state enum
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async state wrapper
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User verification status
 */
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

/**
 * User role
 */
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

/**
 * Device platform
 */
export type Platform = 'ios' | 'android';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Language code
 */
export type LanguageCode = 'tr' | 'en';

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper
 */
export type Optional<T> = T | undefined;

/**
 * Deep partial type helper
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================
// UUID TYPE & VALIDATION
// ============================================

/**
 * UUID branded type for type-safety
 * Backend'de UUID olarak tanımlanan alanlar için kullanılır
 *
 * @example
 * const userId: UUID = '550e8400-e29b-41d4-a716-446655440000' as UUID;
 */
export type UUID = string & { readonly __brand: 'UUID' };

/**
 * UUID format regex pattern
 * RFC 4122 uyumlu UUID formatı
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID format
 *
 * @param value - String to validate
 * @returns true if valid UUID format
 *
 * @example
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000') // true
 * isValidUUID('invalid-uuid') // false
 */
export function isValidUUID(value: string): value is UUID {
  return UUID_REGEX.test(value);
}

/**
 * Converts a string to UUID type with validation
 * Throws error if invalid format
 *
 * @param value - String to convert
 * @returns UUID branded string
 * @throws Error if invalid UUID format
 *
 * @example
 * const userId = toUUID('550e8400-e29b-41d4-a716-446655440000');
 */
export function toUUID(value: string): UUID {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid UUID format: ${value}`);
  }
  return value;
}

/**
 * Safely converts a string to UUID, returns null if invalid
 *
 * @param value - String to convert
 * @returns UUID or null if invalid
 */
export function toUUIDSafe(value: string | null | undefined): UUID | null {
  if (!value || !isValidUUID(value)) {
    return null;
  }
  return value;
}
