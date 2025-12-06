// src/features/messaging/services/stompClient.ts
// STOMP over SockJS WebSocket client servisi
// Backend: Spring WebSocket + STOMP protokolü
// Oku: backend-development-guide/infrastructure/18-WEBSOCKET-SETUP.md

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { ENV } from '@config/env';
import { tokenService } from '@features/auth/services';
import { useMessagingStore } from '../stores';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import type {
  StompConnectionState,
  WsMessageResponse,
  WsTypingNotification,
  WsReadReceipt,
  WsSendMessageRequest,
} from '../types';

/**
 * STOMP event handler tipi
 */
type StompEventHandler<T = unknown> = (data: T) => void;

/**
 * Subscription bilgisi - StompSubscription from @stomp/stompjs
 */
interface SubscriptionInfo {
  destination: string;
  subscription: StompSubscription | null;
  handler: (message: IMessage) => void;
}

/**
 * STOMP Client Class
 * Spring WebSocket + STOMP protokolüne uyumlu
 */
class StompClient {
  private client: InstanceType<typeof Client> | null = null;
  private connectionState: StompConnectionState = 'DISCONNECTED';
  private subscriptions: Map<string, SubscriptionInfo> = new Map();
  private eventHandlers: Map<string, Set<StompEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private messageQueue: Array<{ destination: string; body: unknown }> = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * STOMP bağlantısını başlat
   */
  async connect(): Promise<void> {
    if (this.client?.connected) {
      return;
    }

    this.setConnectionState('CONNECTING');

    try {
      // Ensure we have a valid token before connecting
      const token = await tokenService.ensureValidToken();

      const wsUrl = `${ENV.API_BASE_URL}/ws`;

      this.client = new Client({
        // SockJS kullanarak WebSocket bağlantısı
        webSocketFactory: () => new SockJS(wsUrl),

        // Bağlantı header'ları - JWT token
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },

        // Debug logging - production'da tamamen kapalı
        debug: __DEV__
          ? (str: string) => {
              // Sadece kritik olayları logla
              if (str.includes('ERROR') || str.includes('CONNECT') || str.includes('DISCONNECT')) {
                console.log('[STOMP]', str);
              }
            }
          : () => {},

        // Heartbeat ayarları
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        // Reconnect ayarları
        reconnectDelay: 5000,

        // Bağlantı kurulduğunda
        onConnect: () => {
          this.setConnectionState('CONNECTED');
          this.reconnectAttempts = 0;
          this.setupSubscriptions();
          this.processMessageQueue();
          this.notifyHandlers('connect', {});
        },

        // Bağlantı kesildiğinde
        onDisconnect: () => {
          this.setConnectionState('DISCONNECTED');
          this.notifyHandlers('disconnect', {});
        },

        // STOMP hatası
        onStompError: (frame: { headers: Record<string, string>; body: string }) => {
          console.error('[STOMP] Error:', frame.headers.message);
          this.setConnectionState('ERROR');
          this.notifyHandlers('error', { message: frame.headers.message });
        },

        // WebSocket kapatıldığında
        onWebSocketClose: () => {
          if (this.connectionState === 'CONNECTED') {
            this.setConnectionState('RECONNECTING');
            this.reconnectAttempts++;

            if (this.reconnectAttempts <= this.maxReconnectAttempts) {
              this.notifyHandlers('reconnecting', { attempt: this.reconnectAttempts });
            } else {
              this.setConnectionState('ERROR');
              this.notifyHandlers('reconnect_failed', {});
            }
          }
        },
      });

      // Bağlantıyı başlat
      this.client.activate();
    } catch (error) {
      this.setConnectionState('ERROR');
      throw error;
    }
  }

  /**
   * Bağlantı durumunu ayarla ve store'u güncelle
   */
  private setConnectionState(state: StompConnectionState): void {
    this.connectionState = state;
    const { setConnectionState } = useMessagingStore.getState();
    setConnectionState(state);
  }

  /**
   * Default subscription'ları kur
   */
  private setupSubscriptions(): void {
    // Yeni mesaj subscription
    this.subscribe('/user/queue/messages', (message: IMessage) => {
      const data: WsMessageResponse = JSON.parse(message.body);
      this.notifyHandlers('message:new', data);
    });

    // Yazıyor bildirimi subscription
    this.subscribe('/user/queue/typing', (message: IMessage) => {
      const data: WsTypingNotification = JSON.parse(message.body);
      const { addTypingUser, removeTypingUser } = useMessagingStore.getState();

      if (data.isTyping) {
        // senderId'yi bulmak için conversationId kullanıyoruz
        // Typing notification gönderen kişi recipientId değil, karşı taraf
        addTypingUser(data.conversationId, data.recipientId);
      } else {
        removeTypingUser(data.conversationId, data.recipientId);
      }

      this.notifyHandlers('typing', data);
    });

    // Okundu bildirimi subscription
    this.subscribe('/user/queue/read', (message: IMessage) => {
      const data: WsReadReceipt = JSON.parse(message.body);
      this.notifyHandlers('read', data);
    });
  }

  /**
   * Bir destination'a subscribe ol
   */
  subscribe(destination: string, handler: (message: IMessage) => void): void {
    if (!this.client?.connected) {
      // Bağlantı yoksa bekleyen subscriptions'a ekle
      this.subscriptions.set(destination, {
        destination,
        subscription: null,
        handler,
      });
      return;
    }

    const subscription = this.client.subscribe(destination, handler);
    this.subscriptions.set(destination, {
      destination,
      subscription,
      handler,
    });
  }

  /**
   * Subscription'ı iptal et
   */
  unsubscribe(destination: string): void {
    const info = this.subscriptions.get(destination);
    if (info?.subscription) {
      info.subscription.unsubscribe();
    }
    this.subscriptions.delete(destination);
  }

  /**
   * Event handler'ları bilgilendir
   */
  private notifyHandlers(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Mesaj kuyruğunu işle
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const { destination, body } = this.messageQueue.shift()!;
      this.send(destination, body);
    }
  }

  /**
   * STOMP destination'a mesaj gönder
   */
  send(destination: string, body: unknown): void {
    if (this.client?.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      // Bağlantı yoksa kuyruğa ekle
      this.messageQueue.push({ destination, body });
    }
  }

  /**
   * Event dinle
   */
  on<T = unknown>(event: string, handler: StompEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as StompEventHandler);
  }

  /**
   * Event dinlemeyi bırak
   */
  off<T = unknown>(event: string, handler: StompEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as StompEventHandler);
    }
  }

  /**
   * Bağlantıyı kes
   */
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Tüm subscription'ları iptal et
    this.subscriptions.forEach(info => {
      if (info.subscription) {
        info.subscription.unsubscribe();
      }
    });
    this.subscriptions.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.setConnectionState('DISCONNECTED');
    this.eventHandlers.clear();
    this.messageQueue = [];
  }

  /**
   * Bağlantı durumunu al
   */
  getConnectionState(): StompConnectionState {
    return this.connectionState;
  }

  /**
   * Bağlı mı kontrol et
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  // =========================================================================
  // MESSAGING HELPERS - Backend STOMP destinations ile uyumlu
  // =========================================================================

  /**
   * Mesaj gönder
   * Destination: /app/chat.send
   */
  sendMessage(request: WsSendMessageRequest): void {
    this.send('/app/chat.send', request);
  }

  /**
   * Yazıyor bildirimi gönder
   * Destination: /app/chat.typing
   */
  sendTyping(conversationId: string, recipientId: number, isTyping: boolean): void {
    const notification: WsTypingNotification = {
      conversationId,
      recipientId,
      isTyping,
    };
    this.send('/app/chat.typing', notification);
  }

  /**
   * Okundu bildirimi gönder
   * Destination: /app/chat.read
   */
  sendReadReceipt(conversationId: string, lastReadMessageId: string): void {
    const receipt: Partial<WsReadReceipt> = {
      conversationId,
      lastReadMessageId,
    };
    this.send('/app/chat.read', receipt);
  }

  /**
   * Yazıyor eventini başlat
   */
  startTyping(conversationId: string, recipientId: number): void {
    this.sendTyping(conversationId, recipientId, true);
  }

  /**
   * Yazıyor eventini durdur
   */
  stopTyping(conversationId: string, recipientId: number): void {
    this.sendTyping(conversationId, recipientId, false);
  }
}

// Singleton instance
export const stompClient = new StompClient();

// Legacy alias for backward compatibility
export const socketClient = stompClient;

export default stompClient;
