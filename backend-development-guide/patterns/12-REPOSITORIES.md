# Repository Pattern Kılavuzu

## 1. Genel Bakış

### 1.1 Repository Nedir?

Repository, aggregate'lerin persistence ve retrieval (kaydetme ve yükleme) işlemlerini kapsayan bir abstraction layer'dır. Domain layer ile infrastructure layer arasında bir köprü görevi görür.

**Temel Özellikler:**

- **Collection Semantics:** Aggregate'leri bir collection gibi yönetir
- **Persistence Ignorance:** Domain layer database detaylarından habersiz
- **Aggregate Root Only:** Sadece aggregate root için repository oluşturulur
- **Query Encapsulation:** Karmaşık query'ler kapsüllenir

**Repository vs DAO:**

```
Repository:
- Domain-driven
- Aggregate root odaklı
- Collection semantics (add, remove, find)
- Business-oriented query methods
- Domain layer'da interface

DAO (Data Access Object):
- Data-driven
- Table odaklı
- CRUD operations (create, read, update, delete)
- Generic query methods
- Infrastructure layer'da
```

**Meslektaş Projesi Context:**

- 9 Repository interface (her aggregate root için)
- Spring Data JPA implementation
- Custom query methods (business-oriented)
- Specification pattern for complex queries

### 1.2 Repository Sorumluluğu

**✅ Repository Sorumlu:**

- Aggregate'i ID ile bulmak
- Aggregate'i kaydetmek
- Aggregate'i silmek
- Business-oriented query'ler (e.g., findByProfession)
- Pagination & sorting

**❌ Repository Sorumlu Değil:**

- Business logic (domain service'e ait)
- Validation (aggregate'e ait)
- Transaction management (application service'e ait)
- DTO mapping (application layer'a ait)

---

## 2. Repository Tasarım Prensipleri

### 2.1 Interface in Domain Layer

**Prensip:** Repository interface domain layer'da, implementation infrastructure layer'da olmalıdır.

**Package Structure:**

```
src/main/java/
├── domain/
│   ├── model/
│   │   └── post/
│   │       ├── Post.java (Aggregate Root)
│   │       ├── PostId.java (Value Object)
│   │       └── PostRepository.java (Interface - Domain Layer)
│   └── ...
├── infrastructure/
│   └── persistence/
│       └── post/
│           ├── PostRepositoryImpl.java (Implementation - Infrastructure)
│           ├── PostJpaRepository.java (Spring Data JPA)
│           └── PostEntity.java (JPA Entity - optional if using entity mapping)
```

**Domain Layer Interface:**

```java
// Domain Layer: domain/model/post/PostRepository.java
package com.meslektas.domain.model.post;

import java.util.List;
import java.util.Optional;

public interface PostRepository {

    /**
     * Find post by ID
     */
    Optional<Post> findById(PostId id);

    /**
     * Save post (insert or update)
     */
    Post save(Post post);

    /**
     * Delete post
     */
    void delete(Post post);

    /**
     * Find posts by profession (business query)
     */
    List<Post> findByProfession(Profession profession, Pageable pageable);

    /**
     * Find posts by author
     */
    List<Post> findByAuthorId(UserId authorId);

    /**
     * Check if post exists
     */
    boolean existsById(PostId id);
}
```

**Infrastructure Layer Implementation:**

```java
// Infrastructure Layer: infrastructure/persistence/post/PostRepositoryImpl.java
package com.meslektas.infrastructure.persistence.post;

import com.meslektas.domain.model.post.*;
import org.springframework.stereotype.Repository;

@Repository
public class PostRepositoryImpl implements PostRepository {

    private final PostJpaRepository jpaRepository;

    @Override
    public Optional<Post> findById(PostId id) {
        return jpaRepository.findById(id.getValue())
            .map(PostMapper::toDomain);
    }

    @Override
    public Post save(Post post) {
        PostJpaEntity entity = PostMapper.toEntity(post);
        PostJpaEntity saved = jpaRepository.save(entity);
        return PostMapper.toDomain(saved);
    }

    // ... other methods
}
```

**Neden Bu Pattern?**

- Domain layer infrastructure'dan bağımsız (dependency inversion)
- Test edilebilirlik (mock repository kullanılabilir)
- Database değişikliği domain layer'ı etkilemez

### 2.2 Aggregate Root Only

**Prensip:** Sadece aggregate root için repository oluştur, child entity'ler için değil.

```java
✅ Doğru:
public interface PostRepository {
    Optional<Post> findById(PostId id);
}

public interface UserRepository {
    Optional<User> findById(UserId id);
}

❌ Yanlış:
public interface CommentRepository {  // Comment bir child entity!
    Optional<Comment> findById(CommentId id);
}

// Comment'e erişim aggregate üzerinden:
Post post = postRepository.findById(postId).orElseThrow();
Comment comment = post.findComment(commentId);  // Aggregate method
```

**Meslektaş Repository'leri (9 Aggregate Root):**

1. UserRepository (User aggregate)
2. VerificationRequestRepository (VerificationRequest aggregate)
3. PostRepository (Post aggregate)
4. ConversationRepository (Conversation aggregate)
5. MessageRepository (Message aggregate - lazy loaded)
6. NotificationRepository (Notification aggregate)
7. ModerationCaseRepository (ModerationCase aggregate)

### 2.3 Collection Semantics

**Prensip:** Repository bir collection gibi davranmalıdır.

```java
public interface PostRepository {

    // Collection methods
    Optional<Post> findById(PostId id);  // Get by key
    List<Post> findAll();  // Get all
    Post save(Post post);  // Add or update
    void delete(Post post);  // Remove
    boolean exists(PostId id);  // Contains
    long count();  // Size
}
```

**Anti-Pattern (CRUD Smell):**

```java
❌ Yanlış:
public interface PostRepository {
    void create(Post post);  // CRUD terminology
    Post read(PostId id);
    void update(Post post);
    void delete(PostId id);
}
```

### 2.4 Business-Oriented Queries

**Prensip:** Query method isimleri business domain'den gelmeli.

```java
✅ Doğru (Business-Oriented):
public interface PostRepository {
    List<Post> findByProfession(Profession profession);
    List<Post> findActivePostsByAuthor(UserId authorId);
    List<Post> findRecentPosts(Profession profession, int limit);
    long countPostsByProfession(Profession profession);
}

❌ Yanlış (Technical):
public interface PostRepository {
    List<Post> selectWhereProfessionEquals(String profession);
    List<Post> queryByAuthorIdAndStatusActive(UUID authorId);
}
```

---

## 3. Meslektaş Repository Katalog

### 3.1 Identity Context Repositories

#### UserRepository

**Aggregate Root:** User

**Interface:**

```java
public interface UserRepository {

    /**
     * Find user by ID
     */
    Optional<User> findById(UserId id);

    /**
     * Find user by email (unique constraint)
     */
    Optional<User> findByEmail(Email email);

    /**
     * Save user (insert or update)
     */
    User save(User user);

    /**
     * Delete user
     */
    void delete(User user);

    /**
     * Check if email exists (for registration validation)
     */
    boolean existsByEmail(Email email);

    /**
     * Find users by profession (for analytics)
     */
    List<User> findByProfession(Profession profession);

    /**
     * Find verified users
     */
    List<User> findVerifiedUsers(Pageable pageable);

    /**
     * Find suspended/banned users (for moderation)
     */
    List<User> findByStatus(UserStatus status);
}
```

**Business Queries:**

- `findByEmail`: Login use case
- `existsByEmail`: Registration validation
- `findVerifiedUsers`: Analytics, admin panel
- `findByStatus`: Moderation queries

---

### 3.2 Verification Context Repositories

#### VerificationRequestRepository

**Aggregate Root:** VerificationRequest

**Interface:**

```java
public interface VerificationRequestRepository {

    Optional<VerificationRequest> findById(VerificationRequestId id);

    VerificationRequest save(VerificationRequest request);

    /**
     * Find user's verification requests (for attempt check)
     */
    List<VerificationRequest> findByUserId(UserId userId);

    /**
     * Find user's latest verification request
     */
    Optional<VerificationRequest> findLatestByUserId(UserId userId);

    /**
     * Find pending manual review requests (for moderator assignment)
     */
    List<VerificationRequest> findPendingManualReview(Pageable pageable);

    /**
     * Find requests by status
     */
    List<VerificationRequest> findByStatus(VerificationStatus status);

    /**
     * Find expired pending requests (for cleanup job)
     */
    List<VerificationRequest> findExpiredPendingRequests(Duration timeout);

    /**
     * Count requests by status (for dashboard)
     */
    long countByStatus(VerificationStatus status);
}
```

**Business Queries:**

- `findLatestByUserId`: Attempt validation
- `findPendingManualReview`: Moderator assignment
- `findExpiredPendingRequests`: Timeout handling

---

### 3.3 Social Context Repositories

#### PostRepository

**Aggregate Root:** Post

**Interface:**

```java
public interface PostRepository {

    Optional<Post> findById(PostId id);

    Post save(Post post);

    void delete(Post post);

    /**
     * Find posts by profession (feed use case)
     */
    List<Post> findByProfession(Profession profession, Pageable pageable);

    /**
     * Find active posts by profession (exclude hidden/deleted)
     */
    List<Post> findActiveByProfession(Profession profession, Pageable pageable);

    /**
     * Find posts by author
     */
    List<Post> findByAuthorId(UserId authorId, Pageable pageable);

    /**
     * Find posts with status (for moderation)
     */
    List<Post> findByStatus(PostStatus status, Pageable pageable);

    /**
     * Find posts with image count (for analytics)
     */
    List<Post> findPostsWithImages();

    /**
     * Count posts by profession
     */
    long countByProfession(Profession profession);

    /**
     * Find recent posts (last 24 hours)
     */
    List<Post> findRecentPosts(Profession profession, Instant since);

    /**
     * Find posts by IDs (for batch loading)
     */
    List<Post> findAllById(List<PostId> ids);
}
```

**Custom Query Example:**

```java
@Query("""
    SELECT p FROM Post p
    WHERE p.profession = :profession
      AND p.status = 'ACTIVE'
      AND p.authorId NOT IN :blockedUserIds
    ORDER BY p.createdAt DESC
""")
List<Post> findFeedPosts(
    @Param("profession") Profession profession,
    @Param("blockedUserIds") Set<UserId> blockedUserIds,
    Pageable pageable
);
```

**Business Queries:**

- `findActiveByProfession`: Feed generation
- `findByAuthorId`: User profile posts
- `findRecentPosts`: Analytics, trending

---

### 3.4 Messaging Context Repositories

#### ConversationRepository

**Aggregate Root:** Conversation

**Interface:**

```java
public interface ConversationRepository {

    Optional<Conversation> findById(ConversationId id);

    Conversation save(Conversation conversation);

    /**
     * Find conversation between two users
     */
    Optional<Conversation> findByParticipants(UserId user1Id, UserId user2Id);

    /**
     * Find all conversations for a user
     */
    List<Conversation> findByParticipant(UserId userId, Pageable pageable);

    /**
     * Find active conversations (not archived)
     */
    List<Conversation> findActiveByParticipant(UserId userId, Pageable pageable);

    /**
     * Find conversations with unread messages
     */
    List<Conversation> findWithUnreadMessages(UserId userId);

    /**
     * Find archived conversations
     */
    List<Conversation> findArchivedByParticipant(UserId userId, Pageable pageable);

    /**
     * Count unread conversations
     */
    long countUnreadConversations(UserId userId);
}
```

**Business Queries:**

- `findByParticipants`: Check existing conversation before creating
- `findWithUnreadMessages`: Unread badge count
- `findActiveByParticipant`: User's conversation list

---

#### MessageRepository

**Aggregate Root:** Message (lazy loaded from Conversation)

**Interface:**

```java
public interface MessageRepository {

    Optional<Message> findById(MessageId id);

    Message save(Message message);

    void delete(Message message);

    /**
     * Find messages in conversation (paginated)
     */
    Page<Message> findByConversationId(ConversationId conversationId, Pageable pageable);

    /**
     * Find latest messages (for preview)
     */
    List<Message> findLatestMessages(ConversationId conversationId, int limit);

    /**
     * Find unread messages
     */
    List<Message> findUnreadMessages(ConversationId conversationId, UserId recipientId);

    /**
     * Count unread messages
     */
    long countUnreadMessages(ConversationId conversationId, UserId recipientId);

    /**
     * Find messages sent after timestamp (for real-time sync)
     */
    List<Message> findMessagesSince(ConversationId conversationId, Instant since);
}
```

**Business Queries:**

- `findLatestMessages`: Conversation preview
- `findUnreadMessages`: Mark all as read
- `countUnreadMessages`: Badge count

**Note:** Message'lar Conversation aggregate'inin bir parçası olmasına rağmen, performans için ayrı repository kullanılıyor (lazy loading).

---

### 3.5 Notification Context Repositories

#### NotificationRepository

**Aggregate Root:** Notification

**Interface:**

```java
public interface NotificationRepository {

    Optional<Notification> findById(NotificationId id);

    Notification save(Notification notification);

    void delete(Notification notification);

    /**
     * Find notifications for user (paginated)
     */
    Page<Notification> findByRecipientId(UserId recipientId, Pageable pageable);

    /**
     * Find unread notifications
     */
    List<Notification> findUnreadByRecipientId(UserId recipientId);

    /**
     * Count unread notifications (badge)
     */
    long countUnreadByRecipientId(UserId recipientId);

    /**
     * Find notifications by type (for filtering)
     */
    List<Notification> findByRecipientIdAndType(
        UserId recipientId,
        NotificationType type,
        Pageable pageable
    );

    /**
     * Find expired notifications (30 days old)
     */
    List<Notification> findExpiredNotifications(Instant expiryDate);

    /**
     * Delete notifications related to deleted post
     */
    void deleteByTargetPostId(PostId postId);

    /**
     * Delete all notifications for user (when user banned)
     */
    void deleteByRecipientId(UserId recipientId);
}
```

**Business Queries:**

- `findUnreadByRecipientId`: Notification list
- `countUnreadByRecipientId`: Badge count
- `findExpiredNotifications`: Cleanup job

---

### 3.6 Moderation Context Repositories

#### ModerationCaseRepository

**Aggregate Root:** ModerationCase

**Interface:**

```java
public interface ModerationCaseRepository {

    Optional<ModerationCase> findById(ModerationCaseId id);

    ModerationCase save(ModerationCase moderationCase);

    /**
     * Find case by target (post or user)
     */
    Optional<ModerationCase> findByTargetPostId(PostId postId);
    Optional<ModerationCase> findByTargetUserId(UserId userId);

    /**
     * Find pending manual review cases (for moderator queue)
     */
    List<ModerationCase> findPendingManualReview(Pageable pageable);

    /**
     * Find cases assigned to moderator
     */
    List<ModerationCase> findByAssignedModeratorId(UserId moderatorId);

    /**
     * Find cases by status
     */
    List<ModerationCase> findByStatus(ModerationStatus status);

    /**
     * Find overdue cases (48h SLA)
     */
    List<ModerationCase> findOverdueCases(Instant deadline);

    /**
     * Find cases with high report count
     */
    List<ModerationCase> findCasesWithReportCountGreaterThan(int threshold);

    /**
     * Count cases by status (dashboard)
     */
    long countByStatus(ModerationStatus status);
}
```

**Business Queries:**

- `findPendingManualReview`: Moderator assignment
- `findOverdueCases`: SLA monitoring
- `findByTargetPostId`: Check if post already reported

---

## 4. Spring Data JPA Implementation

### 4.1 Basic Repository

```java
// Spring Data JPA Interface
public interface PostJpaRepository extends JpaRepository<Post, UUID> {

    // Method name query (Spring Data generates SQL)
    List<Post> findByProfession(Profession profession, Pageable pageable);

    List<Post> findByAuthorId(UUID authorId);

    boolean existsByIdAndStatus(UUID id, PostStatus status);
}
```

### 4.2 Custom Query (@Query)

```java
public interface PostJpaRepository extends JpaRepository<Post, UUID> {

    @Query("""
        SELECT p FROM Post p
        WHERE p.profession = :profession
          AND p.status = 'ACTIVE'
          AND p.createdAt > :since
        ORDER BY p.createdAt DESC
    """)
    List<Post> findRecentActivePosts(
        @Param("profession") Profession profession,
        @Param("since") Instant since,
        Pageable pageable
    );

    // Native SQL query
    @Query(value = """
        SELECT * FROM posts p
        WHERE p.profession = :profession
          AND p.status = 'ACTIVE'
          AND NOT EXISTS (
              SELECT 1 FROM user_blocked_users bu
              WHERE bu.user_id = :userId AND bu.blocked_user_id = p.author_id
          )
        ORDER BY p.created_at DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Post> findFeedPostsNative(
        @Param("profession") String profession,
        @Param("userId") UUID userId,
        @Param("limit") int limit
    );
}
```

### 4.3 Specification Pattern (Dynamic Queries)

```java
// Specification interface
public interface PostSpecification {

    static Specification<Post> hasStatus(PostStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    static Specification<Post> hasProfession(Profession profession) {
        return (root, query, cb) -> cb.equal(root.get("profession"), profession);
    }

    static Specification<Post> createdAfter(Instant since) {
        return (root, query, cb) -> cb.greaterThan(root.get("createdAt"), since);
    }

    static Specification<Post> authorNotIn(Set<UserId> blockedUserIds) {
        return (root, query, cb) -> cb.not(root.get("authorId").in(blockedUserIds));
    }
}

// Repository
public interface PostJpaRepository extends JpaRepository<Post, UUID>,
                                           JpaSpecificationExecutor<Post> {
}

// Usage
Specification<Post> spec = Specification
    .where(PostSpecification.hasStatus(PostStatus.ACTIVE))
    .and(PostSpecification.hasProfession(Profession.DOCTOR))
    .and(PostSpecification.createdAfter(Instant.now().minus(7, ChronoUnit.DAYS)))
    .and(PostSpecification.authorNotIn(blockedUserIds));

List<Post> posts = postRepository.findAll(spec, PageRequest.of(0, 20));
```

### 4.4 Custom Implementation

```java
// Custom repository interface
public interface PostRepositoryCustom {
    List<Post> findFeedPostsOptimized(UserId userId, Profession profession, Pageable pageable);
}

// Implementation
@Repository
public class PostRepositoryCustomImpl implements PostRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Post> findFeedPostsOptimized(UserId userId, Profession profession, Pageable pageable) {
        String sql = """
            SELECT p.* FROM posts p
            WHERE p.profession = :profession
              AND p.status = 'ACTIVE'
              AND p.author_id NOT IN (
                  SELECT blocked_user_id FROM user_blocked_users WHERE user_id = :userId
              )
            ORDER BY p.created_at DESC
            LIMIT :limit OFFSET :offset
        """;

        Query query = entityManager.createNativeQuery(sql, Post.class);
        query.setParameter("profession", profession.name());
        query.setParameter("userId", userId.getValue());
        query.setParameter("limit", pageable.getPageSize());
        query.setParameter("offset", pageable.getOffset());

        return query.getResultList();
    }
}

// Main repository extends custom
public interface PostJpaRepository extends JpaRepository<Post, UUID>,
                                           PostRepositoryCustom {
}
```

---

## 5. Performance Optimization

### 5.1 N+1 Query Problem

**Problem:**

```java
❌ N+1 Query:
List<Post> posts = postRepository.findAll();  // 1 query
for (Post post : posts) {
    User author = userRepository.findById(post.getAuthorId());  // N queries!
}
```

**Solution 1: JOIN FETCH:**

```java
@Query("""
    SELECT p FROM Post p
    LEFT JOIN FETCH p.comments
    WHERE p.profession = :profession
""")
List<Post> findByProfessionWithComments(@Param("profession") Profession profession);
```

**Solution 2: Batch Loading:**

```java
// application.properties
spring.jpa.properties.hibernate.default_batch_fetch_size=10

// Entity
@Entity
public class Post {
    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 10)  // Load 10 comment collections at once
    private List<Comment> comments;
}
```

**Solution 3: DTO Projection:**

```java
public interface PostSummary {
    PostId getId();
    String getContent();
    int getLikeCount();
    int getCommentCount();
}

@Query("""
    SELECT p.id as id, p.content as content,
           SIZE(p.likes) as likeCount,
           SIZE(p.comments) as commentCount
    FROM Post p
    WHERE p.profession = :profession
""")
List<PostSummary> findSummaryByProfession(@Param("profession") Profession profession);
```

### 5.2 Index Optimization

```sql
-- Most queried columns should be indexed

CREATE INDEX idx_posts_profession ON posts(profession);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Composite index for common query
CREATE INDEX idx_posts_profession_status_created
ON posts(profession, status, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Partial index (PostgreSQL)
CREATE INDEX idx_posts_active
ON posts(profession, created_at DESC)
WHERE status = 'ACTIVE';
```

### 5.3 Pagination

```java
// Cursor-based pagination (better for large datasets)
public interface PostRepository {

    @Query("""
        SELECT p FROM Post p
        WHERE p.profession = :profession
          AND p.createdAt < :cursor
        ORDER BY p.createdAt DESC
    """)
    List<Post> findNextPage(
        @Param("profession") Profession profession,
        @Param("cursor") Instant cursor,
        Pageable pageable
    );
}

// Usage:
Instant cursor = lastPost.getCreatedAt();
List<Post> nextPage = postRepository.findNextPage(
    Profession.DOCTOR,
    cursor,
    PageRequest.of(0, 20)
);
```

### 5.4 Caching

```java
@Repository
public class CachedPostRepository implements PostRepository {

    private final PostJpaRepository jpaRepository;
    private final RedisTemplate<String, Post> redisTemplate;

    @Override
    public Optional<Post> findById(PostId id) {
        // Check cache first
        String cacheKey = "post:" + id.getValue();
        Post cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return Optional.of(cached);
        }

        // Load from DB
        Optional<Post> post = jpaRepository.findById(id.getValue());

        // Cache for 1 hour
        post.ifPresent(p ->
            redisTemplate.opsForValue().set(cacheKey, p, 1, TimeUnit.HOURS)
        );

        return post;
    }

    @Override
    public Post save(Post post) {
        Post saved = jpaRepository.save(post);

        // Invalidate cache
        String cacheKey = "post:" + post.getId().getValue();
        redisTemplate.delete(cacheKey);

        return saved;
    }
}
```

---

## 6. Testing Repositories

### 6.1 Unit Test (Mock Repository)

```java
class PostServiceTest {

    private PostRepository postRepository;
    private PostService postService;

    @BeforeEach
    void setup() {
        postRepository = mock(PostRepository.class);
        postService = new PostService(postRepository);
    }

    @Test
    void should_find_post_by_id() {
        // Given
        PostId postId = new PostId(UUID.randomUUID());
        Post expectedPost = Post.create(...);

        when(postRepository.findById(postId))
            .thenReturn(Optional.of(expectedPost));

        // When
        Post actualPost = postService.getPost(postId);

        // Then
        assertThat(actualPost).isEqualTo(expectedPost);
        verify(postRepository).findById(postId);
    }
}
```

### 6.2 Integration Test (@DataJpaTest)

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class PostRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired
    private PostJpaRepository postRepository;

    @Test
    void should_save_and_find_post() {
        // Given
        Post post = Post.create(
            new UserId(UUID.randomUUID()),
            Profession.DOCTOR,
            new PostContent("Test post"),
            List.of()
        );

        // When
        Post saved = postRepository.save(post);
        Optional<Post> found = postRepository.findById(saved.getId().getValue());

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getContent()).isEqualTo("Test post");
    }

    @Test
    void should_find_posts_by_profession() {
        // Given
        Post doctorPost = Post.create(authorId, Profession.DOCTOR, content, List.of());
        Post engineerPost = Post.create(authorId, Profession.ENGINEER, content, List.of());
        postRepository.saveAll(List.of(doctorPost, engineerPost));

        // When
        List<Post> doctorPosts = postRepository.findByProfession(
            Profession.DOCTOR,
            Pageable.unpaged()
        );

        // Then
        assertThat(doctorPosts).hasSize(1);
        assertThat(doctorPosts.get(0).getProfession()).isEqualTo(Profession.DOCTOR);
    }
}
```

### 6.3 Performance Test

```java
@SpringBootTest
class PostRepositoryPerformanceTest {

    @Autowired
    private PostRepository postRepository;

    @Test
    void should_load_feed_in_less_than_100ms() {
        // Given - insert 1000 posts
        List<Post> posts = IntStream.range(0, 1000)
            .mapToObj(i -> Post.create(...))
            .toList();
        postRepository.saveAll(posts);

        // When
        long start = System.currentTimeMillis();
        List<Post> feed = postRepository.findActiveByProfession(
            Profession.DOCTOR,
            PageRequest.of(0, 20)
        );
        long duration = System.currentTimeMillis() - start;

        // Then
        assertThat(duration).isLessThan(100);  // Less than 100ms
        assertThat(feed).hasSize(20);
    }
}
```

---

## 7. Repository Anti-Patterns

### 7.1 Generic Repository

```java
❌ Yanlış (Generic Repository):
public interface GenericRepository<T, ID> {
    T save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void delete(T entity);
}

public interface PostRepository extends GenericRepository<Post, PostId> {
    // Generic methods kullanılıyor - business query'ler yok
}

Sorunlar:
- Business domain'i temsil etmiyor
- Tüm aggregate'ler aynı interface'i kullanıyor (one-size-fits-all)
- CRUD smell
```

```java
✅ Doğru (Business-Specific Repository):
public interface PostRepository {
    Optional<Post> findById(PostId id);
    Post save(Post post);
    void delete(Post post);

    // Business-specific queries
    List<Post> findActiveByProfession(Profession profession, Pageable pageable);
    List<Post> findRecentPosts(Profession profession, Instant since);
    long countByProfession(Profession profession);
}
```

### 7.2 Repository with Business Logic

```java
❌ Yanlış:
public interface PostRepository {

    // Business logic - Repository'de OLMAMALI!
    default boolean canUserLikePost(Post post, UserId userId) {
        if (post.getAuthorId().equals(userId)) {
            return false;
        }
        if (post.getLikes().contains(userId)) {
            return false;
        }
        return true;
    }
}

Sorun: Business logic repository'de, aggregate'te olmalı
```

```java
✅ Doğru:
// Business logic aggregate'te
public class Post {
    public void addLike(UserId userId) {
        if (this.authorId.equals(userId)) {
            throw new CannotLikeSelfPostException();
        }
        if (this.likes.contains(userId)) {
            throw new UserAlreadyLikedPostException();
        }
        this.likes.add(userId);
    }
}
```

### 7.3 Repository Leaking Infrastructure

```java
❌ Yanlış:
public interface PostRepository {
    // JPA EntityManager sızdırıyor!
    EntityManager getEntityManager();

    // Hibernate Session sızdırıyor!
    Session getSession();
}

Sorun: Domain layer infrastructure detaylarından haberdar olmamalı
```

### 7.4 Too Many Query Methods

```java
❌ Yanlış (Method Explosion):
public interface PostRepository {
    List<Post> findByProfession(Profession profession);
    List<Post> findByProfessionAndStatus(Profession profession, PostStatus status);
    List<Post> findByProfessionAndStatusAndCreatedAtAfter(Profession profession, PostStatus status, Instant since);
    List<Post> findByProfessionAndStatusAndCreatedAtAfterAndAuthorIdNotIn(Profession profession, PostStatus status, Instant since, Set<UserId> blockedUserIds);
    // ... 50 more methods
}

Sorun: Her query combination için method - unmaintainable
```

```java
✅ Doğru (Specification Pattern):
public interface PostRepository extends JpaSpecificationExecutor<Post> {
    // Core methods only
    Optional<Post> findById(PostId id);
    Post save(Post post);

    // Use specifications for dynamic queries
    // List<Post> findAll(Specification<Post> spec, Pageable pageable);
}
```

---

## 8. Özet

### Repository Prensipleri:

1. **Interface in Domain Layer:** Repository interface domain'de, implementation infrastructure'da
2. **Aggregate Root Only:** Sadece aggregate root için repository
3. **Collection Semantics:** Repository bir collection gibi davranır
4. **Business-Oriented Queries:** Query method isimleri domain'den gelir
5. **Persistence Ignorance:** Domain layer database detaylarından habersiz

### Meslektaş Repository Summary:

- **9 Repository:** User, VerificationRequest, Post, Conversation, Message, Notification, ModerationCase
- **Spring Data JPA:** Method name queries, @Query, Specification pattern
- **Performance:** Index optimization, pagination, caching, N+1 prevention
- **Testing:** Unit tests (mock), integration tests (@DataJpaTest + Testcontainers)

### Query Optimization:

- **Index:** Most queried columns indexed
- **JOIN FETCH:** Prevent N+1 queries
- **DTO Projection:** Load only needed data
- **Pagination:** Cursor-based for large datasets
- **Caching:** Redis cache for frequently accessed data

### Next Steps:

- **CQRS Pattern:** 13-CQRS-PATTERN.md (Command/Query separation)
- **Application Services:** 14-APPLICATION-SERVICES.md (Use case orchestration)
- **DTO Mapping:** 15-DTO-MAPPING.md (Domain ↔ DTO transformation)
