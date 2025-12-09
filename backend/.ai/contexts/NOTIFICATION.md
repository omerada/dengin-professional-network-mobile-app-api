# Notification Context - Multi-Channel Notifications

## Overview

Çok kanallı bildirim sistemi: Push (FCM), In-App, Email. Kullanıcı tercihleri ile özelleştirilebilir.

---

## Domain Model

### Notification (Aggregate Root)

```java
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_created", columnList = "user_id, created_at DESC"),
    @Index(name = "idx_user_unread", columnList = "user_id, status, created_at DESC")
})
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Convert(converter = JsonConverter.class)
    @Column(columnDefinality = "JSONB")
    private Map<String, String> metadata;  // postId, commentId, etc.

    @Enumerated(EnumType.STRING)
    private NotificationStatus status;  // UNREAD, READ, ARCHIVED

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private Set<DeliveryChannel> deliveredChannels = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime readAt;
}
```

### NotificationType (Enum)

```java
public enum NotificationType {
    // Social
    POST_LIKE("Birisi gönderini beğendi", "social", true),
    COMMENT("Gönderine yorum yapıldı", "social", true),
    COMMENT_REPLY("Yorumuna yanıt verildi", "social", true),
    POST_MENTION("Bir gönderide bahsedildin", "social", true),

    // Messaging
    MESSAGE("Yeni mesaj", "messaging", false),  // Not optional

    // Verification
    VERIFICATION_STATUS("Doğrulama durumu güncellendi", "system", false),

    // Moderation
    POST_REMOVED("Gönderen kaldırıldı", "moderation", false),
    ACCOUNT_WARNING("Hesap uyarısı", "moderation", false),
    ACCOUNT_SUSPENDED("Hesap askıya alındı", "moderation", false);

    private final String displayName;
    private final String category;
    private final boolean optional;  // Can user disable?
}
```

### DeliveryChannel (Enum)

```java
public enum DeliveryChannel {
    PUSH,      // Firebase FCM
    IN_APP,    // Stored in DB
    EMAIL      // Mailgun
}
```

### NotificationPreferences (Entity)

```java
@Entity
@Table(name = "notification_preferences")
public class NotificationPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long userId;

    // Global settings
    private Boolean pushEnabled = true;
    private Boolean emailEnabled = true;

    // Type-specific settings (JSON)
    @Convert(converter = JsonConverter.class)
    @Column(columnDefinality = "JSONB")
    private Map<NotificationType, Set<DeliveryChannel>> typeSettings;

    // Defaults
    public NotificationPreferences() {
        typeSettings = new HashMap<>();
        // Default: All types via PUSH and IN_APP
        for (NotificationType type : NotificationType.values()) {
            typeSettings.put(type, Set.of(DeliveryChannel.PUSH, DeliveryChannel.IN_APP));
        }
    }
}
```

---

## API Endpoints

### Get Notifications

```java
GET /api/notifications?page=0&size=20&status=UNREAD

// Response
{
  "content": [
    {
      "id": "uuid-123",
      "type": "POST_LIKE",
      "title": "Yeni beğeni",
      "message": "Dr. Ayşe gönderini beğendi",
      "metadata": {
        "postId": "456",
        "likerId": "5"
      },
      "status": "UNREAD",
      "createdAt": "2025-12-09T15:30:00Z"
    }
  ],
  "page": 0,
  "totalElements": 25,
  "unreadCount": 10
}
```

### Mark as Read

```java
PUT /api/notifications/{id}/read

// Response
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All as Read

```java
PUT /api/notifications/read-all

// Marks all UNREAD → READ
```

### Delete Notification

```java
DELETE /api/notifications/{id}

// Soft delete: status = ARCHIVED
```

---

### Preferences Management

#### Get Preferences

```java
GET /api/notifications/preferences

// Response
{
  "userId": 1,
  "pushEnabled": true,
  "emailEnabled": false,
  "typeSettings": {
    "POST_LIKE": ["PUSH", "IN_APP"],
    "COMMENT": ["PUSH", "IN_APP", "EMAIL"],
    "MESSAGE": ["PUSH", "IN_APP"],
    "VERIFICATION_STATUS": ["PUSH", "IN_APP", "EMAIL"]
  },
  "availableTypes": [
    {
      "type": "POST_LIKE",
      "displayName": "Birisi gönderini beğendi",
      "category": "social",
      "optional": true
    }
  ]
}
```

#### Update Preferences

```java
PUT /api/notifications/preferences

{
  "pushEnabled": true,
  "emailEnabled": false,
  "typeSettings": {
    "POST_LIKE": ["IN_APP"],  // Disable push for likes
    "COMMENT": ["PUSH", "IN_APP", "EMAIL"],
    "MESSAGE": ["PUSH", "IN_APP"]
  }
}
```

**Validation:**

- System notifications (VERIFICATION_STATUS, ACCOUNT_WARNING) cannot be fully disabled
- At least IN_APP must be enabled for all types

---

## Notification Flow

### 1. Create Notification

```java
@Service
public class NotificationService {

    public void sendNotification(
        Long userId,
        NotificationType type,
        Map<String, String> metadata
    ) {
        // 1. Check user preferences
        NotificationPreferences prefs = preferencesRepository.findByUserId(userId)
            .orElse(createDefaultPreferences(userId));

        Set<DeliveryChannel> channels = prefs.getEnabledChannels(type);

        // 2. Create in-app notification (always)
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(type.getDisplayName());
        notification.setMessage(buildMessage(type, metadata));
        notification.setMetadata(metadata);
        notification.setStatus(NotificationStatus.UNREAD);

        notificationRepository.save(notification);

        // 3. Send via channels
        if (channels.contains(DeliveryChannel.PUSH) && prefs.isPushEnabled()) {
            pushService.send(userId, notification);
        }

        if (channels.contains(DeliveryChannel.EMAIL) && prefs.isEmailEnabled()) {
            emailService.send(userId, notification);
        }

        // 4. Publish real-time event (WebSocket)
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            notification
        );
    }
}
```

### 2. Push Notification (FCM)

```java
@Service
public class FCMPushNotificationService {

    public void send(Long userId, Notification notification) {
        // Get user's device tokens
        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(userId);

        if (tokens.isEmpty()) {
            log.info("No device tokens for user {}", userId);
            return;
        }

        // Build FCM message
        MulticastMessage message = MulticastMessage.builder()
            .setNotification(
                com.google.firebase.messaging.Notification.builder()
                    .setTitle(notification.getTitle())
                    .setBody(notification.getMessage())
                    .build()
            )
            .putData("notificationId", notification.getId().toString())
            .putData("type", notification.getType().name())
            .putAllData(notification.getMetadata())
            .addAllTokens(tokens.stream().map(DeviceToken::getToken).toList())
            .build();

        // Send
        BatchResponse response = firebaseMessaging.sendMulticast(message);

        // Handle failures (remove invalid tokens)
        if (response.getFailureCount() > 0) {
            handleFailedTokens(tokens, response);
        }
    }
}
```

### 3. Email Notification (Mailgun)

```java
@Service
public class MailgunEmailService {

    public void send(Long userId, Notification notification) {
        User user = userRepository.findById(userId).orElseThrow();

        // Don't send email for unverified users
        if (!user.isVerified()) {
            return;
        }

        // Build email
        EmailRequest email = EmailRequest.builder()
            .to(user.getEmail())
            .subject(notification.getTitle())
            .html(buildHtmlTemplate(notification))
            .build();

        // Send via Mailgun API
        mailgunClient.send(email);
    }
}
```

---

## Business Rules

### Notification Creation

1. **Deduplication**: Don't create duplicate notifications within 5 minutes

   ```java
   Optional<Notification> existing = notificationRepository.findDuplicate(
       userId, type, metadata, LocalDateTime.now().minusMinutes(5)
   );
   if (existing.isPresent()) return;
   ```

2. **Rate Limiting**: Max 100 notifications per user per hour

3. **Batch Notifications**: Group similar notifications
   ```
   "Dr. Ayşe and 5 others liked your post"
   instead of 6 separate notifications
   ```

### User Preferences

1. System notifications cannot be fully disabled
2. At least one channel must be enabled
3. Default: all notifications via PUSH + IN_APP

### Push Tokens

1. User can have multiple devices (iOS, Android)
2. Invalid tokens auto-removed after FCM failure
3. Tokens expire after 90 days of inactivity

---

## Service Layer

### NotificationService

```java
@Service
@Transactional
public class NotificationService {

    // Create notification
    public NotificationResponse send(
        Long userId,
        NotificationType type,
        Map<String, String> metadata
    );

    // Query notifications
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(
        Long userId,
        NotificationStatus status,
        Pageable pageable
    );

    // Mark as read
    public void markAsRead(UUID notificationId, Long userId);

    public void markAllAsRead(Long userId);

    // Preferences
    public NotificationPreferencesResponse getPreferences(Long userId);

    public NotificationPreferencesResponse updatePreferences(
        Long userId,
        UpdatePreferencesRequest request
    );
}
```

---

## Repository Methods

```java
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status = :status")
    Page<Notification> findByUserIdAndStatus(
        @Param("userId") Long userId,
        @Param("status") NotificationStatus status,
        Pageable pageable
    );

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.status = 'UNREAD'")
    long countUnread(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.status = 'UNREAD'")
    void markAllAsRead(@Param("userId") Long userId);

    // Deduplication check
    @Query("""
        SELECT n FROM Notification n
        WHERE n.userId = :userId
        AND n.type = :type
        AND n.metadata = :metadata
        AND n.createdAt > :since
    """)
    Optional<Notification> findDuplicate(
        @Param("userId") Long userId,
        @Param("type") NotificationType type,
        @Param("metadata") Map<String, String> metadata,
        @Param("since") LocalDateTime since
    );
}
```

---

## Integration Points

### → Social Context

```java
// Post liked
notificationService.send(
    post.getAuthorId(),
    NotificationType.POST_LIKE,
    Map.of("postId", postId, "likerId", userId)
);

// Comment added
notificationService.send(
    post.getAuthorId(),
    NotificationType.COMMENT,
    Map.of("postId", postId, "commentId", commentId)
);
```

### → Messaging Context

```java
// New message
notificationService.send(
    message.getRecipientId(),
    NotificationType.MESSAGE,
    Map.of("conversationId", conversationId, "senderId", senderId)
);
```

### → Verification Context

```java
// Verification approved
notificationService.send(
    verification.getUserId(),
    NotificationType.VERIFICATION_STATUS,
    Map.of("status", "APPROVED")
);
```

---

## Real-Time Delivery (WebSocket)

```java
@Configuration
public class WebSocketNotificationConfig {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendRealTimeNotification(Long userId, Notification notification) {
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            notification
        );
    }
}
```

**Client-Side:**

```javascript
stompClient.subscribe("/user/queue/notifications", (notification) => {
  const data = JSON.parse(notification.body);
  // Show toast/banner
  showNotificationBanner(data);
  // Update badge count
  updateUnreadCount();
});
```

---

## Performance Optimizations

### 1. Batch Push Sending

```java
// Send to up to 500 devices in one FCM call
List<List<String>> batches = partition(tokens, 500);
batches.forEach(batch -> fcm.sendMulticast(batch));
```

### 2. Async Processing

```java
@Async
public void sendNotification(Long userId, NotificationType type) {
    // Runs in background thread pool
}
```

### 3. Caching Preferences

```java
@Cacheable(value = "notification-preferences", key = "#userId")
public NotificationPreferences getPreferences(Long userId) {
    return preferencesRepository.findByUserId(userId)
        .orElse(createDefault(userId));
}
```

### 4. Pagination

```java
// Never load all notifications
Pageable pageable = PageRequest.of(page, 20);
```

---

## Common Errors

```java
NOTIFICATION_NOT_FOUND (404)
→ Invalid notification ID

NOT_NOTIFICATION_OWNER (403)
→ Can only read/update own notifications

INVALID_DEVICE_TOKEN (400)
→ FCM token format invalid

EMAIL_NOT_VERIFIED (400)
→ Cannot send email to unverified address

PREFERENCES_LOCKED (400)
→ System notifications cannot be disabled

RATE_LIMIT_EXCEEDED (429)
→ Too many notifications
```

---

## Testing

```java
@SpringBootTest
@Transactional
class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @MockBean
    private FCMPushNotificationService pushService;

    @Test
    void shouldSendNotificationToPreferredChannels() {
        // Given
        User user = createUser();
        NotificationPreferences prefs = new NotificationPreferences();
        prefs.setTypeSettings(Map.of(
            NotificationType.POST_LIKE, Set.of(DeliveryChannel.PUSH, DeliveryChannel.IN_APP)
        ));

        // When
        notificationService.send(
            user.getId(),
            NotificationType.POST_LIKE,
            Map.of("postId", "123")
        );

        // Then
        verify(pushService).send(eq(user.getId()), any());
        assertThat(notificationRepository.countUnread(user.getId())).isEqualTo(1);
    }
}
```

---

**Last Updated:** 2025-12-09
