// src/core/utils/errorUtils.ts
// Error handling utilities for user-friendly Turkish error messages

import { AxiosError } from 'axios';

/**
 * Error response from backend
 */
export interface ApiErrorResponse {
  status: number;
  error?: string;
  message?: string;
  errorCode?: string;
  path?: string;
  timestamp?: string;
  validationErrors?: Record<string, string>;
}

/**
 * Error code to Turkish message mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'E-posta veya şifre hatalı',
  AUTH_USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  AUTH_EMAIL_ALREADY_EXISTS: 'Bu e-posta adresi zaten kullanılıyor',
  AUTH_ACCOUNT_INACTIVE: 'Hesabınız aktif değil',
  AUTH_ACCOUNT_BANNED: 'Hesabınız yasaklanmış',
  AUTH_TOKEN_EXPIRED: 'Oturum süreniz doldu, lütfen tekrar giriş yapın',
  AUTH_TOKEN_INVALID: 'Geçersiz oturum bilgisi',
  AUTH_UNAUTHORIZED: 'Bu işlem için yetkiniz yok',

  // Validation errors
  VALIDATION_ERROR: 'Girdiğiniz bilgiler geçersiz',
  VALIDATION_EMAIL_INVALID: 'Geçerli bir e-posta adresi girin',
  VALIDATION_PASSWORD_TOO_SHORT: 'Şifre en az 8 karakter olmalıdır',
  VALIDATION_REQUIRED_FIELD: 'Bu alan zorunludur',

  // Network errors
  NETWORK_ERROR: 'İnternet bağlantınızı kontrol edin',
  NETWORK_TIMEOUT: 'İstek zaman aşımına uğradı, lütfen tekrar deneyin',
  NETWORK_CONNECTION_REFUSED: 'Sunucuya bağlanılamıyor',

  // Server errors
  SERVER_ERROR: 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin',
  SERVICE_UNAVAILABLE: 'Servis şu anda kullanılamıyor',

  // Verification errors
  VERIFICATION_NOT_FOUND: 'Doğrulama talebi bulunamadı',
  VERIFICATION_ALREADY_EXISTS: 'Zaten bekleyen bir doğrulama talebiniz var',
  VERIFICATION_EXPIRED: 'Doğrulama süresi doldu',
  VERIFICATION_INVALID_DOCUMENT: 'Belge geçersiz',
  VERIFICATION_MAX_ATTEMPTS: 'Maksimum deneme hakkınız doldu',

  // File upload errors
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük',
  FILE_INVALID_TYPE: 'Geçersiz dosya tipi',
  UPLOAD_FAILED: 'Dosya yüklenemedi',

  // Messaging errors
  MESSAGE_RECIPIENT_NOT_FOUND: 'Alıcı bulunamadı',
  MESSAGE_SEND_FAILED: 'Mesaj gönderilemedi',
  CONVERSATION_NOT_FOUND: 'Konuşma bulunamadı',

  // Feed/Post errors
  POST_NOT_FOUND: 'Gönderi bulunamadı',
  POST_DELETED: 'Gönderi silinmiş',
  COMMENT_NOT_FOUND: 'Yorum bulunamadı',

  // User errors
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  USER_BLOCKED: 'Bu kullanıcıyı engellediniz',
  USER_BLOCKED_YOU: 'Bu kullanıcı sizi engellemiş',

  // Generic errors
  BAD_REQUEST: 'Geçersiz istek',
  FORBIDDEN: 'Bu işlem için yetkiniz yok',
  NOT_FOUND: 'İstenen kaynak bulunamadı',
  CONFLICT: 'İşlem çakışması',
  INTERNAL_ERROR: 'Bir hata oluştu',
};

/**
 * HTTP status code to Turkish message mapping
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Geçersiz istek',
  401: 'Oturum açmanız gerekiyor',
  403: 'Bu işlem için yetkiniz yok',
  404: 'İstenen kaynak bulunamadı',
  409: 'Bu işlem çakışıyor',
  422: 'Girdiğiniz bilgiler geçersiz',
  429: 'Çok fazla istek gönderdiniz, lütfen bekleyin',
  500: 'Sunucu hatası oluştu',
  502: 'Sunucu geçici olarak kullanılamıyor',
  503: 'Servis bakımda',
  504: 'İstek zaman aşımına uğradı',
};

/**
 * Extract user-friendly error message from error object
 */
export const getErrorMessage = (error: unknown): string => {
  // Handle null/undefined
  if (!error) {
    return 'Bilinmeyen bir hata oluştu';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check if it's an Axios error
    if ('isAxiosError' in error && error.isAxiosError) {
      return getAxiosErrorMessage(error as AxiosError<ApiErrorResponse>);
    }

    // Return error message if it looks like a user-friendly message
    if (error.message && !error.message.includes('Request failed')) {
      return error.message;
    }
  }

  // Handle objects with message property
  if (typeof error === 'object' && 'message' in error) {
    const msg = (error as any).message;
    if (typeof msg === 'string' && msg) {
      return msg;
    }
  }

  return 'Bir hata oluştu, lütfen tekrar deneyin';
};

/**
 * Extract error message from Axios error
 */
const getAxiosErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return ERROR_MESSAGES.NETWORK_TIMEOUT;
    }
    if (error.code === 'ECONNREFUSED') {
      return ERROR_MESSAGES.NETWORK_CONNECTION_REFUSED;
    }
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { data, status } = error.response;

  // Check for errorCode in response
  if (data?.errorCode && ERROR_MESSAGES[data.errorCode]) {
    return ERROR_MESSAGES[data.errorCode];
  }

  // Check for message in response
  if (data?.message) {
    // If message is already in Turkish or user-friendly, use it
    if (!data.message.includes('Request failed') && !data.message.includes('Error:')) {
      return data.message;
    }
  }

  // Handle validation errors
  if (data?.validationErrors && Object.keys(data.validationErrors).length > 0) {
    const firstError = Object.values(data.validationErrors)[0];
    return firstError || ERROR_MESSAGES.VALIDATION_ERROR;
  }

  // Fallback to status code message
  if (STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  // Last resort
  return status >= 500 ? ERROR_MESSAGES.SERVER_ERROR : ERROR_MESSAGES.INTERNAL_ERROR;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  if ('isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError;
    return !axiosError.response;
  }

  return false;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  if ('isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const errorCode = axiosError.response?.data?.errorCode;

    return status === 401 || errorCode?.startsWith('AUTH_') || false;
  }

  return false;
};

/**
 * Check if error requires retry
 */
export const shouldRetry = (error: unknown, retryCount: number = 0): boolean => {
  if (retryCount >= 3) return false;

  if (!error || typeof error !== 'object') return false;

  if ('isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;

    // Retry on network errors
    if (!axiosError.response) return true;

    // Retry on server errors (5xx) except 501
    if (status && status >= 500 && status !== 501) return true;

    // Retry on rate limit (429) after delay
    if (status === 429) return true;
  }

  return false;
};

/**
 * Get validation errors as key-value pairs
 */
export const getValidationErrors = (error: unknown): Record<string, string> | null => {
  if (!error || typeof error !== 'object') return null;

  if ('isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.validationErrors || null;
  }

  return null;
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: unknown): string => {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    if ('isAxiosError' in error && error.isAxiosError) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return JSON.stringify(
        {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          code: axiosError.code,
        },
        null,
        2,
      );
    }

    return `${error.name}: ${error.message}\n${error.stack}`;
  }

  return JSON.stringify(error, null, 2);
};
