# Notification Context - Multi-channel Notification Delivery

> **Bounded Context:** Notification  
> **Complexity:** ⭐⭐⭐ High (Multi-channel routing)  
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

Multi-channel bildirim yönetimi (in-app, push, email), kullanıcı tercihleri, bildirim geçmişi, delivery tracking.

### Ubiquitous Language

```
Notification: Bildirim (Aggregate Root)
NotificationChannel: IN_APP, PUSH, EMAIL
NotificationType: VERIFICATION, POST_LIKE, COMMENT, MESSAGE, SYSTEM
NotificationPriority: LOW, MEDIUM, HIGH, URGENT
DeliveryStatus: PENDING, SENT, DELIVERED, FAILED, READ
UserPreferences: Kullanıcı bildirim tercihleri
NotificationTemplate: Bildirim şablonu
BatchNotification: Toplu bildirim
```

### Context Boundaries

```
IN SCOPE:
✅ Notification creation
✅ Multi-channel delivery (in-app, push, email)
✅ User notification preferences
✅ Delivery status tracking
✅ Notification history
✅ Read/unread tracking
✅ Batch notifications
✅ Priority-based routing
✅ Template management

OUT OF SCOPE:
❌ User authentication (Identity Context)
❌ Content creation (Social/Messaging Contexts)
❌ Email/Push provider integration details (Infrastructure)
```

---

## 🏗️ Domain Model

### Aggregate: Notification

```java
/**
 * Notification Aggregate Root
 *
 * Business Rules:
 * - Each notification has a type and priority
 * - Multi-channel delivery (in-app + push/email based on preferences)
 * - Failed deliveries retried up to 3 times
 * - Read notifications not shown as unread
 * - Notifications deleted after 30 days
 * - URGENT notifications bypass user preferences
 */
@Entity
@Table(name = "notifications")
public class Notification extends AggregateRoot {

    @EmbeddedId
    private NotificationId id;

    @Embedded
    private UserId recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Column(name = "message", length = 500, nullable = false)
    private String message;

    @Column(name = "action_url")
    private String actionUrl;

    @Embedded
    private NotificationData data;

    @ElementCollection
    @CollectionTable(
        name = "notification_deliveries",
        joinColumns = @JoinColumn(name = "notification_id")
    )
    private Set<ChannelDelivery> deliveries = new HashSet<>();

    @Column(name = "is_read")
    private boolean isRead;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Create new notification
     */
    public static Notification create(
        UserId recipientId,
        NotificationType type,
        NotificationPriority priority,
        String title,
        String message,
        String actionUrl,
        NotificationData data
    ) {
        // Validation
        if (title.length() > 100) {
            throw new TitleTooLongException("Title max 100 characters");
        }

        if (message.length() > 500) {
            throw new MessageTooLongException("Message max 500 characters");
        }

        Notification notification = new Notification();
        notification.id = NotificationId.generate();
        notification.recipientId = recipientId;
        notification.type = type;
        notification.priority = priority;
        notification.title = title;
        notification.message = message;
        notification.actionUrl = actionUrl;
        notification.data = data;
        notification.isRead = false;
        notification.createdAt = Instant.now();
        notification.expiresAt = Instant.now().plus(Duration.ofDays(30));

        notification.registerEvent(new NotificationCreatedEvent(
            notification.id,
            recipientId,
            type,
            priority
        ));

        return notification;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Schedule delivery to channel
     */
    public void scheduleDelivery(NotificationChannel channel) {
        ChannelDelivery delivery = new ChannelDelivery(
            channel,
            DeliveryStatus.PENDING,
            0, // attempt count
            null,
            null
        );

        deliveries.add(delivery);

        registerEvent(new NotificationDeliveryScheduledEvent(
            this.id,
            this.recipientId,
            channel
        ));
    }

    /**
     * Mark delivery as sent
     */
    public void markAsSent(NotificationChannel channel) {
        deliveries.stream()
            .filter(d -> d.channel() == channel)
            .findFirst()
            .ifPresent(delivery -> {
                ChannelDelivery updated = new ChannelDelivery(
                    delivery.channel(),
                    DeliveryStatus.SENT,
                    delivery.attemptCount() + 1,
                    Instant.now(),
                    null
                );
                deliveries.remove(delivery);
                deliveries.add(updated);
            });

        registerEvent(new NotificationSentEvent(
            this.id,
            channel
        ));
    }

    /**
     * Mark delivery as delivered
     */
    public void markAsDelivered(NotificationChannel channel) {
        deliveries.stream()
            .filter(d -> d.channel() == channel)
            .findFirst()
            .ifPresent(delivery -> {
                ChannelDelivery updated = new ChannelDelivery(
                    delivery.channel(),
                    DeliveryStatus.DELIVERED,
                    delivery.attemptCount(),
                    delivery.sentAt(),
                    Instant.now()
                );
                deliveries.remove(delivery);
                deliveries.add(updated);
            });
    }

    /**
     * Mark delivery as failed
     * Business rule: Retry up to 3 times
     */
    public void markAsFailed(NotificationChannel channel, String errorMessage) {
        deliveries.stream()
            .filter(d -> d.channel() == channel)
            .findFirst()
            .ifPresent(delivery -> {
                int attempts = delivery.attemptCount() + 1;

                ChannelDelivery updated = new ChannelDelivery(
                    delivery.channel(),
                    attempts < 3 ? DeliveryStatus.PENDING : DeliveryStatus.FAILED,
                    attempts,
                    delivery.sentAt(),
                    null
                );
                deliveries.remove(delivery);
                deliveries.add(updated);

                if (attempts < 3) {
                    // Schedule retry
                    registerEvent(new NotificationDeliveryRetryEvent(
                        this.id,
                        channel,
                        attempts
                    ));
                } else {
                    // Max retries exceeded
                    registerEvent(new NotificationDeliveryFailedEvent(
                        this.id,
                        channel,
                        errorMessage
                    ));
                }
            });
    }

    /**
     * Mark notification as read
     */
    public void markAsRead() {
        if (this.isRead) {
            return; // Already read
        }

        this.isRead = true;
        this.readAt = Instant.now();

        registerEvent(new NotificationReadEvent(
            this.id,
            this.recipientId
        ));
    }

    /**
     * Check if notification is expired
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    /**
     * Check if all deliveries completed
     */
    public boolean isFullyDelivered() {
        return deliveries.stream()
            .allMatch(d -> d.status() == DeliveryStatus.DELIVERED
                       || d.status() == DeliveryStatus.FAILED);
    }
}
```

### Value Objects

```java
/**
 * Channel Delivery Value Object
 */
@Embeddable
public record ChannelDelivery(
    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    NotificationChannel channel,

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    DeliveryStatus status,

    @Column(name = "attempt_count")
    int attemptCount,

    @Column(name = "sent_at")
    Instant sentAt,

    @Column(name = "delivered_at")
    Instant deliveredAt
) {
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChannelDelivery other)) return false;
        return channel == other.channel;
    }

    @Override
    public int hashCode() {
        return channel.hashCode();
    }
}

/**
 * Notification Data Value Object
 * Contains type-specific metadata
 */
@Embeddable
public class NotificationData {

    @Column(name = "post_id")
    private UUID postId;

    @Column(name = "comment_id")
    private UUID commentId;

    @Column(name = "message_id")
    private UUID messageId;

    @Column(name = "verification_id")
    private UUID verificationId;

    @Column(name = "actor_id") // User who triggered the notification
    private UUID actorId;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "actor_profile_image")
    private String actorProfileImage;

    // Factory methods
    public static NotificationData forPostLike(UUID postId, UUID actorId, String actorName) {
        NotificationData data = new NotificationData();
        data.postId = postId;
        data.actorId = actorId;
        data.actorName = actorName;
        return data;
    }

    public static NotificationData forComment(
        UUID postId,
        UUID commentId,
        UUID actorId,
        String actorName
    ) {
        NotificationData data = new NotificationData();
        data.postId = postId;
        data.commentId = commentId;
        data.actorId = actorId;
        data.actorName = actorName;
        return data;
    }

    public static NotificationData forMessage(
        UUID messageId,
        UUID actorId,
        String actorName
    ) {
        NotificationData data = new NotificationData();
        data.messageId = messageId;
        data.actorId = actorId;
        data.actorName = actorName;
        return data;
    }

    public static NotificationData forVerification(UUID verificationId) {
        NotificationData data = new NotificationData();
        data.verificationId = verificationId;
        return data;
    }
}

/**
 * User Notification Preferences Value Object
 */
@Embeddable
public class NotificationPreferences {

    @Column(name = "in_app_enabled")
    private boolean inAppEnabled;

    @Column(name = "push_enabled")
    private boolean pushEnabled;

    @Column(name = "email_enabled")
    private boolean emailEnabled;

    @Column(name = "post_likes_enabled")
    private boolean postLikesEnabled;

    @Column(name = "comments_enabled")
    private boolean commentsEnabled;

    @Column(name = "messages_enabled")
    private boolean messagesEnabled;

    @Column(name = "verification_enabled")
    private boolean verificationEnabled;

    @Column(name = "system_enabled")
    private boolean systemEnabled;

    // Default preferences
    public static NotificationPreferences defaults() {
        NotificationPreferences prefs = new NotificationPreferences();
        prefs.inAppEnabled = true;
        prefs.pushEnabled = true;
        prefs.emailEnabled = true;
        prefs.postLikesEnabled = true;
        prefs.commentsEnabled = true;
        prefs.messagesEnabled = true;
        prefs.verificationEnabled = true;
        prefs.systemEnabled = true;
        return prefs;
    }

    /**
     * Check if notification type is enabled
     */
    public boolean isTypeEnabled(NotificationType type) {
        return switch (type) {
            case POST_LIKE -> postLikesEnabled;
            case COMMENT -> commentsEnabled;
            case MESSAGE -> messagesEnabled;
            case VERIFICATION -> verificationEnabled;
            case SYSTEM -> systemEnabled;
        };
    }

    /**
     * Get enabled channels
     */
    public Set<NotificationChannel> getEnabledChannels() {
        Set<NotificationChannel> channels = new HashSet<>();
        if (inAppEnabled) channels.add(NotificationChannel.IN_APP);
        if (pushEnabled) channels.add(NotificationChannel.PUSH);
        if (emailEnabled) channels.add(NotificationChannel.EMAIL);
        return channels;
    }
}
```

### Enums

```java
public enum NotificationType {
    VERIFICATION,  // Verification approved/rejected
    POST_LIKE,     // Post liked
    COMMENT,       // Comment on post
    MESSAGE,       // New chat message
    SYSTEM         // System announcements
}

public enum NotificationPriority {
    LOW,      // Can be batched
    MEDIUM,   // Send immediately
    HIGH,     // Important, bypass some preferences
    URGENT    // Critical, bypass all preferences
}

public enum NotificationChannel {
    IN_APP,   // In-app notification (database)
    PUSH,     // Push notification (mobile)
    EMAIL     // Email notification
}

public enum DeliveryStatus {
    PENDING,
    SENT,
    DELIVERED,
    FAILED,
    READ
}
```

---

## 🛠️ Domain Services

### NotificationRoutingService

```java
/**
 * Domain Service: Multi-channel routing logic
 *
 * Business rules:
 * - URGENT notifications bypass user preferences
 * - HIGH priority delivered to all enabled channels
 * - MEDIUM/LOW respect user preferences
 * - In-app always enabled
 */
@Service
public class NotificationRoutingService {

    private final UserRepository userRepository;

    /**
     * Determine delivery channels based on preferences and priority
     */
    public Set<NotificationChannel> determineChannels(
        UserId recipientId,
        NotificationType type,
        NotificationPriority priority
    ) {
        // IN_APP always included
        Set<NotificationChannel> channels = new HashSet<>();
        channels.add(NotificationChannel.IN_APP);

        // URGENT: All channels
        if (priority == NotificationPriority.URGENT) {
            channels.add(NotificationChannel.PUSH);
            channels.add(NotificationChannel.EMAIL);
            return channels;
        }

        // Get user preferences
        User user = userRepository.findById(recipientId)
            .orElseThrow(() -> new UserNotFoundException(recipientId));

        NotificationPreferences prefs = user.getNotificationPreferences();

        // Check if notification type is enabled
        if (!prefs.isTypeEnabled(type)) {
            return Set.of(NotificationChannel.IN_APP); // Only in-app
        }

        // HIGH: All enabled channels
        if (priority == NotificationPriority.HIGH) {
            channels.addAll(prefs.getEnabledChannels());
            return channels;
        }

        // MEDIUM/LOW: Respect preferences
        channels.addAll(prefs.getEnabledChannels());

        return channels;
    }
}
```

### NotificationTemplateService

```java
/**
 * Domain Service: Notification template rendering
 */
public class NotificationTemplateService {

    /**
     * Generate notification content from template
     */
    public NotificationContent generate(
        NotificationType type,
        NotificationData data
    ) {
        return switch (type) {
            case POST_LIKE -> generatePostLike(data);
            case COMMENT -> generateComment(data);
            case MESSAGE -> generateMessage(data);
            case VERIFICATION -> generateVerification(data);
            case SYSTEM -> generateSystem(data);
        };
    }

    private NotificationContent generatePostLike(NotificationData data) {
        String title = "Yeni Beğeni";
        String message = String.format(
            "%s paylaşımınızı beğendi",
            data.getActorName()
        );
        String actionUrl = "/posts/" + data.getPostId();

        return new NotificationContent(title, message, actionUrl);
    }

    private NotificationContent generateComment(NotificationData data) {
        String title = "Yeni Yorum";
        String message = String.format(
            "%s paylaşımınıza yorum yaptı",
            data.getActorName()
        );
        String actionUrl = "/posts/" + data.getPostId() + "/comments/" + data.getCommentId();

        return new NotificationContent(title, message, actionUrl);
    }

    private NotificationContent generateMessage(NotificationData data) {
        String title = "Yeni Mesaj";
        String message = String.format(
            "%s size mesaj gönderdi",
            data.getActorName()
        );
        String actionUrl = "/messages/" + data.getMessageId();

        return new NotificationContent(title, message, actionUrl);
    }

    private NotificationContent generateVerification(NotificationData data) {
        String title = "Doğrulama Sonucu";
        String message = "Meslek doğrulama talebiniz işleme alındı";
        String actionUrl = "/verification/" + data.getVerificationId();

        return new NotificationContent(title, message, actionUrl);
    }

    private NotificationContent generateSystem(NotificationData data) {
        String title = "Sistem Bildirimi";
        String message = "Önemli bir güncelleme var";
        String actionUrl = "/announcements";

        return new NotificationContent(title, message, actionUrl);
    }
}

record NotificationContent(String title, String message, String actionUrl) {}
```

### NotificationBatchService

```java
/**
 * Domain Service: Batch notification aggregation
 *
 * Business rules:
 * - LOW priority notifications can be batched
 * - Batch sent every 15 minutes or when 10 notifications accumulated
 */
public class NotificationBatchService {

    /**
     * Check if notifications should be batched
     */
    public boolean shouldBatch(
        NotificationType type,
        NotificationPriority priority
    ) {
        // Only LOW priority can be batched
        if (priority != NotificationPriority.LOW) {
            return false;
        }

        // Some types never batched
        return type != NotificationType.VERIFICATION
            && type != NotificationType.SYSTEM;
    }

    /**
     * Create batch notification from individual notifications
     */
    public Notification createBatch(List<Notification> notifications) {
        UserId recipientId = notifications.get(0).getRecipientId();

        String title = String.format(
            "%d yeni bildiriminiz var",
            notifications.size()
        );

        String message = notifications.stream()
            .map(Notification::getMessage)
            .limit(3)
            .collect(Collectors.joining(", "));

        return Notification.create(
            recipientId,
            NotificationType.SYSTEM,
            NotificationPriority.LOW,
            title,
            message,
            "/notifications",
            new NotificationData()
        );
    }
}
```

---

## 📨 Domain Events

```java
public record NotificationCreatedEvent(
    NotificationId notificationId,
    UserId recipientId,
    NotificationType type,
    NotificationPriority priority,
    Instant createdAt
) implements DomainEvent {}

public record NotificationDeliveryScheduledEvent(
    NotificationId notificationId,
    UserId recipientId,
    NotificationChannel channel,
    Instant scheduledAt
) implements DomainEvent {}

public record NotificationSentEvent(
    NotificationId notificationId,
    NotificationChannel channel,
    Instant sentAt
) implements DomainEvent {}

public record NotificationDeliveryFailedEvent(
    NotificationId notificationId,
    NotificationChannel channel,
    String errorMessage,
    Instant failedAt
) implements DomainEvent {}

public record NotificationReadEvent(
    NotificationId notificationId,
    UserId recipientId,
    Instant readAt
) implements DomainEvent {}
```

---

## 📋 Business Rules

### BR-NOT-001: Multi-channel Delivery

```
Rule: Notifications delivered to multiple channels based on preferences
Channels: IN_APP (always), PUSH, EMAIL (based on preferences)
Enforcement: NotificationRoutingService
```

### BR-NOT-002: Priority Override

```
Rule: URGENT priority bypasses user preferences, delivers to all channels
Enforcement: NotificationRoutingService.determineChannels()
```

### BR-NOT-003: Delivery Retry

```
Rule: Failed deliveries retried up to 3 times
Enforcement: Notification.markAsFailed()
```

### BR-NOT-004: Notification Expiry

```
Rule: Notifications deleted after 30 days
Enforcement: Notification.expiresAt + Scheduled job
```

### BR-NOT-005: Batch Aggregation

```
Rule: LOW priority notifications batched (max 10 or 15 minutes)
Enforcement: NotificationBatchService
```

### BR-NOT-006: Type Filtering

```
Rule: Users can disable specific notification types
Enforcement: NotificationPreferences.isTypeEnabled()
```

---

## 🔗 Integration Points

### Upstream Event Consumers

```java
// Listens to events from other contexts
@Component
public class NotificationEventListener {

    @EventListener
    @Async
    public void onPostLiked(PostLikedEvent event) {
        // Create POST_LIKE notification
    }

    @EventListener
    @Async
    public void onCommentAdded(CommentAddedEvent event) {
        // Create COMMENT notification
    }

    @EventListener
    @Async
    public void onMessageSent(MessageSentEvent event) {
        // Create MESSAGE notification
    }

    @EventListener
    @Async
    public void onVerificationApproved(VerificationApprovedEvent event) {
        // Create VERIFICATION notification
    }
}
```

### External Services (Anti-Corruption Layer)

```java
// Push Notification Provider (e.g., Firebase)
public interface PushNotificationProvider {
    void sendPush(UserId userId, String title, String message);
}

// Email Provider (AWS SES)
public interface EmailProvider {
    void sendEmail(Email email, String subject, String body);
}
```

---

## 🛠️ Implementation Guide

### Package Structure

```
notification/
├── domain/
│   ├── model/
│   │   ├── Notification.java (Aggregate Root)
│   │   ├── NotificationId.java (Value Object)
│   │   ├── ChannelDelivery.java (Value Object)
│   │   ├── NotificationData.java (Value Object)
│   │   ├── NotificationPreferences.java (Value Object)
│   │   ├── NotificationType.java (Enum)
│   │   ├── NotificationPriority.java (Enum)
│   │   ├── NotificationChannel.java (Enum)
│   │   └── DeliveryStatus.java (Enum)
│   ├── service/
│   │   ├── NotificationRoutingService.java
│   │   ├── NotificationTemplateService.java
│   │   └── NotificationBatchService.java
│   ├── repository/
│   │   └── NotificationRepository.java (Interface)
│   └── event/
│       ├── NotificationCreatedEvent.java
│       ├── NotificationSentEvent.java
│       └── NotificationReadEvent.java
│
├── application/
│   ├── command/
│   │   ├── SendNotificationCommand.java
│   │   └── MarkAsReadCommand.java
│   ├── query/
│   │   ├── GetUnreadNotificationsQuery.java
│   │   └── GetNotificationHistoryQuery.java
│   ├── service/
│   │   └── NotificationApplicationService.java
│   └── dto/
│       ├── NotificationDTO.java
│       └── NotificationPreferencesDTO.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── NotificationJpaRepository.java
│   │   └── NotificationRepositoryImpl.java
│   ├── provider/
│   │   ├── FirebasePushProvider.java
│   │   └── AWSSESEmailProvider.java
│   └── event/
│       └── NotificationEventListener.java
│
└── api/
    └── NotificationController.java
```

---

**Complexity:** ⭐⭐⭐ High  
**Lines of Code (estimated):** 1600-2000  
**Implementation Time:** Sprint 9-10 (3 weeks)

**Next:** [07-MODERATION-CONTEXT.md](./07-MODERATION-CONTEXT.md)
