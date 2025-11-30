# Aggregate Tasarım Kılavuzu

## 1. Genel Bakış

### 1.1 Aggregate Nedir?

Aggregate, Domain-Driven Design'ın en kritik taktiksel paternlerinden biridir. Bir grup ilişkili nesneyi (entity ve value object) tek bir birim olarak ele alır ve bu birimin tutarlılığını (consistency) garanti eder.

**Temel Prensipler:**

- Her aggregate'in bir **Aggregate Root** (kök entity) vardır
- Dış dünya sadece aggregate root üzerinden erişim sağlar
- Aggregate sınırları içinde **invariant'lar** (iş kuralları) korunur
- Her aggregate bir **transaction boundary** (işlem sınırı) oluşturur
- Aggregate'ler arasındaki referanslar sadece **ID** üzerinden yapılır

**Meslektaş Projesi Context:**

- 9 Aggregate Root tanımlandı (6 bounded context'te dağıtılmış)
- Her aggregate kendi business rule'larını enforce eder
- Aggregate sınırları mikroservis geçişini destekler

### 1.2 Aggregate vs Entity Farkı

**Entity:**

- Kimliğe (ID) sahip nesne
- Yaşam döngüsü boyunca takip edilir
- Başka bir entity'nin içinde yaşayabilir

**Aggregate Root:**

- Özel bir entity türü
- Aggregate sınırının giriş noktası
- Invariant'ları korumaktan sorumlu
- Repository sadece aggregate root için oluşturulur

**Örnek - Meslektaş:**

```
Post (Aggregate Root)
  └── Comment (Entity - Post'un içinde yaşar)
      └── Like (Value Object)

Conversation (Aggregate Root)
  └── Message (Entity - Conversation'un içinde yaşar)
      └── DeliveryStatus (Value Object)
```

### 1.3 Aggregate Boyutları

**Küçük Aggregate'ler Tercih Edilir:**

- Performans: Daha az veri yüklenir
- Concurrency: Daha az lock çakışması
- Scalability: Daha kolay cache'lenir

**Meslektaş Aggregate Boyutları:**

- **Küçük:** User, Notification, Report (1 entity)
- **Orta:** Post (Comment collection), Conversation (Message collection)
- **Büyük:** VerificationRequest (6-stage pipeline ile ilişkili)

---

## 2. Aggregate Tasarım Kuralları

### 2.1 Rule 1: Model True Invariants

**Prensip:** Sadece gerçek iş kurallarını (invariant) korumak için aggregate sınırı çizin.

**Invariant Nedir?**
Her zaman geçerli olması gereken iş kuralı. Aggregate root bu kuralı garanti eder.

**Meslektaş Örnekleri:**

**Post Aggregate - Invariants:**

```
Invariant 1: Post'un author'ı değiştirilemez (immutable)
Invariant 2: HIDDEN veya DELETED post'lara comment eklenemez
Invariant 3: Comment devre dışı ise yeni comment eklenemez
Invariant 4: Aynı user bir post'u sadece 1 kez like'layabilir
```

**User Aggregate - Invariants:**

```
Invariant 1: Email unique olmalı
Invariant 2: Profession doğrulandıktan sonra değiştirilemez
Invariant 3: SUSPENDED user BANNED olamaz (state machine)
Invariant 4: Blocked user'lar mutual olmalı (iki yönlü)
```

**VerificationRequest Aggregate - Invariants:**

```
Invariant 1: Confidence score 0-100 arasında olmalı
Invariant 2: APPROVED request tekrar submit edilemez
Invariant 3: MaxAttempts (3) aşılırsa REJECTED olmalı
Invariant 4: REJECTED request manual review'a geçemez
```

**Anti-Pattern:**

```
❌ Yanlış: Sadece query kolaylığı için aggregate'e entity ekleme
❌ Yanlış: İki aggregate'i birleştirmek çünkü "genelde beraber kullanılıyorlar"
✅ Doğru: Sadece iş kuralı (invariant) gerektiriyorsa birleştir
```

### 2.2 Rule 2: Design Small Aggregates

**Prensip:** Aggregate'leri mümkün olduğunca küçük tutun.

**Neden Küçük?**

- **Performance:** Daha az JOIN, daha hızlı load
- **Concurrency:** Optimistic locking çakışmaları azalır
- **Memory:** Daha verimli cache kullanımı
- **Scalability:** Daha kolay sharding

**Meslektaş Tasarım Kararları:**

**Küçük Aggregate Örnekleri:**

```
User Aggregate:
  └── User (root)
      - blockedUsers: Set<UserId> (value object collection)
      - profession: Profession (value object)

  Boyut: ~1 entity + 2 value object
  Load Time: <10ms
  Cache Size: ~2-5 KB
```

```
Notification Aggregate:
  └── Notification (root)
      - recipient: UserId (value object)
      - content: NotificationContent (value object)

  Boyut: ~1 entity + 2 value object
  Load Time: <5ms
  Cache Size: ~1-2 KB
```

**Orta Büyüklük Aggregate Örnekleri:**

```
Post Aggregate:
  └── Post (root)
      └── comments: List<Comment> (entity collection)
          - likes: Set<UserId> (value object collection)

  Boyut: 1 root + N comments (avg ~10)
  Load Time: ~20-50ms (N+1 query önlenmeli)
  Cache Strategy: Post ve comments ayrı cache'lenir
```

```
Conversation Aggregate:
  └── Conversation (root)
      └── messages: List<Message> (entity collection - lazy loaded)

  Boyut: 1 root + N messages (pagination ile yüklenir)
  Load Time: ~30-100ms (sayfalama ile)
  Cache Strategy: Son 50 mesaj cache'lenir
```

**Büyük Aggregate (Dikkatli Kullanım):**

```
VerificationRequest Aggregate:
  └── VerificationRequest (root)
      - documents: List<Document> (value object collection)
      - attemptHistory: List<Attempt> (value object collection)
      - aiResults: AIVerificationResult (value object - 6 stage)

  Boyut: 1 root + 3-10 document + 1-3 attempt + 1 AI result
  Load Time: ~100-200ms (AWS Rekognition çağrıları dahil)
  Neden Büyük: 6-stage AI pipeline transaction boundary gerektiriyor
```

### 2.3 Rule 3: Reference Other Aggregates by ID

**Prensip:** Aggregate'ler arası ilişkilerde sadece ID kullanın, entity referansı kullanmayın.

**Neden ID Kullanmalı?**

- **Loose Coupling:** Aggregate'ler bağımsız yüklenir/güncellenir
- **Performance:** Lazy loading ve N+1 query problemlerini önler
- **Scalability:** Farklı database shard'larında yaşayabilir
- **Microservices:** Farklı servislere kolayca ayrılabilir

**Meslektaş Örnekleri:**

**Post → User Referansı:**

```
✅ Doğru Tasarım:
class Post {
    private PostId id;
    private UserId authorId;  // ID referansı
    private Profession profession;
    private String content;
}

// Kullanım:
Post post = postRepository.findById(postId);
UserId authorId = post.getAuthorId();
User author = userRepository.findById(authorId);  // Ayrı query
```

```
❌ Yanlış Tasarım:
class Post {
    private PostId id;
    private User author;  // Entity referansı - YANLIŞ!
    private String content;
}

Sorunlar:
- Post load edildiğinde User da load edilir (N+1)
- User güncellendiğinde Post cache'i invalid olur
- Mikroservislere ayrılamazlar
```

**Conversation → User Referansı:**

```
✅ Doğru Tasarım:
class Conversation {
    private ConversationId id;
    private UserId participant1Id;
    private UserId participant2Id;
    private Profession profession;
}

// Participants bilgisi lazımsa:
List<UserId> participantIds = conversation.getParticipantIds();
List<User> participants = userRepository.findAllById(participantIds);
```

**ModerationCase → Post/User Referansı:**

```
✅ Doğru Tasarım:
class ModerationCase {
    private ModerationCaseId id;
    private PostId targetPostId;  // Nullable (comment da olabilir)
    private UserId targetUserId;
    private UserId reportedById;
}

// Post'u yüklemek gerekirse:
if (moderationCase.getTargetPostId() != null) {
    Post post = postRepository.findById(moderationCase.getTargetPostId());
}
```

**Exception: Value Object Olarak Embedding**

```
✅ İzin Verilen (Snapshot Pattern):
class Notification {
    private NotificationId id;
    private UserId recipientId;
    private UserSnapshot actor;  // Value Object - o anki snapshot
}

class UserSnapshot {  // Value Object
    private String fullName;
    private Profession profession;
    private String profileImageUrl;
}

Neden Doğru:
- UserSnapshot bir value object (identity yok)
- Notification gönderildiği andaki user bilgisini saklar
- User değişse bile notification değişmez (historical record)
```

### 2.4 Rule 4: Use Eventual Consistency Outside Boundary

**Prensip:** Aggregate sınırları dışındaki güncellemeler eventual consistency ile yapılır.

**Strong Consistency (Aggregate İçinde):**

- Tek transaction'da gerçekleşir
- ACID garantisi vardır
- Immediate consistency (anında tutarlılık)

**Eventual Consistency (Aggregate'ler Arası):**

- Domain Event kullanılır
- Message broker üzerinden iletilir
- Belirli bir süre sonra tutarlılık sağlanır

**Meslektaş Örnekleri:**

**Örnek 1: Post Like → Notification**

```
Strong Consistency (Post Aggregate İçinde):
1. Post.addLike(userId) çağrılır
2. Like count artırılır
3. PostLikedEvent publish edilir
4. Transaction commit edilir

Eventual Consistency (Notification Context):
5. PostLikedEvent listener'ı tetiklenir (ayrı transaction)
6. Notification oluşturulur
7. Push notification gönderilir

Gecikme: ~100-500ms
Kullanıcı Etkisi: Like anında görünür, bildirim birkaç saniye sonra gelir
```

**Örnek 2: Verification Approved → User Profession Update**

```
Strong Consistency (VerificationRequest Aggregate):
1. VerificationRequest.approve(score) çağrılır
2. Status = APPROVED set edilir
3. VerificationApprovedEvent publish edilir
4. Transaction commit edilir

Eventual Consistency (Identity Context):
5. VerificationApprovedEvent listener'ı tetiklenir (ayrı transaction)
6. User.updateProfession(profession) çağrılır
7. User.markAsVerified() çağrılır
8. UserVerifiedEvent publish edilir

Gecikme: ~200-1000ms
Kullanıcı Etkisi: Doğrulama ekranında "Onaylandı", profil güncellemesi birkaç saniye sonra
```

**Örnek 3: User Blocked → Conversations/Messages Cleanup**

```
Strong Consistency (User Aggregate):
1. User.blockUser(blockedUserId) çağrılır
2. blockedUsers set'ine eklenir
3. UserBlockedEvent publish edilir
4. Transaction commit edilir

Eventual Consistency (Messaging Context):
5. UserBlockedEvent listener'ı tetiklenir (ayrı transaction)
6. Conversation.archive() çağrılır (iki taraf arası)
7. Future message'lar engellenir

Gecikme: ~500-2000ms
Kullanıcı Etkisi: Engelleme anında etkili, konuşma temizliği arka planda
```

**Eventual Consistency Retry Stratejisi:**

```
Meslektaş Event Handler Pattern:
- Max Retry: 3 attempts
- Backoff: Exponential (1s, 2s, 4s)
- Dead Letter Queue: 3 retry sonrası DLQ'ya gönder
- Monitoring: Event delivery rate < 99.9% ise alert
```

### 2.5 Rule 5: Protect Invariants with Domain Logic

**Prensip:** Aggregate root, invariant'ları korumak için domain logic içermelidir.

**Anemic Domain Model (Anti-Pattern):**

```
❌ Yanlış:
class Post {
    private PostId id;
    private String content;
    private PostStatus status;

    // Sadece getter/setter - logic yok!
    public void setStatus(PostStatus status) {
        this.status = status;
    }
}

// Business logic service'te:
class PostService {
    public void deletePost(PostId postId) {
        Post post = postRepository.findById(postId);
        post.setStatus(DELETED);  // Kontrol yok!
        postRepository.save(post);
    }
}

Sorunlar:
- Invariant koruması yok
- Domain logic service'te dağılmış
- Test edilmesi zor
```

**Rich Domain Model (Doğru Tasarım):**

```
✅ Doğru:
class Post {
    private PostId id;
    private UserId authorId;
    private String content;
    private PostStatus status;
    private boolean commentsEnabled;
    private Set<UserId> likes;

    // Domain logic aggregate içinde
    public void delete() {
        if (this.status == DELETED) {
            throw new PostAlreadyDeletedException();
        }
        this.status = DELETED;
        this.updatedAt = Instant.now();

        // Domain event publish
        DomainEventPublisher.publish(
            new PostDeletedEvent(this.id, this.authorId)
        );
    }

    public void addComment(Comment comment) {
        if (this.status == DELETED) {
            throw new CannotCommentOnDeletedPostException();
        }
        if (this.status == HIDDEN) {
            throw new CannotCommentOnHiddenPostException();
        }
        if (!this.commentsEnabled) {
            throw new CommentsDisabledException();
        }

        this.comments.add(comment);
        this.updatedAt = Instant.now();

        DomainEventPublisher.publish(
            new CommentAddedEvent(this.id, comment.getId())
        );
    }

    public void addLike(UserId userId) {
        if (this.likes.contains(userId)) {
            throw new UserAlreadyLikedPostException();
        }
        if (this.authorId.equals(userId)) {
            throw new CannotLikeSelfPostException();
        }

        this.likes.add(userId);

        DomainEventPublisher.publish(
            new PostLikedEvent(this.id, userId)
        );
    }

    // Private setter - dışarıdan erişim yok
    private void setStatus(PostStatus status) {
        this.status = status;
    }
}
```

**Meslektaş Aggregate Invariant Koruması:**

**User Aggregate:**

```
class User {
    public void blockUser(UserId blockedUserId) {
        // Invariant 1: Kendini engelleyemez
        if (this.id.equals(blockedUserId)) {
            throw new CannotBlockSelfException();
        }

        // Invariant 2: Zaten engellenmiş mi kontrol
        if (this.blockedUsers.contains(blockedUserId)) {
            throw new UserAlreadyBlockedException();
        }

        this.blockedUsers.add(blockedUserId);

        DomainEventPublisher.publish(
            new UserBlockedEvent(this.id, blockedUserId)
        );
    }

    public void updateProfession(Profession newProfession) {
        // Invariant: Verified user'ın profession'ı değiştirilemez
        if (this.verificationStatus == VERIFIED) {
            throw new VerifiedUserProfessionImmutableException();
        }

        // Invariant: Pending verification varsa değiştirilemez
        if (this.verificationStatus == PENDING) {
            throw new PendingVerificationExistsException();
        }

        this.profession = newProfession;
        this.verificationStatus = NOT_VERIFIED;
    }
}
```

**Conversation Aggregate:**

```
class Conversation {
    public void sendMessage(Message message) {
        // Invariant 1: Sadece participant gönderebilir
        if (!isParticipant(message.getSenderId())) {
            throw new NotConversationParticipantException();
        }

        // Invariant 2: Rate limiting (60 msg/min)
        if (exceedsRateLimit(message.getSenderId())) {
            throw new MessageRateLimitExceededException();
        }

        // Invariant 3: Max 1000 karakter
        if (message.getContent().length() > 1000) {
            throw new MessageTooLongException();
        }

        this.messages.add(message);
        this.lastMessageAt = Instant.now();

        // Unread count güncelle
        this.incrementUnreadCount(getOtherParticipant(message.getSenderId()));

        DomainEventPublisher.publish(
            new MessageSentEvent(this.id, message.getId())
        );
    }

    private boolean isParticipant(UserId userId) {
        return this.participant1Id.equals(userId) ||
               this.participant2Id.equals(userId);
    }

    private UserId getOtherParticipant(UserId senderId) {
        return this.participant1Id.equals(senderId)
            ? this.participant2Id
            : this.participant1Id;
    }
}
```

---

## 3. Meslektaş Aggregate Katalog

### 3.1 Identity Context Aggregates

#### User Aggregate

**Aggregate Root:** User  
**Entities:** None  
**Value Objects:** Email, Password, FullName, Profession, Set<UserId> (blockedUsers)

**Invariants:**

1. Email unique ve valid format olmalı
2. Password minimum 8 karakter, 1 büyük, 1 küçük, 1 rakam içermeli
3. Profession VERIFIED ise değiştirilemez
4. SUSPENDED user BANNED olamaz
5. User kendini engelleyemez

**Public Methods:**

```
+ register(email, password, fullName, profession): User
+ login(password): AuthToken
+ blockUser(userId): void
+ unblockUser(userId): void
+ updateProfession(profession): void
+ markAsVerified(): void
+ suspend(reason, duration): void
+ ban(reason): void
```

**Domain Events:**

- UserRegistered
- UserLoggedIn
- UserBlocked
- UserUnblocked
- ProfessionUpdated
- UserVerified
- UserSuspended
- UserBanned

**Aggregate Boyutu:** Küçük (~1 entity + 3-10 blocked users)  
**Transaction Boundary:** User mutation'ları  
**Consistency:** Strong (aggregate içi)

---

#### AuthToken Aggregate

**Aggregate Root:** AuthToken  
**Entities:** RefreshToken (child entity)  
**Value Objects:** JwtToken, TokenExpiry

**Invariants:**

1. Access token 24 saat valid
2. Refresh token 30 gün valid
3. Refresh token sadece 1 kez kullanılabilir
4. User logout olduğunda tüm token'lar invalidate edilmeli

**Public Methods:**

```
+ generateTokenPair(userId): TokenPair
+ refreshAccessToken(refreshToken): AccessToken
+ revokeAllTokens(userId): void
+ validateToken(token): boolean
```

**Domain Events:**

- TokenGenerated
- TokenRefreshed
- TokenRevoked

**Aggregate Boyutu:** Küçük (~1 entity + 1 refresh token)  
**Transaction Boundary:** Token lifecycle  
**Consistency:** Strong (token validation için kritik)

---

### 3.2 Verification Context Aggregates

#### VerificationRequest Aggregate

**Aggregate Root:** VerificationRequest  
**Entities:** None  
**Value Objects:** Document (collection), Attempt (collection), AIVerificationResult, ConfidenceScore

**Invariants:**

1. Max 3 attempt izin verilir
2. Confidence score 0-100 arasında olmalı
3. APPROVED request tekrar submit edilemez
4. REJECTED olan PENDING'e geri dönemez
5. Document ID + Selfie gerekli
6. KVKK: APPROVED/REJECTED sonrası 7 gün içinde dosyalar silinmeli

**Public Methods:**

```
+ submit(idDocument, selfie): VerificationRequest
+ processWithAI(): AIVerificationResult
+ approve(score): void
+ reject(reason): void
+ sendToManualReview(): void
+ deleteDocuments(): void
```

**Domain Events:**

- VerificationSubmitted
- AIProcessingCompleted
- VerificationApproved
- VerificationRejected
- ManualReviewRequested
- DocumentsDeleted

**Aggregate Boyutu:** Büyük (~1 entity + 2-10 documents + 1-3 attempts + AI result)  
**Transaction Boundary:** 6-stage AI pipeline (OCR → Face Match → Liveness → Authenticity → Data Match → Decision)  
**Consistency:** Strong (AI pipeline atomicity kritik)

**Neden Büyük Aggregate?**

- AI pipeline transaction boundary gerektiriyor
- Confidence calculation 6 stage'in weighted sum'ı
- Document validation cascade logic var
- KVKK compliance için document lifecycle tracking

---

### 3.3 Social Context Aggregates

#### Post Aggregate

**Aggregate Root:** Post  
**Entities:** Comment (collection)  
**Value Objects:** PostContent, PostImage (collection), Like (Set<UserId>)

**Invariants:**

1. Author VERIFIED olmalı (BR-SOC-002)
2. Max 4 image (BR-SOC-003)
3. Content max 2000 karakter (BR-SOC-004)
4. DELETED post'a comment eklenemez
5. HIDDEN post'a comment eklenemez
6. User bir post'u sadece 1 kez like'layabilir
7. Comment max 500 karakter (BR-SOC-006)

**Public Methods:**

```
+ create(authorId, profession, content, images): Post
+ addComment(userId, content): Comment
+ removeComment(commentId): void
+ addLike(userId): void
+ removeLike(userId): void
+ toggleComments(): void
+ hide(): void
+ delete(): void
```

**Domain Events:**

- PostCreated
- CommentAdded
- CommentRemoved
- PostLiked
- PostUnliked
- CommentsDisabled
- PostHidden
- PostDeleted

**Aggregate Boyutu:** Orta (~1 entity + 5-50 comments + 10-500 likes)  
**Transaction Boundary:** Post ve comment'leri  
**Consistency:** Strong (aggregate içi), Eventual (notification için)

**Tasarım Notu:**

- Comment collection lazy load edilebilir
- Like count cache'lenir (Redis)
- Profession-based feed query optimize edilmeli

---

### 3.4 Messaging Context Aggregates

#### Conversation Aggregate

**Aggregate Root:** Conversation  
**Entities:** Message (collection - lazy loaded)  
**Value Objects:** UnreadCount (per participant), TypingStatus

**Invariants:**

1. Sadece 2 participant (1-to-1 chat)
2. Her iki participant aynı profession'da olmalı (BR-MSG-001)
3. Blocked user'larla konuşma açılamaz
4. Message max 1000 karakter (BR-MSG-004)
5. Rate limit: 60 msg/min per user, 10 msg/min per conversation (BR-MSG-005)
6. Sadece gönderen message silebilir (BR-MSG-006)
7. Sadece alıcı "read" mark edebilir (BR-MSG-007)

**Public Methods:**

```
+ startConversation(participant1Id, participant2Id, profession): Conversation
+ sendMessage(senderId, content): Message
+ markAsRead(recipientId, messageId): void
+ deleteMessage(messageId, userId): void
+ archive(): void
+ updateTypingStatus(userId, isTyping): void
```

**Domain Events:**

- ConversationStarted
- MessageSent
- MessageRead
- MessageDeleted
- ConversationArchived
- TypingStarted
- TypingStopped

**Aggregate Boyutu:** Orta-Büyük (~1 entity + 100-1000 messages)  
**Transaction Boundary:** Message send/read işlemleri  
**Consistency:** Strong (message delivery), Eventual (notification)

**Tasarım Notu:**

- Message collection pagination ile yüklenmeli (son 50 mesaj)
- Unread count cache'lenir (Redis)
- Typing indicator WebSocket ile real-time
- Archive edilen conversation'lar soft delete

---

### 3.5 Notification Context Aggregates

#### Notification Aggregate

**Aggregate Root:** Notification  
**Entities:** None  
**Value Objects:** NotificationContent, UserSnapshot (actor bilgisi)

**Invariants:**

1. Recipient user valid olmalı
2. Type enum'dan biri olmalı (POST_LIKED, COMMENT_ADDED, MESSAGE_RECEIVED, vb.)
3. Priority URGENT ise user preferences bypass edilir (BR-NOT-002)
4. Max 3 delivery attempt (BR-NOT-003)
5. 30 gün sonra otomatik silinir (BR-NOT-004)
6. LOW priority batch'lenir (BR-NOT-005)

**Public Methods:**

```
+ create(recipientId, type, content, priority): Notification
+ markAsRead(): void
+ markAsDelivered(channel): void
+ incrementRetryCount(): void
+ delete(): void
```

**Domain Events:**

- NotificationCreated
- NotificationDelivered
- NotificationRead
- NotificationFailed
- NotificationExpired

**Aggregate Boyutu:** Küçük (~1 entity)  
**Transaction Boundary:** Notification lifecycle  
**Consistency:** Eventual (notification delivery async)

**Tasarım Notu:**

- IN_APP channel her zaman enabled
- PUSH ve EMAIL user preferences'a bağlı
- Batch aggregation için scheduler (LOW priority)
- Failed delivery → retry queue

---

### 3.6 Moderation Context Aggregates

#### ModerationCase Aggregate

**Aggregate Root:** ModerationCase  
**Entities:** Report (collection)  
**Value Objects:** ViolationHistory, ModerationAction

**Invariants:**

1. 5 report → auto-hide content (BR-MOD-001)
2. 10 report → auto-suspend user (BR-MOD-002)
3. Suspension escalation: 1d → 7d → 30d → permanent (BR-MOD-003)
4. Manual review max 48 saat (BR-MOD-004)
5. User sadece 1 kez appeal edebilir (BR-MOD-005)
6. Self-reporting yasak (BR-MOD-006)
7. Duplicate report yasak (BR-MOD-007)

**Public Methods:**

```
+ createReport(reporterId, targetId, reason): Report
+ autoHideContent(): void
+ autoSuspendUser(duration): void
+ assignToModerator(moderatorId): void
+ resolveCase(action, reason): void
+ appeal(userId, reason): void
```

**Domain Events:**

- ReportAdded
- ContentAutoHidden
- UserAutoSuspended
- ModerationCaseAssigned
- ModerationActionApplied
- ModerationAppealed

**Aggregate Boyutu:** Orta (~1 entity + 5-20 reports)  
**Transaction Boundary:** Report + auto-action işlemleri  
**Consistency:** Strong (auto-moderation), Eventual (manual review)

**Tasarım Notu:**

- Spam detection service (emoji ratio, URL shorteners)
- Violation history tracking (User aggregate'ten query)
- Auto-suspend threshold profession-specific olabilir
- Appeal sadece 1 kez (business rule)

---

## 4. Aggregate Transaction Boundaries

### 4.1 Single Aggregate Transaction

**Prensip:** Bir transaction sadece bir aggregate'i değiştirebilir.

**Meslektaş Örnekleri:**

**Post Like Ekleme (Single Aggregate):**

```
@Transactional
public void likePost(PostId postId, UserId userId) {
    // 1. Aggregate load
    Post post = postRepository.findById(postId)
        .orElseThrow(() -> new PostNotFoundException());

    // 2. Domain logic (invariant check + state change)
    post.addLike(userId);  // Throws exception if already liked

    // 3. Event publish
    // PostLikedEvent published inside addLike()

    // 4. Aggregate save
    postRepository.save(post);

    // Transaction commit → Event dispatched → Notification created
}
```

**User Block (Single Aggregate):**

```
@Transactional
public void blockUser(UserId blockerId, UserId blockedId) {
    // 1. Aggregate load
    User blocker = userRepository.findById(blockerId)
        .orElseThrow(() -> new UserNotFoundException());

    // 2. Domain logic
    blocker.blockUser(blockedId);  // Invariant check

    // 3. Event publish
    // UserBlockedEvent published inside blockUser()

    // 4. Aggregate save
    userRepository.save(blocker);

    // Transaction commit → Event dispatched → Conversations archived
}
```

### 4.2 Multi-Aggregate Coordination (Eventual Consistency)

**Prensip:** İki aggregate'i güncellemek için Domain Event kullan.

**Verification Approval → User Update (2 Aggregates):**

```
// Transaction 1: VerificationRequest Aggregate
@Transactional
public void approveVerification(VerificationRequestId id, ConfidenceScore score) {
    VerificationRequest request = verificationRepository.findById(id)
        .orElseThrow();

    request.approve(score);  // Status = APPROVED
    verificationRepository.save(request);

    // VerificationApprovedEvent published
}

// Transaction 2: User Aggregate (Event Handler)
@TransactionalEventListener
public void onVerificationApproved(VerificationApprovedEvent event) {
    User user = userRepository.findById(event.getUserId())
        .orElseThrow();

    user.markAsVerified();  // verificationStatus = VERIFIED
    userRepository.save(user);

    // UserVerifiedEvent published → Notification
}

Eventual Consistency Delay: ~200-1000ms
```

**Post Delete → Notification Cleanup (2 Aggregates):**

```
// Transaction 1: Post Aggregate
@Transactional
public void deletePost(PostId postId, UserId userId) {
    Post post = postRepository.findById(postId)
        .orElseThrow();

    if (!post.isAuthor(userId)) {
        throw new UnauthorizedException();
    }

    post.delete();  // Soft delete
    postRepository.save(post);

    // PostDeletedEvent published
}

// Transaction 2: Notification Aggregate (Event Handler)
@TransactionalEventListener
public void onPostDeleted(PostDeletedEvent event) {
    // Delete related notifications
    List<Notification> notifications = notificationRepository
        .findByTargetPostId(event.getPostId());

    notifications.forEach(Notification::delete);
    notificationRepository.saveAll(notifications);
}

Eventual Consistency Delay: ~500-2000ms
```

**User Banned → Cascade Cleanup (4 Aggregates):**

```
// Transaction 1: User Aggregate
@Transactional
public void banUser(UserId userId, String reason) {
    User user = userRepository.findById(userId)
        .orElseThrow();

    user.ban(reason);  // status = BANNED
    userRepository.save(user);

    // UserBannedEvent published
}

// Transaction 2: Post Aggregate (Event Handler)
@TransactionalEventListener
public void onUserBanned_DeletePosts(UserBannedEvent event) {
    List<Post> posts = postRepository.findByAuthorId(event.getUserId());
    posts.forEach(Post::delete);
    postRepository.saveAll(posts);
}

// Transaction 3: Conversation Aggregate (Event Handler)
@TransactionalEventListener
public void onUserBanned_ArchiveConversations(UserBannedEvent event) {
    List<Conversation> conversations = conversationRepository
        .findByParticipant(event.getUserId());
    conversations.forEach(Conversation::archive);
    conversationRepository.saveAll(conversations);
}

// Transaction 4: Notification Aggregate (Event Handler)
@TransactionalEventListener
public void onUserBanned_DeleteNotifications(UserBannedEvent event) {
    notificationRepository.deleteByRecipientId(event.getUserId());
}

Eventual Consistency Delay: ~1-3 seconds (sequential events)
```

### 4.3 Saga Pattern (Long-Running Transactions)

**Meslektaş'ta Kullanım:** AI Verification Pipeline (6-stage process)

**Problem:**

- AI pipeline 6 stage (OCR, Face Match, Liveness, Authenticity, Data Validation, Final Decision)
- Her stage AWS Rekognition API call (100-500ms)
- Total süre: 1-3 saniye
- Long-running transaction sorun yaratır (database lock)

**Çözüm: Orchestration Saga**

```
@Service
public class VerificationSagaOrchestrator {

    @Transactional
    public void startVerification(VerificationRequestId id) {
        VerificationRequest request = verificationRepository.findById(id)
            .orElseThrow();

        request.start();  // Status = PROCESSING
        verificationRepository.save(request);

        // Saga başlat (async)
        sagaExecutor.execute(new VerificationSaga(id));
    }
}

public class VerificationSaga implements Saga {

    @Override
    public void execute() {
        try {
            // Stage 1: OCR (AWS Rekognition)
            OCRResult ocr = ocrService.extractText(idDocumentUrl);
            saveProgress(STAGE_1_COMPLETED, ocr);

            // Stage 2: Face Comparison
            FaceMatchResult faceMatch = faceComparisonService
                .compareFaces(idDocumentUrl, selfieUrl);
            saveProgress(STAGE_2_COMPLETED, faceMatch);

            // Stage 3: Liveness Detection
            LivenessResult liveness = livenessService.detectLiveness(selfieUrl);
            saveProgress(STAGE_3_COMPLETED, liveness);

            // Stage 4: Document Authenticity
            AuthenticityResult authenticity = authenticityService
                .verifyDocument(idDocumentUrl);
            saveProgress(STAGE_4_COMPLETED, authenticity);

            // Stage 5: Data Validation
            ValidationResult validation = validationService
                .validateData(ocr, userData);
            saveProgress(STAGE_5_COMPLETED, validation);

            // Stage 6: Final Decision
            ConfidenceScore finalScore = calculateConfidenceScore(
                ocr, faceMatch, liveness, authenticity, validation
            );

            if (finalScore.getValue() >= 85) {
                approveVerification(finalScore);
            } else if (finalScore.getValue() >= 60) {
                sendToManualReview(finalScore);
            } else {
                rejectVerification("Low confidence score");
            }

        } catch (Exception e) {
            compensate();  // Rollback logic
        }
    }

    @Transactional
    private void saveProgress(VerificationStage stage, Object result) {
        VerificationRequest request = verificationRepository.findById(id)
            .orElseThrow();
        request.updateProgress(stage, result);
        verificationRepository.save(request);
    }

    @Transactional
    private void compensate() {
        VerificationRequest request = verificationRepository.findById(id)
            .orElseThrow();
        request.fail("AI processing failed");
        verificationRepository.save(request);
    }
}
```

**Saga Özellikleri:**

- Her stage ayrı transaction (short-lived)
- Progress database'e kaydedilir (resume capability)
- Failure durumunda compensate edilir
- Total süre: 1-3 saniye (user-friendly)
- VerificationRequest aggregate her stage'de güncellenir

---

## 5. Aggregate Performance Optimizasyonu

### 5.1 Lazy Loading

**Prensip:** Aggregate içindeki collection'lar lazy load edilmeli.

**Post Aggregate - Lazy Loading:**

```
@Entity
public class Post {
    @Id
    private PostId id;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    private Set<UserId> likes = new HashSet<>();
}

// Kullanım:
Post post = postRepository.findById(postId);  // Comments yüklenmez
String content = post.getContent();  // Fast query

// Sadece gerektiğinde yükle:
List<Comment> comments = post.getComments();  // Lazy load trigger
```

**Conversation Aggregate - Pagination:**

```
@Entity
public class Conversation {
    @Id
    private ConversationId id;

    // Message'lar repository'den pagination ile yüklenir
    // Aggregate'te collection yok!
}

// Message'lar ayrı repository:
public interface MessageRepository {
    Page<Message> findByConversationId(
        ConversationId conversationId,
        Pageable pageable
    );
}

// Kullanım:
Conversation conversation = conversationRepository.findById(id);
Page<Message> messages = messageRepository.findByConversationId(
    conversation.getId(),
    PageRequest.of(0, 50)  // Son 50 mesaj
);
```

### 5.2 Snapshot Pattern

**Prensip:** Büyük aggregate yerine snapshot (value object) kullan.

**Notification - UserSnapshot:**

```
@Entity
public class Notification {
    @Id
    private NotificationId id;

    private UserId recipientId;  // ID referansı

    @Embedded
    private UserSnapshot actor;  // Value Object - snapshot
}

@Embeddable
public class UserSnapshot {
    private String fullName;
    private Profession profession;
    private String profileImageUrl;

    // Notification gönderildiği andaki user bilgisi
    // User sonradan değişse bile notification değişmez
}
```

**Post Feed - PostSummary:**

```
// Anti-pattern: Full Post aggregate load
List<Post> posts = postRepository.findByProfession(profession);  // Heavy!

// Better: Projection kullan
public interface PostSummary {
    PostId getId();
    String getContent();
    UserId getAuthorId();
    int getLikeCount();
    int getCommentCount();
    Instant getCreatedAt();
}

List<PostSummary> posts = postRepository.findSummaryByProfession(profession);

// JPQL:
@Query("""
    SELECT p.id as id, p.content as content, p.authorId as authorId,
           SIZE(p.likes) as likeCount, SIZE(p.comments) as commentCount,
           p.createdAt as createdAt
    FROM Post p
    WHERE p.profession = :profession AND p.status = 'ACTIVE'
    ORDER BY p.createdAt DESC
""")
List<PostSummary> findSummaryByProfession(@Param("profession") Profession profession);
```

### 5.3 Caching Strategy

**Prensip:** Sık okunan aggregate'leri cache'le.

**User Aggregate - Redis Cache:**

```
@Service
public class UserService {

    @Cacheable(value = "users", key = "#userId")
    public User findById(UserId userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException());
    }

    @CacheEvict(value = "users", key = "#user.id")
    public void update(User user) {
        userRepository.save(user);
    }
}

// Cache config:
spring:
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 1 hour
```

**Post Like Count - Redis Cache:**

```
@Service
public class PostCacheService {

    private final RedisTemplate<String, Integer> redisTemplate;

    public int getLikeCount(PostId postId) {
        String key = "post:like:count:" + postId.getValue();
        Integer count = redisTemplate.opsForValue().get(key);

        if (count == null) {
            Post post = postRepository.findById(postId).orElseThrow();
            count = post.getLikes().size();
            redisTemplate.opsForValue().set(key, count, 1, TimeUnit.HOURS);
        }

        return count;
    }

    public void incrementLikeCount(PostId postId) {
        String key = "post:like:count:" + postId.getValue();
        redisTemplate.opsForValue().increment(key);
    }
}
```

**Conversation Unread Count - Redis:**

```
@Service
public class UnreadCountService {

    public int getUnreadCount(UserId userId) {
        String key = "user:unread:" + userId.getValue();
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? Integer.parseInt(value) : 0;
    }

    public void incrementUnreadCount(UserId userId, ConversationId conversationId) {
        // Global unread count
        String globalKey = "user:unread:" + userId.getValue();
        redisTemplate.opsForValue().increment(globalKey);

        // Per-conversation unread count
        String convKey = "conversation:unread:" + conversationId.getValue() + ":" + userId.getValue();
        redisTemplate.opsForValue().increment(convKey);
    }

    public void resetUnreadCount(UserId userId, ConversationId conversationId) {
        String convKey = "conversation:unread:" + conversationId.getValue() + ":" + userId.getValue();
        redisTemplate.opsForValue().set(convKey, "0");

        // Recalculate global unread
        recalculateGlobalUnread(userId);
    }
}
```

---

## 6. Aggregate Testing Stratejisi

### 6.1 Unit Testing (Aggregate Logic)

**Prensip:** Aggregate'in domain logic'ini test et (repository mock'la).

**Post Aggregate Test:**

```java
class PostTest {

    @Test
    void should_add_like_when_user_not_already_liked() {
        // Given
        Post post = Post.create(
            authorId,
            Profession.DOCTOR,
            "Test content",
            List.of()
        );
        UserId likerId = new UserId(UUID.randomUUID());

        // When
        post.addLike(likerId);

        // Then
        assertThat(post.getLikes()).contains(likerId);
        assertThat(post.getLikeCount()).isEqualTo(1);
    }

    @Test
    void should_throw_exception_when_user_already_liked() {
        // Given
        Post post = Post.create(authorId, Profession.DOCTOR, "Test", List.of());
        UserId likerId = new UserId(UUID.randomUUID());
        post.addLike(likerId);

        // When & Then
        assertThatThrownBy(() -> post.addLike(likerId))
            .isInstanceOf(UserAlreadyLikedPostException.class);
    }

    @Test
    void should_throw_exception_when_commenting_on_deleted_post() {
        // Given
        Post post = Post.create(authorId, Profession.DOCTOR, "Test", List.of());
        post.delete();

        Comment comment = Comment.create(commenterId, "Nice post!");

        // When & Then
        assertThatThrownBy(() -> post.addComment(comment))
            .isInstanceOf(CannotCommentOnDeletedPostException.class);
    }
}
```

**User Aggregate Test:**

```java
class UserTest {

    @Test
    void should_block_user_when_not_already_blocked() {
        // Given
        User user = User.register(
            new Email("test@example.com"),
            new Password("Test1234"),
            new FullName("Test User"),
            Profession.ENGINEER
        );
        UserId blockedUserId = new UserId(UUID.randomUUID());

        // When
        user.blockUser(blockedUserId);

        // Then
        assertThat(user.getBlockedUsers()).contains(blockedUserId);
    }

    @Test
    void should_throw_exception_when_blocking_self() {
        // Given
        User user = User.register(...);

        // When & Then
        assertThatThrownBy(() -> user.blockUser(user.getId()))
            .isInstanceOf(CannotBlockSelfException.class);
    }

    @Test
    void should_throw_exception_when_updating_verified_profession() {
        // Given
        User user = User.register(...);
        user.markAsVerified();  // verificationStatus = VERIFIED

        // When & Then
        assertThatThrownBy(() -> user.updateProfession(Profession.LAWYER))
            .isInstanceOf(VerifiedUserProfessionImmutableException.class);
    }
}
```

### 6.2 Integration Testing (Repository + Database)

**Prensip:** Aggregate persistence'ı test et (Testcontainers ile real database).

**Post Repository Integration Test:**

```java
@DataJpaTest
@Testcontainers
class PostRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired
    private PostRepository postRepository;

    @Test
    void should_save_and_load_post_with_comments() {
        // Given
        Post post = Post.create(authorId, Profession.DOCTOR, "Test", List.of());
        Comment comment = Comment.create(commenterId, "Nice!");
        post.addComment(comment);

        // When
        Post saved = postRepository.save(post);
        Post loaded = postRepository.findById(saved.getId()).orElseThrow();

        // Then
        assertThat(loaded.getComments()).hasSize(1);
        assertThat(loaded.getComments().get(0).getContent()).isEqualTo("Nice!");
    }

    @Test
    void should_find_posts_by_profession() {
        // Given
        Post doctorPost = Post.create(authorId, Profession.DOCTOR, "Medical", List.of());
        Post engineerPost = Post.create(authorId, Profession.ENGINEER, "Tech", List.of());
        postRepository.saveAll(List.of(doctorPost, engineerPost));

        // When
        List<Post> doctorPosts = postRepository.findByProfession(Profession.DOCTOR);

        // Then
        assertThat(doctorPosts).hasSize(1);
        assertThat(doctorPosts.get(0).getContent()).isEqualTo("Medical");
    }
}
```

### 6.3 Domain Event Testing

**Prensip:** Aggregate'in event publish ettiğini test et.

**Post Event Test:**

```java
class PostEventTest {

    private TestDomainEventPublisher eventPublisher;

    @BeforeEach
    void setup() {
        eventPublisher = new TestDomainEventPublisher();
        DomainEventPublisher.setInstance(eventPublisher);
    }

    @Test
    void should_publish_post_liked_event_when_like_added() {
        // Given
        Post post = Post.create(authorId, Profession.DOCTOR, "Test", List.of());
        UserId likerId = new UserId(UUID.randomUUID());

        // When
        post.addLike(likerId);

        // Then
        assertThat(eventPublisher.getPublishedEvents())
            .hasSize(1)
            .first()
            .isInstanceOf(PostLikedEvent.class)
            .satisfies(event -> {
                PostLikedEvent likedEvent = (PostLikedEvent) event;
                assertThat(likedEvent.getPostId()).isEqualTo(post.getId());
                assertThat(likedEvent.getLikerId()).isEqualTo(likerId);
            });
    }
}

// Test helper:
class TestDomainEventPublisher implements DomainEventPublisher {
    private final List<DomainEvent> publishedEvents = new ArrayList<>();

    @Override
    public void publish(DomainEvent event) {
        publishedEvents.add(event);
    }

    public List<DomainEvent> getPublishedEvents() {
        return publishedEvents;
    }
}
```

---

## 7. Aggregate Anti-Patterns

### 7.1 Anemic Domain Model

**Anti-Pattern:** Aggregate'te sadece getter/setter var, logic yok.

```
❌ Yanlış:
class Post {
    private PostId id;
    private String content;
    private PostStatus status;

    // Sadece getter/setter - LOGIC YOK!
    public PostStatus getStatus() { return status; }
    public void setStatus(PostStatus status) { this.status = status; }
}

// Logic service'te:
class PostService {
    public void deletePost(PostId postId) {
        Post post = postRepository.findById(postId);
        post.setStatus(DELETED);  // Business rule check yok!
        postRepository.save(post);
    }
}
```

```
✅ Doğru (Rich Domain Model):
class Post {
    private PostId id;
    private String content;
    private PostStatus status;

    // Domain logic aggregate içinde
    public void delete() {
        if (this.status == DELETED) {
            throw new PostAlreadyDeletedException();
        }
        this.status = DELETED;
        this.updatedAt = Instant.now();

        DomainEventPublisher.publish(new PostDeletedEvent(this.id));
    }

    // Private setter - dışarıdan erişim yok
    private void setStatus(PostStatus status) {
        this.status = status;
    }
}
```

### 7.2 God Aggregate

**Anti-Pattern:** Tek bir aggregate'e çok fazla entity yığmak.

```
❌ Yanlış (User aggregate içinde her şey):
class User {
    private UserId id;
    private Email email;

    // Post'lar user aggregate'inde - YANLIŞ!
    private List<Post> posts;

    // Conversation'lar user aggregate'inde - YANLIŞ!
    private List<Conversation> conversations;

    // Notification'lar user aggregate'inde - YANLIŞ!
    private List<Notification> notifications;
}

Sorunlar:
- User load edildiğinde her şey yüklenir (performance)
- Transaction lock çok büyük (concurrency)
- Single Responsibility ihlal edilmiş
```

```
✅ Doğru (Ayrı aggregate'ler):
class User {
    private UserId id;
    private Email email;
    private Set<UserId> blockedUsers;  // Sadece ID referansları
}

class Post {
    private PostId id;
    private UserId authorId;  // ID referansı
    private String content;
}

class Conversation {
    private ConversationId id;
    private UserId participant1Id;  // ID referansı
    private UserId participant2Id;
}
```

### 7.3 Aggregate Referencing Aggregate

**Anti-Pattern:** Aggregate'ler arası entity referansı.

```
❌ Yanlış:
class Post {
    private PostId id;
    private User author;  // Entity referansı - YANLIŞ!
}

class Comment {
    private CommentId id;
    private Post post;  // Entity referansı - YANLIŞ!
    private User commenter;
}

Sorunlar:
- Cascade loading (N+1 query)
- Circular dependency riski
- Mikroservislere ayrılamaz
```

```
✅ Doğru (ID referansları):
class Post {
    private PostId id;
    private UserId authorId;  // ID referansı
}

class Comment {
    private CommentId id;
    private PostId postId;  // ID referansı
    private UserId commenterId;
}

// İlişkili entity'ye ihtiyaç varsa:
Post post = postRepository.findById(postId);
User author = userRepository.findById(post.getAuthorId());
```

### 7.4 Missing Invariant Protection

**Anti-Pattern:** Invariant'lar korunmuyor.

```
❌ Yanlış:
class User {
    private Profession profession;
    private VerificationStatus verificationStatus;

    // Public setter - invariant koruması yok!
    public void setProfession(Profession profession) {
        this.profession = profession;
    }
}

// Service'te:
user.setProfession(Profession.LAWYER);  // VERIFIED user'ın profession'ı değişti!
```

```
✅ Doğru:
class User {
    private Profession profession;
    private VerificationStatus verificationStatus;

    public void updateProfession(Profession newProfession) {
        // Invariant check
        if (this.verificationStatus == VERIFIED) {
            throw new VerifiedUserProfessionImmutableException();
        }

        this.profession = newProfession;
        this.verificationStatus = NOT_VERIFIED;
    }

    // Private setter
    private void setProfession(Profession profession) {
        this.profession = profession;
    }
}
```

---

## 8. Implementasyon Checklist

### 8.1 Yeni Aggregate Oluşturma

```
☐ Aggregate Root entity oluştur
☐ Aggregate sınırını belirle (hangi entity'ler içeride?)
☐ Invariant'ları tanımla ve koru
☐ Factory method ekle (create, reconstitute)
☐ Domain logic method'ları ekle (public API)
☐ Domain Event'leri publish et
☐ Repository interface tanımla
☐ Value Object'leri embed et
☐ ID referansları kullan (diğer aggregate'lere)
☐ Private setter'lar ekle
☐ Unit test'ler yaz
☐ Integration test'ler yaz
```

### 8.2 Aggregate Refactoring

```
☐ Aggregate boyutunu ölç (entity + collection count)
☐ Transaction boundary analizi yap
☐ Concurrency sorunlarını tespit et
☐ N+1 query'leri tespit et
☐ Lazy loading ekle
☐ Cache stratejisi belirle
☐ Snapshot pattern uygula (gerekiyorsa)
☐ Event sourcing düşün (audit trail için)
☐ Performance test yap
☐ Mikroservis uyumluluğunu kontrol et
```

### 8.3 Code Review Checklist

```
☐ Aggregate root dışından entity erişimi yok mu?
☐ Invariant'lar korunuyor mu?
☐ ID referansları kullanılmış mı?
☐ Domain Event'ler publish ediliyor mu?
☐ Transaction boundary doğru mu?
☐ Eventual consistency mantıklı mı?
☐ Anemic domain model yok mu?
☐ God aggregate yok mu?
☐ Public setter yok mu?
☐ Unit test coverage >80% mi?
```

---

## 9. Özet

### Aggregate Tasarım Prensipleri:

1. **Model True Invariants:** Sadece gerçek iş kuralları için aggregate sınırı çiz
2. **Design Small Aggregates:** Mümkün olduğunca küçük tut (performance + concurrency)
3. **Reference by ID:** Aggregate'ler arası ID kullan (loose coupling + scalability)
4. **Eventual Consistency:** Aggregate dışı güncellemeler için domain event kullan
5. **Protect Invariants:** Domain logic aggregate içinde (rich domain model)

### Meslektaş Aggregate Summary:

- **9 Aggregate Root:** User, AuthToken, VerificationRequest, Post, Conversation, Message, Notification, ModerationCase
- **45+ Business Rule:** Her aggregate kendi invariant'larını koruyor
- **36 Domain Event:** Aggregate'ler arası eventual consistency
- **Transaction Boundaries:** Her aggregate bağımsız transaction (mikroservis ready)

### Next Steps:

- **Value Object Katalog:** 09-VALUE-OBJECTS.md (Email, Password, Profession, vb.)
- **Domain Service'ler:** 10-DOMAIN-SERVICES.md (Aggregate'e sığmayan logic)
- **Domain Event Patterns:** 11-DOMAIN-EVENTS.md (Event publishing, handling, replay)
- **Repository Patterns:** 12-REPOSITORIES.md (Aggregate persistence stratejisi)
