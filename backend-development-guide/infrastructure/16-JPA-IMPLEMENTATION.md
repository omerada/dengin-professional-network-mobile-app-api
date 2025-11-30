# JPA Implementation Kılavuzu

## 1. Genel Bakış

### 1.1 JPA ve Spring Data JPA

JPA (Java Persistence API), Java nesneleri ile ilişkisel veritabanı arasında ORM (Object-Relational Mapping) sağlar.

**Teknoloji Stack:**

```
Spring Data JPA 3.2.x
Hibernate 6.4.x (JPA Implementation)
PostgreSQL 15
Flyway (Database Migration)
```

**Katman Yapısı:**

```
Domain Layer (Aggregate)
    ↓
Repository Interface (Domain)
    ↓
JPA Repository Implementation (Infrastructure)
    ↓
JPA Entity (Infrastructure)
    ↓
PostgreSQL Database
```

### 1.2 Domain vs Infrastructure

**Domain Layer (Pure):**

- Aggregate Root (User, Post, Conversation)
- Value Objects (Email, UserId, PostContent)
- Domain Events
- Repository Interfaces (port)

**Infrastructure Layer (Technical):**

- JPA Entities (@Entity)
- JPA Repository Implementations
- Entity Converters
- Query implementations

**Mapping Strategy:**

```
Domain Aggregate ↔ JPA Entity (separate classes)
- Domain: Business logic
- Entity: Persistence mapping
- Converter: Bidirectional conversion
```

---

## 2. JPA Entity Design

### 2.1 Entity Base Class

Tüm entity'ler ortak base class'tan türer.

**BaseEntity:**

```java
package com.meslektas.infrastructure.persistence.entity;

@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Getters/Setters
}
```

### 2.2 User Entity

**UserEntity (JPA):**

```java
package com.meslektas.infrastructure.persistence.entity;

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_email", columnList = "email", unique = true),
        @Index(name = "idx_user_profession", columnList = "profession")
    }
)
public class UserEntity extends BaseEntity {

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "profession", nullable = false, length = 50)
    private Profession profession;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 50)
    private VerificationStatus verificationStatus;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "profile_visible", nullable = false)
    private boolean profileVisible = true;

    @Column(name = "accept_messages", nullable = false)
    private boolean acceptMessages = true;

    @Column(name = "post_count", nullable = false)
    private int postCount = 0;

    @Column(name = "follower_count", nullable = false)
    private int followerCount = 0;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "user_blocked_users",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "blocked_user_id")
    private Set<UUID> blockedUserIds = new HashSet<>();

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    // Constructors
    protected UserEntity() {
        // JPA requires no-arg constructor
    }

    // Getters/Setters
}
```

**Domain → Entity Converter:**

```java
package com.meslektas.infrastructure.persistence.converter;

@Component
public class UserEntityConverter {

    public UserEntity toEntity(User user) {
        UserEntity entity = new UserEntity();
        entity.setId(user.getId().getValue());
        entity.setEmail(user.getEmail().getValue());
        entity.setPasswordHash(user.getPassword().getHash());
        entity.setFirstName(user.getFullName().getFirstName());
        entity.setLastName(user.getFullName().getLastName());
        entity.setProfession(user.getProfession());
        entity.setVerificationStatus(user.getVerificationStatus());
        entity.setProfileImageUrl(user.getProfileImageUrl());
        entity.setProfileVisible(user.getPrivacySettings().isProfileVisible());
        entity.setAcceptMessages(user.getPrivacySettings().isAcceptMessages());
        entity.setPostCount(user.getPostCount());
        entity.setFollowerCount(user.getFollowerCount());
        entity.setBlockedUserIds(
            user.getBlockedUsers().stream()
                .map(UserId::getValue)
                .collect(Collectors.toSet())
        );
        entity.setActive(user.isActive());
        entity.setLastLoginAt(user.getLastLoginAt());
        return entity;
    }

    public User toDomain(UserEntity entity) {
        // Reconstruct domain object using factory/builder
        User user = User.reconstruct(
            UserId.of(entity.getId()),
            new Email(entity.getEmail()),
            new Password(entity.getPasswordHash()),
            new FullName(entity.getFirstName(), entity.getLastName()),
            entity.getProfession(),
            entity.getVerificationStatus(),
            entity.getProfileImageUrl(),
            new PrivacySettings(entity.isProfileVisible(), entity.isAcceptMessages()),
            entity.getPostCount(),
            entity.getFollowerCount(),
            entity.getBlockedUserIds().stream()
                .map(UserId::of)
                .collect(Collectors.toSet()),
            entity.isActive(),
            entity.getLastLoginAt(),
            entity.getCreatedAt()
        );
        return user;
    }
}
```

### 2.3 Post Entity

**PostEntity:**

```java
@Entity
@Table(
    name = "posts",
    indexes = {
        @Index(name = "idx_post_author", columnList = "author_id"),
        @Index(name = "idx_post_profession", columnList = "profession"),
        @Index(name = "idx_post_created", columnList = "created_at")
    }
)
public class PostEntity extends BaseEntity {

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "profession", nullable = false, length = 50)
    private Profession profession;

    @Column(name = "content", nullable = false, length = 2000)
    private String content;

    @OneToMany(
        mappedBy = "post",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<PostImageEntity> images = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "post_likes",
        joinColumns = @JoinColumn(name = "post_id")
    )
    @Column(name = "user_id")
    private Set<UUID> likes = new HashSet<>();

    @OneToMany(
        mappedBy = "post",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @OrderBy("createdAt ASC")
    private List<CommentEntity> comments = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // Getters/Setters

    // Helper methods for bidirectional relationships
    public void addImage(PostImageEntity image) {
        images.add(image);
        image.setPost(this);
    }

    public void addComment(CommentEntity comment) {
        comments.add(comment);
        comment.setPost(this);
    }
}
```

**PostImageEntity:**

```java
@Entity
@Table(name = "post_images")
public class PostImageEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private PostEntity post;

    @Column(name = "s3_url", nullable = false, length = 500)
    private String s3Url;

    @Column(name = "s3_key", nullable = false, length = 500)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    @Column(name = "format", nullable = false, length = 20)
    private ImageFormat format;

    @Column(name = "size_bytes", nullable = false)
    private int sizeBytes;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    // Getters/Setters
}
```

**CommentEntity:**

```java
@Entity
@Table(name = "post_comments")
public class CommentEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private PostEntity post;

    @Column(name = "commenter_id", nullable = false)
    private UUID commenterId;

    @Column(name = "content", nullable = false, length = 500)
    private String content;

    // Getters/Setters
}
```

### 2.4 Verification Request Entity

**VerificationRequestEntity:**

```java
@Entity
@Table(
    name = "verification_requests",
    indexes = {
        @Index(name = "idx_verification_user", columnList = "user_id"),
        @Index(name = "idx_verification_status", columnList = "status")
    }
)
public class VerificationRequestEntity extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private VerificationStatus status;

    // ID Document
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", length = 50)
    private DocumentType documentType;

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(name = "id_document_url", length = 500)
    private String idDocumentUrl;

    @Column(name = "id_document_s3_key", length = 500)
    private String idDocumentS3Key;

    // Selfie
    @Column(name = "selfie_url", length = 500)
    private String selfieUrl;

    @Column(name = "selfie_s3_key", length = 500)
    private String selfieS3Key;

    // AI Analysis
    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(name = "face_match_score")
    private Integer faceMatchScore;

    @Column(name = "document_authenticity_score")
    private Integer documentAuthenticityScore;

    @Column(name = "ai_processing_completed_at")
    private Instant aiProcessingCompletedAt;

    // Review
    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    // Getters/Setters
}
```

### 2.5 Conversation & Message Entities

**ConversationEntity:**

```java
@Entity
@Table(
    name = "conversations",
    indexes = {
        @Index(name = "idx_conversation_participants",
               columnList = "participant1_id, participant2_id")
    }
)
public class ConversationEntity extends BaseEntity {

    @Column(name = "participant1_id", nullable = false)
    private UUID participant1Id;

    @Column(name = "participant2_id", nullable = false)
    private UUID participant2Id;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // Getters/Setters
}
```

**MessageEntity:**

```java
@Entity
@Table(
    name = "messages",
    indexes = {
        @Index(name = "idx_message_conversation", columnList = "conversation_id"),
        @Index(name = "idx_message_sent_at", columnList = "sent_at")
    }
)
public class MessageEntity extends BaseEntity {

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "content", nullable = false, length = 1000)
    private String content;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    // Getters/Setters
}
```

---

## 3. Repository Implementation

### 3.1 Spring Data JPA Repository

**UserJpaRepository:**

```java
package com.meslektas.infrastructure.persistence.repository;

@Repository
public interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM UserEntity u
        WHERE u.profession = :profession
        AND u.verificationStatus = 'VERIFIED'
        AND u.isActive = true
        """)
    List<UserEntity> findVerifiedUsersByProfession(
        @Param("profession") Profession profession
    );
}
```

**Domain Repository Implementation:**

```java
package com.meslektas.infrastructure.persistence.repository;

@Repository
@Transactional
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository jpaRepository;
    private final UserEntityConverter converter;

    public UserRepositoryImpl(
        UserJpaRepository jpaRepository,
        UserEntityConverter converter
    ) {
        this.jpaRepository = jpaRepository;
        this.converter = converter;
    }

    @Override
    public Optional<User> findById(UserId id) {
        return jpaRepository.findById(id.getValue())
            .map(converter::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.getValue())
            .map(converter::toDomain);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return jpaRepository.existsByEmail(email.getValue());
    }

    @Override
    public User save(User user) {
        UserEntity entity = converter.toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return converter.toDomain(saved);
    }

    @Override
    public void delete(User user) {
        jpaRepository.deleteById(user.getId().getValue());
    }
}
```

### 3.2 Custom Queries

**PostJpaRepository:**

```java
@Repository
public interface PostJpaRepository extends JpaRepository<PostEntity, UUID> {

    @Query("""
        SELECT p FROM PostEntity p
        WHERE p.profession = :profession
        AND p.isDeleted = false
        AND p.authorId NOT IN :blockedUserIds
        ORDER BY p.createdAt DESC
        """)
    Page<PostEntity> findActiveByProfession(
        @Param("profession") Profession profession,
        @Param("blockedUserIds") Set<UUID> blockedUserIds,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM PostEntity p
        LEFT JOIN FETCH p.images
        LEFT JOIN FETCH p.comments
        WHERE p.id = :id
        AND p.isDeleted = false
        """)
    Optional<PostEntity> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
        SELECT COUNT(p) FROM PostEntity p
        WHERE p.authorId = :authorId
        AND p.isDeleted = false
        """)
    int countActivePostsByAuthor(@Param("authorId") UUID authorId);
}
```

### 3.3 Native Queries

**Complex queries için native SQL:**

```java
@Repository
public interface PostJpaRepository extends JpaRepository<PostEntity, UUID> {

    @Query(value = """
        SELECT p.*,
               COUNT(DISTINCT l.user_id) as like_count,
               COUNT(DISTINCT c.id) as comment_count
        FROM posts p
        LEFT JOIN post_likes l ON p.id = l.post_id
        LEFT JOIN post_comments c ON p.id = c.post_id
        WHERE p.profession = :profession
        AND p.is_deleted = false
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT :limit OFFSET :offset
        """,
        nativeQuery = true
    )
    List<Object[]> findFeedWithCounts(
        @Param("profession") String profession,
        @Param("limit") int limit,
        @Param("offset") int offset
    );
}
```

---

## 4. Value Object Mapping

### 4.1 JPA Embeddable

**Embeddable Value Objects:**

```java
@Embeddable
public class AddressEmbeddable {

    @Column(name = "street", length = 200)
    private String street;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    // Constructor, getters
}

// Usage in Entity
@Entity
public class UserEntity {

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street", column = @Column(name = "home_street")),
        @AttributeOverride(name = "city", column = @Column(name = "home_city")),
        @AttributeOverride(name = "postalCode", column = @Column(name = "home_postal_code"))
    })
    private AddressEmbeddable homeAddress;
}
```

### 4.2 AttributeConverter

**Custom Type Converter:**

```java
@Converter(autoApply = false)
public class EmailConverter implements AttributeConverter<Email, String> {

    @Override
    public String convertToDatabaseColumn(Email attribute) {
        return attribute != null ? attribute.getValue() : null;
    }

    @Override
    public Email convertToEntityAttribute(String dbData) {
        return dbData != null ? new Email(dbData) : null;
    }
}

// Usage
@Entity
public class UserEntity {

    @Convert(converter = EmailConverter.class)
    @Column(name = "email")
    private Email email;  // Value object directly
}
```

---

## 5. Performance Optimization

### 5.1 Fetch Strategies

**Lazy Loading:**

```java
@Entity
public class PostEntity {

    // Lazy: Load only when accessed
    @OneToMany(fetch = FetchType.LAZY)
    private List<CommentEntity> comments;

    @ElementCollection(fetch = FetchType.LAZY)
    private Set<UUID> likes;
}
```

**Eager Loading (use sparingly):**

```java
@Entity
public class PostEntity {

    // Eager: Always load with parent
    @OneToMany(fetch = FetchType.EAGER)
    private List<PostImageEntity> images;  // Small collection
}
```

**Entity Graph (best practice):**

```java
@Repository
public interface PostJpaRepository extends JpaRepository<PostEntity, UUID> {

    @EntityGraph(attributePaths = {"images", "comments"})
    @Query("SELECT p FROM PostEntity p WHERE p.id = :id")
    Optional<PostEntity> findByIdWithDetails(@Param("id") UUID id);
}
```

### 5.2 Batch Fetching

**@BatchSize:**

```java
@Entity
public class PostEntity {

    @OneToMany
    @BatchSize(size = 25)  // Fetch in batches of 25
    private List<CommentEntity> comments;
}
```

### 5.3 Query Optimization

**Pagination:**

```java
@Repository
public interface PostJpaRepository extends JpaRepository<PostEntity, UUID> {

    Page<PostEntity> findByProfession(
        Profession profession,
        Pageable pageable
    );
}

// Usage
Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
Page<PostEntity> page = postRepository.findByProfession(Profession.DOCTOR, pageable);
```

**Projection (DTO):**

```java
// Interface projection
public interface PostSummaryProjection {
    UUID getId();
    String getContent();
    int getLikeCount();
}

@Query("""
    SELECT p.id as id, p.content as content, SIZE(p.likes) as likeCount
    FROM PostEntity p
    WHERE p.profession = :profession
    """)
List<PostSummaryProjection> findPostSummaries(
    @Param("profession") Profession profession
);
```

---

## 6. Transaction Management

### 6.1 @Transactional

**Service Layer:**

```java
@Service
@Transactional  // Class-level default
public class PostService {

    public PostId createPost(CreatePostCommand command) {
        // All repository calls in single transaction
        User user = userRepository.findById(command.userId()).orElseThrow();
        Post post = Post.create(...);
        postRepository.save(post);

        return post.getId();
        // Transaction commits here
    }

    @Transactional(readOnly = true)  // Optimization for read
    public PostDTO getPost(PostId id) {
        Post post = postRepository.findById(id).orElseThrow();
        return PostDTO.from(post);
    }
}
```

### 6.2 Isolation Levels

**Custom Isolation:**

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void criticalOperation() {
    // Highest isolation, prevents phantom reads
}

@Transactional(isolation = Isolation.READ_COMMITTED)  // Default
public void normalOperation() {
    // Standard isolation
}
```

### 6.3 Rollback Rules

**Exception Handling:**

```java
@Transactional(rollbackFor = {Exception.class})
public void operationWithRollback() {
    // Rollback on any exception
}

@Transactional(noRollbackFor = {BusinessException.class})
public void operationWithNoRollback() {
    // No rollback for business exceptions
}
```

---

## 7. Database Migrations (Flyway)

### 7.1 Flyway Configuration

**application.yml:**

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
    validate-on-migrate: true
```

### 7.2 Migration Scripts

**V1\_\_create_users_table.sql:**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profession VARCHAR(50) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    profile_image_url VARCHAR(500),
    profile_visible BOOLEAN NOT NULL DEFAULT true,
    accept_messages BOOLEAN NOT NULL DEFAULT true,
    post_count INTEGER NOT NULL DEFAULT 0,
    follower_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_profession ON users(profession);
```

**V2\_\_create_posts_table.sql:**

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(id),
    profession VARCHAR(50) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_post_author ON posts(author_id);
CREATE INDEX idx_post_profession ON posts(profession);
CREATE INDEX idx_post_created ON posts(created_at);

CREATE TABLE post_images (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    s3_url VARCHAR(500) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    format VARCHAR(20) NOT NULL,
    size_bytes INTEGER NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE post_comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL REFERENCES users(id),
    content VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);
```

---

## 8. Best Practices

### 8.1 Entity Guidelines

- ✅ Use UUID for IDs
- ✅ Add indexes for foreign keys and query fields
- ✅ Use @Version for optimistic locking
- ✅ Lazy loading by default
- ✅ Cascade operations carefully
- ❌ Avoid bidirectional relationships when possible
- ❌ Don't use @ManyToMany (use join entity instead)

### 8.2 Query Guidelines

- ✅ Use JPQL for portability
- ✅ Use native SQL for complex queries
- ✅ Always paginate large result sets
- ✅ Use projections for read-only queries
- ✅ Add @QueryHint for performance tuning
- ❌ Avoid N+1 queries (use JOIN FETCH)
- ❌ Don't fetch entire collections unnecessarily

### 8.3 Performance Guidelines

- ✅ Enable second-level cache for reference data
- ✅ Use batch inserts/updates
- ✅ Profile queries with query logging
- ✅ Monitor slow query log
- ❌ Avoid Cartesian products in queries

---

## 9. Özet

### JPA Implementation:

- **Entity Design:** Separate from domain model
- **Converters:** Domain ↔ Entity bidirectional
- **Repositories:** Spring Data JPA + custom implementations
- **Performance:** Lazy loading, projections, batching
- **Migrations:** Flyway versioned scripts

### Meslektaş Entities:

- UserEntity, PostEntity, VerificationRequestEntity
- ConversationEntity, MessageEntity, NotificationEntity
- ModerationCaseEntity

### Best Practices:

- ✅ Domain model isolation
- ✅ Optimistic locking (@Version)
- ✅ Proper indexing
- ✅ Transaction boundaries
- ✅ Query optimization

### Next:

- **AWS Integration:** 17-AWS-INTEGRATION.md (S3, Rekognition, SES)
