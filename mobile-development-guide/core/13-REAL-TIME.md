# Real-time Communication

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium-High)

---

## 1. Overview

Real-time communication modülü Socket.IO kullanarak WebSocket bağlantısı, event handling, reconnection logic ve message queuing sağlar.

---

## 2. Module Structure

```
src/core/socket/
├── socketClient.ts          # Socket.IO client
├── socketEvents.ts          # Event handlers
├── messageQueue.ts          # Offline message queue
└── types.ts                 # Socket types
```

---

## 3. Socket Types

**src/core/socket/types.ts:**

```typescript
export interface SocketConfig {
  url: string;
  auth?: {
    token?: string;
  };
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface SocketMessage {
  id: string;
  event: string;
  data: any;
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

export interface SocketEventMap {
  // Connection events
  connect: void;
  disconnect: string;
  connect_error: Error;
  reconnect: number;
  reconnect_attempt: number;
  reconnect_error: Error;
  reconnect_failed: void;

  // Message events
  "message:new": {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
  };
  "message:delivered": {
    messageId: string;
    deliveredAt: string;
  };
  "message:read": {
    messageId: string;
    readAt: string;
  };

  // Typing events
  "typing:start": {
    conversationId: string;
    userId: string;
  };
  "typing:stop": {
    conversationId: string;
    userId: string;
  };

  // Presence events
  "user:online": {
    userId: string;
  };
  "user:offline": {
    userId: string;
  };

  // Notification events
  "notification:new": {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  };
}
```

---

## 4. Socket Client

**src/core/socket/socketClient.ts:**

```typescript
import io, { Socket } from "socket.io-client";
import { ENV } from "@config/env";
import { tokenService } from "@features/auth/services/tokenService";
import { messageQueue } from "./messageQueue";
import type { SocketConfig, SocketStatus, SocketEventMap } from "./types";

class SocketClient {
  private socket: Socket | null = null;
  private status: SocketStatus = SocketStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners = new Map<string, Set<Function>>();

  // Connect to socket server
  async connect(config?: Partial<SocketConfig>): Promise<void> {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.status = SocketStatus.CONNECTING;

    const token = await tokenService.getAccessToken();

    const socketConfig: SocketConfig = {
      url: ENV.WS_URL,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      ...config,
    };

    this.socket = io(socketConfig.url, {
      auth: socketConfig.auth,
      transports: ["websocket"],
      reconnection: socketConfig.reconnection,
      reconnectionAttempts: socketConfig.reconnectionAttempts,
      reconnectionDelay: socketConfig.reconnectionDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventHandlers();
    this.processQueuedMessages();
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.status = SocketStatus.DISCONNECTED;
    }
  }

  // Setup built-in event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.status = SocketStatus.CONNECTED;
      this.reconnectAttempts = 0;
      this.emit("connect");
      this.processQueuedMessages();
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
      this.status = SocketStatus.DISCONNECTED;
      this.emit("disconnect", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      this.status = SocketStatus.ERROR;
      this.emit("connect_error", error);
    });

    this.socket.on("reconnect", (attemptNumber: number) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      this.status = SocketStatus.CONNECTED;
      this.emit("reconnect", attemptNumber);
    });

    this.socket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log("Socket reconnect attempt:", attemptNumber);
      this.status = SocketStatus.RECONNECTING;
      this.reconnectAttempts = attemptNumber;
      this.emit("reconnect_attempt", attemptNumber);
    });

    this.socket.on("reconnect_error", (error: Error) => {
      console.error("Socket reconnect error:", error);
      this.emit("reconnect_error", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnect failed");
      this.status = SocketStatus.ERROR;
      this.emit("reconnect_failed");
    });
  }

  // Emit event to server
  emit<K extends keyof SocketEventMap>(
    event: K,
    data?: SocketEventMap[K]
  ): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      // Queue message for later
      messageQueue.add({
        id: `${Date.now()}-${Math.random()}`,
        event: event as string,
        data,
        timestamp: Date.now(),
      });
    }
  }

  // Listen to events from server
  on<K extends keyof SocketEventMap>(
    event: K,
    handler: (data: SocketEventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }

    const handlers = this.listeners.get(event as string)!;
    handlers.add(handler);

    // Register with socket
    if (this.socket) {
      this.socket.on(event as string, handler);
    }

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (this.socket) {
        this.socket.off(event as string, handler);
      }
    };
  }

  // Remove event listener
  off<K extends keyof SocketEventMap>(event: K, handler?: Function): void {
    if (handler) {
      const handlers = this.listeners.get(event as string);
      if (handlers) {
        handlers.delete(handler);
      }
      if (this.socket) {
        this.socket.off(event as string, handler as any);
      }
    } else {
      // Remove all listeners for event
      this.listeners.delete(event as string);
      if (this.socket) {
        this.socket.off(event as string);
      }
    }
  }

  // Process queued messages
  private async processQueuedMessages(): Promise<void> {
    if (!this.socket?.connected) return;

    const messages = messageQueue.getAll();

    for (const message of messages) {
      try {
        this.socket.emit(message.event, message.data);
        messageQueue.remove(message.id);
      } catch (error) {
        console.error("Failed to send queued message:", error);
      }
    }
  }

  // Get connection status
  getStatus(): SocketStatus {
    return this.status;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for advanced use)
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
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
import { socketClient } from "./socketClient";
import { queryClient } from "@config/queryClient";

// Setup socket event listeners
export const setupSocketEvents = () => {
  // New message
  socketClient.on("message:new", (data) => {
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

  // Message delivered
  socketClient.on("message:delivered", (data) => {
    console.log("Message delivered:", data.messageId);

    // Update message status in cache
    queryClient.setQueriesData({ queryKey: ["messages"] }, (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: any) =>
            msg.id === data.messageId ? { ...msg, status: "delivered" } : msg
          ),
        })),
      };
    });
  });

  // Message read
  socketClient.on("message:read", (data) => {
    console.log("Message read:", data.messageId);

    // Update message status in cache
    queryClient.setQueriesData({ queryKey: ["messages"] }, (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: any) =>
            msg.id === data.messageId ? { ...msg, status: "read" } : msg
          ),
        })),
      };
    });
  });

  // User online/offline
  socketClient.on("user:online", (data) => {
    console.log("User online:", data.userId);
    // Update user status in cache
  });

  socketClient.on("user:offline", (data) => {
    console.log("User offline:", data.userId);
    // Update user status in cache
  });

  // New notification
  socketClient.on("notification:new", (data) => {
    console.log("New notification:", data);

    // Invalidate notifications query
    queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });

    // Show local notification
    // notifeeService.displayNotification(data);
  });
};

// Cleanup socket events
export const cleanupSocketEvents = () => {
  socketClient.off("message:new");
  socketClient.off("message:delivered");
  socketClient.off("message:read");
  socketClient.off("user:online");
  socketClient.off("user:offline");
  socketClient.off("notification:new");
};
```

---

## 7. Usage Examples

**Initialize socket:**

```typescript
import { socketClient } from "@core/socket/socketClient";
import { setupSocketEvents } from "@core/socket/socketEvents";

// In App.tsx
useEffect(() => {
  if (isAuthenticated) {
    socketClient.connect();
    setupSocketEvents();
  }

  return () => {
    socketClient.disconnect();
  };
}, [isAuthenticated]);
```

**Send message:**

```typescript
import { socketClient } from "@core/socket/socketClient";

// Send message via socket
socketClient.emit("message:send", {
  conversationId: "123",
  content: "Hello!",
  type: "text",
});
```

**Listen to events:**

```typescript
import { socketClient } from "@core/socket/socketClient";

useEffect(() => {
  const unsubscribe = socketClient.on("message:new", (message) => {
    console.log("New message:", message);
  });

  return unsubscribe;
}, []);
```

---

## 8. Connection Monitor

**src/core/socket/connectionMonitor.ts:**

```typescript
import { AppState, NetInfo } from "react-native";
import { socketClient } from "./socketClient";

export class ConnectionMonitor {
  private appStateSubscription: any;
  private netInfoSubscription: any;

  start(): void {
    // Monitor app state
    this.appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (!socketClient.isConnected()) {
          socketClient.connect();
        }
      }
    });

    // Monitor network state
    this.netInfoSubscription = NetInfo.addEventListener((state) => {
      if (state.isConnected && !socketClient.isConnected()) {
        socketClient.connect();
      } else if (!state.isConnected) {
        socketClient.disconnect();
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

- ✅ Socket.IO client with TypeScript
- ✅ Auto-reconnection logic
- ✅ Offline message queuing
- ✅ Event subscription/unsubscription
- ✅ Connection monitoring (app state, network)
- ✅ Integration with React Query
- ✅ Message delivery tracking

**Result:** Production-ready real-time communication system with offline support.
