// src/features/messaging/services/index.ts
// Messaging services - HTTP API layer
// Socket services are now in @core/socket

export { messagingService } from './messagingService';

// Re-export socket services for backward compatibility
export { stompClient, messageQueue, connectionMonitor } from '@core/socket';

// Legacy exports - DEPRECATED, use @core/socket instead
// export { socketClient } from './socketClient';
// export { messageQueue } from './messageQueue';
