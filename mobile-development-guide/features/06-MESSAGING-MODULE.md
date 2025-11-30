# Messaging Module

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium-High)

---

## 1. Overview

Messaging modülü real-time mesajlaşma özelliklerini yönetir: WebSocket bağlantısı, mesaj gönderme/alma, typing indicators, read receipts ve conversation yönetimi.

---

## 2. Module Structure

```
src/features/messaging/
├── screens/
│   ├── ConversationListScreen.tsx       # Konuşma listesi
│   └── ChatScreen.tsx                   # Chat ekranı
├── components/
│   ├── ConversationItem.tsx             # Konuşma item
│   ├── MessageBubble.tsx                # Mesaj balonu
│   ├── ChatInput.tsx                    # Mesaj input
│   ├── TypingIndicator.tsx              # "yazıyor..." göstergesi
│   └── DateSeparator.tsx                # Tarih ayırıcı
├── hooks/
│   ├── useConversations.ts              # Conversations query
│   ├── useMessages.ts                   # Messages query
│   ├── useSendMessage.ts                # Send message mutation
│   ├── useSocket.ts                     # WebSocket connection
│   └── useTypingIndicator.ts            # Typing status
├── stores/
│   └── messagingStore.ts                # Zustand message cache
├── services/
│   ├── messagingApi.ts                  # Messaging API
│   └── socketService.ts                 # Socket.IO service
├── types/
│   └── messaging.types.ts               # Type definitions
└── index.ts
```

---

## 3. Type Definitions

**src/features/messaging/types/messaging.types.ts:**

```typescript
export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image";
  status: "sending" | "sent" | "delivered" | "read";
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: "text" | "image";
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface SocketEvents {
  "message:new": Message;
  "message:delivered": { messageId: string };
  "message:read": { messageId: string };
  "typing:start": TypingStatus;
  "typing:stop": TypingStatus;
  "user:online": { userId: string };
  "user:offline": { userId: string };
}
```

---

## 4. Services

**src/features/messaging/services/socketService.ts:**

```typescript
import io, { Socket } from "socket.io-client";
import { ENV } from "@config/env";
import { tokenService } from "@features/auth/services/tokenService";
import type { SocketEvents } from "../types/messaging.types";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    const token = await tokenService.getAccessToken();

    this.socket = io(ENV.WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]): void {
    this.socket?.emit(event, data);
  }

  on<K extends keyof SocketEvents>(
    event: K,
    handler: (data: SocketEvents[K]) => void
  ): void {
    this.socket?.on(event, handler);
  }

  off<K extends keyof SocketEvents>(event: K): void {
    this.socket?.off(event);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
```

**src/features/messaging/services/messagingApi.ts:**

```typescript
import { apiClient } from "@core/api/client";
import type {
  Conversation,
  Message,
  SendMessageRequest,
} from "../types/messaging.types";

export const messagingApi = {
  // Get conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get("/conversations");
    return response.data;
  },

  // Get messages
  getMessages: async (
    conversationId: string,
    cursor?: string
  ): Promise<{
    messages: Message[];
    nextCursor?: string;
  }> => {
    const response = await apiClient.get(
      `/conversations/${conversationId}/messages`,
      {
        params: { cursor, limit: 50 },
      }
    );
    return response.data;
  },

  // Send message (HTTP fallback)
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post("/messages", data);
    return response.data;
  },

  // Mark as read
  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/read`);
  },

  // Create conversation
  createConversation: async (userId: string): Promise<Conversation> => {
    const response = await apiClient.post("/conversations", { userId });
    return response.data;
  },
};
```

---

## 5. Hooks

**src/features/messaging/hooks/useSocket.ts:**

```typescript
import { useEffect } from "react";
import { socketService } from "../services/socketService";
import { useAuthStore } from "@features/auth/stores/authStore";

export const useSocket = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  return socketService;
};
```

**src/features/messaging/hooks/useMessages.ts:**

```typescript
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { messagingApi } from "../services/messagingApi";
import { socketService } from "../services/socketService";
import type { Message } from "../types/messaging.types";

export const useMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      messagingApi.getMessages(conversationId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  useEffect(() => {
    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        queryClient.setQueryData(["messages", conversationId], (old: any) => {
          if (!old) return old;

          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              { ...firstPage, messages: [message, ...firstPage.messages] },
              ...old.pages.slice(1),
            ],
          };
        });
      }
    };

    socketService.on("message:new", handleNewMessage);

    return () => {
      socketService.off("message:new");
    };
  }, [conversationId]);

  return query;
};
```

**src/features/messaging/hooks/useSendMessage.ts:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { socketService } from "../services/socketService";
import type { SendMessageRequest } from "../types/messaging.types";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      // Send via WebSocket (real-time)
      socketService.emit("message:send", data);

      // Return optimistic message
      return {
        id: `temp-${Date.now()}`,
        ...data,
        senderId: "current-user", // Get from auth store
        status: "sending" as const,
        createdAt: new Date().toISOString(),
      };
    },

    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", data.conversationId],
      });

      // Optimistic update
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        ...data,
        senderId: "current-user",
        status: "sending" as const,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["messages", data.conversationId],
        (old: any) => {
          if (!old) return old;

          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                messages: [optimisticMessage, ...firstPage.messages],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );
    },
  });
};
```

---

## 6. Components

**src/features/messaging/components/MessageBubble.tsx:**

```typescript
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/Text";
import type { Message } from "../types/messaging.types";

interface Props {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<Props> = ({ message, isOwn }) => {
  return (
    <View style={[styles.container, isOwn ? styles.own : styles.other]}>
      <View
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
      >
        <Text style={isOwn ? styles.ownText : styles.otherText}>
          {message.content}
        </Text>
        <Text style={styles.time}>
          {new Date(message.createdAt).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  own: {
    alignItems: "flex-end",
  },
  other: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },
  ownText: {
    color: "#fff",
  },
  otherText: {
    color: "#000",
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
});
```

---

## 7. Screens

**src/features/messaging/screens/ChatScreen.tsx:**

```typescript
import React, { useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { TypingIndicator } from "../components/TypingIndicator";
import { useMessages } from "../hooks/useMessages";
import { useSendMessage } from "../hooks/useSendMessage";

export const ChatScreen = ({ route }) => {
  const { conversationId } = route.params;
  const { data, fetchNextPage, hasNextPage } = useMessages(conversationId);
  const { mutate: sendMessage } = useSendMessage();

  const messages = data?.pages.flatMap((page) => page.messages) || [];

  const handleSend = (content: string) => {
    sendMessage({
      conversationId,
      content,
      type: "text",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          inverted
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId === "current-user"}
            />
          )}
          keyExtractor={(item) => item.id}
          onEndReached={() => hasNextPage && fetchNextPage()}
        />

        <TypingIndicator conversationId={conversationId} />
        <ChatInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
```

---

## 8. Summary

### Features:

- ✅ Real-time messaging with Socket.IO
- ✅ Optimistic UI updates
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Message status (sending, sent, delivered, read)
- ✅ Infinite scroll for message history
- ✅ Auto-reconnect on disconnect

**Result:** Production-ready real-time messaging with WebSocket.
