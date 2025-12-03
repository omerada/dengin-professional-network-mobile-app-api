// src/features/messaging/services/socketClient.ts
// Socket.IO client servisi
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { io, Socket } from 'socket.io-client';
import { ENV } from '@core/config/env';
import { tokenService } from '@features/auth/services';
import { useMessagingStore } from '../stores';
import type {
  Message,
  TypingEvent,
  PresenceEvent,
  MessageStatusEvent,
  SocketEvent,
} from '../types';

/**
 * Socket bağlantı durumu
 */
export type SocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

/**
 * Socket event handler tipi
 */
type SocketEventHandler<T = unknown> = (data: T) => void;

/**
 * Socket Client Class
 */
class SocketClient {
  private socket: Socket | null = null;
  private connectionState: SocketConnectionState = 'disconnected';
  private eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: Array<{ event: string; data: unknown }> = [];

  /**
   * Socket'e bağlan
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    this.connectionState = 'connecting';

    try {
      const token = await tokenService.getAccessToken();

      if (!token) {
        throw new Error('No access token available');
      }

      this.socket = io(ENV.WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        forceNew: true,
      });

      this.setupEventListeners();
    } catch (error) {
      this.connectionState = 'disconnected';
      throw error;
    }
  }

  /**
   * Socket event listener'ları kur
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.processMessageQueue();
      this.notifyHandlers('connect', {});
    });

    this.socket.on('disconnect', (reason: string) => {
      this.connectionState = 'disconnected';
      this.notifyHandlers('disconnect', { reason });
    });

    this.socket.on('connect_error', (error: Error) => {
      this.connectionState = 'disconnected';
      this.notifyHandlers('connect_error', { error: error.message });
    });

    this.socket.on('reconnect_attempt', (attempt: number) => {
      this.connectionState = 'reconnecting';
      this.reconnectAttempts = attempt;
      this.notifyHandlers('reconnect_attempt', { attempt });
    });

    this.socket.on('reconnect', () => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.processMessageQueue();
      this.notifyHandlers('reconnect', {});
    });

    this.socket.on('reconnect_failed', () => {
      this.connectionState = 'disconnected';
      this.notifyHandlers('reconnect_failed', {});
    });

    // Business events
    this.socket.on('message:new', (data: Message) => {
      this.notifyHandlers('message:new', data);
    });

    this.socket.on('message:status', (data: MessageStatusEvent) => {
      this.notifyHandlers('message:status', data);
    });

    this.socket.on('message:deleted', (data: { messageId: string }) => {
      this.notifyHandlers('message:deleted', data);
    });

    this.socket.on('typing:start', (data: TypingEvent) => {
      const { addTypingUser } = useMessagingStore.getState();
      addTypingUser(data.conversationId, data.userId);
      this.notifyHandlers('typing:start', data);
    });

    this.socket.on('typing:stop', (data: TypingEvent) => {
      const { removeTypingUser } = useMessagingStore.getState();
      removeTypingUser(data.conversationId, data.userId);
      this.notifyHandlers('typing:stop', data);
    });

    this.socket.on('presence:update', (data: PresenceEvent) => {
      const { setUserOnline } = useMessagingStore.getState();
      setUserOnline(data.userId, data.isOnline);
      this.notifyHandlers('presence:update', data);
    });

    this.socket.on('conversation:update', (data: unknown) => {
      this.notifyHandlers('conversation:update', data);
    });
  }

  /**
   * Event handler'ları bilgilendir
   */
  private notifyHandlers(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Mesaj kuyruğunu işle
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift()!;
      this.emit(event, data);
    }
  }

  /**
   * Event emit et
   */
  emit(event: string, data: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      // Bağlantı yoksa kuyruğa ekle
      this.messageQueue.push({ event, data });
    }
  }

  /**
   * Event dinle
   */
  on<T = unknown>(event: SocketEvent | string, handler: SocketEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as SocketEventHandler);
  }

  /**
   * Event dinlemeyi bırak
   */
  off<T = unknown>(event: SocketEvent | string, handler: SocketEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as SocketEventHandler);
    }
  }

  /**
   * Bağlantıyı kes
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = 'disconnected';
    this.eventHandlers.clear();
    this.messageQueue = [];
  }

  /**
   * Bağlantı durumunu al
   */
  getConnectionState(): SocketConnectionState {
    return this.connectionState;
  }

  /**
   * Bağlı mı kontrol et
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Socket ID'yi al
   */
  getSocketId(): string | null {
    return this.socket?.id ?? null;
  }

  /**
   * Konuşmaya katıl (room join)
   */
  joinConversation(conversationId: string): void {
    this.emit('conversation:join', { conversationId });
  }

  /**
   * Konuşmadan ayrıl (room leave)
   */
  leaveConversation(conversationId: string): void {
    this.emit('conversation:leave', { conversationId });
  }

  /**
   * Yazıyor eventini gönder
   */
  sendTypingStart(conversationId: string): void {
    this.emit('typing:start', { conversationId });
  }

  /**
   * Yazmayı bıraktı eventini gönder
   */
  sendTypingStop(conversationId: string): void {
    this.emit('typing:stop', { conversationId });
  }

  /**
   * Mesaj okundu olarak işaretle
   */
  markAsRead(conversationId: string, messageId: string): void {
    this.emit('message:read', { conversationId, messageId });
  }
}

export const socketClient = new SocketClient();
export default socketClient;
