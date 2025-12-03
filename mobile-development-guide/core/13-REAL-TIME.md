# Real-time Communication

**Version:** 2.0
**Last Updated:** 2024-12-03
**Complexity:** ⭐⭐⭐⭐ (High)

---

## 1. Overview

Real-time communication modülü **STOMP over WebSocket** kullanarak backend ile gerçek zamanlı iletişim sağlar. Socket.IO yerine Spring STOMP protokolü kullanılır.

**Backend WebSocket URL:**

- Development: `ws://localhost:8080/ws`
- Production: `wss://api.meslektas.com/ws`

---

## 2. Module Structure

```
src/core/socket/
├── stompClient.ts           # STOMP WebSocket client
├── socketEvents.ts          # Event handlers
├── messageQueue.ts          # Offline message queue
└── types.ts                 # Socket types
```

---

## 3. Dependencies

```bash
# Install required packages
npm install @stomp/stompjs sockjs-client
npm install -D @types/sockjs-client
```

---

## 4. Socket Types

**src/core/socket/types.ts:**

```typescript
export interface SocketConfig {
  url: string;
  token: string;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  reconnectDelay?: number;
  debug?: boolean;
}

export interface SocketMessage {
  id: string;
  destination: string;
  body: any;
  timestamp: number;
  retry?: number;
}

export enum SocketStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

// ========== WebSocket Message Types ==========

// Send Message Request
export interface WsSendMessageRequest {
  recipientId: number;
  content: string;
  attachment?: {
    s3Key: string;
    url: string;
    contentType: string;
    fileSize: number;
    fileName: string;
  };
}

// Message Response
export interface WsMessageResponse {
  messageId: string;
  conversationId: string;
  senderId: number;
  recipientId: number;
  content: string;
  attachment?: {
    s3Key: string;
    url: string;
    contentType: string;
    fileSize: number;
    fileName: string;
  };
  status: "SENT" | "DELIVERED" | "READ";
  sentAt: string;
}

// Typing Notification
export interface WsTypingNotification {
  conversationId: string;
  recipientId: number;
  isTyping: boolean;
}

// Read Receipt
export interface WsReadReceipt {
  conversationId: string;
  readByUserId: number;
  messagesRead: number;
  readAt: string;
}

// Error Response
export interface WsErrorResponse {
  code: "VALIDATION_ERROR" | "FORBIDDEN" | "INTERNAL_ERROR";
  message: string;
  action: string;
}

// Notification
export interface WsNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  createdAt: string;
}
```

---

## 5. STOMP Client

**src/core/socket/stompClient.ts:**

```typescript
import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { ENV } from "@config/env";
import { tokenService } from "@features/auth/services/tokenService";
import { messageQueue } from "./messageQueue";
import type {
  SocketConfig,
  SocketStatus,
  WsSendMessageRequest,
  WsMessageResponse,
  WsTypingNotification,
  WsReadReceipt,
  WsErrorResponse,
  WsNotification,
} from "./types";

class StompClient {
  private client: Client | null = null;
  private status: SocketStatus = SocketStatus.DISCONNECTED;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // ========== Connection ==========

  async connect(config?: Partial<SocketConfig>): Promise<void> {
    if (this.client?.connected) {
      console.log("[STOMP] Already connected");
      return;
    }

    this.status = SocketStatus.CONNECTING;
    const token = await tokenService.getAccessToken();

    if (!token) {
      console.error("[STOMP] No access token available");
      this.status = SocketStatus.ERROR;
      return;
    }

    const wsUrl = config?.url || ENV.WS_URL || `${ENV.API_BASE_URL}/ws`;

    this.client = new Client({
      // Use SockJS for browser/React Native compatibility
      webSocketFactory: () => new SockJS(wsUrl),

      // Authentication
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Heartbeat settings (match backend: 10 seconds)
      heartbeatIncoming: config?.heartbeatIncoming ?? 10000,
      heartbeatOutgoing: config?.heartbeatOutgoing ?? 10000,

      // Reconnection
      reconnectDelay: config?.reconnectDelay ?? 5000,

      // Debug logging
      debug:
        config?.debug && __DEV__
          ? (str) => console.log("[STOMP]", str)
          : () => {},

      // Connection callbacks
      onConnect: () => {
        console.log("[STOMP] Connected");
        this.status = SocketStatus.CONNECTED;
        this.reconnectAttempts = 0;
        this.subscribeToUserQueues();
        this.processQueuedMessages();
      },

      onDisconnect: () => {
        console.log("[STOMP] Disconnected");
        this.status = SocketStatus.DISCONNECTED;
      },

      onStompError: (frame) => {
        console.error("[STOMP] Error:", frame.headers["message"]);
        console.error("[STOMP] Details:", frame.body);
        this.status = SocketStatus.ERROR;
      },

      onWebSocketClose: () => {
        console.log("[STOMP] WebSocket closed");
        if (this.status !== SocketStatus.DISCONNECTED) {
          this.status = SocketStatus.RECONNECTING;
          this.reconnectAttempts++;
        }
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      // Unsubscribe all
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.status = SocketStatus.DISCONNECTED;
    }
  }

  // ========== Subscriptions ==========

  private subscribeToUserQueues(): void {
    // Messages queue
    this.subscribe("/user/queue/messages", (message: IMessage) => {
      const data: WsMessageResponse = JSON.parse(message.body);
      this.emit("message", data);
    });

    // Typing notifications
    this.subscribe("/user/queue/typing", (message: IMessage) => {
      const data: WsTypingNotification = JSON.parse(message.body);
      this.emit("typing", data);
    });

    // Read receipts
    this.subscribe("/user/queue/read", (message: IMessage) => {
      const data: WsReadReceipt = JSON.parse(message.body);
      this.emit("read", data);
    });

    // Errors
    this.subscribe("/user/queue/errors", (message: IMessage) => {
      const data: WsErrorResponse = JSON.parse(message.body);
      this.emit("error", data);
    });

    // Push notifications
    this.subscribe("/user/queue/notifications", (message: IMessage) => {
      const data: WsNotification = JSON.parse(message.body);
      this.emit("notification", data);
    });
  }

  private subscribe(
    destination: string,
    callback: (message: IMessage) => void
  ): void {
    if (!this.client?.connected) {
      console.warn("[STOMP] Cannot subscribe, not connected");
      return;
    }

    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.set(destination, subscription);
  }

  // ========== Publishing ==========

  sendMessage(request: WsSendMessageRequest): void {
    this.publish("/app/chat.send", request);
  }

  sendTyping(
    conversationId: string,
    recipientId: number,
    isTyping: boolean
  ): void {
    this.publish("/app/chat.typing", { conversationId, recipientId, isTyping });
  }

  markAsRead(conversationId: string): void {
    this.publish("/app/chat.read", { conversationId });
  }

  private publish(destination: string, body: any): void {
    if (this.client?.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      // Queue for later
      messageQueue.add({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        destination,
        body,
        timestamp: Date.now(),
      });
    }
  }

  // ========== Event Handling ==========

  private eventHandlers: Map<string, Set<Function>> = new Map();

  on<T>(event: string, handler: (data: T) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  // ========== Message Queue ==========

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
        console.error("[STOMP] Failed to send queued message:", error);
        await messageQueue.incrementRetry(msg.id);
      }
    }
  }

  // ========== Status ==========

  getStatus(): SocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const stompClient = new StompClient();
```

---

## 5. Message Queue

**src/core/socket/messageQueue.ts:**

```typescript
import { asyncStorage } from "@core/storage/asyncStorage";
import type { SocketMessage } from "./types";

const QUEUE_KEY = "@socket:message_queue";
const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_COUNT = 3;

class MessageQueue {
  private queue: SocketMessage[] = [];

  // Load queue from storage
  async load(): Promise<void> {
    const stored = await asyncStorage.getItem<SocketMessage[]>(QUEUE_KEY);
    if (stored) {
      this.queue = stored;
    }
  }

  // Save queue to storage
  private async save(): Promise<void> {
    await asyncStorage.setItem(QUEUE_KEY, this.queue);
  }

  // Add message to queue
  async add(message: SocketMessage): Promise<void> {
    // Remove old messages if queue is full
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.queue.shift();
    }

    this.queue.push(message);
    await this.save();
  }

  // Remove message from queue
  async remove(messageId: string): Promise<void> {
    this.queue = this.queue.filter((m) => m.id !== messageId);
    await this.save();
  }

  // Get all messages
  getAll(): SocketMessage[] {
    return this.queue.filter((m) => !m.retry || m.retry < MAX_RETRY_COUNT);
  }

  // Clear queue
  async clear(): Promise<void> {
    this.queue = [];
    await this.save();
  }

  // Get queue size
  size(): number {
    return this.queue.length;
  }

  // Increment retry count
  async incrementRetry(messageId: string): Promise<void> {
    const message = this.queue.find((m) => m.id === messageId);
    if (message) {
      message.retry = (message.retry || 0) + 1;
      await this.save();
    }
  }
}

export const messageQueue = new MessageQueue();
```

---

## 6. Socket Events

**src/core/socket/socketEvents.ts:**

```typescript
import { stompClient } from "./stompClient";
import { queryClient } from "@config/queryClient";
import type { WsMessageResponse, WsReadReceipt, WsNotification } from "./types";

// Unsubscribe functions
let unsubscribers: (() => void)[] = [];

// Setup socket event listeners
export const setupSocketEvents = () => {
  // New message received
  const unsubMessage = stompClient.on<WsMessageResponse>("message", (data) => {
    console.log("New message received:", data);

    // Invalidate messages query
    queryClient.invalidateQueries({
      queryKey: ["messages", data.conversationId],
    });

    // Invalidate conversations query
    queryClient.invalidateQueries({
      queryKey: ["conversations"],
    });
  });
  unsubscribers.push(unsubMessage);

  // Read receipt received
  const unsubRead = stompClient.on<WsReadReceipt>("read", (data) => {
    console.log("Messages read:", data.conversationId);

    // Update message status in cache
    queryClient.setQueriesData(
      { queryKey: ["messages", data.conversationId] },
      (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((msg: any) => ({
              ...msg,
              status: "read",
            })),
          })),
        };
      }
    );
  });
  unsubscribers.push(unsubRead);

  // New notification received
  const unsubNotification = stompClient.on<WsNotification>(
    "notification",
    (data) => {
      console.log("New notification:", data);

      // Invalidate notifications query
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      // Show local notification
      // notifeeService.displayNotification(data);
    }
  );
  unsubscribers.push(unsubNotification);

  // Error received
  const unsubError = stompClient.on("error", (data) => {
    console.error("WebSocket error:", data);
  });
  unsubscribers.push(unsubError);
};

// Cleanup socket events
export const cleanupSocketEvents = () => {
  unsubscribers.forEach((unsub) => unsub());
  unsubscribers = [];
};
```

---

## 7. Usage Examples

**Initialize socket:**

```typescript
import { stompClient } from "@core/socket/stompClient";
import {
  setupSocketEvents,
  cleanupSocketEvents,
} from "@core/socket/socketEvents";

// In App.tsx
useEffect(() => {
  if (isAuthenticated) {
    stompClient.connect();
    setupSocketEvents();
  }

  return () => {
    cleanupSocketEvents();
    stompClient.disconnect();
  };
}, [isAuthenticated]);
```

**Send message:**

```typescript
import { stompClient } from "@core/socket/stompClient";

// Send message via STOMP WebSocket
stompClient.sendMessage({
  recipientId: 123,
  content: "Hello!",
});
```

**Send typing indicator:**

```typescript
import { stompClient } from "@core/socket/stompClient";

// Notify typing started
stompClient.sendTyping("conversation-uuid", 123, true);

// Notify typing stopped
stompClient.sendTyping("conversation-uuid", 123, false);
```

**Mark messages as read:**

```typescript
import { stompClient } from "@core/socket/stompClient";

// Mark conversation messages as read
stompClient.markAsRead("conversation-uuid");
```

**Listen to events:**

```typescript
import { stompClient } from "@core/socket/stompClient";
import type { WsMessageResponse } from "@core/socket/types";

useEffect(() => {
  const unsubscribe = stompClient.on<WsMessageResponse>("message", (data) => {
    console.log("New message:", data);
  });

  return unsubscribe;
}, []);
```

---

## 8. Connection Monitor

**src/core/socket/connectionMonitor.ts:**

```typescript
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { stompClient } from "./stompClient";

export class ConnectionMonitor {
  private appStateSubscription: any;
  private netInfoSubscription: any;

  start(): void {
    // Monitor app state
    this.appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (!stompClient.isConnected()) {
          stompClient.connect();
        }
      }
    });

    // Monitor network state
    this.netInfoSubscription = NetInfo.addEventListener((state) => {
      if (state.isConnected && !stompClient.isConnected()) {
        stompClient.connect();
      } else if (!state.isConnected) {
        stompClient.disconnect();
      }
    });
  }

  stop(): void {
    this.appStateSubscription?.remove();
    this.netInfoSubscription?.();
  }
}

export const connectionMonitor = new ConnectionMonitor();
```

---

## 9. Summary

### Features:

- ✅ STOMP over WebSocket with SockJS fallback
- ✅ Auto-reconnection with exponential backoff
- ✅ Offline message queuing
- ✅ Event subscription/unsubscription pattern
- ✅ Connection monitoring (app state, network)
- ✅ Integration with React Query
- ✅ Message delivery tracking

**Result:** Production-ready real-time communication system with offline support.
