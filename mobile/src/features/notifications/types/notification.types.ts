// src/features/notifications/types/notification.types.ts
// Notification type definitions
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

/**
 * Bildirim türleri
 */
export type NotificationType =
  | 'message'
  | 'post_like'
  | 'post_comment'
  | 'comment_reply'
  | 'follow'
  | 'verification_update'
  | 'system';

/**
 * Bildirim durumu
 */
export type NotificationStatus = 'unread' | 'read';

/**
 * Bildirim veri yapısı
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
}

/**
 * Bildirim içindeki veri
 */
export interface NotificationData {
  type: NotificationType;
  id?: string;
  conversationId?: string;
  postId?: string;
  userId?: string;
  imageUrl?: string;
  [key: string]: string | undefined;
}

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
 * Bildirim ayarları
 */
export interface NotificationSettings {
  messages: boolean;
  postLikes: boolean;
  postComments: boolean;
  commentReplies: boolean;
  follows: boolean;
  verificationUpdates: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;   // HH:mm format
}

/**
 * Varsayılan bildirim ayarları
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  messages: true,
  postLikes: true,
  postComments: true,
  commentReplies: true,
  follows: true,
  verificationUpdates: true,
  systemNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
};

/**
 * Bildirim kanalı (Android)
 */
export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: 'none' | 'min' | 'low' | 'default' | 'high';
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
    id: 'posts',
    name: 'Gönderiler',
    description: 'Beğeni ve yorum bildirimleri',
    importance: 'default',
    sound: 'default',
    vibration: true,
  },
  {
    id: 'social',
    name: 'Sosyal',
    description: 'Takip bildirimleri',
    importance: 'default',
    vibration: false,
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

/**
 * Store state tipi
 */
export interface NotificationStoreState {
  // State
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  fcmToken: string | null;
  isPermissionGranted: boolean;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  setSettings: (settings: Partial<NotificationSettings>) => void;
  setFcmToken: (token: string | null) => void;
  setPermissionGranted: (granted: boolean) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

/**
 * Paginated notifications response
 */
export interface PaginatedNotifications {
  content: Notification[];
  hasNext: boolean;
  nextCursor: string | null;
}
