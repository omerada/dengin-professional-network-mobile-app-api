# Social Context - Professional Social Network

## Overview

Profesyonel paylaşım platformu. Kullanıcılar meslekleriyle ilgili içerik paylaşabilir, yorum yapabilir ve etkileşime geçebilir.

---

## Domain Model

### Post (Aggregate Root)

```java
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long authorId;

    @Enumerated(EnumType.STRING)
    private Profession profession;  // Post owner's profession

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection
    @CollectionTable(name = "post_images")
    private List<String> imageUrls = new ArrayList<>();  // Max 5

    private Integer likeCount = 0;
    private Integer commentCount = 0;

    private Boolean deleted = false;  // Soft delete

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Domain logic
    public void like(Long userId) {
        this.likeCount++;
    }

    public void unlike(Long userId) {
        if (this.likeCount > 0) this.likeCount--;
    }

    public void incrementCommentCount() {
        this.commentCount++;
    }

    public void decrementCommentCount() {
        if (this.commentCount > 0) this.commentCount--;
    }
}
```

### Comment (Entity)

```java
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long postId;
    private Long authorId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Long parentCommentId;  // For nested comments (max 3 levels)

    private Boolean deleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### PostLike (Entity)

```java
@Entity
@Table(name = "post_likes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_id"}))
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long postId;
    private Long userId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

## API Endpoints

### Posts

#### Create Post

```java
POST /api/posts
Authorization: Bearer {token}

{
  "content": "Bugün harika bir ameliyat gerçekleştirdik...",
  "imageUrls": [
    "https://cdn.dengin.com/posts/1.jpg",
    "https://cdn.dengin.com/posts/2.jpg"
  ]
}

// Response
{
  "success": true,
  "data": {
    "id": 123,
    "authorId": 1,
    "authorName": "Dr. Ahmet Yılmaz",
    "profession": "DOCTOR",
    "content": "Bugün harika bir ameliyat gerçekleştirdik...",
    "imageUrls": [...],
    "likeCount": 0,
    "commentCount": 0,
    "createdAt": "2025-12-09T10:30:00Z"
  }
}
```

**Validation:**

- User must be `profileVerified = true`
- Content: 1-5000 characters
- Images: max 5 URLs
- Images must be from S3 (presigned URL flow)

#### Get Feed

```java
GET /api/posts?page=0&size=20&profession=DOCTOR&sort=createdAt,desc

// Response
{
  "content": [
    {
      "id": 123,
      "authorId": 1,
      "authorName": "Dr. Ahmet Yılmaz",
      "authorAvatarUrl": "...",
      "profession": "DOCTOR",
      "content": "...",
      "imageUrls": [...],
      "likeCount": 15,
      "commentCount": 3,
      "liked": true,  // Current user liked?
      "createdAt": "2025-12-09T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8
}
```

**Filters:**

- `profession`: Filter by profession (optional)
- `authorId`: Filter by author (optional)
- `sort`: `createdAt,desc` (default) or `likeCount,desc`

#### Get Single Post

```java
GET /api/posts/{id}

// Returns post with author details
```

#### Edit Post

```java
PUT /api/posts/{id}

{
  "content": "Updated content..."
}
```

**Rules:**

- Only author can edit
- Edit allowed within 24 hours of creation
- Cannot edit if post has comments

#### Delete Post

```java
DELETE /api/posts/{id}

// Soft delete: sets deleted = true
```

**Rules:**

- Only author can delete
- Comments remain visible with "[Deleted Post]" placeholder

---

### Likes

#### Toggle Like

```java
POST /api/posts/{id}/like

// If not liked: creates like
// If already liked: removes like

// Response
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 16
  }
}
```

#### Get Likers

```java
GET /api/posts/{id}/likes?page=0&size=20

// Returns users who liked the post
{
  "content": [
    {
      "userId": 5,
      "name": "Ayşe Demir",
      "profession": "NURSE",
      "avatarUrl": "...",
      "likedAt": "2025-12-09T11:00:00Z"
    }
  ]
}
```

---

### Comments

#### Add Comment

```java
POST /api/posts/{postId}/comments

{
  "content": "Çok başarılı bir çalışma!",
  "parentCommentId": null  // or comment ID for reply
}

// Response
{
  "id": 456,
  "postId": 123,
  "authorId": 2,
  "authorName": "Hemşire Ayşe",
  "content": "Çok başarılı bir çalışma!",
  "parentCommentId": null,
  "createdAt": "2025-12-09T11:05:00Z"
}
```

**Validation:**

- Content: 1-1000 characters
- Max nesting level: 3 (comment → reply → reply-to-reply)

#### Get Comments

```java
GET /api/posts/{postId}/comments?page=0&size=20

// Returns top-level comments with nested replies
{
  "content": [
    {
      "id": 456,
      "authorId": 2,
      "authorName": "Hemşire Ayşe",
      "content": "Çok başarılı bir çalışma!",
      "replies": [
        {
          "id": 457,
          "authorName": "Dr. Ahmet",
          "content": "Teşekkür ederim!",
          "createdAt": "2025-12-09T11:10:00Z"
        }
      ],
      "createdAt": "2025-12-09T11:05:00Z"
    }
  ]
}
```

#### Delete Comment

```java
DELETE /api/posts/{postId}/comments/{commentId}

// Soft delete
```

**Rules:**

- Only author can delete
- If has replies: shows "[Deleted Comment]" placeholder
- If no replies: completely removed from view

---

## Business Rules

### Post Creation

1. User must be verified (`profileVerified = true`)
2. Content required (1-5000 chars)
3. Max 5 images
4. Images must be uploaded via presigned URL first

### Editing

1. Only author can edit
2. Edit window: 24 hours from creation
3. Cannot edit if post has comments (prevents context loss)

### Deletion

1. Soft delete (keeps record for moderation)
2. Deleted posts show "[Deleted Post]" in feed
3. Author and admin can delete

### Comments

1. Max 3 nesting levels
2. Cannot comment on deleted posts
3. Edit not allowed (delete + re-comment instead)

### Feed Algorithm

```
Priority:
1. Recent posts (last 7 days)
2. Same profession as user
3. High engagement (likes + comments)
4. Following authors (future feature)
```

---

## Service Layer

### PostService

```java
@Service
@Transactional
public class PostService {

    public PostResponse createPost(Long authorId, CreatePostRequest request) {
        // Validate user is verified
        User author = userRepository.findById(authorId).orElseThrow();
        if (!author.isProfileVerified()) {
            throw new BusinessException("Only verified users can post", "USER_NOT_VERIFIED");
        }

        // Create post
        Post post = new Post();
        post.setAuthorId(authorId);
        post.setProfession(author.getProfession());
        post.setContent(request.getContent());
        post.setImageUrls(request.getImageUrls());

        Post saved = postRepository.save(post);

        // Publish event
        eventPublisher.publishEvent(new PostCreatedEvent(saved.getId()));

        return postMapper.toResponse(saved, author);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(Pageable pageable, Profession profession) {
        Page<Post> posts = (profession != null)
            ? postRepository.findByProfessionAndDeletedFalse(profession, pageable)
            : postRepository.findByDeletedFalse(pageable);

        return posts.map(this::enrichWithAuthor);
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow();

        // Only author can delete
        if (!post.getAuthorId().equals(userId)) {
            throw new ForbiddenException("Only author can delete post");
        }

        post.setDeleted(true);
        postRepository.save(post);
    }
}
```

---

## Repository Methods

```java
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE p.deleted = false ORDER BY p.createdAt DESC")
    Page<Post> findByDeletedFalse(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.profession = :profession AND p.deleted = false")
    Page<Post> findByProfessionAndDeletedFalse(
        @Param("profession") Profession profession,
        Pageable pageable
    );

    @Query("SELECT p FROM Post p WHERE p.authorId = :authorId AND p.deleted = false")
    List<Post> findByAuthorIdAndDeletedFalse(@Param("authorId") Long authorId);

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.id = :id")
    void incrementLikeCount(@Param("id") Long id);
}

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c WHERE c.postId = :postId AND c.deleted = false")
    Page<Comment> findByPostIdAndDeletedFalse(
        @Param("postId") Long postId,
        Pageable pageable
    );

    @Query("SELECT c FROM Comment c WHERE c.parentCommentId = :parentId AND c.deleted = false")
    List<Comment> findReplies(@Param("parentId") Long parentId);
}

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    @Query("SELECT l FROM PostLike l WHERE l.postId = :postId ORDER BY l.createdAt DESC")
    Page<PostLike> findByPostId(@Param("postId") Long postId, Pageable pageable);

    void deleteByPostIdAndUserId(Long postId, Long userId);
}
```

---

## Integration Points

### → Notification Context

```java
// On post like
notificationService.send(
    post.getAuthorId(),
    NotificationType.POST_LIKE,
    Map.of("postId", postId, "likerId", userId)
);

// On comment
notificationService.send(
    post.getAuthorId(),
    NotificationType.COMMENT,
    Map.of("postId", postId, "commenterId", userId)
);
```

### → Moderation Context

```java
// Posts can be reported
reportService.reportPost(postId, reason);

// Moderation can hide/delete posts
moderationService.hidePost(postId);
```

---

## Performance Optimizations

### 1. Eager Loading Author Data

```java
@Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :id")
Optional<Post> findByIdWithAuthor(@Param("id") Long id);
```

### 2. Denormalized Counters

```java
// Instead of COUNT(*) queries
private Integer likeCount = 0;
private Integer commentCount = 0;

// Updated on like/comment events
```

### 3. Pagination

```java
// Always use pagination for lists
Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
```

### 4. Caching

```java
@Cacheable(value = "posts", key = "#id")
public PostResponse getPost(Long id) { ... }

@CacheEvict(value = "posts", key = "#postId")
public void updatePost(Long postId) { ... }
```

---

## Common Errors

```java
USER_NOT_VERIFIED (403)
→ Only verified users can post

POST_NOT_FOUND (404)
→ Post doesn't exist or deleted

EDIT_WINDOW_EXPIRED (400)
→ Can only edit within 24 hours

CANNOT_EDIT_WITH_COMMENTS (400)
→ Cannot edit post with comments

NOT_POST_AUTHOR (403)
→ Only author can edit/delete

MAX_IMAGES_EXCEEDED (400)
→ Max 5 images per post

CONTENT_TOO_LONG (400)
→ Max 5000 characters

INVALID_IMAGE_URL (400)
→ Image must be from S3
```

---

## Testing

```java
@SpringBootTest
@Transactional
class PostServiceTest {

    @Autowired
    private PostService postService;

    @Test
    void shouldCreatePost() {
        // Given
        User author = createVerifiedUser();
        CreatePostRequest request = new CreatePostRequest();
        request.setContent("Test post");

        // When
        PostResponse response = postService.createPost(author.getId(), request);

        // Then
        assertThat(response.getContent()).isEqualTo("Test post");
        assertThat(response.getAuthorId()).isEqualTo(author.getId());
    }

    @Test
    void shouldThrowExceptionWhenUserNotVerified() {
        // Given
        User unverified = createUnverifiedUser();

        // When/Then
        assertThatThrownBy(() -> postService.createPost(unverified.getId(), request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("USER_NOT_VERIFIED");
    }
}
```

---

**Last Updated:** 2025-12-09
