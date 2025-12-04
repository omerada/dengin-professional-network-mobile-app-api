// src/features/notifications/hooks/index.ts
// Notification hooks barrel export
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

export { useNotifications } from './useNotifications';
export { useUnreadCount } from './useUnreadCount';
export {
  useMarkAsRead,
  useMarkMultipleAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
  useNotificationHandler,
} from './useNotificationActions';
export { useNotificationSettings } from './useNotificationSettings';
export { useNotificationPermission } from './useNotificationPermission';
