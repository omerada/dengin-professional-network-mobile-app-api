# 🏗️ Backend Mimari Dökümantasyonu

**Versiyon:** 1.0  
**Tarih:** 30 Kasım 2025  
**Mimari Yaklaşım:** Hybrid DDD-Lite

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Mimari Kararlar](#mimari-kararlar)
3. [Package Yapısı](#package-yapısı)
4. [Bounded Contexts](#bounded-contexts)
5. [Domain Model](#domain-model)
6. [Application Services](#application-services)
7. [Infrastructure](#infrastructure)
8. [API Design](#api-design)
9. [Data Flow](#data-flow)
10. [Security Architecture](#security-architecture)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Strategy](#deployment-strategy)

---

## 🎯 Genel Bakış

### Mimari Filozofisi

Meslektaş backend mimarisi, **pragmatik DDD (Domain-Driven Design Lite)** yaklaşımını benimser:

**Temel Prensipler:**

1. **Strategic DDD:** Bounded contexts ile domain'i ayır
2. **Selective Tactical DDD:** Sadece karmaşık domain'lere uygula
3. **Modularity First:** Her context bağımsız çalışabilir
4. **API-First:** RESTful API odaklı tasarım
5. **Evolvability:** Microservices'e kolay geçiş

### Teknoloji Stack

```yaml
Framework: Spring Boot 3.2.x
Language: Java 17 LTS
Build Tool: Maven 3.9
Database: PostgreSQL 15
Cache: Redis 7.x
ORM: Spring Data JPA + Hibernate 6
Security: Spring Security 6 + JWT
API Docs: SpringDoc OpenAPI 3
Testing: JUnit 5 + Mockito + Testcontainers
Migration: Flyway
Messaging: Spring WebSocket + STOMP
```

---

## 🧠 Mimari Kararlar

### Karar 1: Hybrid DDD Yaklaşımı

**Problem:** Full DDD mi, Layered Architecture mi?

**Karar:** Hybrid yaklaşım

- **Karmaşık domain'ler:** DDD (Verification, Notification)
- **Basit CRUD:** Layered (Social, Identity)

**Gerekçe:**

- MVP hızını korur
- Gelecek için ölçeklenebilir
- Ekip öğrenmesine zaman tanır
- Over-engineering'den kaçınır

### Karar 2: Monolith-First

**Problem:** Microservices mi, Monolith mi?

**Karar:** Modular Monolith (Microservices-ready)

**Gerekçe:**

- MVP için daha hızlı
- Deploy ve debug daha kolay
- Bounded context'ler gelecekte kolayca ayrıştırılabilir
- Küçük ekip için uygun

### Karar 3: Database-Per-Context (Gelecek)

**Problem:** Tek database mi, context başına mı?

**Karar:** MVP'de tek PostgreSQL, gelecekte schema separation

**Gerekçe:**

- MVP'de basitlik
- Transaction yönetimi kolay
- Gelecekte schema bazlı ayrım → Database split

### Karar 4: Event-Driven Communication

**Problem:** Direct call mı, event-driven mı?

**Karar:** Domain Events + Spring Application Events

**Gerekçe:**

- Context'ler arası loose coupling
- Gelecekte message queue'ya kolay geçiş
- Audit trail kolaylığı

---

## 📦 Package Yapısı

### Root Package Structure

```
com.meslektas/
│
├── MeslektasApplication.java       # Main application
│
├── config/                         # Global configurations
│   ├── SecurityConfig.java
│   ├── WebConfig.java
│   ├── WebSocketConfig.java
│   ├── RedisConfig.java
│   ├── JpaConfig.java
│   └── OpenApiConfig.java
│
├── common/                         # Shared Kernel
│   ├── domain/
│   │   ├── BaseEntity.java
│   │   ├── BaseDomainEvent.java
│   │   └── ValueObject.java
│   │
│   ├── exception/
│   │   ├── DomainException.java
│   │   ├── ResourceNotFoundException.java
│   │   ├── UnauthorizedException.java
│   │   └── ValidationException.java
│   │
│   ├── util/
│   │   ├── DateUtils.java
│   │   ├── StringUtils.java
│   │   └── ValidationUtils.java
│   │
│   └── api/
│       ├── ApiResponse.java
│       ├── PageResponse.java
│       └── ErrorResponse.java
│
├── verification/                   # 🎯 DDD BOUNDED CONTEXT
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
│   (Detaylı yapı aşağıda)
│
├── notification/                   # 🎯 DDD BOUNDED CONTEXT
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
│   (Detaylı yapı aşağıda)
│
├── messaging/                      # 🎯 DDD BOUNDED CONTEXT
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
│   (Detaylı yapı aşağıda)
│
├── social/                         # ⚙️ LAYERED ARCHITECTURE
│   ├── entity/
│   ├── repository/
│   ├── service/
│   ├── controller/
│   └── dto/
│   (Detaylı yapı aşağıda)
│
└── identity/                       # ⚙️ LAYERED ARCHITECTURE
    ├── entity/
    ├── repository/
    ├── service/
    ├── controller/
    └── security/
    (Detaylı yapı aşağıda)
```

---

## 🎯 Bounded Contexts

### Context 1: Verification Context (DDD)

**Sorumluluk:** Meslek doğrulama süreci

**Domain Model:**

```
VerificationRequest (Aggregate Root)
  ├── VerificationDocument (Entity)
  ├── ConfidenceScore (Value Object)
  ├── VerificationDecision (Value Object)
  └── VerificationStatus (Enum)
```

**Package Yapısı:**

```
verification/
│
├── domain/                         # Domain Layer
│   ├── model/
│   │   ├── VerificationRequest.java       # Aggregate Root
│   │   ├── VerificationDocument.java      # Entity
│   │   ├── ConfidenceScore.java           # Value Object
│   │   ├── VerificationDecision.java      # Value Object
│   │   └── VerificationStatus.java        # Enum
│   │
│   ├── service/
│   │   ├── VerificationDomainService.java # Domain logic
│   │   └── VerificationPolicy.java        # Business rules
│   │
│   ├── repository/
│   │   └── VerificationRepository.java    # Interface
│   │
│   └── event/
│       ├── VerificationSubmittedEvent.java
│       ├── VerificationApprovedEvent.java
│       ├── VerificationRejectedEvent.java
│       └── ManualReviewRequiredEvent.java
│
├── application/                    # Application Layer
│   ├── command/
│   │   ├── SubmitVerificationCommand.java
│   │   ├── ApproveVerificationCommand.java
│   │   └── RejectVerificationCommand.java
│   │
│   ├── query/
│   │   ├── GetVerificationStatusQuery.java
│   │   └── ListPendingVerificationsQuery.java
│   │
│   ├── service/
│   │   ├── VerificationApplicationService.java
│   │   └── VerificationQueryService.java
│   │
│   └── dto/
│       ├── VerificationRequestDto.java
│       └── VerificationResponseDto.java
│
├── infrastructure/                 # Infrastructure Layer
│   ├── persistence/
│   │   ├── JpaVerificationRequest.java    # JPA Entity
│   │   ├── JpaVerificationRepository.java
│   │   └── VerificationMapper.java
│   │
│   ├── ai/
│   │   ├── AIVerificationService.java     # Interface
│   │   └── AwsRekognitionService.java     # Implementation
│   │
│   └── storage/
│       └── DocumentStorageService.java
│
└── api/                            # Presentation Layer
    ├── VerificationController.java
    ├── dto/
    │   ├── SubmitVerificationRequest.java
    │   └── VerificationResponse.java
    └── VerificationEventListener.java
```

**Key Components:**

```java
// Aggregate Root
@Entity
@Table(name = "verification_requests")
public class VerificationRequest extends BaseEntity {

    @EmbeddedId
    private VerificationId id;

    @Embedded
    private VerificationDocument document;

    @Embedded
    private ConfidenceScore confidenceScore;

    @Enumerated(EnumType.STRING)
    private VerificationStatus status;

    // Domain behavior
    public void submit() {
        if (status != VerificationStatus.DRAFT) {
            throw new InvalidVerificationStateException();
        }
        this.status = VerificationStatus.PENDING;
        registerEvent(new VerificationSubmittedEvent(this.id));
    }

    public void processAIResult(ConfidenceScore score) {
        this.confidenceScore = score;
        VerificationDecision decision = VerificationPolicy.decide(score);

        if (decision.isAutoApproved()) {
            approve();
        } else if (decision.isAutoRejected()) {
            reject("Low confidence score");
        } else {
            requireManualReview();
        }
    }

    private void approve() {
        this.status = VerificationStatus.APPROVED;
        registerEvent(new VerificationApprovedEvent(this.id));
    }

    private void reject(String reason) {
        this.status = VerificationStatus.REJECTED;
        registerEvent(new VerificationRejectedEvent(this.id, reason));
    }

    private void requireManualReview() {
        this.status = VerificationStatus.MANUAL_REVIEW;
        registerEvent(new ManualReviewRequiredEvent(this.id));
    }
}

// Value Object
public class ConfidenceScore implements ValueObject {
    private final BigDecimal value;

    public ConfidenceScore(BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) < 0 ||
            value.compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Score must be 0-100");
        }
        this.value = value;
    }

    public boolean isHighConfidence() {
        return value.compareTo(new BigDecimal("85")) >= 0;
    }

    public boolean isLowConfidence() {
        return value.compareTo(new BigDecimal("60")) < 0;
    }
}

// Domain Service
@Service
public class VerificationDomainService {

    public VerificationDecision evaluateVerification(
        VerificationDocument document,
        ConfidenceScore score
    ) {
        // Complex business logic here
        if (score.isHighConfidence() && document.isValid()) {
            return VerificationDecision.autoApprove();
        }
        // ... more logic
    }
}

// Application Service
@Service
@Transactional
public class VerificationApplicationService {

    private final VerificationRepository repository;
    private final AIVerificationService aiService;
    private final ApplicationEventPublisher eventPublisher;

    public VerificationId submitVerification(SubmitVerificationCommand command) {
        // Create aggregate
        VerificationRequest request = VerificationRequest.create(
            command.userId(),
            command.professionId(),
            command.documentUrl()
        );

        // Submit
        request.submit();

        // Save
        repository.save(request);

        // Publish events
        request.getEvents().forEach(eventPublisher::publishEvent);

        // Trigger AI processing (async)
        aiService.processAsync(request.getId());

        return request.getId();
    }
}
```

---

### Context 2: Notification Context (DDD)

**Sorumluluk:** Bildirim yönetimi ve routing

**Domain Model:**

```
Notification (Aggregate Root)
  ├── Recipient (Value Object)
  ├── NotificationChannel (Value Object)
  ├── NotificationPriority (Enum)
  └── DeliveryStatus (Value Object)
```

**Package Yapısı:**

```
notification/
│
├── domain/
│   ├── model/
│   │   ├── Notification.java              # Aggregate Root
│   │   ├── Recipient.java                 # Value Object
│   │   ├── NotificationChannel.java       # Value Object (PUSH/EMAIL/IN_APP)
│   │   ├── NotificationPriority.java      # Enum
│   │   └── DeliveryStatus.java            # Value Object
│   │
│   ├── service/
│   │   ├── NotificationRoutingService.java
│   │   └── NotificationPolicy.java
│   │
│   ├── repository/
│   │   └── NotificationRepository.java
│   │
│   └── event/
│       ├── NotificationSentEvent.java
│       └── NotificationFailedEvent.java
│
├── application/
│   ├── command/
│   │   ├── SendNotificationCommand.java
│   │   └── MarkAsReadCommand.java
│   │
│   ├── service/
│   │   └── NotificationApplicationService.java
│   │
│   └── dto/
│       └── NotificationDto.java
│
├── infrastructure/
│   ├── persistence/
│   │   └── JpaNotificationRepository.java
│   │
│   ├── sender/
│   │   ├── NotificationSender.java        # Interface
│   │   ├── FcmNotificationSender.java     # Push
│   │   ├── EmailNotificationSender.java   # Email
│   │   └── InAppNotificationSender.java   # In-app
│   │
│   └── template/
│       └── NotificationTemplateEngine.java
│
└── api/
    └── NotificationController.java
```

**Key Components:**

```java
// Aggregate Root
@Entity
public class Notification extends BaseEntity {

    @Embedded
    private Recipient recipient;

    @Embedded
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    private NotificationPriority priority;

    private String title;
    private String message;

    @Embedded
    private DeliveryStatus deliveryStatus;

    // Domain behavior
    public void send() {
        if (deliveryStatus.isDelivered()) {
            throw new AlreadyDeliveredException();
        }

        deliveryStatus = DeliveryStatus.sending();
        registerEvent(new NotificationSendingEvent(this));
    }

    public void markAsDelivered() {
        deliveryStatus = DeliveryStatus.delivered();
        registerEvent(new NotificationSentEvent(this.getId()));
    }

    public void markAsFailed(String reason) {
        deliveryStatus = DeliveryStatus.failed(reason);
        registerEvent(new NotificationFailedEvent(this.getId(), reason));
    }
}

// Domain Service - Routing logic
@Service
public class NotificationRoutingService {

    public List<NotificationChannel> determineChannels(
        NotificationType type,
        UserPreferences preferences
    ) {
        // Complex routing logic
        List<NotificationChannel> channels = new ArrayList<>();

        if (type == NotificationType.VERIFICATION_RESULT) {
            channels.add(NotificationChannel.PUSH);
            channels.add(NotificationChannel.EMAIL);
        } else if (type == NotificationType.NEW_MESSAGE) {
            if (preferences.isPushEnabled()) {
                channels.add(NotificationChannel.PUSH);
            }
            channels.add(NotificationChannel.IN_APP);
        }

        return channels;
    }
}
```

---

### Context 3: Messaging Context (DDD)

**Sorumluluk:** Sohbet ve mesajlaşma

**Domain Model:**

```
Conversation (Aggregate Root)
  ├── Message (Entity)
  ├── Participant (Value Object)
  ├── ReadReceipt (Value Object)
  └── ConversationType (Enum: PRIVATE/GROUP)
```

**Package Yapısı:**

```
messaging/
│
├── domain/
│   ├── model/
│   │   ├── Conversation.java              # Aggregate Root
│   │   ├── Message.java                   # Entity
│   │   ├── Participant.java               # Value Object
│   │   ├── ReadReceipt.java               # Value Object
│   │   └── ConversationType.java          # Enum
│   │
│   ├── service/
│   │   ├── MessageDeliveryService.java
│   │   └── ConversationPolicy.java
│   │
│   ├── repository/
│   │   ├── ConversationRepository.java
│   │   └── MessageRepository.java
│   │
│   └── event/
│       ├── MessageSentEvent.java
│       ├── MessageReadEvent.java
│       └── TypingStartedEvent.java
│
├── application/
│   ├── command/
│   │   ├── SendMessageCommand.java
│   │   ├── MarkAsReadCommand.java
│   │   └── StartConversationCommand.java
│   │
│   ├── query/
│   │   ├── GetConversationQuery.java
│   │   └── SearchMessagesQuery.java
│   │
│   └── service/
│       ├── ChatApplicationService.java
│       └── MessageQueryService.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── JpaConversation.java
│   │   └── JpaMessage.java
│   │
│   └── websocket/
│       ├── WebSocketMessageHandler.java
│       └── StompMessageBroker.java
│
└── api/
    ├── ChatController.java
    ├── WebSocketChatEndpoint.java
    └── dto/
        ├── SendMessageRequest.java
        └── MessageResponse.java
```

**Key Components:**

```java
// Aggregate Root
@Entity
public class Conversation extends BaseEntity {

    @ElementCollection
    private Set<Participant> participants;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<Message> messages;

    @Enumerated(EnumType.STRING)
    private ConversationType type;

    // Domain behavior
    public Message sendMessage(UserId senderId, String content) {
        if (!isParticipant(senderId)) {
            throw new NotParticipantException();
        }

        Message message = Message.create(this, senderId, content);
        messages.add(message);

        registerEvent(new MessageSentEvent(message.getId()));
        return message;
    }

    public void markAsRead(UserId userId, MessageId messageId) {
        Message message = findMessage(messageId);
        message.markAsReadBy(userId);

        registerEvent(new MessageReadEvent(messageId, userId));
    }

    private boolean isParticipant(UserId userId) {
        return participants.stream()
            .anyMatch(p -> p.getUserId().equals(userId));
    }
}

// Entity
@Entity
public class Message {

    @Id
    private MessageId id;

    @ManyToOne
    private Conversation conversation;

    private UserId senderId;
    private String content;

    @ElementCollection
    private Map<UserId, ReadReceipt> readReceipts;

    public void markAsReadBy(UserId userId) {
        if (!readReceipts.containsKey(userId)) {
            readReceipts.put(userId, ReadReceipt.now());
        }
    }

    public boolean isReadBy(UserId userId) {
        return readReceipts.containsKey(userId);
    }
}
```

---

### Context 4: Social Context (Layered)

**Sorumluluk:** Post, Comment, Like, Follow

**Package Yapısı:**

```
social/
│
├── entity/                         # JPA Entities
│   ├── Post.java
│   ├── Comment.java
│   ├── Like.java
│   └── Follow.java
│
├── repository/                     # Spring Data JPA
│   ├── PostRepository.java
│   ├── CommentRepository.java
│   ├── LikeRepository.java
│   └── FollowRepository.java
│
├── service/                        # Business Logic
│   ├── PostService.java
│   ├── CommentService.java
│   ├── LikeService.java
│   ├── FollowService.java
│   └── FeedService.java
│
├── controller/                     # REST Controllers
│   ├── PostController.java
│   ├── CommentController.java
│   └── FeedController.java
│
└── dto/                            # Data Transfer Objects
    ├── request/
    │   ├── CreatePostRequest.java
    │   └── CreateCommentRequest.java
    └── response/
        ├── PostResponse.java
        └── FeedResponse.java
```

**Key Components:**

```java
// Entity
@Entity
@Table(name = "posts")
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User author;

    private String content;

    @Enumerated(EnumType.STRING)
    private PostType type;

    private String mediaUrl;
    private LocalDateTime deletedAt;

    // Basic domain logic
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}

// Service
@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationApplicationService notificationService;

    public PostResponse createPost(CreatePostRequest request, Long authorId) {
        // Fetch user
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate
        if (!author.isVerified()) {
            throw new UnverifiedUserException();
        }

        // Create post
        Post post = new Post();
        post.setAuthor(author);
        post.setContent(request.content());
        post.setType(request.type());

        // Save
        Post savedPost = postRepository.save(post);

        // Notify followers (via notification context)
        notificationService.notifyFollowers(author.getId(), savedPost.getId());

        return PostMapper.toResponse(savedPost);
    }

    public PageResponse<PostResponse> getFeed(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get posts from same profession
        Page<Post> posts = postRepository.findByProfession(
            user.getProfession().getId(),
            pageable
        );

        return PageResponse.of(posts.map(PostMapper::toResponse));
    }
}
```

---

### Context 5: Identity Context (Layered)

**Sorumluluk:** User, Auth, JWT

**Package Yapısı:**

```
identity/
│
├── entity/
│   ├── User.java
│   ├── Profession.java
│   └── RefreshToken.java
│
├── repository/
│   ├── UserRepository.java
│   ├── ProfessionRepository.java
│   └── RefreshTokenRepository.java
│
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── JwtService.java
│   └── OAuth2Service.java
│
├── controller/
│   ├── AuthController.java
│   └── UserController.java
│
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   ├── UserDetailsServiceImpl.java
│   └── OAuth2SuccessHandler.java
│
└── dto/
    ├── request/
    │   ├── LoginRequest.java
    │   ├── RegisterRequest.java
    │   └── RefreshTokenRequest.java
    └── response/
        ├── LoginResponse.java
        └── UserResponse.java
```

---

## 🔄 Data Flow

### End-to-End Flow Örneği: Verification

```
[Mobile App]
    ↓ POST /api/verification/submit
[VerificationController]
    ↓ Validate input
[VerificationApplicationService]
    ↓ Create command
[VerificationRequest] (Aggregate)
    ↓ submit() - Domain behavior
[VerificationRepository] (Interface)
    ↓ save()
[JpaVerificationRepository] (Infrastructure)
    ↓ persist
[PostgreSQL]

    ↓ Domain Event: VerificationSubmittedEvent
[ApplicationEventPublisher]
    ↓
[AIVerificationService] (Async listener)
    ↓ process AI
[AWS Rekognition API]
    ↓ Return confidence score
[VerificationRequest]
    ↓ processAIResult() - Domain logic
    ↓ Decision: Approve/Reject/Manual Review
[VerificationRepository]
    ↓ update status
[PostgreSQL]

    ↓ Domain Event: VerificationApprovedEvent
[NotificationEventListener]
    ↓ Send notification
[NotificationApplicationService]
    ↓
[FCM / Email Sender]
    ↓
[User Device / Email]
```

---

## 🔐 Security Architecture

### Authentication Flow

```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

[AuthController]
    ↓
[AuthService]
    ├─→ [UserRepository] → Find user
    ├─→ BCryptPasswordEncoder → Verify password
    ├─→ [JwtService] → Generate access + refresh tokens
    └─→ Return LoginResponse

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_abc123",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Authorization Flow

```
GET /api/posts/feed
Header: Authorization: Bearer eyJhbGc...

[JwtAuthenticationFilter]
    ├─→ Extract token
    ├─→ Validate signature
    ├─→ Check expiration
    ├─→ Extract userId
    └─→ Set SecurityContext

[PostController] @PreAuthorize("hasRole('USER')")
    ↓ Check if user is verified
[PostService]
    ↓ Business logic
[PostRepository]
    ↓
[PostgreSQL]
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
           /\
          /  \
         / E2E\         # Integration tests (10%)
        /______\
       /        \
      /  Service \      # Service tests (30%)
     /____________\
    /              \
   /    Unit Tests  \   # Domain + utility tests (60%)
  /__________________\
```

### Test Types

**1. Unit Tests (Domain Layer)**

```java
@Test
void shouldAutoApproveWhenHighConfidence() {
    // Given
    ConfidenceScore highScore = new ConfidenceScore(new BigDecimal("90"));
    VerificationRequest request = VerificationRequest.create(...);

    // When
    request.processAIResult(highScore);

    // Then
    assertThat(request.getStatus()).isEqualTo(VerificationStatus.APPROVED);
    assertThat(request.getEvents())
        .anyMatch(e -> e instanceof VerificationApprovedEvent);
}
```

**2. Integration Tests (Application Layer)**

```java
@SpringBootTest
@Testcontainers
class VerificationApplicationServiceIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired
    VerificationApplicationService service;

    @Test
    void shouldSubmitVerification() {
        // Given
        SubmitVerificationCommand command = new SubmitVerificationCommand(...);

        // When
        VerificationId id = service.submitVerification(command);

        // Then
        assertThat(id).isNotNull();
    }
}
```

**3. E2E Tests (API Layer)**

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class VerificationApiE2ETest {

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void shouldSubmitVerificationViaAPI() {
        // Given
        SubmitVerificationRequest request = new SubmitVerificationRequest(...);

        // When
        ResponseEntity<VerificationResponse> response = restTemplate
            .postForEntity("/api/verification/submit", request, VerificationResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

---

## 🚀 Deployment Strategy

### Environment Configuration

```yaml
# application.yml (Common)
spring:
  application:
    name: meslektas-api

# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/meslektas_dev

# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://prod-db.aws.com:5432/meslektas_prod
```

### Docker Compose (Development)

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: meslektas_dev
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
```

---

## 📝 Sonuç

### Mimari Avantajlar

✅ **Modularity:** Bounded contexts birbirinden bağımsız  
✅ **Scalability:** Microservices'e kolay geçiş  
✅ **Testability:** Domain logic kolayca test edilir  
✅ **Maintainability:** İş mantığı merkezi ve açık  
✅ **Evolvability:** Gelecek değişikliklere açık

### Sonraki Adımlar

1. [ ] Environment setup
2. [ ] Database schema creation (Flyway)
3. [ ] Core domain implementation
4. [ ] API development
5. [ ] Testing
6. [ ] Deployment

---

**Hazırlayan:** Backend Team  
**Tarih:** 30 Kasım 2025  
**Versiyon:** 1.0
