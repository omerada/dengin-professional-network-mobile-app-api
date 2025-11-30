# CQRS Pattern Kılavuzu

## 1. Genel Bakış

### 1.1 CQRS Nedir?

CQRS (Command Query Responsibility Segregation), okuma (query) ve yazma (command) operasyonlarını ayıran bir pattern'dir. Greg Young tarafından popüler hale getirilmiştir.

**Temel Prensip:**

```
Command: Sistemin state'ini değiştirir, veri döndürmez
Query: Sistemin state'ini okur, değiştirmez
```

**Traditional Approach vs CQRS:**

```
Traditional (CRUD):
UserService.createUser() → User DTO döner
UserService.updateUser() → User DTO döner
UserService.getUser() → User DTO döner

CQRS:
Commands (Write):
- CreateUserCommand → void (sadece success/failure)
- UpdateUserCommand → void
- DeleteUserCommand → void

Queries (Read):
- GetUserQuery → UserDTO
- GetUserListQuery → List<UserDTO>
- SearchUsersQuery → Page<UserDTO>
```

**Meslektaş Projesi Context:**

- CQRS Lite (basit CQRS - aynı database)
- Command: State değiştiren işlemler (register, verify, post, message)
- Query: Okuma işlemleri (feed, profile, notifications)
- Eventual consistency: Command → Event → Read model update

### 1.2 CQRS Seviyeleri

**Level 1: CQRS Lite (Meslektaş Yaklaşımı)**

```
- Aynı database (PostgreSQL)
- Command ve Query ayrı sınıflar
- Domain model yazma için, DTO okuma için
- Eventual consistency (event-driven)
```

**Level 2: CQRS with Separate Databases**

```
- Write DB: PostgreSQL (normalized)
- Read DB: MongoDB/Elasticsearch (denormalized)
- Event sourcing ile sync
- High scalability
```

**Level 3: Event Sourcing + CQRS**

```
- Event store as source of truth
- Read models event replay ile oluşturulur
- Complete audit trail
- Complex implementation
```

**Meslektaş Tercihi:** Level 1 (CQRS Lite)

- Yeterli performans ve scalability
- Basit implementation
- Event-driven architecture hazırlığı

---

## 2. Command Design

### 2.1 Command Nedir?

Command, sistemin state'ini değiştiren bir intent (niyet) temsil eder. Command immutable'dır ve validation içerir.

**Command Özellikleri:**

- **Immutable:** Oluşturulduktan sonra değişmez
- **Imperative Naming:** RegisterUser, LikePost, SendMessage (emir kipi)
- **Validation:** Constructor'da validation yapar
- **Return void:** Sadece success/failure döner (entity döndürmez)

**Command Template:**

```java
public record CreatePostCommand(
    UserId authorId,
    Profession profession,
    String content,
    List<String> imageUrls
) {
    // Validation in compact constructor
    public CreatePostCommand {
        if (authorId == null) {
            throw new IllegalArgumentException("Author ID is required");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content is required");
        }
        if (content.length() > 2000) {
            throw new IllegalArgumentException("Content too long");
        }
        if (imageUrls != null && imageUrls.size() > 4) {
            throw new IllegalArgumentException("Max 4 images allowed");
        }
    }
}
```

### 2.2 Command Handler

Command Handler, command'ı işleyen sınıftır. Domain model ile etkileşime geçer.

**Command Handler Template:**

```java
@Service
@Transactional
public class CreatePostCommandHandler {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final DomainEventPublisher eventPublisher;

    public PostId handle(CreatePostCommand command) {
        // 1. Validation (business rules)
        User author = userRepository.findById(command.authorId())
            .orElseThrow(() -> new UserNotFoundException());

        if (author.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new UnverifiedUserException("Only verified users can create posts");
        }

        // 2. Create domain object
        Post post = Post.create(
            command.authorId(),
            command.profession(),
            new PostContent(command.content()),
            command.imageUrls().stream()
                .map(url -> new PostImage(url, ...))
                .toList()
        );

        // 3. Save
        Post saved = postRepository.save(post);

        // 4. Publish events
        eventPublisher.publishAll(saved.getDomainEvents());
        saved.clearDomainEvents();

        // 5. Return ID only
        return saved.getId();
    }
}
```

---

## 3. Meslektaş Command Katalog

### 3.1 Identity Context Commands

#### RegisterUserCommand

```java
public record RegisterUserCommand(
    String email,
    String password,
    String firstName,
    String lastName,
    String profession
) {
    public RegisterUserCommand {
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new InvalidEmailException();
        }
        if (password == null || password.length() < 8) {
            throw new InvalidPasswordException();
        }
        // ... validation
    }
}

@Service
@Transactional
public class RegisterUserCommandHandler {

    public UserId handle(RegisterUserCommand command) {
        // Check email uniqueness
        if (userRepository.existsByEmail(new Email(command.email()))) {
            throw new EmailAlreadyExistsException();
        }

        // Create user
        User user = User.register(
            new Email(command.email()),
            new Password(command.password()),
            new FullName(command.firstName(), command.lastName()),
            Profession.valueOf(command.profession())
        );

        // Save
        User saved = userRepository.save(user);

        // Publish event
        eventPublisher.publishAll(saved.getDomainEvents());

        return saved.getId();
    }
}
```

#### BlockUserCommand

```java
public record BlockUserCommand(
    UserId blockerId,
    UserId blockedUserId
) {
    public BlockUserCommand {
        if (blockerId == null || blockedUserId == null) {
            throw new IllegalArgumentException("User IDs are required");
        }
        if (blockerId.equals(blockedUserId)) {
            throw new CannotBlockSelfException();
        }
    }
}

@Service
@Transactional
public class BlockUserCommandHandler {

    public void handle(BlockUserCommand command) {
        User blocker = userRepository.findById(command.blockerId())
            .orElseThrow(() -> new UserNotFoundException());

        blocker.blockUser(command.blockedUserId());

        userRepository.save(blocker);
        eventPublisher.publishAll(blocker.getDomainEvents());
    }
}
```

### 3.2 Verification Context Commands

#### SubmitVerificationCommand

```java
public record SubmitVerificationCommand(
    UserId userId,
    String idDocumentUrl,
    String selfieUrl,
    String documentNumber,
    String documentType
) {
    public SubmitVerificationCommand {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (idDocumentUrl == null || selfieUrl == null) {
            throw new IllegalArgumentException("Documents are required");
        }
    }
}

@Service
@Transactional
public class SubmitVerificationCommandHandler {

    private final VerificationRequestRepository verificationRepository;
    private final VerificationAttemptPolicy attemptPolicy;

    public VerificationRequestId handle(SubmitVerificationCommand command) {
        // Check attempt limit
        Optional<VerificationRequest> latest = verificationRepository
            .findLatestByUserId(command.userId());

        if (latest.isPresent() && !attemptPolicy.canSubmitNewAttempt(latest.get())) {
            throw new MaxAttemptsExceededException();
        }

        // Create verification request
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

        return saved.getId();
    }
}
```

#### ApproveVerificationCommand

```java
public record ApproveVerificationCommand(
    VerificationRequestId requestId,
    int confidenceScore,
    UserId approvedBy  // Admin/AI system
) {}

@Service
@Transactional
public class ApproveVerificationCommandHandler {

    public void handle(ApproveVerificationCommand command) {
        VerificationRequest request = verificationRepository
            .findById(command.requestId())
            .orElseThrow();

        request.approve(new ConfidenceScore(command.confidenceScore()));

        verificationRepository.save(request);
        eventPublisher.publishAll(request.getDomainEvents());
        // Event handler will update User.verificationStatus
    }
}
```

### 3.3 Social Context Commands

#### CreatePostCommand

```java
public record CreatePostCommand(
    UserId authorId,
    Profession profession,
    String content,
    List<String> imageUrls
) {
    public CreatePostCommand {
        if (content == null || content.length() > 2000) {
            throw new InvalidPostContentException();
        }
        if (imageUrls != null && imageUrls.size() > 4) {
            throw new TooManyImagesException();
        }
    }
}
```

#### LikePostCommand

```java
public record LikePostCommand(
    PostId postId,
    UserId userId
) {}

@Service
@Transactional
public class LikePostCommandHandler {

    public void handle(LikePostCommand command) {
        Post post = postRepository.findById(command.postId())
            .orElseThrow(() -> new PostNotFoundException());

        post.addLike(command.userId());

        postRepository.save(post);
        eventPublisher.publishAll(post.getDomainEvents());
        // PostLikedEvent → Notification
    }
}
```

#### AddCommentCommand

```java
public record AddCommentCommand(
    PostId postId,
    UserId commenterId,
    String content
) {
    public AddCommentCommand {
        if (content == null || content.length() > 500) {
            throw new InvalidCommentException();
        }
    }
}
```

### 3.4 Messaging Context Commands

#### SendMessageCommand

```java
public record SendMessageCommand(
    ConversationId conversationId,
    UserId senderId,
    String content
) {
    public SendMessageCommand {
        if (content == null || content.length() > 1000) {
            throw new InvalidMessageException();
        }
    }
}

@Service
@Transactional
public class SendMessageCommandHandler {

    private final ConversationRepository conversationRepository;
    private final MessageRateLimitService rateLimitService;

    public MessageId handle(SendMessageCommand command) {
        Conversation conversation = conversationRepository
            .findById(command.conversationId())
            .orElseThrow();

        // Rate limit check
        if (rateLimitService.hasExceededRateLimit(
            command.senderId(),
            command.conversationId(),
            conversation.getRecentMessageTimestamps()
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

        return message.getId();
    }
}
```

#### MarkMessageAsReadCommand

```java
public record MarkMessageAsReadCommand(
    MessageId messageId,
    UserId recipientId
) {}
```

### 3.5 Moderation Context Commands

#### ReportContentCommand

```java
public record ReportContentCommand(
    UserId reporterId,
    PostId targetPostId,  // Nullable
    UserId targetUserId,  // Nullable
    String violationType,
    String reason
) {
    public ReportContentCommand {
        if (targetPostId == null && targetUserId == null) {
            throw new IllegalArgumentException("Target is required");
        }
    }
}

@Service
@Transactional
public class ReportContentCommandHandler {

    private final ModerationCaseRepository moderationRepository;
    private final ModerationPolicyService policyService;

    public ModerationCaseId handle(ReportContentCommand command) {
        // Find or create moderation case
        Optional<ModerationCase> existing = targetPostId != null
            ? moderationRepository.findByTargetPostId(command.targetPostId())
            : moderationRepository.findByTargetUserId(command.targetUserId());

        ModerationCase moderationCase = existing.orElseGet(() ->
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

        return saved.getId();
    }
}
```

---

## 4. Query Design

### 4.1 Query Nedir?

Query, sistemden veri okuyan bir request'tir. Side-effect içermez, sadece veri döner.

**Query Özellikleri:**

- **Immutable:** Read-only
- **Declarative Naming:** GetUser, FindPosts, SearchMessages
- **No Side-Effects:** State değiştirmez
- **DTO Return:** Domain model değil, DTO döner
- **Optimized:** Performance için optimize edilmiş

**Query Template:**

```java
public record GetUserProfileQuery(
    UserId userId
) {}

@Service
@Transactional(readOnly = true)
public class GetUserProfileQueryHandler {

    private final UserRepository userRepository;

    public UserProfileDTO handle(GetUserProfileQuery query) {
        User user = userRepository.findById(query.userId())
            .orElseThrow(() -> new UserNotFoundException());

        return UserProfileDTO.from(user);
    }
}
```

### 4.2 DTO (Data Transfer Object)

DTO, query sonucunda dönen veri yapısıdır. Domain model'den bağımsızdır.

**DTO vs Domain Model:**

```
Domain Model (Write):
- Business logic içerir
- Invariant'ları korur
- Rich behavior (methods)
- Private setters

DTO (Read):
- Sadece veri taşır
- Business logic YOK
- Anemic (getter only)
- Public fields/getters
```

**DTO Example:**

```java
public record UserProfileDTO(
    String userId,
    String email,
    String fullName,
    String profession,
    String verificationStatus,
    String profileImageUrl,
    int postCount,
    int followerCount,
    Instant joinedAt
) {
    public static UserProfileDTO from(User user) {
        return new UserProfileDTO(
            user.getId().getValue().toString(),
            user.getEmail().getValue(),
            user.getFullName().getFullName(),
            user.getProfession().name(),
            user.getVerificationStatus().name(),
            user.getProfileImageUrl(),
            user.getPostCount(),
            user.getFollowerCount(),
            user.getCreatedAt()
        );
    }
}
```

---

## 5. Meslektaş Query Katalog

### 5.1 Identity Context Queries

#### GetUserProfileQuery

```java
public record GetUserProfileQuery(UserId userId) {}

@Service
@Transactional(readOnly = true)
public class GetUserProfileQueryHandler {

    public UserProfileDTO handle(GetUserProfileQuery query) {
        User user = userRepository.findById(query.userId())
            .orElseThrow(() -> new UserNotFoundException());

        return UserProfileDTO.from(user);
    }
}

// DTO
public record UserProfileDTO(
    String userId,
    String email,
    String fullName,
    String profession,
    String verificationStatus,
    String profileImageUrl,
    Instant joinedAt
) {}
```

### 5.2 Social Context Queries

#### GetFeedQuery

```java
public record GetFeedQuery(
    UserId userId,
    int page,
    int size
) {}

@Service
@Transactional(readOnly = true)
public class GetFeedQueryHandler {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ProfessionFeedService feedService;

    public Page<PostDTO> handle(GetFeedQuery query) {
        // Get user
        User user = userRepository.findById(query.userId())
            .orElseThrow();

        // Get posts (profession-based)
        Pageable pageable = PageRequest.of(query.page(), query.size());
        List<Post> posts = postRepository.findActiveByProfession(
            user.getProfession(),
            pageable
        );

        // Filter (blocked users, content policy)
        List<Post> filteredPosts = feedService.filterByProfession(
            posts,
            user.getProfession(),
            query.userId(),
            user.getBlockedUsers()
        );

        // Convert to DTO
        List<PostDTO> postDTOs = filteredPosts.stream()
            .map(PostDTO::from)
            .toList();

        return new PageImpl<>(postDTOs, pageable, postDTOs.size());
    }
}

// DTO
public record PostDTO(
    String postId,
    AuthorDTO author,
    String content,
    List<String> imageUrls,
    int likeCount,
    int commentCount,
    boolean isLikedByCurrentUser,
    Instant createdAt
) {
    public static PostDTO from(Post post) {
        return new PostDTO(
            post.getId().getValue().toString(),
            AuthorDTO.from(post.getAuthorId()),
            post.getContent().getValue(),
            post.getImages().stream()
                .map(PostImage::getS3Url)
                .toList(),
            post.getLikeCount(),
            post.getCommentCount(),
            false,  // Set by service
            post.getCreatedAt()
        );
    }
}
```

#### GetPostDetailsQuery

```java
public record GetPostDetailsQuery(
    PostId postId,
    UserId currentUserId
) {}

@Service
@Transactional(readOnly = true)
public class GetPostDetailsQueryHandler {

    public PostDetailsDTO handle(GetPostDetailsQuery query) {
        Post post = postRepository.findById(query.postId())
            .orElseThrow(() -> new PostNotFoundException());

        // Check if current user liked
        boolean isLiked = post.getLikes().contains(query.currentUserId());

        // Load comments
        List<CommentDTO> comments = post.getComments().stream()
            .map(CommentDTO::from)
            .toList();

        return PostDetailsDTO.from(post, isLiked, comments);
    }
}
```

### 5.3 Messaging Context Queries

#### GetConversationListQuery

```java
public record GetConversationListQuery(
    UserId userId,
    int page,
    int size
) {}

@Service
@Transactional(readOnly = true)
public class GetConversationListQueryHandler {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public Page<ConversationListItemDTO> handle(GetConversationListQuery query) {
        Pageable pageable = PageRequest.of(query.page(), query.size());

        List<Conversation> conversations = conversationRepository
            .findActiveByParticipant(query.userId(), pageable);

        List<ConversationListItemDTO> dtos = conversations.stream()
            .map(conv -> {
                // Get last message
                List<Message> lastMessages = messageRepository
                    .findLatestMessages(conv.getId(), 1);

                Message lastMessage = lastMessages.isEmpty()
                    ? null
                    : lastMessages.get(0);

                // Get unread count
                long unreadCount = messageRepository.countUnreadMessages(
                    conv.getId(),
                    query.userId()
                );

                return ConversationListItemDTO.from(
                    conv,
                    lastMessage,
                    unreadCount,
                    query.userId()
                );
            })
            .toList();

        return new PageImpl<>(dtos, pageable, dtos.size());
    }
}

// DTO
public record ConversationListItemDTO(
    String conversationId,
    ParticipantDTO otherParticipant,
    String lastMessagePreview,
    Instant lastMessageAt,
    long unreadCount
) {}
```

#### GetConversationMessagesQuery

```java
public record GetConversationMessagesQuery(
    ConversationId conversationId,
    UserId currentUserId,
    int page,
    int size
) {}

@Service
@Transactional(readOnly = true)
public class GetConversationMessagesQueryHandler {

    public Page<MessageDTO> handle(GetConversationMessagesQuery query) {
        // Verify access
        Conversation conversation = conversationRepository
            .findById(query.conversationId())
            .orElseThrow();

        if (!conversation.isParticipant(query.currentUserId())) {
            throw new UnauthorizedAccessException();
        }

        // Load messages (paginated)
        Pageable pageable = PageRequest.of(query.page(), query.size());
        Page<Message> messages = messageRepository.findByConversationId(
            query.conversationId(),
            pageable
        );

        return messages.map(MessageDTO::from);
    }
}
```

### 5.4 Notification Context Queries

#### GetNotificationsQuery

```java
public record GetNotificationsQuery(
    UserId userId,
    boolean unreadOnly,
    int page,
    int size
) {}

@Service
@Transactional(readOnly = true)
public class GetNotificationsQueryHandler {

    public Page<NotificationDTO> handle(GetNotificationsQuery query) {
        Pageable pageable = PageRequest.of(query.page(), query.size());

        Page<Notification> notifications = query.unreadOnly()
            ? notificationRepository.findUnreadByRecipientId(query.userId(), pageable)
            : notificationRepository.findByRecipientId(query.userId(), pageable);

        return notifications.map(NotificationDTO::from);
    }
}

// DTO
public record NotificationDTO(
    String notificationId,
    String type,
    String title,
    String body,
    ActorDTO actor,
    Map<String, String> data,
    boolean isRead,
    Instant createdAt
) {}
```

---

## 6. CQRS Best Practices

### 6.1 Command Validation

```java
// Validation layers:

// 1. Command constructor (structure validation)
public record CreatePostCommand(String content) {
    public CreatePostCommand {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content required");
        }
    }
}

// 2. Command handler (business validation)
@Service
public class CreatePostCommandHandler {
    public PostId handle(CreatePostCommand command) {
        // Business rule: Only verified users
        User author = userRepository.findById(command.authorId()).orElseThrow();
        if (!author.isVerified()) {
            throw new UnverifiedUserException();
        }

        // Create post...
    }
}
```

### 6.2 Query Performance

```java
// Use DTO projections instead of loading full entity

// ❌ Slow: Load full entity
List<Post> posts = postRepository.findAll();  // Loads everything
return posts.stream().map(PostDTO::from).toList();

// ✅ Fast: Use projection
@Query("""
    SELECT new com.meslektas.dto.PostSummaryDTO(
        p.id, p.content, p.authorId, SIZE(p.likes), SIZE(p.comments)
    )
    FROM Post p
    WHERE p.profession = :profession
""")
List<PostSummaryDTO> findPostSummaries(@Param("profession") Profession profession);
```

### 6.3 Read Model Caching

```java
@Service
public class GetFeedQueryHandler {

    private final RedisTemplate<String, Page<PostDTO>> redisTemplate;

    public Page<PostDTO> handle(GetFeedQuery query) {
        // Check cache
        String cacheKey = "feed:" + query.userId() + ":" + query.page();
        Page<PostDTO> cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return cached;
        }

        // Load from DB
        Page<PostDTO> feed = loadFeedFromDatabase(query);

        // Cache for 5 minutes
        redisTemplate.opsForValue().set(cacheKey, feed, 5, TimeUnit.MINUTES);

        return feed;
    }
}
```

### 6.4 Eventual Consistency

```java
// Command publishes event
@Service
@Transactional
public class CreatePostCommandHandler {
    public PostId handle(CreatePostCommand command) {
        Post post = Post.create(...);
        postRepository.save(post);

        eventPublisher.publish(new PostCreatedEvent(post.getId(), ...));

        return post.getId();
    }
}

// Event handler updates read model (async)
@Component
public class PostReadModelUpdater {

    @TransactionalEventListener
    public void onPostCreated(PostCreatedEvent event) {
        // Update read model (denormalized)
        PostSummary summary = new PostSummary(
            event.postId(),
            event.authorName(),
            event.content(),
            0,  // like count
            0   // comment count
        );

        postSummaryRepository.save(summary);
    }
}
```

---

## 7. Testing CQRS

### 7.1 Command Handler Test

```java
class CreatePostCommandHandlerTest {

    @Test
    void should_create_post_when_user_verified() {
        // Given
        CreatePostCommand command = new CreatePostCommand(
            verifiedUserId,
            Profession.DOCTOR,
            "Test content",
            List.of()
        );

        // When
        PostId postId = handler.handle(command);

        // Then
        assertThat(postId).isNotNull();
        verify(postRepository).save(any(Post.class));
        verify(eventPublisher).publishAll(anyList());
    }

    @Test
    void should_throw_exception_when_user_not_verified() {
        // Given
        CreatePostCommand command = new CreatePostCommand(
            unverifiedUserId,
            Profession.DOCTOR,
            "Test",
            List.of()
        );

        // When & Then
        assertThatThrownBy(() -> handler.handle(command))
            .isInstanceOf(UnverifiedUserException.class);
    }
}
```

### 7.2 Query Handler Test

```java
class GetFeedQueryHandlerTest {

    @Test
    void should_return_profession_filtered_feed() {
        // Given
        GetFeedQuery query = new GetFeedQuery(doctorUserId, 0, 20);

        // When
        Page<PostDTO> feed = handler.handle(query);

        // Then
        assertThat(feed.getContent()).hasSize(20);
        assertThat(feed.getContent())
            .allMatch(dto -> dto.author().profession().equals("DOCTOR"));
    }
}
```

---

## 8. Özet

### CQRS Prensipleri:

1. **Separation:** Command (write) ve Query (read) ayrı
2. **Command:** State değiştirir, void/ID döner
3. **Query:** State okur, DTO döner
4. **Eventual Consistency:** Event-driven sync
5. **Performance:** Query optimize edilmiş (projection, cache)

### Meslektaş CQRS Summary:

- **CQRS Lite:** Aynı database, ayrı sınıflar
- **Commands:** 20+ command (register, verify, post, message, report)
- **Queries:** 15+ query (feed, profile, conversations, notifications)
- **Event-Driven:** Command → Event → Read model update
- **Caching:** Redis cache for frequent queries

### Benefits:

- ✅ Scalability: Read/write ayrı optimize edilebilir
- ✅ Performance: Query projections, caching
- ✅ Maintainability: Single Responsibility Principle
- ✅ Flexibility: Read model farklı şekilde organize edilebilir

### Next Steps:

- **Application Services:** 14-APPLICATION-SERVICES.md (Transaction orchestration)
- **DTO Mapping:** 15-DTO-MAPPING.md (MapStruct patterns)
