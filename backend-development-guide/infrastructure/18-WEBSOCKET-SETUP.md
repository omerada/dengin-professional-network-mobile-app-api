# WebSocket Setup Kılavuzu

## 1. Genel Bakış

### 1.1 WebSocket ve STOMP

WebSocket, client-server arasında full-duplex, real-time iletişim sağlar. STOMP (Simple Text Oriented Messaging Protocol), WebSocket üzerinde mesajlaşma protokolüdür.

**Teknoloji Stack:**

```
Spring WebSocket 6.1.x
STOMP Protocol
SockJS (WebSocket fallback)
Redis Pub/Sub (Multi-instance)
```

**Use Cases:**

- Real-time messaging (chat)
- Message delivery notifications
- Typing indicators
- Online/offline status
- New notification alerts

**Architecture:**

```
Client (SockJS + STOMP.js)
    ↓ WebSocket Connection
Spring WebSocket Handler
    ↓ Message Routing
STOMP Broker (Redis)
    ↓ Pub/Sub
Multiple Backend Instances
    ↓ Push
Subscribed Clients
```

### 1.2 STOMP Destinations

**Destination Types:**

```
/app/** : Application prefix (handled by @MessageMapping)
/topic/** : Broadcast (one-to-many)
/queue/** : Point-to-point (one-to-one)
/user/** : User-specific (private)
```

**Meslektaş Destinations:**

```
/app/chat.send : Send message
/app/chat.typing : Typing indicator

/topic/notifications/{userId} : User notifications
/queue/messages/{conversationId} : Conversation messages
/user/queue/private : Private user messages
```

---

## 2. WebSocket Configuration

### 2.1 Dependencies

**pom.xml:**

```xml
<dependencies>
    <!-- WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>

    <!-- Redis (for multi-instance support) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>

    <!-- Jackson for JSON -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

### 2.2 WebSocket Config

**WebSocketConfig:**

```java
package com.meslektas.infrastructure.websocket.config;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${websocket.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for /topic and /queue
        config.enableSimpleBroker("/topic", "/queue", "/user");

        // Application destination prefix
        config.setApplicationDestinationPrefixes("/app");

        // User destination prefix
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
            .setAllowedOrigins(allowedOrigins)
            .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Add interceptor for authentication
        registration.interceptors(new AuthChannelInterceptor());
    }
}
```

**application.yml:**

```yaml
websocket:
  allowed-origins:
    - http://localhost:3000
    - https://app.meslektas.com

  message:
    size-limit: 128KB

  heartbeat:
    client: 10000
    server: 10000
```

### 2.3 Authentication Interceptor

**AuthChannelInterceptor:**

```java
package com.meslektas.infrastructure.websocket.security;

public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    public AuthChannelInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
            message,
            StompHeaderAccessor.class
        );

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Extract JWT token from header
            String token = accessor.getFirstNativeHeader("Authorization");

            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);

                if (jwtTokenProvider.validateToken(token)) {
                    String userId = jwtTokenProvider.getUserIdFromToken(token);

                    // Set user in session
                    accessor.setUser(new StompPrincipal(userId));
                } else {
                    throw new UnauthorizedException("Invalid JWT token");
                }
            } else {
                throw new UnauthorizedException("Missing JWT token");
            }
        }

        return message;
    }
}

public class StompPrincipal implements Principal {

    private final String name;

    public StompPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }
}
```

---

## 3. Message Controllers

### 3.1 Chat Message Controller

**ChatMessageController:**

```java
package com.meslektas.infrastructure.websocket.controller;

@Controller
public class ChatMessageController {

    private final MessagingService messagingService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Client sends message to /app/chat.send
     * Backend broadcasts to /queue/messages/{conversationId}
     */
    @MessageMapping("/chat.send")
    public void sendMessage(
        @Payload ChatMessagePayload payload,
        Principal principal
    ) {
        // Extract sender ID from principal
        UserId senderId = UserId.from(principal.getName());

        // Send message via application service
        SendMessageCommand command = new SendMessageCommand(
            ConversationId.from(payload.conversationId()),
            senderId,
            payload.content()
        );

        MessageId messageId = messagingService.sendMessage(command);

        // Broadcast to conversation subscribers
        ChatMessageResponse response = new ChatMessageResponse(
            messageId.getValue().toString(),
            payload.conversationId(),
            senderId.getValue().toString(),
            payload.content(),
            false,
            Instant.now(),
            null
        );

        messagingTemplate.convertAndSend(
            "/queue/messages/" + payload.conversationId(),
            response
        );
    }

    /**
     * Typing indicator
     */
    @MessageMapping("/chat.typing")
    public void typing(
        @Payload TypingIndicatorPayload payload,
        Principal principal
    ) {
        UserId userId = UserId.from(principal.getName());

        TypingIndicatorResponse response = new TypingIndicatorResponse(
            payload.conversationId(),
            userId.getValue().toString(),
            payload.isTyping()
        );

        // Send to other participant only
        messagingTemplate.convertAndSend(
            "/queue/typing/" + payload.conversationId(),
            response
        );
    }

    /**
     * Mark message as read
     */
    @MessageMapping("/chat.read")
    public void markAsRead(
        @Payload MessageReadPayload payload,
        Principal principal
    ) {
        UserId userId = UserId.from(principal.getName());

        messagingService.markMessageAsRead(
            new MarkMessageAsReadCommand(
                MessageId.from(payload.messageId()),
                userId
            )
        );

        // Notify sender
        MessageReadResponse response = new MessageReadResponse(
            payload.messageId(),
            userId.getValue().toString(),
            Instant.now()
        );

        messagingTemplate.convertAndSend(
            "/queue/read/" + payload.conversationId(),
            response
        );
    }
}
```

**Payloads (Request):**

```java
public record ChatMessagePayload(
    String conversationId,
    String content
) {}

public record TypingIndicatorPayload(
    String conversationId,
    boolean isTyping
) {}

public record MessageReadPayload(
    String conversationId,
    String messageId
) {}
```

**Responses:**

```java
public record ChatMessageResponse(
    String messageId,
    String conversationId,
    String senderId,
    String content,
    boolean isRead,
    Instant sentAt,
    Instant readAt
) {}

public record TypingIndicatorResponse(
    String conversationId,
    String userId,
    boolean isTyping
) {}

public record MessageReadResponse(
    String messageId,
    String userId,
    Instant readAt
) {}
```

### 3.2 Notification Controller

**NotificationController:**

```java
@Controller
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to specific user
     * Triggered by domain events
     */
    @EventListener
    public void onPostLiked(PostLikedEvent event) {
        // Load post author
        Post post = postRepository.findById(event.postId()).orElseThrow();

        // Don't notify if user liked their own post
        if (post.getAuthorId().equals(event.likerId())) {
            return;
        }

        // Create notification
        NotificationResponse notification = new NotificationResponse(
            UUID.randomUUID().toString(),
            "POST_LIKED",
            "Gönderiniz beğenildi",
            event.likerName() + " gönderinizi beğendi",
            new ActorDTO(
                event.likerId().getValue().toString(),
                event.likerName(),
                null
            ),
            Map.of("postId", event.postId().getValue().toString()),
            false,
            Instant.now()
        );

        // Send to user's private queue
        messagingTemplate.convertAndSendToUser(
            post.getAuthorId().getValue().toString(),
            "/queue/notifications",
            notification
        );
    }

    @EventListener
    public void onCommentAdded(CommentAddedEvent event) {
        Post post = postRepository.findById(event.postId()).orElseThrow();

        if (post.getAuthorId().equals(event.commenterId())) {
            return;
        }

        NotificationResponse notification = new NotificationResponse(
            UUID.randomUUID().toString(),
            "COMMENT_ADDED",
            "Yeni yorum",
            event.commenterName() + " gönderinize yorum yaptı",
            new ActorDTO(
                event.commenterId().getValue().toString(),
                event.commenterName(),
                null
            ),
            Map.of(
                "postId", event.postId().getValue().toString(),
                "commentId", event.commentId().getValue().toString()
            ),
            false,
            Instant.now()
        );

        messagingTemplate.convertAndSendToUser(
            post.getAuthorId().getValue().toString(),
            "/queue/notifications",
            notification
        );
    }

    @EventListener
    public void onMessageReceived(MessageSentEvent event) {
        Conversation conversation = conversationRepository
            .findById(event.conversationId())
            .orElseThrow();

        // Get recipient
        UserId recipientId = conversation.getOtherParticipant(event.senderId());

        NotificationResponse notification = new NotificationResponse(
            UUID.randomUUID().toString(),
            "MESSAGE_RECEIVED",
            "Yeni mesaj",
            event.senderName() + " size mesaj gönderdi",
            new ActorDTO(
                event.senderId().getValue().toString(),
                event.senderName(),
                null
            ),
            Map.of("conversationId", event.conversationId().getValue().toString()),
            false,
            Instant.now()
        );

        messagingTemplate.convertAndSendToUser(
            recipientId.getValue().toString(),
            "/queue/notifications",
            notification
        );
    }
}
```

---

## 4. Client Integration

### 4.1 JavaScript Client (SockJS + STOMP)

**Installation:**

```bash
npm install sockjs-client @stomp/stompjs
```

**WebSocket Client:**

```javascript
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class WebSocketClient {
  constructor(jwtToken, userId) {
    this.jwtToken = jwtToken;
    this.userId = userId;
    this.client = null;
    this.subscriptions = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      // Create SockJS connection
      const socket = new SockJS("http://localhost:8080/ws");

      // Create STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,

        connectHeaders: {
          Authorization: `Bearer ${this.jwtToken}`,
        },

        onConnect: () => {
          console.log("WebSocket connected");
          this.subscribeToNotifications();
          resolve();
        },

        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          reject(frame);
        },

        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }

  subscribeToNotifications() {
    const subscription = this.client.subscribe(
      `/user/queue/notifications`,
      (message) => {
        const notification = JSON.parse(message.body);
        this.handleNotification(notification);
      }
    );

    this.subscriptions.set("notifications", subscription);
  }

  subscribeToConversation(conversationId, onMessage) {
    const subscription = this.client.subscribe(
      `/queue/messages/${conversationId}`,
      (message) => {
        const chatMessage = JSON.parse(message.body);
        onMessage(chatMessage);
      }
    );

    this.subscriptions.set(conversationId, subscription);
  }

  unsubscribeFromConversation(conversationId) {
    const subscription = this.subscriptions.get(conversationId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(conversationId);
    }
  }

  sendMessage(conversationId, content) {
    this.client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        conversationId,
        content,
      }),
    });
  }

  sendTypingIndicator(conversationId, isTyping) {
    this.client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        conversationId,
        isTyping,
      }),
    });
  }

  markMessageAsRead(conversationId, messageId) {
    this.client.publish({
      destination: "/app/chat.read",
      body: JSON.stringify({
        conversationId,
        messageId,
      }),
    });
  }

  handleNotification(notification) {
    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.body,
        icon: "/logo.png",
      });
    }

    // Update UI
    this.onNotification?.(notification);
  }
}

export default WebSocketClient;
```

**Usage in React:**

```javascript
import { useEffect, useState } from "react";
import WebSocketClient from "./WebSocketClient";

function Chat({ conversationId, jwtToken, userId }) {
  const [messages, setMessages] = useState([]);
  const [wsClient, setWsClient] = useState(null);

  useEffect(() => {
    // Connect WebSocket
    const client = new WebSocketClient(jwtToken, userId);

    client.connect().then(() => {
      // Subscribe to conversation
      client.subscribeToConversation(conversationId, (message) => {
        setMessages((prev) => [...prev, message]);
      });

      setWsClient(client);
    });

    return () => {
      client.disconnect();
    };
  }, [conversationId, jwtToken, userId]);

  const sendMessage = (content) => {
    wsClient?.sendMessage(conversationId, content);
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.messageId}>{msg.content}</div>
      ))}
    </div>
  );
}
```

---

## 5. Multi-Instance Support (Redis)

### 5.1 Redis Pub/Sub Configuration

**Redis Config:**

```java
@Configuration
@EnableRedisRepositories
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);

        return new LettuceConnectionFactory(config);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(
        RedisConnectionFactory connectionFactory
    ) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

**WebSocket Config with Redis:**

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Use Redis message broker for multi-instance
        config.enableStompBrokerRelay("/topic", "/queue", "/user")
            .setRelayHost("localhost")
            .setRelayPort(61613)  // STOMP port
            .setClientLogin("guest")
            .setClientPasscode("guest");

        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }
}
```

### 5.2 Alternative: Simple Broker with Redis Pub/Sub

**WebSocketMessageBroker:**

```java
@Service
public class WebSocketMessageBroker {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Publish message to Redis (all instances receive)
     */
    public void publishMessage(String destination, Object payload) {
        RedisMessage redisMessage = new RedisMessage(destination, payload);
        redisTemplate.convertAndSend("websocket-messages", redisMessage);
    }

    /**
     * Subscribe to Redis messages
     */
    @RedisListener(topics = "websocket-messages")
    public void onRedisMessage(RedisMessage message) {
        // Forward to WebSocket clients on this instance
        messagingTemplate.convertAndSend(
            message.destination(),
            message.payload()
        );
    }
}
```

---

## 6. Best Practices

### 6.1 Connection Management

```java
@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = headerAccessor.getUser().getName();

        log.info("WebSocket connected: userId={}, sessionId={}", userId, sessionId);

        // Update user online status
        userPresenceService.markOnline(UserId.from(userId));
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = headerAccessor.getUser().getName();

        log.info("WebSocket disconnected: userId={}, sessionId={}", userId, sessionId);

        // Update user offline status
        userPresenceService.markOffline(UserId.from(userId));
    }
}
```

### 6.2 Rate Limiting

```java
@Component
public class WebSocketRateLimiter implements ChannelInterceptor {

    private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
            message,
            StompHeaderAccessor.class
        );

        if (accessor != null && accessor.getCommand() == StompCommand.SEND) {
            String userId = accessor.getUser().getName();

            RateLimiter limiter = limiters.computeIfAbsent(
                userId,
                k -> RateLimiter.create(10.0)  // 10 messages per second
            );

            if (!limiter.tryAcquire()) {
                throw new RateLimitExceededException("Too many messages");
            }
        }

        return message;
    }
}
```

### 6.3 Error Handling

```java
@ControllerAdvice
public class WebSocketExceptionHandler {

    @MessageExceptionHandler
    public void handleException(Exception exception, Principal principal) {
        log.error("WebSocket error for user: {}", principal.getName(), exception);

        // Send error message to client
        ErrorMessage errorMessage = new ErrorMessage(
            exception.getClass().getSimpleName(),
            exception.getMessage()
        );

        messagingTemplate.convertAndSendToUser(
            principal.getName(),
            "/queue/errors",
            errorMessage
        );
    }
}
```

---

## 7. Özet

### WebSocket Implementation:

- **Protocol:** STOMP over WebSocket (SockJS fallback)
- **Authentication:** JWT token in connect headers
- **Destinations:** /app, /topic, /queue, /user
- **Multi-instance:** Redis Pub/Sub

### Features:

- Real-time chat messaging
- Typing indicators
- Message read receipts
- Push notifications
- Online/offline status

### Best Practices:

- ✅ JWT authentication on connect
- ✅ Rate limiting per user
- ✅ Connection lifecycle management
- ✅ Error handling and recovery
- ✅ Redis for multi-instance

### Next:

- **Redis Caching:** 19-REDIS-CACHING.md (Performance optimization)
