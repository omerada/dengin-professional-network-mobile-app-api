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
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'POST_MENTION'
  | 'PROFILE_LIKE'
  // Messaging
  | 'NEW_MESSAGE'
  | 'MESSAGE_RECEIVED'
  | 'NEW_MATCH'
  | 'MATCH_ACCEPTED'
  | 'MATCH_SUGGESTION'
  // Verification
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'VERIFICATION_PENDING_REVIEW'
  | 'VERIFICATION_STATUS'
  | 'VERIFICATION_REQUIRED'
  // Moderation
  | 'POST_FLAGGED'
  | 'CONTENT_REMOVED'
  | 'WARNING_ISSUED'
  | 'MODERATION_ALERT'
  | 'POST_REMOVED'
  | 'ACCOUNT_WARNING'
  // Profile
  | 'PROFILE_VIEW'
  // System
  | 'WELCOME'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REACTIVATED'
  | 'SYSTEM'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'FEATURE_ANNOUNCEMENT';

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
  const icons: Partial<Record<NotificationType, string>> = {
    NEW_FOLLOWER: 'person-add',
    POST_LIKED: 'heart',
    POST_COMMENTED: 'chatbubble',
    MENTION: 'at',
    POST_LIKE: 'heart',
    POST_COMMENT: 'chatbubble',
    POST_MENTION: 'at',
    PROFILE_LIKE: 'heart-circle',
    NEW_MESSAGE: 'mail',
    MESSAGE_RECEIVED: 'mail',
    NEW_MATCH: 'people',
    MATCH_ACCEPTED: 'people',
    MATCH_SUGGESTION: 'people-circle',
    VERIFICATION_APPROVED: 'checkmark-circle',
    VERIFICATION_REJECTED: 'close-circle',
    VERIFICATION_PENDING_REVIEW: 'time',
    VERIFICATION_STATUS: 'shield-checkmark',
    VERIFICATION_REQUIRED: 'shield',
    POST_FLAGGED: 'warning',
    CONTENT_REMOVED: 'trash',
    WARNING_ISSUED: 'warning',
    POST_REMOVED: 'trash',
    ACCOUNT_WARNING: 'alert',
    MODERATION_ALERT: 'alert-circle',
    PROFILE_VIEW: 'eye',
    WELCOME: 'hand-right',
    PASSWORD_RESET: 'key',
    ACCOUNT_SUSPENDED: 'ban',
    ACCOUNT_REACTIVATED: 'checkmark-circle',
    SYSTEM: 'information-circle',
    SYSTEM_ANNOUNCEMENT: 'megaphone',
    FEATURE_ANNOUNCEMENT: 'sparkles',
  };
  return icons[type] || 'notifications';
};

export const getNotificationColor = (type: NotificationType): string => {
  const colors: Partial<Record<NotificationType, string>> = {
    NEW_FOLLOWER: '#3B82F6', // Blue
    POST_LIKED: '#EF4444', // Red
    POST_COMMENTED: '#10B981', // Green
    MENTION: '#6366F1', // Indigo
    POST_LIKE: '#EF4444', // Red
    POST_COMMENT: '#10B981', // Green
    POST_MENTION: '#6366F1', // Indigo
    PROFILE_LIKE: '#EF4444', // Red
    NEW_MESSAGE: '#6366F1', // Indigo
    MESSAGE_RECEIVED: '#6366F1', // Indigo
    NEW_MATCH: '#8B5CF6', // Purple
    MATCH_ACCEPTED: '#8B5CF6', // Purple
    MATCH_SUGGESTION: '#8B5CF6', // Purple
    VERIFICATION_APPROVED: '#10B981', // Green
    VERIFICATION_REJECTED: '#EF4444', // Red
    VERIFICATION_PENDING_REVIEW: '#F59E0B', // Amber
    VERIFICATION_STATUS: '#10B981', // Green
    VERIFICATION_REQUIRED: '#F59E0B', // Amber
    POST_FLAGGED: '#F59E0B', // Amber
    CONTENT_REMOVED: '#EF4444', // Red
    WARNING_ISSUED: '#F59E0B', // Amber
    POST_REMOVED: '#EF4444', // Red
    ACCOUNT_WARNING: '#F59E0B', // Amber
    MODERATION_ALERT: '#F59E0B', // Amber
    PROFILE_VIEW: '#3B82F6', // Blue
    WELCOME: '#8B5CF6', // Purple
    PASSWORD_RESET: '#6366F1', // Indigo
    ACCOUNT_SUSPENDED: '#EF4444', // Red
    ACCOUNT_REACTIVATED: '#10B981', // Green
    SYSTEM: '#6B7280', // Gray
    SYSTEM_ANNOUNCEMENT: '#6B7280', // Gray
    FEATURE_ANNOUNCEMENT: '#8B5CF6', // Purple
  };
  return colors[type] || '#6B7280';
};

/**
 * Bildirim kategorisi al
 */
export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  const categories: Partial<Record<NotificationType, NotificationCategory>> = {
    NEW_FOLLOWER: 'SOCIAL',
    POST_LIKED: 'SOCIAL',
    POST_COMMENTED: 'SOCIAL',
    MENTION: 'SOCIAL',
    POST_LIKE: 'SOCIAL',
    POST_COMMENT: 'SOCIAL',
    POST_MENTION: 'SOCIAL',
    PROFILE_LIKE: 'SOCIAL',
    PROFILE_VIEW: 'SOCIAL',
    NEW_MESSAGE: 'MESSAGING',
    MESSAGE_RECEIVED: 'MESSAGING',
    NEW_MATCH: 'SOCIAL',
    MATCH_ACCEPTED: 'SOCIAL',
    MATCH_SUGGESTION: 'SOCIAL',
    VERIFICATION_APPROVED: 'VERIFICATION',
    VERIFICATION_REJECTED: 'VERIFICATION',
    VERIFICATION_PENDING_REVIEW: 'VERIFICATION',
    VERIFICATION_STATUS: 'VERIFICATION',
    VERIFICATION_REQUIRED: 'VERIFICATION',
    POST_FLAGGED: 'MODERATION',
    CONTENT_REMOVED: 'MODERATION',
    WARNING_ISSUED: 'MODERATION',
    POST_REMOVED: 'MODERATION',
    ACCOUNT_WARNING: 'MODERATION',
    MODERATION_ALERT: 'MODERATION',
    WELCOME: 'SYSTEM',
    PASSWORD_RESET: 'SYSTEM',
    ACCOUNT_SUSPENDED: 'SYSTEM',
    ACCOUNT_REACTIVATED: 'SYSTEM',
    SYSTEM: 'SYSTEM',
    SYSTEM_ANNOUNCEMENT: 'SYSTEM',
    FEATURE_ANNOUNCEMENT: 'SYSTEM',
  };
  return categories[type] || 'SYSTEM';
};
