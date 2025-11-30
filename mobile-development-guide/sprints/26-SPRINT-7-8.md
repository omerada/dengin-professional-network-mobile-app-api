# Sprint 7-8: Real-time Messaging

**Duration:** 2 weeks
**Focus:** Socket.IO chat, message status, typing indicators
**Complexity:** ⭐⭐⭐⭐ (High)

---

## Sprint Goals

- ✅ Socket.IO integration
- ✅ Real-time chat interface
- ✅ Message status (sending → sent → delivered → read)
- ✅ Typing indicators
- ✅ Message history with pagination

---

## Week 1: Socket Setup & Chat UI

### Day 1-2: Socket.IO Integration

**Tasks:**

- Install socket.io-client
- Create socket service
- Implement connection management
- Add auto-reconnection logic

**Dependencies:**

```bash
npm install socket.io-client
npm install @react-native-community/netinfo  # Network detection
```

**Code:**

```typescript
// socketClient.ts
import io, { Socket } from "socket.io-client";
import { tokenService } from "@features/auth/services/tokenService";

class SocketClient {
  private socket: Socket | null = null;

  async connect() {
    const token = await tokenService.getAccessToken();

    this.socket = io(ENV.WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      // Queue message
      messageQueue.add({ event, data });
    }
  }

  on(event: string, handler: (data: any) => void) {
    this.socket?.on(event, handler);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketClient = new SocketClient();
```

**Validation:**

- [ ] Socket connects successfully
- [ ] Reconnection works
- [ ] Auth token sent
- [ ] Events can be emitted

---

### Day 3-4: Chat Interface

**Tasks:**

- Create chat screen
- Implement message list (inverted FlatList)
- Add message bubbles (own vs other)
- Show timestamps

**Files:**

```
src/features/messaging/
├── screens/
│   ├── ConversationsScreen.tsx
│   └── ChatScreen.tsx
└── components/
    ├── MessageBubble.tsx
    ├── MessageInput.tsx
    └── TypingIndicator.tsx
```

**Code:**

```typescript
// ChatScreen.tsx
export const ChatScreen: React.FC<{ conversationId: string }> = ({
  conversationId,
}) => {
  const { data: messages, fetchNextPage } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);

  const allMessages = messages?.pages.flatMap((page) => page.data) ?? [];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={allMessages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted // Latest messages at bottom
        onEndReached={fetchNextPage}
      />

      <MessageInput onSend={(text) => sendMessage.mutate({ content: text })} />
    </View>
  );
};
```

**Validation:**

- [ ] Messages display correctly
- [ ] Scroll to bottom on new message
- [ ] Own messages align right
- [ ] Other messages align left

---

### Day 5: Message Status

**Tasks:**

- Implement message status tracking
- Show status icons (sending, sent, delivered, read)
- Update status on socket events
- Handle failed messages

**Code:**

```typescript
// Message status enum
enum MessageStatus {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

// MessageBubble.tsx
const getStatusIcon = (status: MessageStatus) => {
  switch (status) {
    case MessageStatus.SENDING:
      return <ActivityIndicator size="small" />;
    case MessageStatus.SENT:
      return <Icon name="checkmark" color="gray" />;
    case MessageStatus.DELIVERED:
      return <Icon name="checkmark-done" color="gray" />;
    case MessageStatus.READ:
      return <Icon name="checkmark-done" color="blue" />;
    case MessageStatus.FAILED:
      return <Icon name="alert-circle" color="red" />;
  }
};
```

**Validation:**

- [ ] Status updates in real-time
- [ ] Icons display correctly
- [ ] Failed messages can retry
- [ ] Read receipts work

---

## Week 2: Real-time Features

### Day 1-2: Real-time Message Sync

**Tasks:**

- Listen to `message:new` socket event
- Update React Query cache
- Add optimistic updates
- Handle message ordering

**Code:**

```typescript
// useMessages.ts
export const useMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        queryClient.setQueryData(["messages", conversationId], (old: any) => ({
          ...old,
          pages: old.pages.map((page: any, index: number) =>
            index === 0 ? { ...page, data: [message, ...page.data] } : page
          ),
        }));
      }
    };

    socketClient.on("message:new", handleNewMessage);

    return () => {
      socketClient.off("message:new", handleNewMessage);
    };
  }, [conversationId]);

  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      messagingService.getMessages(conversationId, pageParam),
  });
};
```

**Validation:**

- [ ] New messages appear instantly
- [ ] No duplicate messages
- [ ] Optimistic updates work
- [ ] Messages ordered correctly

---

### Day 3-4: Typing Indicators

**Tasks:**

- Send typing events to server
- Listen to typing events
- Show typing indicator in UI
- Debounce typing events

**Code:**

```typescript
// useTyping.ts
export const useTyping = (conversationId: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const sendTypingEvent = () => {
    socketClient.emit("typing:start", { conversationId });

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Stop typing after 3 seconds
    timeoutRef.current = setTimeout(() => {
      socketClient.emit("typing:stop", { conversationId });
    }, 3000);
  };

  useEffect(() => {
    socketClient.on("typing:start", (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => [...prev, data.userId]);
      }
    });

    socketClient.on("typing:stop", (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    });
  }, [conversationId]);

  return { typingUsers, sendTypingEvent };
};
```

**Validation:**

- [ ] Typing indicator shows
- [ ] Indicator hides after 3s
- [ ] Multiple users supported
- [ ] Events debounced

---

### Day 5: Message Queue (Offline Support)

**Tasks:**

- Create message queue for offline mode
- Store pending messages
- Retry on reconnection
- Show sync status

**Code:**

```typescript
// messageQueue.ts
class MessageQueue {
  private queue: QueuedMessage[] = [];

  async add(message: QueuedMessage) {
    this.queue.push(message);
    await asyncStorage.setItem("message_queue", this.queue);
  }

  async process() {
    for (const message of this.queue) {
      try {
        await messagingService.sendMessage(message);
        this.remove(message.id);
      } catch (error) {
        console.error("Failed to send queued message:", error);
      }
    }
  }

  async remove(id: string) {
    this.queue = this.queue.filter((m) => m.id !== id);
    await asyncStorage.setItem("message_queue", this.queue);
  }
}
```

**Validation:**

- [ ] Messages queue when offline
- [ ] Messages send on reconnection
- [ ] Queue persists on app restart
- [ ] Failed messages can retry

---

## Testing Checklist

**Unit Tests:**

- [ ] socketClient.connect()
- [ ] socketClient.emit()
- [ ] messageQueue.add()
- [ ] messageQueue.process()

**Component Tests:**

- [ ] MessageBubble renders
- [ ] MessageInput validation
- [ ] TypingIndicator shows
- [ ] Message status updates

**E2E Tests:**

- [ ] Send message
- [ ] Receive message
- [ ] Typing indicator works
- [ ] Offline queue works

---

## Performance Checklist

- [ ] Message list renders smoothly
- [ ] Socket events don't block UI
- [ ] Memory usage <200MB
- [ ] Message load time <1s

---

## Sprint Review

**Demo:**

1. Open chat
2. Send message (see optimistic update)
3. Receive message (real-time)
4. Show typing indicator
5. Test offline mode
6. Reconnect and sync

**Metrics:**

- Lines of code: ~3,200
- Files created: ~22
- Test coverage: >70%
- Message latency: <200ms

---

## Sprint Retrospective

**What went well:**

- Socket integration smooth
- Real-time updates instant
- Offline queue reliable

**What to improve:**

- Add message reactions
- Improve typing UX
- Better error recovery

**Action items:**

- Add voice messages
- Implement read receipts
- Add message search

---

## Next Sprint Preview (Sprint 9-10)

Focus: Push notifications

- Firebase Cloud Messaging setup
- Notifee local notifications
- Deep linking integration
- Badge count management
