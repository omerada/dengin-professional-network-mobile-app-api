// src/core/socket/stompClient.ts
// STOMP over WebSocket Client
// Oku: mobile-development-guide/core/13-REAL-TIME.md
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { Platform } from 'react-native';
import SockJS from 'sockjs-client';

// Dynamic import for web compatibility
let Client: any;
let IMessage: any;
let StompSubscription: any;

if (Platform.OS !== 'web') {
  const stomp = require('@stomp/stompjs');
  Client = stomp.Client;
  IMessage = stomp.IMessage;
  StompSubscription = stomp.StompSubscription;
} else {
  // For web, use UMD bundle
  const stomp = require('@stomp/stompjs/bundles/stomp.umd.js');
  Client = stomp.Client;
  IMessage = stomp.IMessage;
  StompSubscription = stomp.StompSubscription;
}
import { ENV } from '@config/env';
import { tokenService } from '@features/auth/services';
import { messageQueue } from './messageQueue';
import {
  SocketStatus,
  type SocketConfig,
  type SocketEventType,
  type SocketEventHandler,
  type WsSendMessageRequest,
  type WsMessageResponse,
  type WsTypingNotification,
  type WsReadReceipt,
  type WsErrorResponse,
  type WsNotification,
  type WsPresenceUpdate,
} from './types';

// STOMP Destinations
const DESTINATIONS = {
  // Publishing destinations
  SEND_MESSAGE: '/app/chat.send',
  TYPING: '/app/chat.typing',
  MARK_READ: '/app/chat.read',
  // Subscription destinations
  MESSAGES: '/user/queue/messages',
  TYPING_NOTIFICATIONS: '/user/queue/typing',
  READ_RECEIPTS: '/user/queue/read',
  ERRORS: '/user/queue/errors',
  NOTIFICATIONS: '/user/queue/notifications',
  PRESENCE: '/user/queue/presence',
} as const;

/**
 * STOMP Client Singleton
 * Manages WebSocket connection using STOMP protocol over SockJS
 */
class StompClient {
  private client: Client | null = null;
  private status: SocketStatus = SocketStatus.DISCONNECTED;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private reconnectAttempts = 0;

  // ========== Connection Management ==========

  /**
   * Connect to WebSocket server
   */
  async connect(config?: Partial<SocketConfig>): Promise<void> {
    if (this.client?.connected) {
      console.log('[STOMP] Already connected');
      return;
    }

    this.status = SocketStatus.CONNECTING;
    const token = await tokenService.getAccessToken();

    if (!token) {
      console.error('[STOMP] No access token available');
      this.status = SocketStatus.ERROR;
      return;
    }

    const wsUrl = config?.url || ENV.WS_URL || `${ENV.API_BASE_URL}/ws`;

    this.client = new Client({
      // Use SockJS for browser/React Native compatibility
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,

      // Authentication header
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Heartbeat settings (match backend: 10 seconds)
      heartbeatIncoming: config?.heartbeatIncoming ?? 10000,
      heartbeatOutgoing: config?.heartbeatOutgoing ?? 10000,

      // Reconnection settings
      reconnectDelay: config?.reconnectDelay ?? 5000,

      // Debug logging (only in development)
      debug:
        config?.debug !== false && __DEV__
          ? (str: string) => console.log('[STOMP]', str)
          : () => {},

      // Connection lifecycle callbacks
      onConnect: this.handleConnect.bind(this),
      onDisconnect: this.handleDisconnect.bind(this),
      onStompError: this.handleStompError.bind(this),
      onWebSocketClose: this.handleWebSocketClose.bind(this),
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.client) {
      // Unsubscribe all
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.status = SocketStatus.DISCONNECTED;

      this.emit('disconnect', { reason: 'manual' });
    }
  }

  // ========== Connection Handlers ==========

  private handleConnect(): void {
    console.log('[STOMP] Connected');
    this.status = SocketStatus.CONNECTED;
    this.reconnectAttempts = 0;

    // Subscribe to user queues
    this.subscribeToUserQueues();

    // Process any queued messages
    this.processQueuedMessages();

    this.emit('connect', { status: 'connected' });
  }

  private handleDisconnect(): void {
    console.log('[STOMP] Disconnected');
    this.status = SocketStatus.DISCONNECTED;
    this.emit('disconnect', { reason: 'server' });
  }

  private handleStompError(frame: { headers: Record<string, string>; body: string }): void {
    console.error('[STOMP] Error:', frame.headers['message']);
    console.error('[STOMP] Details:', frame.body);
    this.status = SocketStatus.ERROR;
  }

  private handleWebSocketClose(): void {
    console.log('[STOMP] WebSocket closed');
    if (this.status !== SocketStatus.DISCONNECTED) {
      this.status = SocketStatus.RECONNECTING;
      this.reconnectAttempts++;
    }
  }

  // ========== Subscriptions ==========

  private subscribeToUserQueues(): void {
    // Messages queue
    this.subscribe(DESTINATIONS.MESSAGES, (message: IMessage) => {
      const data: WsMessageResponse = JSON.parse(message.body);
      this.emit('message', data);
    });

    // Typing notifications
    this.subscribe(DESTINATIONS.TYPING_NOTIFICATIONS, (message: IMessage) => {
      const data: WsTypingNotification = JSON.parse(message.body);
      this.emit('typing', data);
    });

    // Read receipts
    this.subscribe(DESTINATIONS.READ_RECEIPTS, (message: IMessage) => {
      const data: WsReadReceipt = JSON.parse(message.body);
      this.emit('read', data);
    });

    // Errors
    this.subscribe(DESTINATIONS.ERRORS, (message: IMessage) => {
      const data: WsErrorResponse = JSON.parse(message.body);
      this.emit('error', data);
    });

    // Notifications
    this.subscribe(DESTINATIONS.NOTIFICATIONS, (message: IMessage) => {
      const data: WsNotification = JSON.parse(message.body);
      this.emit('notification', data);
    });

    // Presence updates
    this.subscribe(DESTINATIONS.PRESENCE, (message: IMessage) => {
      const data: WsPresenceUpdate = JSON.parse(message.body);
      this.emit('presence', data);
    });
  }

  private subscribe(destination: string, callback: (message: IMessage) => void): void {
    if (!this.client?.connected) {
      console.warn('[STOMP] Cannot subscribe, not connected');
      return;
    }

    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.set(destination, subscription);
  }

  // ========== Publishing Methods ==========

  /**
   * Send a chat message
   * @returns true if sent via WebSocket, false if queued
   */
  sendMessage(
    request: WsSendMessageRequest & { conversationId: string; clientMessageId: string },
  ): boolean {
    if (this.client?.connected) {
      this.publish(DESTINATIONS.SEND_MESSAGE, request);
      return true;
    } else {
      // Queue message for later when offline
      messageQueue.add({
        id: request.clientMessageId,
        destination: DESTINATIONS.SEND_MESSAGE,
        body: request,
        timestamp: Date.now(),
      });
      return false;
    }
  }

  /**
   * Send typing indicator
   * @param conversationId - Conversation UUID
   * @param recipientId - Recipient user UUID (string, not number)
   * @param isTyping - Whether user is currently typing
   */
  sendTyping(conversationId: string, recipientId: string, isTyping: boolean): void {
    this.publish(DESTINATIONS.TYPING, { conversationId, recipientId, isTyping });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, messageIds: string[]): void {
    this.publish(DESTINATIONS.MARK_READ, { conversationId, messageIds });
  }

  /**
   * Generic publish method
   */
  private publish(destination: string, body: unknown): void {
    if (this.client?.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      // Queue message for later when offline
      messageQueue.add({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        destination,
        body,
        timestamp: Date.now(),
      });
    }
  }

  // ========== Message Queue Processing ==========

  private async processQueuedMessages(): Promise<void> {
    if (!this.client?.connected) return;

    const messages = messageQueue.getAll();
    for (const msg of messages) {
      try {
        this.client.publish({
          destination: msg.destination,
          body: JSON.stringify(msg.body),
        });
        await messageQueue.remove(msg.id);
      } catch (error) {
        console.error('[STOMP] Failed to send queued message:', error);
        await messageQueue.incrementRetry(msg.id);
      }
    }
  }

  // ========== Event Handling ==========

  /**
   * Subscribe to socket events
   * @returns Unsubscribe function
   */
  on<T = unknown>(event: SocketEventType, handler: SocketEventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as SocketEventHandler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler as SocketEventHandler);
    };
  }

  /**
   * Unsubscribe from socket events
   */
  off<T = unknown>(event: SocketEventType, handler: SocketEventHandler<T>): void {
    this.eventHandlers.get(event)?.delete(handler as SocketEventHandler);
  }

  /**
   * Emit event to handlers
   */
  private emit(event: SocketEventType, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[STOMP] Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // ========== Status Methods ==========

  /**
   * Get current connection status
   */
  getStatus(): SocketStatus {
    return this.status;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * Get reconnection attempts count
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

// Export singleton instance
export const stompClient = new StompClient();
export default stompClient;
