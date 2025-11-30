# Social Context - Feed, Posts, Comments & Likes

> **Bounded Context:** Social Feed  
> **Complexity:** ⭐⭐ Medium  
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

Meslek-bazlı sosyal feed yönetimi, post oluşturma, commenting, liking, profession-based content filtering.

### Ubiquitous Language

```
Post: Kullanıcı paylaşımı (Aggregate Root)
Comment: Post yorumu (Entity, Post aggregate'ine ait)
Like: Beğeni (Value Object)
Feed: Kullanıcının görebileceği postlar (Read Model)
ProfessionFeed: Sadece aynı meslek grubundaki postlar
ImageAttachment: Post'a eklenen resim
PostStatus: PUBLISHED, HIDDEN, DELETED
ModerationFlag: Moderation'dan gelen işaret
```

### Context Boundaries

```
IN SCOPE:
✅ Post creation (text + images)
✅ Comment creation (with threading)
✅ Like/Unlike posts and comments
✅ Profession-based content filtering
✅ Feed generation
✅ Post editing/deletion
✅ Content visibility rules
✅ Image upload and management

OUT OF SCOPE:
❌ User management (Identity Context)
❌ Content moderation (Moderation Context)
❌ Notifications (Notification Context)
❌ AI verification (Verification Context)
```

---

## 🏗️ Domain Model

### Aggregate: Post

```java
/**
 * Post Aggregate Root
 *
 * Business Rules:
 * - Only verified users of same profession can see posts
 * - Posts can have max 4 images
 * - Text max 2000 characters
 * - Comments can be disabled per post
 * - Post author can delete own posts
 * - Hidden posts not shown in feed
 * - Deleted posts kept for 30 days (soft delete)
 */
@Entity
@Table(name = "posts")
public class Post extends AggregateRoot {

    @EmbeddedId
    private PostId id;

    @Embedded
    private UserId authorId;

    @Embedded
    private Profession profession;

    @Column(name = "content", length = 2000, nullable = false)
    private String content;

    @ElementCollection
    @CollectionTable(
        name = "post_images",
        joinColumns = @JoinColumn(name = "post_id")
    )
    @OrderColumn(name = "image_order")
    private List<ImageAttachment> images = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<Comment> comments = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
        name = "post_likes",
        joinColumns = @JoinColumn(name = "post_id")
    )
    private Set<Like> likes = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status;

    @Column(name = "comments_enabled")
    private boolean commentsEnabled;

    @Column(name = "is_pinned")
    private boolean isPinned;

    @Embedded
    private ModerationFlag moderationFlag;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Create new post
     */
    public static Post create(
        UserId authorId,
        Profession profession,
        String content,
        List<ImageAttachment> images,
        boolean commentsEnabled
    ) {
        // Validation
        if (content == null || content.isBlank()) {
            throw new EmptyPostException("Post content cannot be empty");
        }

        if (content.length() > 2000) {
            throw new PostTooLongException(
                "Post content max 2000 characters"
            );
        }

        if (images.size() > 4) {
            throw new TooManyImagesException(
                "Maximum 4 images allowed per post"
            );
        }

        Post post = new Post();
        post.id = PostId.generate();
        post.authorId = authorId;
        post.profession = profession;
        post.content = content;
        post.images = new ArrayList<>(images);
        post.commentsEnabled = commentsEnabled;
        post.status = PostStatus.PUBLISHED;
        post.isPinned = false;
        post.createdAt = Instant.now();
        post.updatedAt = Instant.now();

        post.registerEvent(new PostCreatedEvent(
            post.id,
            post.authorId,
            post.profession
        ));

        return post;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Edit post content
     * Business rule: Only author can edit
     */
    public void edit(UserId editorId, String newContent, List<ImageAttachment> newImages) {
        if (!this.authorId.equals(editorId)) {
            throw new UnauthorizedEditException("Only author can edit post");
        }

        if (this.status != PostStatus.PUBLISHED) {
            throw new CannotEditException("Cannot edit non-published post");
        }

        if (newContent.length() > 2000) {
            throw new PostTooLongException("Post content max 2000 characters");
        }

        if (newImages.size() > 4) {
            throw new TooManyImagesException("Maximum 4 images allowed");
        }

        this.content = newContent;
        this.images = new ArrayList<>(newImages);
        this.updatedAt = Instant.now();

        registerEvent(new PostEditedEvent(this.id, this.authorId));
    }

    /**
     * Delete post (soft delete)
     * Business rule: Only author or admin can delete
     */
    public void delete(UserId deleterId) {
        if (!this.authorId.equals(deleterId)) {
            throw new UnauthorizedDeleteException(
                "Only author can delete post"
            );
        }

        this.status = PostStatus.DELETED;
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();

        registerEvent(new PostDeletedEvent(
            this.id,
            this.authorId,
            Instant.now().plus(Duration.ofDays(30)) // Hard delete after 30 days
        ));
    }

    /**
     * Hide post (moderation action)
     */
    public void hide(String reason) {
        if (this.status == PostStatus.HIDDEN) {
            return; // Already hidden
        }

        this.status = PostStatus.HIDDEN;
        this.moderationFlag = new ModerationFlag(reason, Instant.now());
        this.updatedAt = Instant.now();

        registerEvent(new PostHiddenEvent(this.id, reason));
    }

    /**
     * Restore hidden post
     */
    public void restore() {
        if (this.status != PostStatus.HIDDEN) {
            throw new IllegalStateException("Only hidden posts can be restored");
        }

        this.status = PostStatus.PUBLISHED;
        this.moderationFlag = null;
        this.updatedAt = Instant.now();

        registerEvent(new PostRestoredEvent(this.id));
    }

    /**
     * Add comment to post
     * Business rule: Comments can be disabled
     */
    public Comment addComment(
        UserId commenterId,
        String content,
        CommentId parentCommentId
    ) {
        if (!this.commentsEnabled) {
            throw new CommentsDisabledException("Comments disabled on this post");
        }

        if (this.status != PostStatus.PUBLISHED) {
            throw new CannotCommentException("Cannot comment on non-published post");
        }

        Comment comment = Comment.create(
            this,
            commenterId,
            content,
            parentCommentId
        );

        comments.add(comment);
        this.updatedAt = Instant.now();

        registerEvent(new CommentAddedEvent(
            this.id,
            comment.getId(),
            commenterId,
            this.authorId // Post author (for notification)
        ));

        return comment;
    }

    /**
     * Remove comment
     */
    public void removeComment(CommentId commentId, UserId removerId) {
        Comment comment = comments.stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new CommentNotFoundException(commentId));

        // Only comment author or post author can remove
        if (!comment.getAuthorId().equals(removerId)
            && !this.authorId.equals(removerId)) {
            throw new UnauthorizedDeleteException(
                "Only comment author or post author can remove comment"
            );
        }

        comment.delete();
        this.updatedAt = Instant.now();

        registerEvent(new CommentDeletedEvent(
            this.id,
            commentId,
            removerId
        ));
    }

    /**
     * Like post
     * Business rule: User can like only once
     */
    public void like(UserId userId) {
        if (this.status != PostStatus.PUBLISHED) {
            throw new CannotLikeException("Cannot like non-published post");
        }

        Like like = new Like(userId, Instant.now());
        boolean added = likes.add(like);

        if (added) {
            this.updatedAt = Instant.now();

            registerEvent(new PostLikedEvent(
                this.id,
                userId,
                this.authorId // Post author (for notification)
            ));
        }
    }

    /**
     * Unlike post
     */
    public void unlike(UserId userId) {
        boolean removed = likes.removeIf(like -> like.userId().equals(userId));

        if (removed) {
            this.updatedAt = Instant.now();

            registerEvent(new PostUnlikedEvent(this.id, userId));
        }
    }

    /**
     * Check if user has liked this post
     */
    public boolean isLikedBy(UserId userId) {
        return likes.stream()
            .anyMatch(like -> like.userId().equals(userId));
    }

    /**
     * Get like count
     */
    public int getLikeCount() {
        return likes.size();
    }

    /**
     * Get comment count
     */
    public int getCommentCount() {
        return (int) comments.stream()
            .filter(c -> c.getStatus() == CommentStatus.PUBLISHED)
            .count();
    }

    /**
     * Pin post (admin/moderator)
     */
    public void pin() {
        this.isPinned = true;
        this.updatedAt = Instant.now();

        registerEvent(new PostPinnedEvent(this.id));
    }

    /**
     * Unpin post
     */
    public void unpin() {
        this.isPinned = false;
        this.updatedAt = Instant.now();

        registerEvent(new PostUnpinnedEvent(this.id));
    }

    /**
     * Check if post is visible
     */
    public boolean isVisible() {
        return status == PostStatus.PUBLISHED;
    }
}
```

### Entity: Comment

```java
/**
 * Comment Entity
 * Part of Post aggregate
 */
@Entity
@Table(name = "comments")
public class Comment extends BaseEntity {

    @EmbeddedId
    private CommentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Embedded
    private UserId authorId;

    @Column(name = "content", length = 500, nullable = false)
    private String content;

    @Embedded
    private CommentId parentCommentId; // For threaded comments

    @ElementCollection
    @CollectionTable(
        name = "comment_likes",
        joinColumns = @JoinColumn(name = "comment_id")
    )
    private Set<Like> likes = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentStatus status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // Factory
    public static Comment create(
        Post post,
        UserId authorId,
        String content,
        CommentId parentCommentId
    ) {
        // Validation
        if (content == null || content.isBlank()) {
            throw new EmptyCommentException("Comment cannot be empty");
        }

        if (content.length() > 500) {
            throw new CommentTooLongException("Comment max 500 characters");
        }

        Comment comment = new Comment();
        comment.id = CommentId.generate();
        comment.post = post;
        comment.authorId = authorId;
        comment.content = content;
        comment.parentCommentId = parentCommentId;
        comment.status = CommentStatus.PUBLISHED;
        comment.createdAt = Instant.now();
        comment.updatedAt = Instant.now();

        return comment;
    }

    /**
     * Edit comment
     */
    public void edit(UserId editorId, String newContent) {
        if (!this.authorId.equals(editorId)) {
            throw new UnauthorizedEditException("Only author can edit comment");
        }

        if (newContent.length() > 500) {
            throw new CommentTooLongException("Comment max 500 characters");
        }

        this.content = newContent;
        this.updatedAt = Instant.now();
    }

    /**
     * Delete comment
     */
    public void delete() {
        this.status = CommentStatus.DELETED;
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    /**
     * Like comment
     */
    public void like(UserId userId) {
        Like like = new Like(userId, Instant.now());
        likes.add(like);
        this.updatedAt = Instant.now();
    }

    /**
     * Unlike comment
     */
    public void unlike(UserId userId) {
        likes.removeIf(like -> like.userId().equals(userId));
        this.updatedAt = Instant.now();
    }

    public int getLikeCount() {
        return likes.size();
    }

    public boolean isReply() {
        return parentCommentId != null;
    }
}
```

### Value Objects

```java
/**
 * Like Value Object
 */
public record Like(UserId userId, Instant likedAt) {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Like other)) return false;
        return userId.equals(other.userId);
    }

    @Override
    public int hashCode() {
        return userId.hashCode();
    }
}

/**
 * Image Attachment Value Object
 */
public record ImageAttachment(
    String imageUrl,
    String s3Key,
    int width,
    int height,
    long fileSizeBytes
) {

    public ImageAttachment {
        if (fileSizeBytes > 5_000_000) { // 5MB
            throw new ImageTooLargeException("Image max 5MB");
        }

        if (width > 4096 || height > 4096) {
            throw new ImageTooLargeException("Image max 4096x4096 pixels");
        }
    }
}

/**
 * Moderation Flag Value Object
 */
@Embeddable
public class ModerationFlag {

    @Column(name = "moderation_reason")
    private String reason;

    @Column(name = "flagged_at")
    private Instant flaggedAt;

    public ModerationFlag(String reason, Instant flaggedAt) {
        this.reason = reason;
        this.flaggedAt = flaggedAt;
    }

    protected ModerationFlag() {} // JPA
}
```

---

## 🛠️ Domain Services

### ProfessionFeedService

```java
/**
 * Domain Service: Profession-based Feed Generation
 *
 * Business rules:
 * - Only show posts from same profession
 * - Respect user blocking
 * - Hide deleted/hidden posts
 * - Show pinned posts first
 */
@Service
public class ProfessionFeedService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * Generate feed for user
     */
    public List<Post> generateFeed(UserId userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        // Business rule: User must be verified to see profession feed
        if (!user.isProfessionVerified()) {
            return Collections.emptyList();
        }

        Profession profession = user.getProfession();

        // Fetch posts
        List<Post> posts = postRepository.findByProfession(
            profession,
            PostStatus.PUBLISHED,
            pageable
        );

        // Filter blocked users
        return posts.stream()
            .filter(post -> !user.hasBlocked(post.getAuthorId()))
            .filter(post -> canUserViewPost(user, post))
            .collect(Collectors.toList());
    }

    private boolean canUserViewPost(User viewer, Post post) {
        // Check profession match
        if (!viewer.getProfession().equals(post.getProfession())) {
            return false;
        }

        // Check post status
        if (!post.isVisible()) {
            return false;
        }

        // Check blocking
        if (viewer.hasBlocked(post.getAuthorId())) {
            return false;
        }

        return true;
    }
}
```

### PostContentPolicy

```java
/**
 * Domain Service: Content Policy Enforcement
 */
public class PostContentPolicy {

    private static final List<String> FORBIDDEN_WORDS = List.of(
        // Spam, offensive words
    );

    /**
     * Validate post content
     */
    public static void validateContent(String content) {
        // Check forbidden words
        String lowerContent = content.toLowerCase();
        for (String word : FORBIDDEN_WORDS) {
            if (lowerContent.contains(word)) {
                throw new ForbiddenContentException(
                    "Content contains forbidden words"
                );
            }
        }

        // Check excessive emoji
        long emojiCount = content.codePoints()
            .filter(PostContentPolicy::isEmoji)
            .count();

        double emojiRatio = (double) emojiCount / content.length();
        if (emojiRatio > 0.2) { // 20% emoji
            throw new ExcessiveEmojiException(
                "Content contains too many emojis"
            );
        }
    }

    private static boolean isEmoji(int codePoint) {
        return (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
               (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) ||
               (codePoint >= 0x1F680 && codePoint <= 0x1F6FF);
    }
}
```

---

## 📨 Domain Events

```java
public record PostCreatedEvent(
    PostId postId,
    UserId authorId,
    Profession profession,
    Instant createdAt
) implements DomainEvent {}

public record PostEditedEvent(
    PostId postId,
    UserId authorId,
    Instant editedAt
) implements DomainEvent {}

public record PostDeletedEvent(
    PostId postId,
    UserId authorId,
    Instant hardDeleteAt
) implements DomainEvent {}

public record PostHiddenEvent(
    PostId postId,
    String reason,
    Instant hiddenAt
) implements DomainEvent {}

public record CommentAddedEvent(
    PostId postId,
    CommentId commentId,
    UserId commenterId,
    UserId postAuthorId, // For notification
    Instant commentedAt
) implements DomainEvent {}

public record PostLikedEvent(
    PostId postId,
    UserId likerId,
    UserId postAuthorId, // For notification
    Instant likedAt
) implements DomainEvent {}
```

---

## 📋 Business Rules

### BR-SOC-001: Profession-Based Visibility

```
Rule: Users can only see posts from their own profession
Enforcement: ProfessionFeedService.generateFeed()
Exception: N/A (empty feed returned)
```

### BR-SOC-002: Verified Users Only

```
Rule: Only verified users can create posts
Enforcement: Application Service (before creating post)
Exception: NotVerifiedException
```

### BR-SOC-003: Maximum Images

```
Rule: Maximum 4 images per post
Enforcement: Post.create()
Exception: TooManyImagesException
```

### BR-SOC-004: Content Length Limits

```
Rule:
  - Post content: max 2000 characters
  - Comment content: max 500 characters
Enforcement: Post.create(), Comment.create()
Exception: PostTooLongException, CommentTooLongException
```

### BR-SOC-005: Comment Permission

```
Rule: Only post author can disable comments
Enforcement: Post.commentsEnabled field
Exception: CommentsDisabledException
```

### BR-SOC-006: Like Once Rule

```
Rule: User can like a post/comment only once
Enforcement: Set<Like> (Set prevents duplicates)
```

### BR-SOC-007: Soft Delete

```
Rule: Deleted posts kept for 30 days, then hard delete
Enforcement: Post.delete() + Scheduled job
```

### BR-SOC-008: Moderation Override

```
Rule: Hidden posts not shown in feed (moderation)
Enforcement: ProfessionFeedService filtering
```

---

## 🔗 Integration Points

### Upstream Dependencies

```java
// Identity Context (Customer-Supplier)
// Needs: User info, Profession, Blocking rules
public interface UserRepository {
    Optional<User> findById(UserId userId);
    boolean isUserVerified(UserId userId);
    Profession getUserProfession(UserId userId);
}
```

### Downstream Consumers

```java
// Notification Context
// Consumes: PostCreatedEvent, CommentAddedEvent, PostLikedEvent

// Moderation Context
// Consumes: PostCreatedEvent (for spam detection)
// Updates: Post.hide() via ModerationFlag
```

---

## 🛠️ Implementation Guide

### Package Structure

```
social/
├── domain/
│   ├── model/
│   │   ├── Post.java (Aggregate Root)
│   │   ├── Comment.java (Entity)
│   │   ├── PostId.java (Value Object)
│   │   ├── CommentId.java (Value Object)
│   │   ├── Like.java (Value Object)
│   │   ├── ImageAttachment.java (Value Object)
│   │   ├── ModerationFlag.java (Value Object)
│   │   ├── PostStatus.java (Enum)
│   │   └── CommentStatus.java (Enum)
│   ├── service/
│   │   ├── ProfessionFeedService.java
│   │   └── PostContentPolicy.java
│   ├── repository/
│   │   └── PostRepository.java (Interface)
│   └── event/
│       ├── PostCreatedEvent.java
│       ├── CommentAddedEvent.java
│       └── PostLikedEvent.java
│
├── application/
│   ├── command/
│   │   ├── CreatePostCommand.java
│   │   ├── AddCommentCommand.java
│   │   └── LikePostCommand.java
│   ├── query/
│   │   ├── GetFeedQuery.java
│   │   └── GetPostQuery.java
│   ├── service/
│   │   └── SocialApplicationService.java
│   └── dto/
│       ├── PostDTO.java
│       └── CommentDTO.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── PostJpaRepository.java
│   │   └── PostRepositoryImpl.java
│   ├── storage/
│   │   └── ImageStorageService.java
│   └── event/
│       └── SocialEventListener.java
│
└── api/
    ├── PostController.java
    └── FeedController.java
```

### Repository Implementation

```java
public interface PostRepository {
    Post save(Post post);
    Optional<Post> findById(PostId id);
    List<Post> findByProfession(
        Profession profession,
        PostStatus status,
        Pageable pageable
    );
    List<Post> findByAuthorId(UserId authorId, Pageable pageable);
    void delete(Post post);
}
```

---

**Complexity:** ⭐⭐ Medium  
**Lines of Code (estimated):** 1500-1800  
**Implementation Time:** Sprint 5-6 (3-4 weeks)

**Next:** [05-MESSAGING-CONTEXT.md](./05-MESSAGING-CONTEXT.md)
