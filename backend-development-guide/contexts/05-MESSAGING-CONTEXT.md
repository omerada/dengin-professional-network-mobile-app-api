# Messaging Context - Real-time Chat & Communication

> **Bounded Context:** Messaging  
> **Complexity:** ⭐⭐⭐ High (WebSocket + Real-time)  
> **Core Domain:** ❌ No (Supporting Domain)

---

## 📚 İçindekiler

1. [Context Overview](#context-overview)
2. [Domain Model](#domain-model)
3. [Aggregates](#aggregates)
4. [Domain Services](#domain-services)
5. [Domain Events](#domain-events)
6. [Business Rules](#business-rules)
7. [Integration Points](#integration-points)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 Context Overview

### Responsibility

Meslek-bazlı real-time mesajlaşma, conversation yönetimi, message delivery semantics, read receipts, typing indicators.

### Ubiquitous Language

```
Conversation: İki kullanıcı arasında sohbet (Aggregate Root)
Message: Gönderilen mesaj (Entity)
MessageDeliveryStatus: SENT, DELIVERED, READ
TypingIndicator: Yazıyor göstergesi
ReadReceipt: Okundu bilgisi
OnlineStatus: ONLINE, AWAY, OFFLINE
ChatRoom: Meslek-bazlı genel sohbet odası
UnreadCount: Okunmamış mesaj sayısı
MessageThread: Mesaj zinciri
```

### Context Boundaries

```
IN SCOPE:
✅ 1-to-1 conversations
✅ Profession-based chat rooms (future)
✅ Message sending/receiving
✅ Read receipts
✅ Typing indicators
✅ Online status
✅ Unread message count
✅ Message history
✅ WebSocket real-time delivery
✅ Message search

OUT OF SCOPE:
❌ User authentication (Identity Context)
❌ Push notifications (Notification Context)
❌ File attachments (MVP - text only)
❌ Voice/Video calls (future)
❌ Message encryption (future)
```

---

## 🏗️ Domain Model

### Aggregate: Conversation

```java
/**
 * Conversation Aggregate Root
 *
 * Business Rules:
 * - 1-to-1 conversation between two users
 * - Users must be from same profession
 * - Blocked users cannot message each other
 * - Messages ordered by timestamp
 * - Max 1000 messages per conversation (pagination)
 * - Deleted conversations archived for 30 days
 */
@Entity
@Table(name = "conversations")
public class Conversation extends AggregateRoot {

    @EmbeddedId
    private ConversationId id;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "participant1_id"))
    private UserId participant1;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "participant2_id"))
    private UserId participant2;

    @Embedded
    private Profession profession;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sentAt DESC")
    private List<Message> messages = new ArrayList<>();

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "unread_count_p1"))
    private UnreadCount unreadCountP1;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "unread_count_p2"))
    private UnreadCount unreadCountP2;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "last_message_preview", length = 100)
    private String lastMessagePreview;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ConversationStatus status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Start new conversation
     */
    public static Conversation start(
        UserId user1,
        UserId user2,
        Profession profession
    ) {
        if (user1.equals(user2)) {
            throw new CannotMessageSelfException("Cannot message yourself");
        }

        Conversation conversation = new Conversation();
        conversation.id = ConversationId.generate();
        conversation.participant1 = user1;
        conversation.participant2 = user2;
        conversation.profession = profession;
        conversation.unreadCountP1 = new UnreadCount(0);
        conversation.unreadCountP2 = new UnreadCount(0);
        conversation.status = ConversationStatus.ACTIVE;
        conversation.createdAt = Instant.now();
        conversation.updatedAt = Instant.now();

        conversation.registerEvent(new ConversationStartedEvent(
            conversation.id,
            user1,
            user2,
            profession
        ));

        return conversation;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Send message
     * Business rule: Only participants can send messages
     */
    public Message sendMessage(UserId senderId, String content) {
        // Validate sender is participant
        if (!isParticipant(senderId)) {
            throw new NotParticipantException(
                "User is not participant of this conversation"
            );
        }

        if (status != ConversationStatus.ACTIVE) {
            throw new ConversationNotActiveException(
                "Cannot send message to inactive conversation"
            );
        }

        // Create message
        Message message = Message.create(this, senderId, content);
        messages.add(message);

        // Update conversation metadata
        this.lastMessageAt = Instant.now();
        this.lastMessagePreview = content.length() > 100
            ? content.substring(0, 100)
            : content;
        this.updatedAt = Instant.now();

        // Increment unread count for recipient
        UserId recipientId = getOtherParticipant(senderId);
        incrementUnreadCount(recipientId);

        // Domain event
        registerEvent(new MessageSentEvent(
            this.id,
            message.getId(),
            senderId,
            recipientId,
            content
        ));

        return message;
    }

    /**
     * Mark messages as read
     * Business rule: Only recipient can mark as read
     */
    public void markAsRead(UserId readerId) {
        if (!isParticipant(readerId)) {
            throw new NotParticipantException("User is not participant");
        }

        // Find unread messages for this reader
        List<Message> unreadMessages = messages.stream()
            .filter(m -> !m.getSenderId().equals(readerId))
            .filter(m -> m.getDeliveryStatus() != MessageDeliveryStatus.READ)
            .toList();

        if (unreadMessages.isEmpty()) {
            return; // No unread messages
        }

        // Mark as read
        unreadMessages.forEach(Message::markAsRead);

        // Reset unread count
        resetUnreadCount(readerId);

        this.updatedAt = Instant.now();

        // Domain event
        registerEvent(new MessagesReadEvent(
            this.id,
            readerId,
            unreadMessages.stream().map(Message::getId).toList()
        ));
    }

    /**
     * Typing indicator
     */
    public void startTyping(UserId userId) {
        if (!isParticipant(userId)) {
            throw new NotParticipantException("User is not participant");
        }

        UserId recipientId = getOtherParticipant(userId);

        registerEvent(new TypingStartedEvent(
            this.id,
            userId,
            recipientId
        ));
    }

    /**
     * Stop typing
     */
    public void stopTyping(UserId userId) {
        if (!isParticipant(userId)) {
            throw new NotParticipantException("User is not participant");
        }

        UserId recipientId = getOtherParticipant(userId);

        registerEvent(new TypingStoppedEvent(
            this.id,
            userId,
            recipientId
        ));
    }

    /**
     * Delete message
     * Business rule: Only sender can delete their own message
     */
    public void deleteMessage(MessageId messageId, UserId deleterId) {
        Message message = messages.stream()
            .filter(m -> m.getId().equals(messageId))
            .findFirst()
            .orElseThrow(() -> new MessageNotFoundException(messageId));

        if (!message.getSenderId().equals(deleterId)) {
            throw new UnauthorizedDeleteException(
                "Only sender can delete their message"
            );
        }

        message.delete();
        this.updatedAt = Instant.now();

        registerEvent(new MessageDeletedEvent(
            this.id,
            messageId,
            deleterId
        ));
    }

    /**
     * Archive conversation
     */
    public void archive(UserId userId) {
        if (!isParticipant(userId)) {
            throw new NotParticipantException("User is not participant");
        }

        this.status = ConversationStatus.ARCHIVED;
        this.updatedAt = Instant.now();

        registerEvent(new ConversationArchivedEvent(this.id, userId));
    }

    /**
     * Get unread count for user
     */
    public int getUnreadCount(UserId userId) {
        if (userId.equals(participant1)) {
            return unreadCountP1.value();
        } else if (userId.equals(participant2)) {
            return unreadCountP2.value();
        }
        return 0;
    }

    /**
     * Get other participant
     */
    public UserId getOtherParticipant(UserId userId) {
        if (userId.equals(participant1)) {
            return participant2;
        } else if (userId.equals(participant2)) {
            return participant1;
        }
        throw new NotParticipantException("User is not participant");
    }

    /**
     * Check if user is participant
     */
    public boolean isParticipant(UserId userId) {
        return participant1.equals(userId) || participant2.equals(userId);
    }

    private void incrementUnreadCount(UserId userId) {
        if (userId.equals(participant1)) {
            this.unreadCountP1 = unreadCountP1.increment();
        } else if (userId.equals(participant2)) {
            this.unreadCountP2 = unreadCountP2.increment();
        }
    }

    private void resetUnreadCount(UserId userId) {
        if (userId.equals(participant1)) {
            this.unreadCountP1 = new UnreadCount(0);
        } else if (userId.equals(participant2)) {
            this.unreadCountP2 = new UnreadCount(0);
        }
    }
}
```

### Entity: Message

```java
/**
 * Message Entity
 * Part of Conversation aggregate
 */
@Entity
@Table(name = "messages")
public class Message extends BaseEntity {

    @EmbeddedId
    private MessageId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Embedded
    private UserId senderId;

    @Column(name = "content", length = 1000, nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageDeliveryStatus deliveryStatus;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "is_deleted")
    private boolean isDeleted;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // ============================================
    // FACTORY METHOD
    // ============================================

    public static Message create(
        Conversation conversation,
        UserId senderId,
        String content
    ) {
        // Validation
        if (content == null || content.isBlank()) {
            throw new EmptyMessageException("Message cannot be empty");
        }

        if (content.length() > 1000) {
            throw new MessageTooLongException("Message max 1000 characters");
        }

        Message message = new Message();
        message.id = MessageId.generate();
        message.conversation = conversation;
        message.senderId = senderId;
        message.content = content;
        message.deliveryStatus = MessageDeliveryStatus.SENT;
        message.sentAt = Instant.now();
        message.isDeleted = false;

        return message;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Mark as delivered (WebSocket ACK received)
     */
    public void markAsDelivered() {
        if (this.deliveryStatus == MessageDeliveryStatus.SENT) {
            this.deliveryStatus = MessageDeliveryStatus.DELIVERED;
            this.deliveredAt = Instant.now();
        }
    }

    /**
     * Mark as read (recipient opened conversation)
     */
    public void markAsRead() {
        if (this.deliveryStatus != MessageDeliveryStatus.READ) {
            this.deliveryStatus = MessageDeliveryStatus.READ;
            this.readAt = Instant.now();
        }
    }

    /**
     * Delete message
     */
    public void delete() {
        this.isDeleted = true;
        this.deletedAt = Instant.now();
        this.content = "[Mesaj silindi]";
    }

    /**
     * Get display content
     */
    public String getDisplayContent() {
        return isDeleted ? "[Mesaj silindi]" : content;
    }
}
```

### Value Objects

```java
/**
 * Unread Count Value Object
 */
public record UnreadCount(int value) {

    public UnreadCount {
        if (value < 0) {
            throw new IllegalArgumentException("Unread count cannot be negative");
        }
    }

    public UnreadCount increment() {
        return new UnreadCount(value + 1);
    }

    public UnreadCount reset() {
        return new UnreadCount(0);
    }
}

/**
 * Online Status Value Object
 */
public record OnlineStatus(
    UserId userId,
    boolean isOnline,
    Instant lastSeenAt
) {

    public static OnlineStatus online(UserId userId) {
        return new OnlineStatus(userId, true, Instant.now());
    }

    public static OnlineStatus offline(UserId userId) {
        return new OnlineStatus(userId, false, Instant.now());
    }
}
```

### Enums

```java
public enum MessageDeliveryStatus {
    SENT,      // Message sent to server
    DELIVERED, // Message delivered to recipient (WebSocket ACK)
    READ       // Message read by recipient
}

public enum ConversationStatus {
    ACTIVE,
    ARCHIVED,
    DELETED
}
```

---

## 🛠️ Domain Services

### ConversationAccessPolicy

```java
/**
 * Domain Service: Conversation Access Rules
 *
 * Business rules:
 * - Same profession only
 * - No blocked users
 * - Both users active
 */
public class ConversationAccessPolicy {

    /**
     * Check if user1 can message user2
     */
    public static void validateAccess(User user1, User user2) {
        // Same profession check
        if (!user1.getProfession().equals(user2.getProfession())) {
            throw new DifferentProfessionException(
                "Can only message users from same profession"
            );
        }

        // Blocking check
        if (user1.hasBlocked(user2.getId())) {
            throw new UserBlockedException(
                "Cannot message blocked user"
            );
        }

        if (user2.hasBlocked(user1.getId())) {
            throw new UserBlockedException(
                "User has blocked you"
            );
        }

        // Active status check
        if (!user1.isActive() || !user2.isActive()) {
            throw new UserNotActiveException(
                "Both users must be active"
            );
        }
    }
}
```

### MessageRateLimiter

```java
/**
 * Domain Service: Rate Limiting
 *
 * Business rules:
 * - Max 60 messages per minute per user
 * - Max 10 messages per minute per conversation
 */
public class MessageRateLimiter {

    private final RedisTemplate<String, Integer> redisTemplate;

    public void checkRateLimit(UserId userId, ConversationId conversationId) {
        // User-level rate limit
        String userKey = "msg:rate:" + userId.value();
        Integer userCount = redisTemplate.opsForValue().get(userKey);

        if (userCount != null && userCount >= 60) {
            throw new RateLimitException(
                "Too many messages. Please wait a minute."
            );
        }

        // Conversation-level rate limit
        String convKey = "msg:rate:conv:" + conversationId.value();
        Integer convCount = redisTemplate.opsForValue().get(convKey);

        if (convCount != null && convCount >= 10) {
            throw new RateLimitException(
                "Too many messages in this conversation. Please slow down."
            );
        }

        // Increment counters
        redisTemplate.opsForValue().increment(userKey);
        redisTemplate.expire(userKey, Duration.ofMinutes(1));

        redisTemplate.opsForValue().increment(convKey);
        redisTemplate.expire(convKey, Duration.ofMinutes(1));
    }
}
```

---

## 📨 Domain Events

```java
public record ConversationStartedEvent(
    ConversationId conversationId,
    UserId participant1,
    UserId participant2,
    Profession profession,
    Instant startedAt
) implements DomainEvent {}

public record MessageSentEvent(
    ConversationId conversationId,
    MessageId messageId,
    UserId senderId,
    UserId recipientId,
    String content,
    Instant sentAt
) implements DomainEvent {}

public record MessageDeliveredEvent(
    ConversationId conversationId,
    MessageId messageId,
    UserId recipientId,
    Instant deliveredAt
) implements DomainEvent {}

public record MessagesReadEvent(
    ConversationId conversationId,
    UserId readerId,
    List<MessageId> messageIds,
    Instant readAt
) implements DomainEvent {}

public record TypingStartedEvent(
    ConversationId conversationId,
    UserId userId,
    UserId recipientId,
    Instant startedAt
) implements DomainEvent {}

public record TypingStoppedEvent(
    ConversationId conversationId,
    UserId userId,
    UserId recipientId,
    Instant stoppedAt
) implements DomainEvent {}

public record MessageDeletedEvent(
    ConversationId conversationId,
    MessageId messageId,
    UserId deleterId,
    Instant deletedAt
) implements DomainEvent {}
```

---

## 📋 Business Rules

### BR-MSG-001: Same Profession Only

```
Rule: Users can only message others from same profession
Enforcement: ConversationAccessPolicy.validateAccess()
Exception: DifferentProfessionException
```

### BR-MSG-002: No Self-Messaging

```
Rule: User cannot message themselves
Enforcement: Conversation.start()
Exception: CannotMessageSelfException
```

### BR-MSG-003: Blocked Users

```
Rule: Blocked users cannot message each other
Enforcement: ConversationAccessPolicy.validateAccess()
Exception: UserBlockedException
```

### BR-MSG-004: Message Length

```
Rule: Message max 1000 characters
Enforcement: Message.create()
Exception: MessageTooLongException
```

### BR-MSG-005: Rate Limiting

```
Rule:
  - Max 60 messages/minute per user
  - Max 10 messages/minute per conversation
Enforcement: MessageRateLimiter
Exception: RateLimitException
```

### BR-MSG-006: Delete Own Messages

```
Rule: Only sender can delete their messages
Enforcement: Conversation.deleteMessage()
Exception: UnauthorizedDeleteException
```

### BR-MSG-007: Read Receipt

```
Rule: Only recipient can mark messages as read
Enforcement: Conversation.markAsRead()
```

### BR-MSG-008: Typing Indicator Timeout

```
Rule: Typing indicator auto-expires after 30 seconds
Enforcement: WebSocket handler (client-side timeout)
```

---

## 🔗 Integration Points

### Upstream Dependencies

```java
// Identity Context
// Needs: User info, Profession, Blocking status
public interface UserRepository {
    Optional<User> findById(UserId userId);
    Profession getUserProfession(UserId userId);
    boolean hasBlocked(UserId user1, UserId user2);
}
```

### Downstream Consumers

```java
// Notification Context
// Consumes: MessageSentEvent → Send push notification if offline

// WebSocket Handler
// Consumes: MessageSentEvent, TypingStartedEvent, MessagesReadEvent
// → Broadcast to connected clients
```

### External Services

```java
// WebSocket (Infrastructure)
public interface WebSocketMessageBroadcaster {
    void broadcastMessage(UserId recipientId, MessageDTO message);
    void broadcastTypingIndicator(UserId recipientId, boolean isTyping);
    void broadcastReadReceipt(UserId senderId, List<MessageId> messageIds);
}
```

---

## 🛠️ Implementation Guide

### Package Structure

```
messaging/
├── domain/
│   ├── model/
│   │   ├── Conversation.java (Aggregate Root)
│   │   ├── Message.java (Entity)
│   │   ├── ConversationId.java (Value Object)
│   │   ├── MessageId.java (Value Object)
│   │   ├── UnreadCount.java (Value Object)
│   │   ├── OnlineStatus.java (Value Object)
│   │   ├── MessageDeliveryStatus.java (Enum)
│   │   └── ConversationStatus.java (Enum)
│   ├── service/
│   │   ├── ConversationAccessPolicy.java
│   │   └── MessageRateLimiter.java
│   ├── repository/
│   │   └── ConversationRepository.java (Interface)
│   └── event/
│       ├── MessageSentEvent.java
│       ├── TypingStartedEvent.java
│       └── MessagesReadEvent.java
│
├── application/
│   ├── command/
│   │   ├── SendMessageCommand.java
│   │   ├── MarkAsReadCommand.java
│   │   └── StartTypingCommand.java
│   ├── query/
│   │   ├── GetConversationsQuery.java
│   │   └── GetMessagesQuery.java
│   ├── service/
│   │   └── MessagingApplicationService.java
│   └── dto/
│       ├── ConversationDTO.java
│       └── MessageDTO.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── ConversationJpaRepository.java
│   │   └── ConversationRepositoryImpl.java
│   ├── websocket/
│   │   ├── WebSocketConfig.java
│   │   ├── WebSocketHandler.java
│   │   └── MessageBroadcaster.java
│   ├── cache/
│   │   └── OnlineStatusCache.java (Redis)
│   └── event/
│       └── MessagingEventListener.java
│
└── api/
    ├── MessagingController.java
    └── WebSocketController.java
```

### WebSocket Integration

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins("*")
            .withSockJS();
    }
}
```

---

**Complexity:** ⭐⭐⭐ High  
**Lines of Code (estimated):** 1800-2200  
**Implementation Time:** Sprint 7-8 (4 weeks)

**Next:** [06-NOTIFICATION-CONTEXT.md](./06-NOTIFICATION-CONTEXT.md)
