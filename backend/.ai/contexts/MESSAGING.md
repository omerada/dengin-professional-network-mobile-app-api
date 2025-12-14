# Messaging Context - Real-Time Professional Chat

## Overview

Meslek bazlı 1-to-1 gerçek zamanlı mesajlaşma sistemi. WebSocket (STOMP) + Redis pub/sub kullanır.

---

## Domain Model

### Conversation (Aggregate Root)

```java
@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long participant1Id;
    private Long participant2Id;

    @Enumerated(EnumType.STRING)
    private Profession profession;  // Both users must have same profession

    private LocalDateTime lastMessageAt;
    private String lastMessagePreview;  // First 100 chars

    private Boolean archived = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### Message (Entity)

```java
@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_conversation_created", columnList = "conversation_id, created_at DESC")
})
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long conversationId;
    private Long senderId;
    private Long recipientId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String mediaUrl;  // Optional image/file
    private String mediaType; // image/jpeg, application/pdf, etc.

    private Boolean read = false;
    private LocalDateTime readAt;

    private Boolean deleted = false;  // Soft delete

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

## WebSocket Architecture

### STOMP Protocol

```
Client connects to: ws://api.dengin.com/ws
With headers: Authorization: Bearer {JWT}

Subscriptions:
/topic/conversations/{conversationId}  → Receive messages

Send messages to:
/app/chat.send  → Send new message
```

### Flow Diagram

```
Client A                    Backend                     Client B
   |                           |                            |
   |-- CONNECT (JWT) --------->|                            |
   |<-- CONNECTED -------------|                            |
   |                           |<-- CONNECT (JWT) ----------|
   |                           |--- CONNECTED ------------->|
   |                           |                            |
   |-- SUBSCRIBE(/topic/123)-->|                            |
   |                           |<-- SUBSCRIBE(/topic/123)---|
   |                           |                            |
   |-- SEND(message) --------->|                            |
   |                           |--- PUBLISH(message) ------>|
   |                           |--- Save to DB              |
   |                           |--- Increment unread count  |
   |                           |                            |
```

---

## API Endpoints

### REST Endpoints

#### Get Conversations

```java
GET /api/conversations?page=0&size=20
Authorization: Bearer {token}

// Response
{
  "content": [
    {
      "id": 123,
      "participantId": 5,  // Other user
      "participantName": "Dr. Ayşe Demir",
      "participantAvatarUrl": "...",
      "profession": "DOCTOR",
      "lastMessage": "Merhaba, nasılsın?",
      "lastMessageAt": "2025-12-09T14:30:00Z",
      "unreadCount": 3
    }
  ],
  "page": 0,
  "totalElements": 15
}
```

#### Start Conversation

```java
POST /api/conversations

{
  "recipientId": 5
}

// Response
{
  "id": 123,
  "participant1Id": 1,
  "participant2Id": 5,
  "profession": "DOCTOR",
  "createdAt": "2025-12-09T15:00:00Z"
}
```

**Rules:**

- Both users must have same profession
- Cannot start conversation with blocked users
- Duplicate conversations not allowed (returns existing)

#### Get Messages

```java
GET /api/conversations/{id}/messages?page=0&size=50

// Response
{
  "content": [
    {
      "id": 456,
      "conversationId": 123,
      "senderId": 1,
      "content": "Merhaba!",
      "mediaUrl": null,
      "read": true,
      "readAt": "2025-12-09T15:05:00Z",
      "createdAt": "2025-12-09T15:00:00Z"
    }
  ]
}
```

---

### WebSocket Endpoints

#### Send Message

```javascript
// Client-side (JavaScript)
stompClient.send(
  "/app/chat.send",
  {},
  JSON.stringify({
    conversationId: 123,
    content: "Merhaba, nasılsın?",
    mediaUrl: null,
  })
);
```

**Backend Processing:**

```java
@MessageMapping("/chat.send")
public void sendMessage(
    @Payload SendMessageRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // Validate conversation access
    // Save message to DB
    // Publish to Redis
    // Send push notification if recipient offline

    messagingTemplate.convertAndSend(
        "/topic/conversations/" + request.getConversationId(),
        messageResponse
    );
}
```

#### Subscribe to Conversation

```javascript
stompClient.subscribe("/topic/conversations/123", (message) => {
  const data = JSON.parse(message.body);
  // Display message in UI
});
```

#### Mark as Read

```javascript
stompClient.send(
  "/app/chat.markRead",
  {},
  JSON.stringify({
    conversationId: 123,
    messageId: 456,
  })
);
```

---

## Business Rules

### Conversation Rules

1. Both users must have **same profession**
2. Both users must be **verified** (`profileVerified = true`)
3. Cannot chat with **blocked users**
4. Max **1000 messages** per conversation (older paginated/archived)

### Message Rules

1. Content: 1-5000 characters
2. Media: max 10MB (image/document)
3. Cannot send to deleted conversations
4. Cannot edit messages (delete + resend instead)

### Read Receipts

```java
// Automatic on message fetch
GET /api/conversations/{id}/messages
→ Marks all messages as read

// Manual via WebSocket
/app/chat.markRead → Marks specific message
```

### Typing Indicators

```javascript
// Send typing status
stompClient.send(
  "/app/chat.typing",
  {},
  JSON.stringify({
    conversationId: 123,
    typing: true, // or false
  })
);

// Receive typing status
stompClient.subscribe("/topic/conversations/123/typing", (status) => {
  // Show "User is typing..." indicator
});
```

---

## Service Layer

### ConversationService

```java
@Service
@Transactional
public class ConversationService {

    public ConversationResponse startConversation(Long userId, Long recipientId) {
        // Validate same profession
        User user = userRepository.findById(userId).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();

        if (user.getProfession() != recipient.getProfession()) {
            throw new BusinessException(
                "Can only chat with same profession",
                "PROFESSION_MISMATCH"
            );
        }

        // Check for existing conversation
        Optional<Conversation> existing = conversationRepository
            .findByParticipants(userId, recipientId);

        if (existing.isPresent()) {
            return conversationMapper.toResponse(existing.get());
        }

        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setParticipant1Id(userId);
        conversation.setParticipant2Id(recipientId);
        conversation.setProfession(user.getProfession());

        Conversation saved = conversationRepository.save(conversation);
        return conversationMapper.toResponse(saved);
    }
}
```

### MessageService

```java
@Service
public class MessageService {

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, Long senderId) {
        // Validate conversation access
        Conversation conversation = conversationRepository
            .findById(request.getConversationId())
            .orElseThrow();

        if (!conversation.hasParticipant(senderId)) {
            throw new ForbiddenException("Not a participant");
        }

        // Create message
        Message message = new Message();
        message.setConversationId(request.getConversationId());
        message.setSenderId(senderId);
        message.setRecipientId(conversation.getOtherParticipant(senderId));
        message.setContent(request.getContent());
        message.setMediaUrl(request.getMediaUrl());

        Message saved = messageRepository.save(message);

        // Update conversation
        conversation.setLastMessageAt(LocalDateTime.now());
        conversation.setLastMessagePreview(truncate(request.getContent(), 100));
        conversationRepository.save(conversation);

        // Publish to Redis (for WebSocket distribution)
        redisTemplate.convertAndSend(
            "chat." + conversation.getId(),
            messageMapper.toResponse(saved)
        );

        // Send push notification if recipient offline
        if (!isUserOnline(message.getRecipientId())) {
            notificationService.sendPushNotification(
                message.getRecipientId(),
                NotificationType.MESSAGE,
                Map.of("conversationId", conversation.getId())
            );
        }

        return messageMapper.toResponse(saved);
    }
}
```

---

## WebSocket Configuration

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");  // Broadcast
        config.setApplicationDestinationPrefixes("/app");  // Client → Server
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins("*")
            .withSockJS();
    }
}
```

### JWT Authentication Interceptor

```java
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                UserPrincipal principal = jwtService.validateToken(jwt);
                accessor.setUser(principal);
            }
        }

        return message;
    }
}
```

---

## Redis Integration

### Pub/Sub for Multi-Server Scaling

```java
@Configuration
public class RedisMessageBrokerConfig {

    @Bean
    public RedisMessageListenerContainer redisContainer(
        RedisConnectionFactory factory,
        MessageListenerAdapter adapter
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(factory);
        container.addMessageListener(adapter, new PatternTopic("chat.*"));
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(ChatMessageListener listener) {
        return new MessageListenerAdapter(listener, "onMessage");
    }
}

@Component
public class ChatMessageListener {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void onMessage(String message) {
        MessageResponse msg = objectMapper.readValue(message, MessageResponse.class);

        messagingTemplate.convertAndSend(
            "/topic/conversations/" + msg.getConversationId(),
            msg
        );
    }
}
```

**Why Redis?**

- Enables horizontal scaling (multiple backend servers)
- Message sent to Server A → Redis → All servers → All connected clients

---

## Performance Optimizations

### 1. Pagination

```java
// Load only last 50 messages
Pageable pageable = PageRequest.of(0, 50, Sort.by("createdAt").descending());
```

### 2. Indexes

```sql
CREATE INDEX idx_conversation_created ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_recipient_unread ON messages (recipient_id, read, created_at DESC);
```

### 3. Lazy Loading

```java
// Don't load all 1000 messages at once
@OneToMany(mappedBy = "conversation", fetch = FetchType.LAZY)
private List<Message> messages;
```

### 4. Connection Pooling

```yaml
spring:
  redis:
    lettuce:
      pool:
        max-active: 10
        max-idle: 5
        min-idle: 2
```

---

## Integration Points

### → Notification Context

```java
// Push notification when message sent and user offline
notificationService.send(
    recipientId,
    NotificationType.MESSAGE,
    Map.of("conversationId", id, "senderId", senderId)
);
```

### → Moderation Context

```java
// Users can report messages
reportService.reportMessage(messageId, reason);
```

---

## Common Errors

```java
PROFESSION_MISMATCH (400)
→ Can only chat with same profession

USER_BLOCKED (403)
→ Cannot message blocked users

NOT_A_PARTICIPANT (403)
→ Not part of this conversation

CONVERSATION_NOT_FOUND (404)
→ Invalid conversation ID

MESSAGE_TOO_LONG (400)
→ Max 5000 characters

MEDIA_TOO_LARGE (400)
→ Max 10MB

WEBSOCKET_AUTH_FAILED (401)
→ Invalid JWT token in WebSocket connection
```

---

## Testing

### Integration Test

```java
@SpringBootTest
@AutoConfigureWebTestClient
class ChatIntegrationTest {

    @Autowired
    private WebTestClient webClient;

    @Test
    void shouldSendMessage() {
        // Given
        String token = authenticateUser();
        Long conversationId = createConversation();

        // When
        webClient.post()
            .uri("/api/conversations/{id}/messages", conversationId)
            .header("Authorization", "Bearer " + token)
            .bodyValue(Map.of("content", "Test message"))
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.data.content").isEqualTo("Test message");
    }
}
```

---

**Last Updated:** 2025-12-09
