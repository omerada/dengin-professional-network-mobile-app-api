// src/features/notifications/services/index.ts
// Notification services barrel export
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

// Legacy stub services (for backward compatibility)
export { fcmService } from './fcmService';
export { notifeeService, EventType } from './notifeeService';
export { notificationService } from './notificationService';

// Production services
export { expoNotificationService } from './expoNotificationService';
export { notificationHandler } from './notificationHandler.production';
export { pushNotificationHandler } from './pushNotificationHandler';
