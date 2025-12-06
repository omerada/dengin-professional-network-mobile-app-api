// src/features/notifications/types/notification.types.ts
// Notification type definitions - Backend DTO'larına %100 uyumlu
// Backend: com.meslektas.notification.application.dto.*
// Backend: com.meslektas.notification.domain.model.*

// =============================================================================
// ENUMS - Backend ile uyumlu
// =============================================================================

/**
 * Bildirim türleri - Backend NotificationType enum ile uyumlu
 * @see NotificationType.java
 */
export type NotificationType =
  // Social
  | 'NEW_FOLLOWER'
  | 'POST_LIKED'
  | 'POST_COMMENTED'
  | 'MENTION'
  // Messaging
  | 'NEW_MESSAGE'
  | 'NEW_MATCH'
  // Verification
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'VERIFICATION_PENDING_REVIEW'
  | 'VERIFICATION_STATUS'
  // Moderation
  | 'POST_FLAGGED'
  | 'CONTENT_REMOVED'
  | 'WARNING_ISSUED'
  | 'MODERATION_ALERT'
  // Profile
  | 'PROFILE_VIEW'
  // System
  | 'WELCOME'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REACTIVATED'
  | 'SYSTEM';

/**
 * Bildirim durumu - Backend NotificationStatus enum ile uyumlu
 * @see NotificationStatus.java
 */
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'EXPIRED';

/**
 * Teslimat kanalları - Backend DeliveryChannel enum ile uyumlu
 * @see DeliveryChannel.java
 */
export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'PUSH';

/**
 * Bildirim kategorileri
 */
export type NotificationCategory =
  | 'SOCIAL'
  | 'MESSAGING'
  | 'VERIFICATION'
  | 'MODERATION'
  | 'SYSTEM';

// =============================================================================
// BACKEND DTOs - REST API Response Types
// =============================================================================

/**
 * Bildirim yanıtı - Backend NotificationResponse ile uyumlu
 * @see NotificationResponse.java
 */
export interface NotificationResponse {
  /** Bildirim UUID (zorunlu) */
  notificationId: string;
  /** Bildirim türü */
  type: NotificationType;
  /** Bildirim başlığı */
  title: string;
  /** Bildirim içeriği */
  body: string;
  /** Tıklama URL'i (deep link) */
  actionUrl: string | null;
  /** Ek meta veriler (her zaman object döner, boş olabilir) */
  metadata: Record<string, string>;
  /** Bildirim durumu */
  status: NotificationStatus;
  /** Teslimat yapılan kanallar (her zaman array döner, boş olabilir) */
  deliveredChannels: DeliveryChannel[];
  /** Okundu mu */
  read: boolean;
  /** Okunma zamanı - ISO 8601 */
  readAt: string | null;
  /** Göreceli zaman (ör: "2 saat önce") */
  relativeTime: string;
  /** Oluşturulma zamanı - ISO 8601 */
  createdAt: string;
  /** İkon adı (backend'den hesaplanır, opsiyonel) */
  icon?: string;
  /** Renk (backend'den hesaplanır, opsiyonel) */
  color?: string;
}

/**
 * Bildirim listesi yanıtı - Backend NotificationListResponse ile uyumlu
 * @see NotificationListResponse.java
 */
export interface NotificationListResponse {
  /** Bildirim listesi */
  notifications: NotificationResponse[];
  /** Toplam okunmamış sayısı */
  unreadCount: number;
  /** Türe göre okunmamış sayıları */
  unreadByType: Record<string, number>;
  /** Mevcut sayfa (0-indexed) */
  currentPage: number;
  /** Sayfa boyutu */
  pageSize: number;
  /** Toplam sayfa sayısı */
  totalPages: number;
  /** Toplam bildirim sayısı */
  totalElements: number;
  /** Daha fazla sayfa var mı */
  hasMore: boolean;
  /** İlk sayfa mı */
  first: boolean;
  /** Son sayfa mı */
  last: boolean;
}

/**
 * Bildirim tipi bilgisi - Backend NotificationTypeInfo ile uyumlu
 */
export interface NotificationTypeInfo {
  /** Tip adı */
  name: string;
  /** Görünen ad */
  displayName: string;
  /** Açıklama */
  description: string;
  /** Kategori */
  category: NotificationCategory;
  /** Opsiyonel mi (kapatılabilir) */
  optional: boolean;
}

/**
 * Bildirim tercihleri yanıtı - Backend NotificationPreferencesResponse ile uyumlu
 * @see NotificationPreferencesResponse.java
 */
export interface NotificationPreferencesResponse {
  /** Kullanıcı ID */
  userId: number;
  /** Tüm bildirimler aktif mi */
  notificationsEnabled: boolean;
  /** E-posta bildirimleri aktif mi */
  emailEnabled: boolean;
  /** Push bildirimleri aktif mi */
  pushEnabled: boolean;
  /** Sessiz saatler başlangıcı (0-23), null ise ayarlanmamış */
  quietHoursStart: number | null;
  /** Sessiz saatler bitişi (0-23), null ise ayarlanmamış */
  quietHoursEnd: number | null;
  /** Şu an sessiz saatlerde mi */
  inQuietHours: boolean;
  /** Her bildirim türü için aktif kanallar */
  typeSettings: Record<string, DeliveryChannel[]>;
  /** Mevcut bildirim türleri ve açıklamaları */
  availableTypes: Record<string, NotificationTypeInfo>;
  /** Son güncelleme zamanı - ISO 8601 */
  updatedAt: string;
}

/**
 * Bildirim tercihleri güncelleme isteği
 */
export interface NotificationPreferencesRequest {
  /** Tüm bildirimler aktif mi */
  notificationsEnabled?: boolean;
  /** E-posta bildirimleri aktif mi */
  emailEnabled?: boolean;
  /** Push bildirimleri aktif mi */
  pushEnabled?: boolean;
  /** Sessiz saatler başlangıcı (0-23) */
  quietHoursStart?: number | null;
  /** Sessiz saatler bitişi (0-23) */
  quietHoursEnd?: number | null;
  /** Her bildirim türü için aktif kanallar */
  typeSettings?: Record<string, DeliveryChannel[]>;
}

/**
 * Okundu işaretle isteği
 */
export interface MarkAsReadRequest {
  /** Tümünü okundu işaretle */
  markAll?: boolean;
  /** İşaretlenecek bildirim ID'leri */
  notificationIds?: string[];
}

// =============================================================================
// DEVICE TOKEN DTOs - Backend DeviceTokenController ile uyumlu
// =============================================================================

/**
 * Cihaz platformu
 */
export type DevicePlatform = 'IOS' | 'ANDROID';

/**
 * Cihaz kayıt isteği - Backend RegisterDeviceRequest ile uyumlu
 */
export interface RegisterDeviceRequest {
  /** FCM token */
  token: string;
  /** Platform (IOS/ANDROID) */
  platform: DevicePlatform;
  /** Cihaz adı (opsiyonel) */
  deviceName?: string;
}

/**
 * Cihaz kayıt silme isteği
 */
export interface UnregisterDeviceRequest {
  /** FCM token */
  token: string;
}

/**
 * Cihaz token yanıtı
 */
export interface DeviceTokenResponse {
  /** Token ID */
  id: number;
  /** Platform */
  platform: string;
  /** Cihaz adı */
  deviceName: string | null;
  /** Aktif mi */
  active: boolean;
}

// =============================================================================
// FCM / REMOTE MESSAGE TYPES
// =============================================================================

/**
 * FCM uzak mesaj yapısı
 */
export interface RemoteMessage {
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
    imageUrl?: string;
  };
  data?: Record<string, string>;
  from?: string;
  sentTime?: number;
}

/**
 * Bildirim verisi (data payload)
 */
export interface NotificationPayload {
  /** Bildirim türü */
  type: NotificationType;
  /** Bildirim ID */
  notificationId?: string;
  /** Bildirim ID alias */
  id?: string;
  /** Deep link URL */
  actionUrl?: string;
  /** İlgili kaynak ID'leri */
  conversationId?: string;
  postId?: string;
  userId?: string;
  commentId?: string;
  /** Additional IDs for different notification types */
  senderId?: string;
  messageId?: string;
  matchId?: string;
  viewerId?: string;
}

/**
 * Bildirim verisi alias - backward compatibility
 */
export type NotificationData = NotificationPayload;

// =============================================================================
// NOTIFICATION CHANNELS (Android)
// =============================================================================

/**
 * Bildirim kanalı önem seviyesi
 */
export type ChannelImportance = 'none' | 'min' | 'low' | 'default' | 'high';

/**
 * Bildirim kanalı (Android)
 */
export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: ChannelImportance;
  sound?: string;
  vibration?: boolean;
}

/**
 * Bildirim kanalları listesi
 */
export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: 'messages',
    name: 'Mesajlar',
    description: 'Yeni mesaj bildirimleri',
    importance: 'high',
    sound: 'default',
    vibration: true,
  },
  {
    id: 'social',
    name: 'Sosyal',
    description: 'Beğeni, yorum ve takip bildirimleri',
    importance: 'default',
    sound: 'default',
    vibration: true,
  },
  {
    id: 'verification',
    name: 'Doğrulama',
    description: 'Kimlik doğrulama bildirimleri',
    importance: 'high',
    sound: 'default',
    vibration: true,
  },
  {
    id: 'system',
    name: 'Sistem',
    description: 'Sistem bildirimleri',
    importance: 'default',
  },
];

// =============================================================================
// STORE TYPES
// =============================================================================

/**
 * Bildirim store state
 */
export interface NotificationStoreState {
  // State
  notifications: NotificationResponse[];
  unreadCount: number;
  unreadByType: Record<string, number>;
  preferences: NotificationPreferencesResponse | null;
  fcmToken: string | null;
  isPermissionGranted: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: NotificationResponse[]) => void;
  appendNotifications: (notifications: NotificationResponse[]) => void;
  addNotification: (notification: NotificationResponse) => void;
  prependNotification: (notification: NotificationResponse) => void;
  updateNotification: (notificationId: string, updates: Partial<NotificationResponse>) => void;
  markAsRead: (notificationId: string) => void;
  markMultipleAsRead: (notificationIds: string[]) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  setPreferences: (preferences: NotificationPreferencesResponse) => void;
  updatePreferences: (updates: Partial<NotificationPreferencesRequest>) => void;
  setUnreadCount: (count: number) => void;
  setUnreadByType: (unreadByType: Record<string, number>) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  setFcmToken: (token: string | null) => void;
  setPermissionGranted: (granted: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Bildirim ikonu ve rengi için yardımcı fonksiyonlar
 */
export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    NEW_FOLLOWER: 'person-add',
    POST_LIKED: 'heart',
    POST_COMMENTED: 'chatbubble',
    MENTION: 'at',
    NEW_MESSAGE: 'mail',
    VERIFICATION_APPROVED: 'checkmark-circle',
    VERIFICATION_REJECTED: 'close-circle',
    VERIFICATION_PENDING_REVIEW: 'time',
    POST_FLAGGED: 'warning',
    CONTENT_REMOVED: 'trash',
    WARNING_ISSUED: 'warning',
    WELCOME: 'hand-right',
    PASSWORD_RESET: 'key',
    ACCOUNT_SUSPENDED: 'ban',
    ACCOUNT_REACTIVATED: 'checkmark-circle',
  };
  return icons[type] || 'notifications';
};

export const getNotificationColor = (type: NotificationType): string => {
  const colors: Record<NotificationType, string> = {
    NEW_FOLLOWER: '#3B82F6', // Blue
    POST_LIKED: '#EF4444', // Red
    POST_COMMENTED: '#10B981', // Green
    MENTION: '#6366F1', // Indigo
    NEW_MESSAGE: '#6366F1', // Indigo
    VERIFICATION_APPROVED: '#10B981', // Green
    VERIFICATION_REJECTED: '#EF4444', // Red
    VERIFICATION_PENDING_REVIEW: '#F59E0B', // Amber
    POST_FLAGGED: '#F59E0B', // Amber
    CONTENT_REMOVED: '#EF4444', // Red
    WARNING_ISSUED: '#F59E0B', // Amber
    WELCOME: '#8B5CF6', // Purple
    PASSWORD_RESET: '#6366F1', // Indigo
    ACCOUNT_SUSPENDED: '#EF4444', // Red
    ACCOUNT_REACTIVATED: '#10B981', // Green
  };
  return colors[type] || '#6B7280';
};

/**
 * Bildirim kategorisi al
 */
export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  const categories: Record<NotificationType, NotificationCategory> = {
    NEW_FOLLOWER: 'SOCIAL',
    POST_LIKED: 'SOCIAL',
    POST_COMMENTED: 'SOCIAL',
    MENTION: 'SOCIAL',
    NEW_MESSAGE: 'MESSAGING',
    VERIFICATION_APPROVED: 'VERIFICATION',
    VERIFICATION_REJECTED: 'VERIFICATION',
    VERIFICATION_PENDING_REVIEW: 'VERIFICATION',
    POST_FLAGGED: 'MODERATION',
    CONTENT_REMOVED: 'MODERATION',
    WARNING_ISSUED: 'MODERATION',
    WELCOME: 'SYSTEM',
    PASSWORD_RESET: 'SYSTEM',
    ACCOUNT_SUSPENDED: 'SYSTEM',
    ACCOUNT_REACTIVATED: 'SYSTEM',
  };
  return categories[type] || 'SYSTEM';
};
