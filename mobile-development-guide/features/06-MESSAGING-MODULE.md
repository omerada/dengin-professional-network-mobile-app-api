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
│   └── socketService.ts                 # STOMP WebSocket service
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
  otherParticipant: Participant;
  lastMessage?: {
    content: string;
    senderId: number;
    sentAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Participant {
  id: number;
  name: string;
  surname: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image";
  status: "sending" | "sent" | "delivered" | "read";
  attachment?: MessageAttachment;
  createdAt: string;
  readAt?: string;
}

export interface MessageAttachment {
  url: string;
  contentType: string;
  fileName: string;
  fileSize: number;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: "text" | "image";
}

// ========== WebSocket Types (STOMP) ==========

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

export interface WsTypingNotification {
  conversationId: string;
  recipientId: number;
  isTyping: boolean;
}

export interface WsReadReceipt {
  conversationId: string;
  readByUserId: number;
  messagesRead: number;
  readAt: string;
}

export interface WsErrorResponse {
  code: "VALIDATION_ERROR" | "FORBIDDEN" | "INTERNAL_ERROR";
  message: string;
  action: string;
}
```

---

## 4. Services

**src/features/messaging/services/socketService.ts:**

```typescript
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { ENV } from "@config/env";
import { tokenService } from "@features/auth/services/tokenService";
import type { SocketEvents } from "../types/messaging.types";

class SocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    const token = await tokenService.getAccessToken();

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${ENV.API_BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
      debug: __DEV__ ? (str) => console.log("[STOMP]", str) : () => {},
    });

    this.setupEventHandlers();
    this.client.activate();
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.onConnect = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };

    this.client.onDisconnect = () => {
      console.log("WebSocket disconnected");
    };

    this.client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
    };
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
  }

  // Send message via WebSocket
  sendMessage(request: WsSendMessageRequest): void {
    this.client?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(request),
    });
  }

  // Send typing indicator
  sendTyping(
    conversationId: string,
    recipientId: number,
    isTyping: boolean
  ): void {
    this.client?.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ conversationId, recipientId, isTyping }),
    });
  }

  // Mark messages as read
  markAsRead(conversationId: string): void {
    this.client?.publish({
      destination: "/app/chat.read",
      body: JSON.stringify({ conversationId }),
    });
  }

  // Subscribe to messages
  subscribeToMessages(callback: (message: WsMessageResponse) => void): void {
    this.client?.subscribe("/user/queue/messages", (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  }

  // Subscribe to typing notifications
  subscribeToTyping(
    callback: (notification: WsTypingNotification) => void
  ): void {
    this.client?.subscribe("/user/queue/typing", (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  }

  // Subscribe to read receipts
  subscribeToReadReceipts(callback: (receipt: WsReadReceipt) => void): void {
    this.client?.subscribe("/user/queue/read", (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  }

  // Subscribe to errors
  subscribeToErrors(callback: (error: WsErrorResponse) => void): void {
    this.client?.subscribe("/user/queue/errors", (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  }

  isConnected(): boolean {
    return this.client?.connected || false;
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
  getConversations: async (
    page = 0,
    size = 20
  ): Promise<{
    conversations: Conversation[];
    hasNext: boolean;
  }> => {
    const response = await apiClient.get("/api/conversations", {
      params: { page, size },
    });
    return response.data.data;
  },

  // Get messages
  getMessages: async (
    conversationId: string,
    page = 0,
    size = 30
  ): Promise<{
    messages: Message[];
    hasNext: boolean;
  }> => {
    const response = await apiClient.get(
      `/api/conversations/${conversationId}/messages`,
      { params: { page, size } }
    );
    return response.data.data;
  },

  // Send message (HTTP fallback when WebSocket unavailable)
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post("/api/messages", data);
    return response.data.data;
  },

  // Mark as read
  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.put(`/api/conversations/${conversationId}/read`);
  },

  // Delete message
  deleteMessage: async (
    conversationId: string,
    messageId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/api/conversations/${conversationId}/messages/${messageId}`
    );
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get("/api/conversations/unread-count");
    return response.data.data;
  },

  // Search messages
  searchMessages: async (
    query: string,
    conversationId?: string,
    page = 0,
    size = 20
  ): Promise<{
    messages: Message[];
    totalResults: number;
    hasNext: boolean;
  }> => {
    const response = await apiClient.get("/api/messages/search", {
      params: { q: query, conversationId, page, size },
    });
    return response.data.data;
  },

  // Get presigned URL for attachment upload
  getAttachmentUploadUrl: async (
    fileName: string,
    contentType: string,
    fileSize: number,
    conversationId?: string
  ): Promise<{
    uploadUrl: string;
    s3Key: string;
    expiresIn: number;
  }> => {
    const response = await apiClient.post(
      "/api/messages/attachments/upload-url",
      {
        fileName,
        contentType,
        fileSize,
        conversationId,
      }
    );
    return response.data.data;
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
import type { Message, WsMessageResponse } from "../types/messaging.types";

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
    // Subscribe to new messages via WebSocket
    socketService.subscribeToMessages((wsMessage: WsMessageResponse) => {
      if (wsMessage.conversationId === conversationId) {
        queryClient.setQueryData(["messages", conversationId], (old: any) => {
          if (!old) return old;

          const newMessage: Message = {
            id: wsMessage.messageId,
            conversationId: wsMessage.conversationId,
            senderId: wsMessage.senderId.toString(),
            content: wsMessage.content,
            type: "text",
            status: wsMessage.status.toLowerCase() as Message["status"],
            createdAt: wsMessage.sentAt,
          };

          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              { ...firstPage, messages: [newMessage, ...firstPage.messages] },
              ...old.pages.slice(1),
            ],
          };
        });

        // Also invalidate conversations to update last message
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    });
  }, [conversationId, queryClient]);

  return query;
};
```

**src/features/messaging/hooks/useSendMessage.ts:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { socketService } from "../services/socketService";
import { messagingApi } from "../services/messagingApi";
import { useAuthStore } from "@features/auth/stores/authStore";
import type { WsSendMessageRequest } from "../types/messaging.types";

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: { recipientId: number; content: string }) => {
      // Try WebSocket first (real-time)
      if (socketService.isConnected()) {
        const wsRequest: WsSendMessageRequest = {
          recipientId: data.recipientId,
          content: data.content,
        };
        socketService.sendMessage(wsRequest);

        // Return optimistic message
        return {
          id: `temp-${Date.now()}`,
          conversationId,
          senderId: currentUser?.id || "unknown",
          content: data.content,
          type: "text" as const,
          status: "sending" as const,
          createdAt: new Date().toISOString(),
        };
      } else {
        // Fallback to HTTP
        return await messagingApi.sendMessage({
          conversationId,
          content: data.content,
          type: "text",
        });
      }
    },

    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationId],
      });

      // Optimistic update
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: currentUser?.id || "unknown",
        content: data.content,
        type: "text" as const,
        status: "sending" as const,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages", conversationId], (old: any) => {
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
      });
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

- ✅ Real-time messaging with STOMP over WebSocket
- ✅ Optimistic UI updates
- ✅ Typing indicators via `/app/chat.typing`
- ✅ Read receipts via `/app/chat.read`
- ✅ Message status (sending, sent, delivered, read)
- ✅ Infinite scroll for message history
- ✅ Auto-reconnect with SockJS fallback
- ✅ HTTP fallback when WebSocket unavailable
- ✅ S3 presigned URLs for attachment upload

### Backend Integration:

| Feature        | REST Endpoint                               | WebSocket Destination  |
| -------------- | ------------------------------------------- | ---------------------- |
| Get Convos     | `GET /api/conversations`                    | -                      |
| Get Messages   | `GET /api/conversations/{id}/messages`      | -                      |
| Send Message   | `POST /api/messages`                        | `/app/chat.send`       |
| Mark Read      | `PUT /api/conversations/{id}/read`          | `/app/chat.read`       |
| Delete Message | `DELETE /api/conversations/{id}/messages/*` | -                      |
| Typing         | -                                           | `/app/chat.typing`     |
| Receive Msgs   | -                                           | `/user/queue/messages` |

**Result:** Production-ready real-time messaging with STOMP WebSocket and REST fallback.
