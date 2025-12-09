# 🤖 Meslektaş Backend - AI Agent Development Guide

**Version:** 1.0.0  
**Last Updated:** 2025-12-09  
**Purpose:** AI Agent'lar için optimize edilmiş, hatasız kod üretimi rehberi

---

## 📋 İçindekiler

1. [Architecture Overview](#architecture-overview)
2. [Bounded Contexts](#bounded-contexts)
3. [Development Principles](#development-principles)
4. [API Patterns](#api-patterns)
5. [Common Pitfalls](#common-pitfalls)
6. [Quick Reference](#quick-reference)

---

## 🏗️ Architecture Overview

### Strategic DDD Architecture

```
Meslektaş Backend
├── Identity Context        → Users, Auth, Professions
├── Verification Context    → AI-powered profession verification
├── Social Context          → Posts, Comments, Likes
├── Messaging Context       → Real-time chat
├── Notification Context    → Multi-channel notifications
└── Moderation Context      → Content moderation, reporting
```

### Technology Stack

```yaml
Framework: Spring Boot 3.2.0
Language: Java 17
Database: PostgreSQL 15+
Cache: Redis
Auth: JWT + OAuth2 (Google, Apple, Facebook)
Storage: AWS S3 + CloudFront
AI: AWS Rekognition
Push: Firebase FCM
Email: Mailgun
Monitoring: Sentry
```

### Package Structure

```
com.meslektas/
├── common/                 # Shared utilities, exceptions
├── config/                 # Spring configuration
├── {context}/              # Each bounded context:
│   ├── domain/
│   │   ├── model/          # Entities, Aggregates, Value Objects
│   │   ├── service/        # Domain services
│   │   └── repository/     # Repository interfaces
│   ├── application/
│   │   ├── service/        # Application services
│   │   └── dto/            # DTOs, Request/Response
│   ├── infrastructure/
│   │   ├── persistence/    # JPA repositories
│   │   ├── aws/            # AWS integrations
│   │   └── config/         # Context-specific config
│   └── api/
│       └── *Controller.java
└── shared/                 # Cross-cutting concerns
```

---

## 🎯 Bounded Contexts

### 1️⃣ Identity Context

**Purpose:** User management, authentication, authorization

**Key Entities:**

- `User` (Aggregate Root)
- `Profession` (Enum: DOCTOR, NURSE, ENGINEER, etc.)
- `DeviceToken` (for push notifications)

**Main Operations:**

```java
// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/verify-email/{token}

// OAuth2
POST   /api/auth/oauth2/google
POST   /api/auth/oauth2/apple

// Profile
GET    /api/users/me
PUT    /api/users/me
POST   /api/users/me/avatar/presigned-url
PUT    /api/users/me/avatar/confirm
```

**Business Rules:**

- Email must be unique
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Avatar: max 5MB, only jpeg/png/webp
- Users must be verified to post/chat

---

### 2️⃣ Verification Context

**Purpose:** AI-powered profession verification using document + selfie

**Key Entities:**

- `VerificationRequest` (Aggregate Root)
- `VerificationStatus`: PENDING → PROCESSING → APPROVED/REJECTED/MANUAL_REVIEW

**AI Pipeline (6 stages):**

```
1. Document Detection (AWS Rekognition)
2. Text Extraction (OCR)
3. Data Matching (name, profession)
4. Document Authenticity Check
5. Face Match (selfie ↔ ID)
6. Liveness Detection (anti-spoofing)
```

**Main Operations:**

```java
POST   /api/verification/submit              // Submit new request
GET    /api/verification/{id}                // Get status
GET    /api/verification/user/{userId}       // User's requests
```

**Business Rules:**

- Max 3 attempts per 24 hours
- Documents auto-deleted after 30 days (KVKK compliance)
- Manual review if AI confidence < 85%

---

### 3️⃣ Social Context

**Purpose:** Professional posts, comments, likes

**Key Entities:**

- `Post` (Aggregate Root)
- `Comment` (Entity)
- `PostLike` (Entity)

**Main Operations:**

```java
POST   /api/posts                    // Create post
GET    /api/posts                    // Feed (paginated)
GET    /api/posts/{id}               // Single post
PUT    /api/posts/{id}               // Edit (24h limit)
DELETE /api/posts/{id}               // Soft delete
POST   /api/posts/{id}/like          // Toggle like
POST   /api/posts/{id}/comments      // Add comment
```

**Business Rules:**

- Only verified users can post
- Edit allowed within 24h
- Max 5 images per post
- Comments can be nested (max 3 levels)

---

### 4️⃣ Messaging Context

**Purpose:** Real-time 1-to-1 chat (profession-restricted)

**Key Entities:**

- `Conversation` (Aggregate Root)
- `Message` (Entity)

**Tech:** WebSocket (STOMP) + Redis pub/sub

**Main Operations:**

```java
// REST
GET    /api/conversations              // User's conversations
POST   /api/conversations              // Start new chat

// WebSocket
/app/chat.send                         // Send message
/topic/conversations/{conversationId}  // Subscribe to chat
```

**Business Rules:**

- Only same-profession users can chat
- Messages encrypted at rest
- Max 1000 messages per conversation (pagination)

---

### 5️⃣ Notification Context

**Purpose:** Multi-channel notifications (Push, In-app, Email)

**Key Entities:**

- `Notification` (Aggregate Root)
- `NotificationPreferences` (Entity)
- `NotificationType`: POST_LIKE, COMMENT, MESSAGE, VERIFICATION_STATUS, etc.

**Main Operations:**

```java
GET    /api/notifications              // User's notifications
PUT    /api/notifications/{id}/read    // Mark read
PUT    /api/notifications/read-all     // Bulk read
GET    /api/notifications/preferences  // Get settings
PUT    /api/notifications/preferences  // Update settings
```

**Delivery Channels:**

- `PUSH` (Firebase FCM)
- `IN_APP` (stored in DB)
- `EMAIL` (Mailgun)

---

### 6️⃣ Moderation Context

**Purpose:** Content moderation, user reporting, sanctions

**Key Entities:**

- `ContentReport` (Aggregate Root)
- `UserSanction` (Aggregate Root)
- `SanctionType`: WARNING, TEMPORARY_BAN, PERMANENT_BAN

**Main Operations:**

```java
POST   /api/moderation/reports          // Report content
GET    /api/moderation/reports/pending  // Admin
POST   /api/moderation/sanctions        // Admin: apply sanction
```

---

## ⚙️ Development Principles

### 1. DDD Tactical Patterns

**✅ USE:**

- **Aggregate Root** for consistency boundaries
- **Value Objects** for immutable concepts (Email, Password, etc.)
- **Domain Services** for multi-aggregate operations
- **Repository interfaces** in domain, implementations in infrastructure

**❌ AVOID:**

- Anemic domain models (logic in services instead of entities)
- Bidirectional JPA relationships (use IDs)
- Large aggregates (keep them small)

### 2. Layering

```
API (Controllers)
    ↓ DTOs
Application (Services)
    ↓ Commands/Queries
Domain (Entities, Services)
    ↓ Repository interfaces
Infrastructure (JPA, AWS, Redis)
```

**Rules:**

- Controllers: validation, DTO mapping, HTTP concerns
- Application Services: orchestration, transactions
- Domain: business logic, invariants
- Infrastructure: technical implementations

### 3. Transaction Management

```java
@Service
@Transactional  // Default: propagation=REQUIRED, readOnly=false
public class PostService {

    @Transactional(readOnly = true)  // Optimization for reads
    public PostResponse getPost(Long id) { ... }

    @Transactional  // Write operation
    public PostResponse createPost(CreatePostRequest request) {
        // Load aggregates
        // Execute domain logic
        // Save
        // Publish events
        return response;
    }
}
```

### 4. Error Handling

**Exception Hierarchy:**

```
BusinessException          → 400 Bad Request
ResourceNotFoundException  → 404 Not Found
UnauthorizedException     → 401 Unauthorized
ForbiddenException        → 403 Forbidden
```

**Example:**

```java
if (!user.isVerified()) {
    throw new BusinessException(
        "Only verified users can post",
        "USER_NOT_VERIFIED" --> Her Zaman türkçe hata mesajları kullanılmalı.
    );
}
```

### 5. API Response Format

**Success:**

```json
{
  "success": true,
  "message": "Post created successfully",  --> Her Zaman türkçe hata mesajları kullanılmalı.
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "User not verified",  --> Her Zaman türkçe hata mesajları kullanılmalı.
  "errorCode": "USER_NOT_VERIFIED",
  "timestamp": "2025-12-09T10:30:00Z"
}
```

---

## 🔌 API Patterns

### Authentication

**All protected endpoints require:**

```http
Authorization: Bearer {JWT_TOKEN}
```

**Get current user in controller:**

```java
@GetMapping("/me")
public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
    @AuthenticationPrincipal UserPrincipal principal
) {
    Long userId = principal.getId();
    // ...
}
```

### Pagination

**Request:**

```http
GET /api/posts?page=0&size=20&sort=createdAt,desc
```

**Response:**

```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "last": false
}
```

**Implementation:**

```java
@GetMapping
public Page<PostResponse> getPosts(
    @PageableDefault(size = 20, sort = "createdAt", direction = Direction.DESC)
    Pageable pageable
) {
    return postService.getPosts(pageable);
}
```

### File Upload (S3 Presigned URLs)

**Flow:**

```
1. Client: GET /api/users/me/avatar/presigned-url
   ← Server: { url, key, expiresIn: 300 }

2. Client: PUT {presigned_url} (direct to S3)
   ← S3: 200 OK

3. Client: PUT /api/users/me/avatar/confirm { key }
   ← Server: { avatarUrl: "https://cdn.meslektas.com/..." }
```

---

## ⚠️ Common Pitfalls

### 1. N+1 Query Problem

**❌ BAD:**

```java
List<Post> posts = postRepository.findAll();
posts.forEach(post -> {
    User author = userRepository.findById(post.getAuthorId()).get();  // N queries!
});
```

**✅ GOOD:**

```java
@Query("SELECT p FROM Post p JOIN FETCH p.author")
List<Post> findAllWithAuthor();
```

### 2. LazyInitializationException

**❌ BAD:**

```java
@Transactional(readOnly = true)
public PostResponse getPost(Long id) {
    Post post = postRepository.findById(id).orElseThrow();
    return postMapper.toResponse(post);  // Accessing lazy comments fails!
}
```

**✅ GOOD:**

```java
@Query("SELECT p FROM Post p LEFT JOIN FETCH p.comments WHERE p.id = :id")
Optional<Post> findByIdWithComments(@Param("id") Long id);
```

### 3. Transaction Boundaries

**❌ BAD:**

```java
public void createPost(CreatePostRequest request) {
    postService.createPost(request);  // Transaction ends here
    notificationService.notify(...);  // No transaction!
}
```

**✅ GOOD:**

```java
@Transactional
public void createPost(CreatePostRequest request) {
    // Everything in one transaction
    Post post = postService.createPost(request);
    notificationService.notify(post.getAuthorId(), ...);
}
```

### 4. DTO Mapping

**❌ BAD:**

```java
return new UserResponse(
    user.getId(),
    user.getEmail(),
    user.getName(),
    // ... 20 more fields - error-prone!
);
```

**✅ GOOD:**

```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}

// Usage:
return userMapper.toResponse(user);
```

### 5. Sensitive Data Exposure

**❌ BAD:**

```java
@Entity
@Data  // Lombok generates toString with ALL fields!
public class User {
    private String passwordHash;  // Will be logged!
}
```

**✅ GOOD:**

```java
@Entity
@Getter
@Setter
@ToString(exclude = {"passwordHash", "tokens"})
public class User { ... }
```

---

## 📚 Quick Reference

### Essential Annotations

```java
// Spring Boot
@SpringBootApplication
@RestController
@RequestMapping("/api/users")
@Service
@Repository
@Configuration

// Validation
@Valid
@NotNull
@NotBlank
@Email
@Size(min = 8, max = 100)
@Pattern(regexp = "...")

// JPA
@Entity
@Table(name = "users")
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(nullable = false, unique = true)
@Enumerated(EnumType.STRING)
@CreationTimestamp
@UpdateTimestamp
@Transactional
@Query("SELECT ...")

// Security
@PreAuthorize("hasRole('ADMIN')")
@AuthenticationPrincipal UserPrincipal principal

// Async
@Async
@Scheduled(cron = "0 0 2 * * *")
```

### Common Queries

```java
// Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Method name queries
    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    // JPQL
    @Query("SELECT p FROM Post p WHERE p.profession = :profession")
    Page<Post> findByProfession(@Param("profession") Profession profession, Pageable pageable);

    // Native SQL (use sparingly)
    @Query(value = "SELECT * FROM posts WHERE created_at > NOW() - INTERVAL '7 days'", nativeQuery = true)
    List<Post> findRecentPosts();

    // Modifying
    @Modifying
    @Query("UPDATE Post p SET p.deleted = true WHERE p.id = :id")
    void softDelete(@Param("id") Long id);
}
```

### Configuration Properties

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/meslektas
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

  jpa:
    hibernate:
      ddl-auto: validate # NEVER use 'update' in production!
    show-sql: false

  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: 6379

# Custom properties
app:
  jwt:
    secret: ${JWT_SECRET}
    expiration: 86400000 # 24h in ms

  aws:
    s3:
      bucket: ${AWS_S3_BUCKET}
      region: eu-central-1
    cloudfront:
      domain: ${AWS_CLOUDFRONT_DOMAIN}
```

### Testing Patterns

```java
@SpringBootTest
@Transactional  // Auto-rollback after each test
class PostServiceTest {

    @Autowired
    private PostService postService;

    @Autowired
    private PostRepository postRepository;

    @Test
    void shouldCreatePost() {
        // Given
        CreatePostRequest request = CreatePostRequest.builder()
            .content("Test post")
            .profession(Profession.DOCTOR)
            .build();

        // When
        PostResponse response = postService.createPost(1L, request);

        // Then
        assertThat(response.getContent()).isEqualTo("Test post");
        assertThat(postRepository.count()).isEqualTo(1);
    }
}
```

---

## 🚀 Development Workflow

### 1. Adding a New Feature

```
1. Define domain model (entities, value objects)
2. Create repository interface (domain layer)
3. Implement repository (infrastructure layer)
4. Write domain service (if needed)
5. Create DTOs (application layer)
6. Implement application service
7. Create controller
8. Write tests
9. Update API documentation
```

### 2. Code Review Checklist

- [ ] No business logic in controllers
- [ ] DTOs used for API boundaries
- [ ] @Transactional on service methods
- [ ] Proper exception handling
- [ ] Input validation (@Valid)
- [ ] No sensitive data in logs
- [ ] Pagination for list endpoints
- [ ] Authorization checks
- [ ] Tests written and passing

### 3. Performance Optimization

```java
// 1. Use indexes
@Table(name = "posts", indexes = {
    @Index(name = "idx_author_created", columnList = "author_id, created_at DESC")
})

// 2. Fetch joins
@Query("SELECT p FROM Post p JOIN FETCH p.author WHERE ...")

// 3. Projection for large entities
public interface PostSummary {
    Long getId();
    String getContent();
    LocalDateTime getCreatedAt();
}

// 4. Caching
@Cacheable(value = "posts", key = "#id")
public Post getPost(Long id) { ... }

// 5. Async processing
@Async
public void sendNotifications(Long postId) { ... }
```

---

## 📖 Context-Specific Guides

For detailed information about each context:

- [Identity Context](./contexts/IDENTITY.md)
- [Verification Context](./contexts/VERIFICATION.md)
- [Social Context](./contexts/SOCIAL.md)
- [Messaging Context](./contexts/MESSAGING.md)
- [Notification Context](./contexts/NOTIFICATION.md)
- [Moderation Context](./contexts/MODERATION.md)

---

## 🔧 Troubleshooting

### Build Issues

```bash
# Clear Maven cache
mvn clean install -U

# Skip tests
mvn clean package -DskipTests

# Run specific test
mvn test -Dtest=PostServiceTest
```

### Database Migration

```bash
# Create new migration
# File: src/main/resources/db/migration/V{version}__description.sql
# Example: V001__create_users_table.sql

# Check migration status
mvn flyway:info

# Run migrations
mvn flyway:migrate

# Rollback (only if using undo)
mvn flyway:undo
```

### Local Development

```bash
# Start dependencies
docker-compose up -d postgres redis localstack

# Run application
mvn spring-boot:run

# Hot reload (requires spring-boot-devtools)
# Just save your Java files, app auto-restarts
```

---

**Last Updated:** 2025-12-09  
**Maintained by:** Meslektaş Development Team  
**For AI Agents:** This guide is optimized for code generation. Follow patterns strictly for consistency.
