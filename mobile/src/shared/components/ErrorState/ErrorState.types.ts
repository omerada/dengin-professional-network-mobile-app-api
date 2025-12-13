// src/shared/components/ErrorState/ErrorState.types.ts
// ErrorState Type Definitions

export type ErrorStateVariant = 'network' | 'server' | 'notFound' | 'generic' | 'permission';

/**
 * ErrorState Props
 */
export interface ErrorStateProps {
  /** Error object or message */
  error?: Error | string;
  /** Retry callback */
  onRetry?: () => void;
  /** Error variant */
  variant?: ErrorStateVariant;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Custom icon */
  icon?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry button label */
  retryLabel?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Error variant configuration
 */
export interface ErrorStateConfig {
  icon: string;
  title: string;
  message: string;
}

export const ERROR_STATE_CONFIGS: Record<ErrorStateVariant, ErrorStateConfig> = {
  network: {
    icon: 'cloud-offline-outline',
    title: 'Bağlantı Hatası',
    message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin',
  },
  server: {
    icon: 'server-outline',
    title: 'Sunucu Hatası',
    message: 'Bir sorun oluştu, lütfen daha sonra tekrar deneyin',
  },
  notFound: {
    icon: 'search-outline',
    title: 'İçerik Bulunamadı',
    message: 'Aradığınız içerik bulunamadı veya kaldırılmış olabilir',
  },
  permission: {
    icon: 'lock-closed-outline',
    title: 'İzin Gerekli',
    message: 'Bu içeriği görüntülemek için izniniz yok',
  },
  generic: {
    icon: 'alert-circle-outline',
    title: 'Bir Hata Oluştu',
    message: 'Beklenmeyen bir hata oluştu, lütfen tekrar deneyin',
  },
};
