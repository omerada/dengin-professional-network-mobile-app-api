// src/core/socket/index.ts
// Socket module exports
// Oku: mobile-development-guide/core/13-REAL-TIME.md

export { stompClient } from './stompClient';
export { messageQueue } from './messageQueue';
export { connectionMonitor } from './connectionMonitor';
export { setupSocketEvents, cleanupSocketEvents } from './socketEvents';

export {
  SocketStatus,
  type SocketConfig,
  type SocketMessage,
  type SocketEventType,
  type SocketEventHandler,
  type WsSendMessageRequest,
  type WsMessageResponse,
  type WsTypingNotification,
  type WsReadReceipt,
  type WsErrorResponse,
  type WsNotification,
  type WsPresenceUpdate,
  type WsAttachment,
} from './types';

