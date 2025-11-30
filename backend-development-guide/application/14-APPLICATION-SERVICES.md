# Application Services Kılavuzu

## 1. Genel Bakış

### 1.1 Application Service Nedir?

Application Service, domain logic'i orchestrate eden katmandır. Use case'leri implement eder ve transaction boundary'lerini yönetir.

**Katman Ayrımı:**

```
Presentation Layer (Controller)
    ↓ Request DTO
Application Layer (Service)
    ↓ Command/Query
Domain Layer (Aggregate)
    ↓ Domain Event
Infrastructure Layer (Repository)
```

**Sorumluluklar:**

- **Use Case Orchestration:** Birden fazla domain object'i koordine eder
- **Transaction Management:** @Transactional boundary
- **DTO Conversion:** Request/Response DTO mapping
- **Event Publishing:** Domain event'lerini publish eder
- **Security:** Authorization checks
- **Validation:** Input validation

**Application Service ≠ Domain Service:**

```
Application Service:
- Use case orchestration
- Transaction boundary
- DTO mapping
- Infrastructure interaction
- Thin (no business logic)

Domain Service:
- Cross-aggregate business logic
- Pure domain operations
- No infrastructure
- No DTO
- Rich (business logic)
```

### 1.2 Meslektaş Application Layer

**Application Services:**

- **User Service:** User management, profile, blocking
- **Verification Service:** Verification submission, approval/rejection
- **Social Service:** Post creation, like, comment
- **Messaging Service:** Conversation, message sending
- **Notification Service:** Notification management
- **Moderation Service:** Report handling, content moderation

---

## 2. Service Design Principles

### 2.1 Use Case per Method

Her method bir use case'i temsil eder. Method isimleri business language kullanır.

**Example:**

```java
@Service
@Transactional
public class UserService {

    // ✅ Good: Clear use case
    public UserId registerNewUser(RegisterUserCommand command) {
        // ...
    }

    public void blockUser(UserId blockerId, UserId blockedUserId) {
        // ...
    }

    public void updateProfileImage(UserId userId, String imageUrl) {
        // ...
    }

    // ❌ Bad: Generic CRUD
    public User save(User user) {
        // ...
    }

    public User update(User user) {
        // ...
    }
}
```

### 2.2 Transaction Boundary

Application service method'u bir transaction boundary'dir. Domain event publishing transaction içinde olur.

**Transaction Template:**

```java
@Service
@Transactional
public class SocialService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final DomainEventPublisher eventPublisher;

    public PostId createPost(CreatePostCommand command) {
        // 1. Load aggregates (within transaction)
        User author = userRepository.findById(command.authorId())
            .orElseThrow(() -> new UserNotFoundException());

        // 2. Business validation
        if (!author.isVerified()) {
            throw new UnverifiedUserException();
        }

        // 3. Execute domain logic
        Post post = Post.create(
            command.authorId(),
            command.profession(),
            new PostContent(command.content()),
            command.imageUrls()
        );

        // 4. Save aggregate
        Post saved = postRepository.save(post);

        // 5. Publish events (before commit)
        eventPublisher.publishAll(saved.getDomainEvents());
        saved.clearDomainEvents();

        // 6. Return ID
        return saved.getId();

        // Transaction commits here
    }
}
```

### 2.3 Dependency Injection

Application service sadece gerekli dependency'leri inject eder. Constructor injection kullanılır.

**Dependency Types:**

```java
@Service
public class VerificationService {

    // Repositories (Infrastructure)
    private final VerificationRequestRepository verificationRepository;
    private final UserRepository userRepository;

    // Domain Services
    private final VerificationAttemptPolicy attemptPolicy;

    // Infrastructure Services
    private final DomainEventPublisher eventPublisher;
    private final AWSRekognitionClient rekognitionClient;

    // Application Services (use sparingly)
    private final NotificationService notificationService;

    public VerificationService(
        VerificationRequestRepository verificationRepository,
        UserRepository userRepository,
        VerificationAttemptPolicy attemptPolicy,
        DomainEventPublisher eventPublisher,
        AWSRekognitionClient rekognitionClient,
        NotificationService notificationService
    ) {
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.attemptPolicy = attemptPolicy;
        this.eventPublisher = eventPublisher;
        this.rekognitionClient = rekognitionClient;
        this.notificationService = notificationService;
    }
}
```

---

## 3. Meslektaş Application Services

### 3.1 UserService

#### Sorumluluklar:

- User registration
- Profile management
- User blocking/unblocking
- Privacy settings

**Implementation:**

```java
package com.meslektas.application.user;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DomainEventPublisher eventPublisher;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        DomainEventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Use Case: Register new user
     * Events: UserRegisteredEvent
     */
    public UserId registerNewUser(RegisterUserCommand command) {
        // Check email uniqueness
        if (userRepository.existsByEmail(new Email(command.email()))) {
            throw new EmailAlreadyExistsException(command.email());
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(command.password());

        // Create user
        User user = User.register(
            new Email(command.email()),
            new Password(hashedPassword),
            new FullName(command.firstName(), command.lastName()),
            Profession.valueOf(command.profession())
        );

        // Save
        User saved = userRepository.save(user);

        // Publish event
        eventPublisher.publishAll(saved.getDomainEvents());
        saved.clearDomainEvents();

        return saved.getId();
    }

    /**
     * Use Case: Block user
     * Events: UserBlockedEvent
     */
    public void blockUser(UserId blockerId, UserId blockedUserId) {
        User blocker = userRepository.findById(blockerId)
            .orElseThrow(() -> new UserNotFoundException(blockerId));

        // Check target exists
        if (!userRepository.existsById(blockedUserId)) {
            throw new UserNotFoundException(blockedUserId);
        }

        // Block
        blocker.blockUser(blockedUserId);

        // Save
        userRepository.save(blocker);
        eventPublisher.publishAll(blocker.getDomainEvents());
        blocker.clearDomainEvents();
    }

    /**
     * Use Case: Unblock user
     * Events: UserUnblockedEvent
     */
    public void unblockUser(UserId blockerId, UserId blockedUserId) {
        User blocker = userRepository.findById(blockerId)
            .orElseThrow(() -> new UserNotFoundException(blockerId));

        blocker.unblockUser(blockedUserId);

        userRepository.save(blocker);
        eventPublisher.publishAll(blocker.getDomainEvents());
        blocker.clearDomainEvents();
    }

    /**
     * Use Case: Update profile image
     * Events: ProfileImageUpdatedEvent
     */
    public void updateProfileImage(UserId userId, String s3ImageUrl) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        user.updateProfileImage(s3ImageUrl);

        userRepository.save(user);
        eventPublisher.publishAll(user.getDomainEvents());
        user.clearDomainEvents();
    }

    /**
     * Use Case: Update privacy settings
     * Events: PrivacySettingsUpdatedEvent
     */
    public void updatePrivacySettings(
        UserId userId,
        boolean profileVisible,
        boolean acceptMessages
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        user.updatePrivacySettings(
            new PrivacySettings(profileVisible, acceptMessages)
        );

        userRepository.save(user);
        eventPublisher.publishAll(user.getDomainEvents());
        user.clearDomainEvents();
    }
}
```

### 3.2 VerificationService

#### Sorumluluklar:

- Verification request submission
- AI verification processing
- Manual review approval/rejection
- Verification status tracking

**Implementation:**

```java
package com.meslektas.application.verification;

@Service
@Transactional
public class VerificationService {

    private final VerificationRequestRepository verificationRepository;
    private final UserRepository userRepository;
    private final VerificationAttemptPolicy attemptPolicy;
    private final DomainEventPublisher eventPublisher;
    private final AWSRekognitionClient rekognitionClient;

    /**
     * Use Case: Submit verification request
     * Events: VerificationRequestSubmittedEvent
     */
    public VerificationRequestId submitVerificationRequest(SubmitVerificationCommand command) {
        // Check attempt limit
        Optional<VerificationRequest> latestRequest = verificationRepository
            .findLatestByUserId(command.userId());

        if (latestRequest.isPresent() && !attemptPolicy.canSubmitNewAttempt(latestRequest.get())) {
            throw new MaxVerificationAttemptsExceededException();
        }

        // Create request
        VerificationRequest request = VerificationRequest.submit(
            command.userId(),
            new Document(
                DocumentType.valueOf(command.documentType()),
                command.documentNumber(),
                command.idDocumentUrl()
            ),
            new Document(null, null, command.selfieUrl())
        );

        // Save
        VerificationRequest saved = verificationRepository.save(request);

        // Publish event (triggers AI processing)
        eventPublisher.publishAll(saved.getDomainEvents());
        saved.clearDomainEvents();

        return saved.getId();
    }

    /**
     * Use Case: Process AI verification result
     * Events: VerificationApprovedEvent | VerificationSentToReviewEvent
     */
    public void processAIVerificationResult(
        VerificationRequestId requestId,
        AIVerificationResult aiResult
    ) {
        VerificationRequest request = verificationRepository.findById(requestId)
            .orElseThrow(() -> new VerificationRequestNotFoundException(requestId));

        // Apply AI result
        if (aiResult.confidenceScore() >= 90) {
            // Auto-approve
            request.approve(new ConfidenceScore(aiResult.confidenceScore()));
        } else if (aiResult.confidenceScore() >= 70) {
            // Send to manual review
            request.sendToManualReview();
        } else {
            // Auto-reject
            request.reject("Low confidence score");
        }

        // Save
        verificationRepository.save(request);
        eventPublisher.publishAll(request.getDomainEvents());
        request.clearDomainEvents();
    }

    /**
     * Use Case: Approve verification (manual review)
     * Events: VerificationApprovedEvent
     */
    public void approveVerification(
        VerificationRequestId requestId,
        UserId reviewerId
    ) {
        VerificationRequest request = verificationRepository.findById(requestId)
            .orElseThrow();

        // Only pending_review can be approved
        if (request.getStatus() != VerificationStatus.PENDING_REVIEW) {
            throw new InvalidVerificationStatusException();
        }

        request.approve(new ConfidenceScore(95));  // Manual review = high confidence

        verificationRepository.save(request);
        eventPublisher.publishAll(request.getDomainEvents());
        request.clearDomainEvents();
    }

    /**
     * Use Case: Reject verification (manual review)
     * Events: VerificationRejectedEvent
     */
    public void rejectVerification(
        VerificationRequestId requestId,
        String reason,
        UserId reviewerId
    ) {
        VerificationRequest request = verificationRepository.findById(requestId)
            .orElseThrow();

        request.reject(reason);

        verificationRepository.save(request);
        eventPublisher.publishAll(request.getDomainEvents());
        request.clearDomainEvents();
    }
}
```

### 3.3 SocialService

#### Sorumluluklar:

- Post creation/deletion
- Like/unlike post
- Comment creation
- Feed generation (delegates to query)

**Implementation:**

```java
package com.meslektas.application.social;

@Service
@Transactional
public class SocialService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final DomainEventPublisher eventPublisher;

    /**
     * Use Case: Create post
     * Events: PostCreatedEvent
     */
    public PostId createPost(CreatePostCommand command) {
        // Load author
        User author = userRepository.findById(command.authorId())
            .orElseThrow(() -> new UserNotFoundException());

        // Business rule: Only verified users
        if (author.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new UnverifiedUserException("Only verified users can create posts");
        }

        // Create post
        Post post = Post.create(
            command.authorId(),
            command.profession(),
            new PostContent(command.content()),
            command.imageUrls().stream()
                .map(url -> new PostImage(url, ImageFormat.JPEG, 0))
                .toList()
        );

        // Save
        Post saved = postRepository.save(post);

        // Publish event
        eventPublisher.publishAll(saved.getDomainEvents());
        saved.clearDomainEvents();

        return saved.getId();
    }

    /**
     * Use Case: Like post
     * Events: PostLikedEvent
     */
    public void likePost(LikePostCommand command) {
        Post post = postRepository.findById(command.postId())
            .orElseThrow(() -> new PostNotFoundException());

        post.addLike(command.userId());

        postRepository.save(post);
        eventPublisher.publishAll(post.getDomainEvents());
        post.clearDomainEvents();
    }

    /**
     * Use Case: Unlike post
     * Events: PostUnlikedEvent
     */
    public void unlikePost(UnlikePostCommand command) {
        Post post = postRepository.findById(command.postId())
            .orElseThrow();

        post.removeLike(command.userId());

        postRepository.save(post);
        eventPublisher.publishAll(post.getDomainEvents());
        post.clearDomainEvents();
    }

    /**
     * Use Case: Add comment
     * Events: CommentAddedEvent
     */
    public void addComment(AddCommentCommand command) {
        Post post = postRepository.findById(command.postId())
            .orElseThrow();

        // Check commenter exists and verified
        User commenter = userRepository.findById(command.commenterId())
            .orElseThrow(() -> new UserNotFoundException());

        if (!commenter.isVerified()) {
            throw new UnverifiedUserException();
        }

        // Add comment
        post.addComment(
            command.commenterId(),
            new CommentContent(command.content())
        );

        postRepository.save(post);
        eventPublisher.publishAll(post.getDomainEvents());
        post.clearDomainEvents();
    }

    /**
     * Use Case: Delete post
     * Events: PostDeletedEvent
     */
    public void deletePost(DeletePostCommand command) {
        Post post = postRepository.findById(command.postId())
            .orElseThrow();

        // Authorization: Only author or admin can delete
        if (!post.getAuthorId().equals(command.userId()) && !command.isAdmin()) {
            throw new UnauthorizedOperationException();
        }

        post.delete();

        postRepository.save(post);
        eventPublisher.publishAll(post.getDomainEvents());
        post.clearDomainEvents();
    }
}
```

### 3.4 MessagingService

#### Sorumluluklar:

- Conversation creation
- Message sending
- Message read tracking
- Conversation participant management

**Implementation:**

```java
package com.meslektas.application.messaging;

@Service
@Transactional
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageRateLimitService rateLimitService;
    private final DomainEventPublisher eventPublisher;

    /**
     * Use Case: Start conversation
     * Events: ConversationStartedEvent
     */
    public ConversationId startConversation(
        UserId initiatorId,
        UserId recipientId
    ) {
        // Check both users exist and verified
        User initiator = userRepository.findById(initiatorId)
            .orElseThrow();
        User recipient = userRepository.findById(recipientId)
            .orElseThrow();

        if (!initiator.isVerified() || !recipient.isVerified()) {
            throw new UnverifiedUserException();
        }

        // Check privacy settings
        if (!recipient.getPrivacySettings().acceptMessages()) {
            throw new MessagesNotAcceptedException();
        }

        // Check existing conversation
        Optional<Conversation> existing = conversationRepository
            .findByParticipants(initiatorId, recipientId);

        if (existing.isPresent()) {
            return existing.get().getId();
        }

        // Create new conversation
        Conversation conversation = Conversation.start(initiatorId, recipientId);

        Conversation saved = conversationRepository.save(conversation);
        eventPublisher.publishAll(saved.getDomainEvents());
        saved.clearDomainEvents();

        return saved.getId();
    }

    /**
     * Use Case: Send message
     * Events: MessageSentEvent
     */
    public MessageId sendMessage(SendMessageCommand command) {
        Conversation conversation = conversationRepository
            .findById(command.conversationId())
            .orElseThrow();

        // Verify sender is participant
        if (!conversation.isParticipant(command.senderId())) {
            throw new UnauthorizedOperationException();
        }

        // Rate limit check
        List<Instant> recentTimestamps = conversation.getRecentMessageTimestamps();
        if (rateLimitService.hasExceededRateLimit(
            command.senderId(),
            command.conversationId(),
            recentTimestamps
        )) {
            throw new RateLimitExceededException();
        }

        // Send message
        Message message = conversation.sendMessage(
            command.senderId(),
            new MessageContent(command.content())
        );

        conversationRepository.save(conversation);
        eventPublisher.publishAll(conversation.getDomainEvents());
        conversation.clearDomainEvents();

        return message.getId();
    }

    /**
     * Use Case: Mark message as read
     * Events: MessageReadEvent
     */
    public void markMessageAsRead(MarkMessageAsReadCommand command) {
        Conversation conversation = conversationRepository
            .findByMessageId(command.messageId())
            .orElseThrow();

        // Find message
        Message message = conversation.getMessages().stream()
            .filter(m -> m.getId().equals(command.messageId()))
            .findFirst()
            .orElseThrow();

        // Mark as read
        message.markAsRead(command.recipientId());

        conversationRepository.save(conversation);
        eventPublisher.publishAll(conversation.getDomainEvents());
        conversation.clearDomainEvents();
    }
}
```

### 3.5 NotificationService

#### Sorumluluklar:

- Notification creation (manual)
- Notification read tracking
- Notification deletion
- Push notification triggering

**Implementation:**

```java
package com.meslektas.application.notification;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final PushNotificationGateway pushGateway;
    private final DomainEventPublisher eventPublisher;

    /**
     * Use Case: Mark notification as read
     * Events: NotificationReadEvent
     */
    public void markNotificationAsRead(
        NotificationId notificationId,
        UserId userId
    ) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow();

        // Verify recipient
        if (!notification.getRecipientId().equals(userId)) {
            throw new UnauthorizedOperationException();
        }

        notification.markAsRead();

        notificationRepository.save(notification);
        eventPublisher.publishAll(notification.getDomainEvents());
        notification.clearDomainEvents();
    }

    /**
     * Use Case: Mark all notifications as read
     */
    public void markAllNotificationsAsRead(UserId userId) {
        List<Notification> unreadNotifications = notificationRepository
            .findUnreadByRecipientId(userId);

        unreadNotifications.forEach(Notification::markAsRead);

        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Use Case: Delete notification
     * Events: NotificationDeletedEvent
     */
    public void deleteNotification(NotificationId notificationId, UserId userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow();

        if (!notification.getRecipientId().equals(userId)) {
            throw new UnauthorizedOperationException();
        }

        notificationRepository.delete(notification);
    }
}
```

### 3.6 ModerationService

#### Sorumluluklar:

- Report content
- Review moderation cases
- Content hiding/unhiding
- User suspension

**Implementation:**

```java
package com.meslektas.application.moderation;

@Service
@Transactional
public class ModerationService {

    private final ModerationCaseRepository moderationRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ModerationPolicyService policyService;
    private final DomainEventPublisher eventPublisher;

    /**
     * Use Case: Report content
     * Events: ContentReportedEvent, ContentAutoHiddenEvent, UserAutoSuspendedEvent
     */
    public ModerationCaseId reportContent(ReportContentCommand command) {
        // Find or create moderation case
        Optional<ModerationCase> existingCase = command.targetPostId() != null
            ? moderationRepository.findByTargetPostId(command.targetPostId())
            : moderationRepository.findByTargetUserId(command.targetUserId());

        ModerationCase moderationCase = existingCase.orElseGet(() ->
            ModerationCase.create(command.targetPostId(), command.targetUserId())
        );

        // Add report
        moderationCase.addReport(
            command.reporterId(),
            ViolationType.valueOf(command.violationType()),
            command.reason()
        );

        // Check auto-moderation thresholds
        int reportCount = moderationCase.getReportCount();
        Optional<ModerationAction> autoAction = policyService.determineAutoAction(reportCount);

        if (autoAction.isPresent()) {
            if (autoAction.get() == ModerationAction.AUTO_HIDE) {
                moderationCase.autoHideContent();
            } else if (autoAction.get() == ModerationAction.AUTO_SUSPEND) {
                moderationCase.autoSuspendUser(Duration.ofDays(1));
            }
        }

        ModerationCase saved = moderationRepository.save(moderationCase);
        eventPublisher.publishAll(saved.getDomainEvents());
        saved.clearDomainEvents();

        return saved.getId();
    }

    /**
     * Use Case: Review moderation case
     * Events: ModerationCaseReviewedEvent, ContentHiddenEvent, UserSuspendedEvent
     */
    public void reviewModerationCase(
        ModerationCaseId caseId,
        ModerationDecision decision,
        String reviewNote,
        UserId moderatorId
    ) {
        ModerationCase moderationCase = moderationRepository.findById(caseId)
            .orElseThrow();

        // Apply decision
        switch (decision) {
            case HIDE_CONTENT -> moderationCase.hideContent(reviewNote, moderatorId);
            case SUSPEND_USER_1_DAY -> moderationCase.suspendUser(
                Duration.ofDays(1),
                reviewNote,
                moderatorId
            );
            case SUSPEND_USER_7_DAYS -> moderationCase.suspendUser(
                Duration.ofDays(7),
                reviewNote,
                moderatorId
            );
            case PERMANENT_BAN -> moderationCase.permanentBanUser(reviewNote, moderatorId);
            case DISMISS -> moderationCase.dismiss(reviewNote, moderatorId);
        }

        moderationRepository.save(moderationCase);
        eventPublisher.publishAll(moderationCase.getDomainEvents());
        moderationCase.clearDomainEvents();
    }
}
```

---

## 4. Cross-Cutting Concerns

### 4.1 Exception Handling

Application service exception'ları domain exception'larını wrap etmez, direkt throw eder.

**Exception Types:**

```java
// Domain exceptions (throw as-is)
throw new UnverifiedUserException();
throw new MaxVerificationAttemptsExceededException();
throw new RateLimitExceededException();

// Application exceptions (wrap infrastructure)
try {
    s3Client.uploadFile(file);
} catch (AmazonS3Exception e) {
    throw new FileUploadException("Failed to upload to S3", e);
}
```

### 4.2 Security & Authorization

Application service method'ları authorization check yapabilir.

**Authorization Example:**

```java
@Service
public class SocialService {

    public void deletePost(DeletePostCommand command) {
        Post post = postRepository.findById(command.postId()).orElseThrow();

        // Authorization
        boolean isAuthor = post.getAuthorId().equals(command.userId());
        boolean isAdmin = command.hasRole("ADMIN");

        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedOperationException(
                "Only author or admin can delete post"
            );
        }

        post.delete();
        postRepository.save(post);
    }
}
```

### 4.3 Logging

Application service her method başlangıç/bitiş log'lar.

**Logging Example:**

```java
@Service
public class VerificationService {

    private static final Logger log = LoggerFactory.getLogger(VerificationService.class);

    public VerificationRequestId submitVerificationRequest(SubmitVerificationCommand command) {
        log.info("Submitting verification request for user: {}", command.userId());

        try {
            // ... business logic

            log.info("Verification request submitted successfully: {}", requestId);
            return requestId;
        } catch (Exception e) {
            log.error("Failed to submit verification request for user: {}", command.userId(), e);
            throw e;
        }
    }
}
```

---

## 5. Testing Application Services

### 5.1 Unit Test

Application service unit test'leri mock repository kullanır.

**Example:**

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private DomainEventPublisher eventPublisher;

    @InjectMocks
    private UserService userService;

    @Test
    void should_register_new_user() {
        // Given
        RegisterUserCommand command = new RegisterUserCommand(
            "doctor@example.com",
            "password123",
            "John",
            "Doe",
            "DOCTOR"
        );

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        UserId userId = userService.registerNewUser(command);

        // Then
        assertThat(userId).isNotNull();
        verify(userRepository).save(any(User.class));
        verify(eventPublisher).publishAll(anyList());
    }

    @Test
    void should_throw_exception_when_email_exists() {
        // Given
        RegisterUserCommand command = new RegisterUserCommand(
            "existing@example.com",
            "password123",
            "John",
            "Doe",
            "DOCTOR"
        );

        when(userRepository.existsByEmail(any())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> userService.registerNewUser(command))
            .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }
}
```

### 5.2 Integration Test

Integration test gerçek repository ve database kullanır.

**Example:**

```java
@SpringBootTest
@Transactional
class SocialServiceIntegrationTest {

    @Autowired
    private SocialService socialService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void should_create_post_and_publish_event() {
        // Given
        User author = createVerifiedUser();
        userRepository.save(author);

        CreatePostCommand command = new CreatePostCommand(
            author.getId(),
            Profession.DOCTOR,
            "Test content",
            List.of()
        );

        // When
        PostId postId = socialService.createPost(command);

        // Then
        Optional<Post> savedPost = postRepository.findById(postId);
        assertThat(savedPost).isPresent();
        assertThat(savedPost.get().getContent().getValue()).isEqualTo("Test content");
    }
}
```

---

## 6. Best Practices

### 6.1 Keep Services Thin

Application service sadece orchestration yapar, business logic aggregate'te olur.

```java
// ❌ Bad: Business logic in service
@Service
public class SocialService {
    public void likePost(PostId postId, UserId userId) {
        Post post = postRepository.findById(postId).orElseThrow();

        // Business logic in service (BAD!)
        if (post.getLikes().contains(userId)) {
            throw new AlreadyLikedException();
        }

        post.getLikes().add(userId);
        postRepository.save(post);
    }
}

// ✅ Good: Business logic in aggregate
@Service
public class SocialService {
    public void likePost(PostId postId, UserId userId) {
        Post post = postRepository.findById(postId).orElseThrow();

        post.addLike(userId);  // Business logic in aggregate

        postRepository.save(post);
    }
}
```

### 6.2 Return IDs, Not Entities

Application service entity yerine ID döner.

```java
// ❌ Bad: Return entity
public Post createPost(CreatePostCommand command) {
    Post post = Post.create(...);
    return postRepository.save(post);  // Exposes domain model
}

// ✅ Good: Return ID
public PostId createPost(CreatePostCommand command) {
    Post post = Post.create(...);
    Post saved = postRepository.save(post);
    return saved.getId();  // Only ID exposed
}
```

### 6.3 One Transaction per Use Case

Her use case bir transaction içinde çalışır. Nested transaction kullanılmaz.

```java
// ✅ Good: Single transaction
@Transactional
public PostId createPost(CreatePostCommand command) {
    // All operations in single transaction
}

// ❌ Bad: Nested transactions
@Transactional
public PostId createPost(CreatePostCommand command) {
    userService.updatePostCount(userId);  // Separate transaction (BAD!)
    // ...
}
```

---

## 7. Özet

### Application Service Characteristics:

- **Orchestration:** Use case koordinasyonu
- **Transaction Boundary:** @Transactional method
- **DTO Conversion:** Request/Response mapping
- **Event Publishing:** Domain event publish
- **Thin:** Business logic yok, sadece orchestration

### Meslektaş Services:

1. **UserService:** Registration, blocking, profile
2. **VerificationService:** Verification lifecycle
3. **SocialService:** Post, like, comment
4. **MessagingService:** Conversation, message
5. **NotificationService:** Notification management
6. **ModerationService:** Report, review, moderation

### Best Practices:

- ✅ One use case per method
- ✅ Return IDs, not entities
- ✅ Keep services thin
- ✅ Single transaction per use case
- ✅ Domain exceptions propagate as-is

### Next:

- **DTO Mapping:** 15-DTO-MAPPING.md (MapStruct, conversion patterns)
