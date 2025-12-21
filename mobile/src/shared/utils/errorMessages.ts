// src/shared/utils/errorMessages.ts
// Unified Error Messaging System - Production Ready
// Consistent, user-friendly error messages across the app

import type { ToastContextValue } from '@contexts/ToastContext';

/**
 * Error Message Configuration
 */
export interface ErrorMessageConfig {
  title?: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * ============================================================================
 * NETWORK ERRORS
 * ============================================================================
 */

/**
 * Show network connection error
 */
export function showNetworkError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'İnternet bağlantınızı kontrol edin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show timeout error
 */
export function showTimeoutError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show server error (5xx)
 */
export function showServerError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
}

/**
 * ============================================================================
 * AUTHENTICATION ERRORS
 * ============================================================================
 */

/**
 * Show invalid credentials error
 */
export function showInvalidCredentialsError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  onForgotPassword?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'E-posta veya şifre hatalı. Lütfen kontrol edin.',
    onForgotPassword ? { action: onForgotPassword } : undefined,
  );
}

/**
 * Show session expired error
 */
export function showSessionExpiredError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('warning');
  toast.warning('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
}

/**
 * Show unauthorized access error
 */
export function showUnauthorizedError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Bu işlem için yetkiniz yok.');
}

/**
 * ============================================================================
 * FEED/POST ERRORS
 * ============================================================================
 */

/**
 * Show post like error
 */
export function showLikeError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Beğeni kaydedilemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show post bookmark error
 */
export function showBookmarkError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Kaydetme işlemi başarısız. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show post delete error
 */
export function showDeletePostError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Gönderi silinemedi. Lütfen tekrar deneyin.');
}

/**
 * Show post create error
 */
export function showCreatePostError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Gönderi paylaşılamadı. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show comment post error
 */
export function showCommentError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Yorum gönderilemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * ============================================================================
 * MESSAGING ERRORS
 * ============================================================================
 */

/**
 * Show message send error
 */
export function showMessageSendError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show message delete error
 */
export function showMessageDeleteError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Mesaj silinemedi. Lütfen tekrar deneyin.');
}

/**
 * Show conversation load error
 */
export function showConversationLoadError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Konuşmalar yüklenemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * ============================================================================
 * SOCIAL/FOLLOW ERRORS
 * ============================================================================
 */

/**
 * Show follow error
 */
export function showFollowError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Takip işlemi başarısız. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show unfollow error
 */
export function showUnfollowError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Takipten çıkma işlemi başarısız. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * ============================================================================
 * PROFILE ERRORS
 * ============================================================================
 */

/**
 * Show profile update error
 */
export function showProfileUpdateError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Profil güncellenemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show avatar upload error
 */
export function showAvatarUploadError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show password change error
 */
export function showPasswordChangeError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Şifre değiştirilemedi. Lütfen bilgilerinizi kontrol edin.');
}

/**
 * ============================================================================
 * VERIFICATION ERRORS
 * ============================================================================
 */

/**
 * Show document upload error
 */
export function showDocumentUploadError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Belge yüklenemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * Show verification submission error
 */
export function showVerificationSubmissionError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Doğrulama başvurusu gönderilemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * ============================================================================
 * FILE/MEDIA ERRORS
 * ============================================================================
 */

/**
 * Show file size error
 */
export function showFileSizeError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  maxSize: string = '10MB',
): void {
  haptic?.trigger?.('warning');
  toast.warning(`Dosya boyutu ${maxSize}'den büyük olamaz.`);
}

/**
 * Show file type error
 */
export function showFileTypeError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  acceptedTypes: string = 'JPG, PNG',
): void {
  haptic?.trigger?.('warning');
  toast.warning(`Sadece ${acceptedTypes} formatında dosya yükleyebilirsiniz.`);
}

/**
 * Show media upload error
 */
export function showMediaUploadError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  toast.error(
    'Medya yüklenemedi. Lütfen tekrar deneyin.',
    retryAction ? { action: retryAction } : undefined,
  );
}

/**
 * ============================================================================
 * PERMISSION ERRORS
 * ============================================================================
 */

/**
 * Show camera permission error
 */
export function showCameraPermissionError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('warning');
  toast.warning('Kamera izni gerekli. Lütfen ayarlardan izin verin.');
}

/**
 * Show photo library permission error
 */
export function showPhotoLibraryPermissionError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('warning');
  toast.warning('Fotoğraf erişim izni gerekli. Lütfen ayarlardan izin verin.');
}

/**
 * Show notification permission error
 */
export function showNotificationPermissionError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('warning');
  toast.warning('Bildirim izni gerekli. Lütfen ayarlardan izin verin.');
}

/**
 * ============================================================================
 * GENERIC ERRORS
 * ============================================================================
 */

/**
 * Show generic operation error with custom operation name
 */
export function showOperationError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
  operationName?: string,
  retryAction?: () => void,
): void {
  haptic?.trigger?.('error');
  const message = operationName
    ? `${operationName} başarısız oldu. Lütfen tekrar deneyin.`
    : 'İşlem başarısız oldu. Lütfen tekrar deneyin.';
  toast.error(message, retryAction ? { action: retryAction } : undefined);
}

/**
 * Show generic error (fallback)
 */
export function showGenericError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
}

/**
 * ============================================================================
 * VALIDATION ERRORS
 * ============================================================================
 */

/**
 * Show required field error
 */
export function showRequiredFieldError(
  toast: ToastContextValue,
  fieldName: string,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('warning');
  toast.warning(`${fieldName} alanı zorunludur.`);
}

/**
 * Show invalid format error
 */
export function showInvalidFormatError(
  toast: ToastContextValue,
  fieldName: string,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('warning');
  toast.warning(`${fieldName} geçersiz formatta.`);
}

/**
 * ============================================================================
 * ERROR PARSER (from API errors)
 * ============================================================================
 */

/**
 * Parse API error and show appropriate message
 *
 * @example
 * catch (error) {
 *   showApiError(error, toast, haptic, () => retry());
 * }
 */
export function showApiError(
  error: unknown,
  toast: ToastContextValue,
  haptic?: { trigger: any },
  retryAction?: () => void,
): void {
  const err = error as { message?: string; status?: number };

  // Network error
  if (err.message?.includes('network') || err.message?.includes('connection')) {
    showNetworkError(toast, haptic, retryAction);
    return;
  }

  // Timeout error
  if (err.message?.includes('timeout')) {
    showTimeoutError(toast, haptic, retryAction);
    return;
  }

  // Auth errors
  if (err.message?.includes('credentials') || err.message?.includes('password')) {
    showInvalidCredentialsError(toast, haptic);
    return;
  }

  if (err.status === 401 || err.message?.includes('unauthorized')) {
    showUnauthorizedError(toast, haptic);
    return;
  }

  // Server errors
  if (err.status && err.status >= 500) {
    showServerError(toast, haptic);
    return;
  }

  // Generic error with retry
  if (retryAction) {
    showGenericError(toast, haptic);
  } else {
    showGenericError(toast, haptic);
  }
}

/**
 * ============================================================================
 * MODERATION ERRORS
 * ============================================================================
 */

/**
 * Show block user error
 */
export function showBlockError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Kullanıcı engellenemedi');
}

/**
 * Show unblock user error
 */
export function showUnblockError(toast: ToastContextValue, haptic?: { trigger: any }): void {
  haptic?.trigger?.('error');
  toast.error('Engel kaldırılamadı');
}

/**
 * ============================================================================
 * VALIDATION ERRORS
 * ============================================================================
 */

/**
 * Show validation error
 */
export function showValidationError(
  toast: ToastContextValue,
  message: string,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('error');
  toast.warning(message);
}

/**
 * ============================================================================
 * ACCOUNT MANAGEMENT ERRORS
 * ============================================================================
 */

/**
 * Show account deletion error
 */
export function showAccountDeletionError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('error');
  toast.error('Hesap silinemedi');
}

/**
 * ============================================================================
 * PERMISSION ERRORS
 * ============================================================================
 */

/**
 * Show gallery permission error
 */
export function showGalleryPermissionError(
  toast: ToastContextValue,
  haptic?: { trigger: any },
): void {
  haptic?.trigger?.('error');
  toast.warning('Galeriden fotoğraf seçmek için izin gerekli');
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */
