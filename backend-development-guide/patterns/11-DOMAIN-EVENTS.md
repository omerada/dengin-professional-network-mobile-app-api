# Domain Event Kılavuzu

## 1. Genel Bakış

### 1.1 Domain Event Nedir?

Domain Event, domain içinde gerçekleşen önemli bir olayı (event) temsil eden immutable nesnelerdir. "Bir şey oldu" (something happened) bilgisini taşırlar ve sistemin diğer parçalarına bu bilgiyi iletirler.

**Temel Özellikler:**

- **Immutable:** Oluşturulduktan sonra değişmez
- **Past Tense:** İsimlendirme geçmiş zaman (UserRegistered, PostLiked, MessageSent)
- **Domain Concept:** İş sürecini temsil eder
- **Eventual Consistency:** Aggregate'ler arası tutarlılık sağlar

**Command vs Event:**

```
Command (İstek):
- Future tense: RegisterUser, LikePost, SendMessage
- Reddedilebilir (validation failure)
- Tek bir handler
- Imperative (emir kipi)

Event (Gerçekleşmiş Olay):
- Past tense: UserRegistered, PostLiked, MessageSent
- Reddedilemez (already happened)
- Birden fazla handler
- Declarative (bildirimsel)
```

**Meslektaş Projesi Context:**

- 36 Domain Event tanımlandı
- Eventual consistency için kullanılıyor
- Cross-context communication sağlıyor
- Audit trail ve event sourcing hazırlığı

### 1.2 Domain Event Kullanım Amaçları

**1. Eventual Consistency (Aggregate'ler Arası Tutarlılık):**

```java
// Transaction 1: Post aggregate
post.addLike(userId);
postRepository.save(post);
// PostLikedEvent published

// Transaction 2: Notification aggregate (event handler)
@EventListener
void onPostLiked(PostLikedEvent event) {
    Notification notification = Notification.create(...);
    notificationRepository.save(notification);
}
```

**2. Cross-Context Communication:**

```java
// Verification Context → Identity Context
VerificationRequest.approve() → VerificationApprovedEvent
  → User.markAsVerified() (farklı context)
```

**3. Audit Trail:**

```java
// Her domain event log'lanır
UserRegisteredEvent → Event Store → Audit log
PostDeletedEvent → Event Store → Who deleted what when?
```

**4. Side Effects (Yan Etkiler):**

```java
UserBannedEvent →
  - Delete user's posts
  - Archive conversations
  - Delete notifications
  - Send email notification
```

**5. Analytics & Metrics:**

```java
PostCreatedEvent → Analytics DB → "Günlük post sayısı"
MessageSentEvent → Metrics → "Average response time"
```

---

## 2. Domain Event Tasarım Prensipleri

### 2.1 Immutability

**Prensip:** Event oluşturulduktan sonra değişmemelidir.

```java
public record UserRegisteredEvent(
    UserId userId,
    Email email,
    FullName fullName,
    Profession profession,
    Instant occurredAt
) implements DomainEvent {

    public UserRegisteredEvent {
        // Validation
        if (userId == null || email == null || fullName == null || profession == null) {
            throw new IllegalArgumentException("All fields are required");
        }

        if (occurredAt == null) {
            occurredAt = Instant.now();
        }
    }
}

// Record kullanımı:
// - Otomatik immutable (final fields)
// - Otomatik equals/hashCode
// - Otomatik toString
// - Compact constructor için validation
```

### 2.2 Past Tense Naming

**Prensip:** Event isimleri geçmiş zaman olmalıdır.

```java
✅ Doğru:
- UserRegisteredEvent
- PostLikedEvent
- MessageSentEvent
- VerificationApprovedEvent
- ConversationArchivedEvent

❌ Yanlış:
- RegisterUserEvent (command gibi)
- LikePost (present tense)
- SendingMessage (progressive)
- ApproveVerification (imperative)
```

### 2.3 Rich Event Content

**Prensip:** Event gerekli tüm bilgiyi içermeli (handler'ın aggregate'i query etmesine gerek kalmamalı).

**Yanlış (Poor Event):**

```java
❌ YANLIŞ:
public record PostLikedEvent(
    PostId postId  // Sadece ID - handler Post'u query etmeli
) {}

// Handler:
@EventListener
void onPostLiked(PostLikedEvent event) {
    Post post = postRepository.findById(event.postId());  // Extra query!
    User author = userRepository.findById(post.getAuthorId());  // Extra query!

    Notification notification = Notification.create(
        author.getId(),
        NotificationType.POST_LIKED,
        ...
    );
}
```

**Doğru (Rich Event):**

```java
✅ DOĞRU:
public record PostLikedEvent(
    PostId postId,
    UserId authorId,      // Post author (notification recipient)
    UserId likerId,       // Who liked (notification actor)
    Profession profession,
    Instant occurredAt
) implements DomainEvent {}

// Handler:
@EventListener
void onPostLiked(PostLikedEvent event) {
    // No extra queries needed!
    Notification notification = Notification.create(
        event.authorId(),          // Recipient
        NotificationType.POST_LIKED,
        UserSnapshot.from(event.likerId()),  // Actor
        Map.of("postId", event.postId().getValue()),
        NotificationPriority.NORMAL
    );
    notificationRepository.save(notification);
}
```

**Trade-off:**

- **Rich Event:** Daha fazla veri, handler'lar bağımsız, performanslı
- **Poor Event:** Daha az veri, handler'lar aggregate'e depend, ekstra query

**Meslektaş Tercih:** Rich Event (performans + decoupling)

### 2.4 Event Versioning

**Prensip:** Event schema değişebilir, backward compatibility sağlanmalı.

```java
// V1 - Initial version
public record UserRegisteredEvent(
    UserId userId,
    Email email,
    Instant occurredAt
) {}

// V2 - New field added
public record UserRegisteredEvent(
    UserId userId,
    Email email,
    Profession profession,  // NEW FIELD
    Instant occurredAt
) {
    // Backward compatibility constructor
    public UserRegisteredEvent(UserId userId, Email email, Instant occurredAt) {
        this(userId, email, Profession.DOCTOR, occurredAt);  // Default value
    }
}
```

**Event Store Schema:**

```json
{
  "eventType": "UserRegisteredEvent",
  "eventVersion": "2", // Version tracking
  "payload": {
    "userId": "123",
    "email": "test@example.com",
    "profession": "DOCTOR",
    "occurredAt": "2025-11-30T10:00:00Z"
  }
}
```

---

## 3. Meslektaş Domain Event Katalog

### 3.1 Identity Context Events

#### UserRegisteredEvent

**Trigger:** User.register()  
**Purpose:** Yeni kullanıcı kaydedildi

```java
public record UserRegisteredEvent(
    UserId userId,
    Email email,
    FullName fullName,
    Profession profession,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send welcome email
- Create default notification preferences
- Analytics: Track registration source

---

#### UserLoggedInEvent

**Trigger:** User.login()  
**Purpose:** Kullanıcı giriş yaptı

```java
public record UserLoggedInEvent(
    UserId userId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Update last login timestamp
- Analytics: Track daily active users

---

#### UserBlockedEvent

**Trigger:** User.blockUser()  
**Purpose:** Kullanıcı başka bir kullanıcıyı engelledi

```java
public record UserBlockedEvent(
    UserId blockerId,
    UserId blockedUserId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Archive conversations between users (Messaging Context)
- Hide posts from blocked user (Social Context)
- Delete notifications from blocked user (Notification Context)

---

#### UserUnblockedEvent

**Trigger:** User.unblockUser()  
**Purpose:** Kullanıcı engelini kaldırdı

```java
public record UserUnblockedEvent(
    UserId unblockerId,
    UserId unblockedUserId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Restore conversation access
- Restore feed visibility

---

#### ProfessionUpdatedEvent

**Trigger:** User.updateProfession()  
**Purpose:** Meslek değiştirildi (NOT_VERIFIED user için)

```java
public record ProfessionUpdatedEvent(
    UserId userId,
    Profession oldProfession,
    Profession newProfession,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Archive old profession conversations
- Clear feed cache

---

#### UserVerifiedEvent

**Trigger:** User.markAsVerified()  
**Purpose:** Kullanıcı doğrulandı

```java
public record UserVerifiedEvent(
    UserId userId,
    Profession profession,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send congratulations notification
- Grant full access
- Analytics: Track verification rate

---

#### UserSuspendedEvent

**Trigger:** User.suspend()  
**Purpose:** Kullanıcı suspend edildi

```java
public record UserSuspendedEvent(
    UserId userId,
    String reason,
    Duration duration,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send suspension notification
- Archive active conversations
- Hide posts temporarily

---

#### UserBannedEvent

**Trigger:** User.ban()  
**Purpose:** Kullanıcı kalıcı olarak banlandı

```java
public record UserBannedEvent(
    UserId userId,
    String reason,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Delete all user posts (Social Context)
- Archive all conversations (Messaging Context)
- Delete all notifications (Notification Context)
- Send ban notification email
- Analytics: Track ban reasons

---

### 3.2 Verification Context Events

#### VerificationSubmittedEvent

**Trigger:** VerificationRequest.submit()  
**Purpose:** Doğrulama isteği gönderildi

```java
public record VerificationSubmittedEvent(
    VerificationRequestId requestId,
    UserId userId,
    Profession profession,
    int attemptNumber,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Start AI processing (async)
- Send "processing" notification
- Analytics: Track submission rate

---

#### AIProcessingStartedEvent

**Trigger:** AIVerificationService.verify() başlangıç  
**Purpose:** AI processing başladı

```java
public record AIProcessingStartedEvent(
    VerificationRequestId requestId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Update UI status: "Processing..."
- Start timeout timer (5 minutes)

---

#### AIProcessingCompletedEvent

**Trigger:** AIVerificationService.verify() tamamlandı  
**Purpose:** AI processing bitti

```java
public record AIProcessingCompletedEvent(
    VerificationRequestId requestId,
    ConfidenceScore finalScore,
    VerificationDecision decision,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Update UI status
- Analytics: Track AI accuracy

---

#### VerificationApprovedEvent

**Trigger:** VerificationRequest.approve()  
**Purpose:** Doğrulama onaylandı

```java
public record VerificationApprovedEvent(
    VerificationRequestId requestId,
    UserId userId,
    Profession profession,
    ConfidenceScore score,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Update User.verificationStatus = VERIFIED (Identity Context)
- Delete verification documents (KVKK - 7 days)
- Send approval notification
- Analytics: Track approval rate by profession

---

#### VerificationRejectedEvent

**Trigger:** VerificationRequest.reject()  
**Purpose:** Doğrulama reddedildi

```java
public record VerificationRejectedEvent(
    VerificationRequestId requestId,
    UserId userId,
    String reason,
    int attemptNumber,
    int remainingAttempts,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send rejection notification with reason
- Delete verification documents (KVKK)
- If max attempts reached → disable verification
- Analytics: Track rejection reasons

---

#### ManualReviewRequestedEvent

**Trigger:** VerificationRequest.sendToManualReview()  
**Purpose:** Manual review'a gönderildi

```java
public record ManualReviewRequestedEvent(
    VerificationRequestId requestId,
    UserId userId,
    ConfidenceScore score,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Assign to moderator queue
- Send "under review" notification
- Start 48h SLA timer

---

#### DocumentsDeletedEvent

**Trigger:** VerificationRequest.deleteDocuments()  
**Purpose:** KVKK compliance - belgeler silindi

```java
public record DocumentsDeletedEvent(
    VerificationRequestId requestId,
    UserId userId,
    int documentCount,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Delete S3 files
- Audit log
- Analytics: KVKK compliance tracking

---

### 3.3 Social Context Events

#### PostCreatedEvent

**Trigger:** Post.create()  
**Purpose:** Yeni post oluşturuldu

```java
public record PostCreatedEvent(
    PostId postId,
    UserId authorId,
    Profession profession,
    int imageCount,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Update feed cache
- Analytics: Track post creation rate
- Spam detection check (async)

---

#### CommentAddedEvent

**Trigger:** Post.addComment()  
**Purpose:** Post'a yorum eklendi

```java
public record CommentAddedEvent(
    PostId postId,
    CommentId commentId,
    UserId postAuthorId,
    UserId commenterId,
    String commentPreview,  // First 100 chars
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send notification to post author (Notification Context)
- Update post comment count cache
- Analytics: Track engagement

---

#### CommentRemovedEvent

**Trigger:** Post.removeComment()  
**Purpose:** Yorum silindi

```java
public record CommentRemovedEvent(
    PostId postId,
    CommentId commentId,
    UserId removedBy,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Delete related notifications
- Update comment count cache

---

#### PostLikedEvent

**Trigger:** Post.addLike()  
**Purpose:** Post beğenildi

```java
public record PostLikedEvent(
    PostId postId,
    UserId authorId,
    UserId likerId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send notification to post author (Notification Context)
- Update like count cache (Redis)
- Analytics: Track engagement

---

#### PostUnlikedEvent

**Trigger:** Post.removeLike()  
**Purpose:** Beğeni geri alındı

```java
public record PostUnlikedEvent(
    PostId postId,
    UserId likerId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Delete notification
- Update like count cache

---

#### CommentsDisabledEvent

**Trigger:** Post.toggleComments()  
**Purpose:** Yorumlar kapatıldı

```java
public record CommentsDisabledEvent(
    PostId postId,
    UserId authorId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Update UI state
- Analytics: Track comment-disabled rate

---

#### PostHiddenEvent

**Trigger:** Post.hide() (moderation)  
**Purpose:** Post gizlendi

```java
public record PostHiddenEvent(
    PostId postId,
    UserId authorId,
    String reason,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send notification to author
- Clear feed cache
- Analytics: Track hidden posts

---

#### PostDeletedEvent

**Trigger:** Post.delete()  
**Purpose:** Post silindi

```java
public record PostDeletedEvent(
    PostId postId,
    UserId authorId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Delete related notifications (Notification Context)
- Delete S3 images (async)
- Clear caches
- Analytics: Track deletion rate

---

### 3.4 Messaging Context Events

#### ConversationStartedEvent

**Trigger:** Conversation.start()  
**Purpose:** Yeni konuşma başladı

```java
public record ConversationStartedEvent(
    ConversationId conversationId,
    UserId participant1Id,
    UserId participant2Id,
    Profession profession,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Initialize Redis cache (unread count = 0)
- Analytics: Track conversation creation

---

#### MessageSentEvent

**Trigger:** Conversation.sendMessage()  
**Purpose:** Mesaj gönderildi

```java
public record MessageSentEvent(
    ConversationId conversationId,
    MessageId messageId,
    UserId senderId,
    UserId recipientId,
    String messagePreview,  // First 100 chars
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send push notification (Notification Context)
- Update unread count (Redis)
- WebSocket broadcast to recipient
- Analytics: Track message volume

---

#### MessageReadEvent

**Trigger:** Message.markAsRead()  
**Purpose:** Mesaj okundu

```java
public record MessageReadEvent(
    ConversationId conversationId,
    MessageId messageId,
    UserId recipientId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- WebSocket broadcast to sender (read receipt)
- Update unread count (Redis)
- Analytics: Track read rate

---

#### MessageDeletedEvent

**Trigger:** Message.delete()  
**Purpose:** Mesaj silindi

```java
public record MessageDeletedEvent(
    ConversationId conversationId,
    MessageId messageId,
    UserId deletedBy,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- WebSocket broadcast (remove from UI)
- Analytics: Track deletion rate

---

#### ConversationArchivedEvent

**Trigger:** Conversation.archive()  
**Purpose:** Konuşma arşivlendi

```java
public record ConversationArchivedEvent(
    ConversationId conversationId,
    UserId participant1Id,
    UserId participant2Id,
    String reason,  // "blocked", "user_banned", "manual"
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Clear Redis cache
- Analytics: Track archive reasons

---

#### TypingStartedEvent

**Trigger:** Conversation.updateTypingStatus(true)  
**Purpose:** Kullanıcı yazıyor

```java
public record TypingStartedEvent(
    ConversationId conversationId,
    UserId userId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- WebSocket broadcast to other participant
- Auto-stop after 30 seconds

---

#### TypingStoppedEvent

**Trigger:** Conversation.updateTypingStatus(false)  
**Purpose:** Yazma durdu

```java
public record TypingStoppedEvent(
    ConversationId conversationId,
    UserId userId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- WebSocket broadcast

---

### 3.5 Notification Context Events

#### NotificationCreatedEvent

**Trigger:** Notification.create()  
**Purpose:** Bildirim oluşturuldu

```java
public record NotificationCreatedEvent(
    NotificationId notificationId,
    UserId recipientId,
    NotificationType type,
    NotificationPriority priority,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Route to channels (IN_APP, PUSH, EMAIL)
- Analytics: Track notification volume

---

#### NotificationDeliveredEvent

**Trigger:** Notification.markAsDelivered()  
**Purpose:** Bildirim iletildi

```java
public record NotificationDeliveredEvent(
    NotificationId notificationId,
    NotificationChannel channel,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Analytics: Track delivery rate per channel
- Update delivery status

---

#### NotificationReadEvent

**Trigger:** Notification.markAsRead()  
**Purpose:** Bildirim okundu

```java
public record NotificationReadEvent(
    NotificationId notificationId,
    UserId userId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Update badge count
- Analytics: Track read rate

---

#### NotificationFailedEvent

**Trigger:** Notification delivery failure  
**Purpose:** Bildirim gönderilemedi

```java
public record NotificationFailedEvent(
    NotificationId notificationId,
    NotificationChannel channel,
    String errorMessage,
    int retryCount,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Retry queue (max 3 attempts)
- Dead letter queue (after 3 failures)
- Analytics: Track failure rate

---

#### NotificationExpiredEvent

**Trigger:** Scheduled job (30 days old)  
**Purpose:** Bildirim süresi doldu

```java
public record NotificationExpiredEvent(
    NotificationId notificationId,
    UserId recipientId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Delete from database
- Analytics: Track expired notifications

---

### 3.6 Moderation Context Events

#### ReportAddedEvent

**Trigger:** ModerationCase.addReport()  
**Purpose:** Yeni şikayet eklendi

```java
public record ReportAddedEvent(
    ModerationCaseId caseId,
    ReportId reportId,
    UserId reporterId,
    PostId targetPostId,  // Nullable
    UserId targetUserId,
    ViolationType violationType,
    int totalReportCount,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Check auto-moderation thresholds (5/10 reports)
- Assign to moderator if manual review needed
- Analytics: Track report volume

---

#### ContentAutoHiddenEvent

**Trigger:** Auto-moderation (5 reports)  
**Purpose:** İçerik otomatik gizlendi

```java
public record ContentAutoHiddenEvent(
    ModerationCaseId caseId,
    PostId postId,
    UserId authorId,
    int reportCount,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Hide post (Social Context)
- Send notification to author
- Analytics: Track auto-hide rate

---

#### UserAutoSuspendedEvent

**Trigger:** Auto-moderation (10 reports)  
**Purpose:** Kullanıcı otomatik suspend edildi

```java
public record UserAutoSuspendedEvent(
    ModerationCaseId caseId,
    UserId userId,
    Duration suspensionDuration,
    int reportCount,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Suspend user (Identity Context)
- Archive conversations (Messaging Context)
- Send suspension notification
- Analytics: Track suspension rate

---

#### ModerationCaseAssignedEvent

**Trigger:** ModerationCase.assignToModerator()  
**Purpose:** Moderatöre atandı

```java
public record ModerationCaseAssignedEvent(
    ModerationCaseId caseId,
    UserId moderatorId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Send assignment notification to moderator
- Start 48h SLA timer
- Analytics: Track moderator workload

---

#### ModerationActionAppliedEvent

**Trigger:** ModerationCase.resolve()  
**Purpose:** Moderasyon kararı uygulandı

```java
public record ModerationActionAppliedEvent(
    ModerationCaseId caseId,
    UserId targetUserId,
    ModerationAction action,  // WARNING, SUSPEND, BAN, DISMISS
    String reason,
    UserId moderatorId,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Apply action (suspend/ban user, delete post)
- Send notification to target user
- Update violation history
- Analytics: Track action distribution

---

#### ModerationAppealedEvent

**Trigger:** ModerationCase.appeal()  
**Purpose:** Karar itiraz edildi

```java
public record ModerationAppealedEvent(
    ModerationCaseId caseId,
    UserId userId,
    String appealReason,
    Instant occurredAt
) implements DomainEvent {}
```

**Handlers:**

- Assign to senior moderator
- Send appeal received notification
- Analytics: Track appeal rate

---

## 4. Event Publishing Pattern

### 4.1 In-Memory Event Publisher

```java
public interface DomainEventPublisher {
    void publish(DomainEvent event);
    void publishAll(List<DomainEvent> events);
}

@Component
public class SpringEventPublisher implements DomainEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publish(DomainEvent event) {
        applicationEventPublisher.publishEvent(event);
    }

    @Override
    public void publishAll(List<DomainEvent> events) {
        events.forEach(this::publish);
    }
}
```

### 4.2 Aggregate Root Pattern

```java
public abstract class AggregateRoot<ID> {

    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    public void clearDomainEvents() {
        domainEvents.clear();
    }
}

// Usage in aggregate:
public class Post extends AggregateRoot<PostId> {

    public void addLike(UserId userId) {
        // Business logic
        this.likes.add(userId);

        // Register event
        registerEvent(new PostLikedEvent(
            this.id,
            this.authorId,
            userId,
            Instant.now()
        ));
    }
}

// Publishing after save:
@Service
@Transactional
public class PostApplicationService {

    private final PostRepository postRepository;
    private final DomainEventPublisher eventPublisher;

    public void likePost(PostId postId, UserId userId) {
        Post post = postRepository.findById(postId).orElseThrow();

        post.addLike(userId);
        postRepository.save(post);

        // Publish all events after successful save
        eventPublisher.publishAll(post.getDomainEvents());
        post.clearDomainEvents();
    }
}
```

### 4.3 Spring @TransactionalEventListener

```java
@Component
public class NotificationEventHandler {

    private final NotificationRepository notificationRepository;

    // AFTER_COMMIT: Event handler runs after transaction commits
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPostLiked(PostLikedEvent event) {
        Notification notification = Notification.create(
            event.authorId(),
            NotificationType.POST_LIKED,
            UserSnapshot.from(event.likerId()),
            Map.of("postId", event.postId().getValue()),
            NotificationPriority.NORMAL
        );

        notificationRepository.save(notification);
    }

    // Multiple event types
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCommentAdded(CommentAddedEvent event) {
        // ...
    }
}
```

**Transaction Phases:**

- **BEFORE_COMMIT:** Transaction commit'inden önce
- **AFTER_COMMIT:** Transaction commit'inden sonra (DEFAULT)
- **AFTER_ROLLBACK:** Transaction rollback'inden sonra
- **AFTER_COMPLETION:** Commit veya rollback'den sonra

**Meslektaş Tercih:** AFTER_COMMIT (eventual consistency + transaction safety)

---

## 5. Event Handling Patterns

### 5.1 Single Handler Pattern

```java
@Component
public class UserVerificationHandler {

    private final UserRepository userRepository;

    @TransactionalEventListener
    @Transactional
    public void onVerificationApproved(VerificationApprovedEvent event) {
        User user = userRepository.findById(event.userId()).orElseThrow();

        user.markAsVerified();
        user.updateProfession(event.profession());

        userRepository.save(user);
    }
}
```

### 5.2 Multiple Handlers Pattern

```java
// Handler 1: Notification
@Component
public class NotificationHandler {

    @TransactionalEventListener
    public void onVerificationApproved(VerificationApprovedEvent event) {
        // Send notification
    }
}

// Handler 2: Analytics
@Component
public class AnalyticsHandler {

    @TransactionalEventListener
    public void onVerificationApproved(VerificationApprovedEvent event) {
        // Track metric
    }
}

// Handler 3: Email
@Component
public class EmailHandler {

    @TransactionalEventListener
    public void onVerificationApproved(VerificationApprovedEvent event) {
        // Send email
    }
}
```

### 5.3 Async Handler Pattern

```java
@Component
public class AsyncEventHandler {

    @Async  // Runs in separate thread pool
    @TransactionalEventListener
    public void onPostCreated(PostCreatedEvent event) {
        // Long-running task (e.g., image processing)
        processImages(event.postId());
    }
}

// Config:
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-event-");
        executor.initialize();
        return executor;
    }
}
```

### 5.4 Retry Pattern

```java
@Component
public class RetryableEventHandler {

    @Retryable(
        value = {NetworkException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    @TransactionalEventListener
    public void onNotificationCreated(NotificationCreatedEvent event) {
        // May fail (network issue, external API down)
        pushNotificationService.send(event.notificationId());
    }

    @Recover
    public void recover(NetworkException e, NotificationCreatedEvent event) {
        // After 3 failed attempts, send to Dead Letter Queue
        deadLetterQueue.send(event);
    }
}
```

---

## 6. Event Sourcing Hazırlığı

### 6.1 Event Store

```java
@Entity
@Table(name = "domain_events")
public class StoredEvent {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false)
    private String aggregateType;  // "Post", "User", etc.

    @Column(nullable = false)
    private String eventType;  // "PostLikedEvent", "UserRegisteredEvent"

    @Column(nullable = false)
    private int eventVersion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;  // JSON

    @Column(nullable = false)
    private Instant occurredAt;

    @Column(nullable = false)
    private Instant storedAt;
}
```

### 6.2 Event Store Service

```java
@Service
public class EventStoreService {

    private final StoredEventRepository repository;
    private final ObjectMapper objectMapper;

    public void store(DomainEvent event) {
        StoredEvent storedEvent = new StoredEvent();
        storedEvent.setAggregateId(extractAggregateId(event));
        storedEvent.setAggregateType(extractAggregateType(event));
        storedEvent.setEventType(event.getClass().getSimpleName());
        storedEvent.setEventVersion(1);
        storedEvent.setPayload(objectMapper.writeValueAsString(event));
        storedEvent.setOccurredAt(event.occurredAt());
        storedEvent.setStoredAt(Instant.now());

        repository.save(storedEvent);
    }

    public List<DomainEvent> getEventsForAggregate(String aggregateId) {
        List<StoredEvent> storedEvents = repository.findByAggregateIdOrderByIdAsc(aggregateId);

        return storedEvents.stream()
            .map(this::deserializeEvent)
            .toList();
    }
}
```

### 6.3 Event Replay

```java
@Service
public class EventReplayService {

    private final EventStoreService eventStore;

    public Post rebuildPostFromEvents(PostId postId) {
        List<DomainEvent> events = eventStore.getEventsForAggregate(postId.getValue());

        Post post = null;

        for (DomainEvent event : events) {
            if (event instanceof PostCreatedEvent created) {
                post = Post.reconstitute(
                    created.postId(),
                    created.authorId(),
                    created.profession(),
                    created.content()
                );
            } else if (event instanceof PostLikedEvent liked) {
                post.addLike(liked.likerId());
            } else if (event instanceof CommentAddedEvent commented) {
                // ...
            }
        }

        return post;
    }
}
```

---

## 7. Testing Domain Events

### 7.1 Event Publishing Test

```java
class PostTest {

    @Test
    void should_publish_post_liked_event_when_like_added() {
        // Given
        Post post = Post.create(authorId, Profession.DOCTOR, "Test", List.of());
        UserId likerId = new UserId(UUID.randomUUID());

        // When
        post.addLike(likerId);

        // Then
        List<DomainEvent> events = post.getDomainEvents();
        assertThat(events).hasSize(1);

        DomainEvent event = events.get(0);
        assertThat(event).isInstanceOf(PostLikedEvent.class);

        PostLikedEvent likedEvent = (PostLikedEvent) event;
        assertThat(likedEvent.postId()).isEqualTo(post.getId());
        assertThat(likedEvent.likerId()).isEqualTo(likerId);
    }
}
```

### 7.2 Event Handler Test

```java
@SpringBootTest
class NotificationEventHandlerTest {

    @Autowired
    private NotificationEventHandler handler;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    @Transactional
    void should_create_notification_when_post_liked() {
        // Given
        PostLikedEvent event = new PostLikedEvent(
            new PostId(UUID.randomUUID()),
            new UserId(UUID.randomUUID()),  // Author
            new UserId(UUID.randomUUID()),  // Liker
            Instant.now()
        );

        // When
        handler.onPostLiked(event);

        // Then
        List<Notification> notifications = notificationRepository.findAll();
        assertThat(notifications).hasSize(1);

        Notification notification = notifications.get(0);
        assertThat(notification.getType()).isEqualTo(NotificationType.POST_LIKED);
        assertThat(notification.getRecipientId()).isEqualTo(event.authorId());
    }
}
```

### 7.3 Integration Test (End-to-End)

```java
@SpringBootTest
@Transactional
class PostLikeIntegrationTest {

    @Autowired
    private PostApplicationService postService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    void should_create_notification_when_post_liked_end_to_end() {
        // Given
        Post post = createTestPost();
        UserId likerId = new UserId(UUID.randomUUID());

        // When
        postService.likePost(post.getId(), likerId);

        // Then - Event published and handled
        List<Notification> notifications = notificationRepository
            .findByRecipientId(post.getAuthorId());

        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0).getType()).isEqualTo(NotificationType.POST_LIKED);
    }
}
```

---

## 8. Özet

### Domain Event Prensipleri:

1. **Immutable:** Event değiştirilemez
2. **Past Tense:** Geçmiş zaman isimlendirme (UserRegistered, PostLiked)
3. **Rich Content:** Gerekli tüm bilgiyi içermeli
4. **Eventual Consistency:** Aggregate'ler arası tutarlılık
5. **Decoupling:** Bounded context'ler arası communication

### Meslektaş Event Summary:

- **36 Domain Event:** Identity (8), Verification (6), Social (8), Messaging (6), Notification (5), Moderation (6)
- **Event Sourcing Ready:** Event Store infrastructure hazır
- **Async Processing:** @Async + retry support
- **Cross-Context Communication:** Bounded context'ler bağımsız

### Event Handler Patterns:

- **@TransactionalEventListener:** AFTER_COMMIT (eventual consistency)
- **Multiple Handlers:** Aynı event'e birden fazla handler
- **Async Handlers:** Uzun işlemler için @Async
- **Retry:** Network failure'lar için @Retryable

### Next Steps:

- **Repositories:** 12-REPOSITORIES.md (Aggregate persistence)
- **CQRS:** 13-CQRS-PATTERN.md (Command/Query separation)
- **Application Services:** 14-APPLICATION-SERVICES.md (Use case orchestration)
