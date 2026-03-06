package com.dengin.social.domain.model;

import com.dengin.common.domain.AggregateRoot;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Post Aggregate Root
 * 
 * Business Rules:
 * - Content: 10-5000 characters
 * - Max 5 images per post
 * - Only verified users can create posts
 * - Only author can delete post
 * - Users can't like their own posts
 * - Users can't like same post twice
 * - Soft delete (status = DELETED)
 * 
 * Invariants:
 * - Post must have content
 * - Post must have author and profession
 * - Published posts are visible in feed
 * - Deleted posts are hidden from feed
 */
@Entity
@Table(name = "posts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Post extends AggregateRoot {
    
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "post_id"))
    private PostId postId;
    
    @Column(name = "author_id", nullable = false)
    private Long authorId;
    
    @Column(name = "profession_id", nullable = false)
    private Long professionId;
    
    @Embedded
    private PostContent content;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "post_images",
        joinColumns = @JoinColumn(name = "post_id")
    )
    @OrderColumn(name = "display_order")
    private List<PostImage> images = new ArrayList<>();
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "post_likes",
        joinColumns = @JoinColumn(name = "post_id")
    )
    private Set<Like> likes = new HashSet<>();
    
    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;
    
    @Column(name = "comment_count", nullable = false)
    private int commentCount = 0;
    
    @Column(name = "share_count", nullable = false)
    private int shareCount = 0;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "post_saves",
        joinColumns = @JoinColumn(name = "post_id")
    )
    @Column(name = "user_id")
    private Set<Long> savedByUsers = new HashSet<>();
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PostStatus status;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // ============================================
    // FACTORY METHOD
    // ============================================
    
    /**
     * Create new post
     * 
     * @param authorId User ID of post author
     * @param professionId Profession ID
     * @param content Post content (10-5000 chars)
     * @param images List of images (max 5)
     * @return New Post aggregate
     */
    public static Post create(
        Long authorId,
        Long professionId,
        PostContent content,
        List<PostImage> images
    ) {
        // Validation
        if (authorId == null) {
            throw new IllegalArgumentException("Author ID cannot be null");
        }
        if (professionId == null) {
            throw new IllegalArgumentException("Profession ID cannot be null");
        }
        if (content == null) {
            throw new IllegalArgumentException("Content cannot be null");
        }
        if (images.size() > 5) {
            throw new IllegalArgumentException("Maximum 5 images allowed per post");
        }
        
        Post post = new Post();
        post.postId = PostId.generate();
        post.authorId = authorId;
        post.professionId = professionId;
        post.content = content;
        post.images = new ArrayList<>(images);
        post.status = PostStatus.PUBLISHED;
        
        // createdAt and updatedAt are handled by BaseEntity @CreatedDate/@LastModifiedDate
        
        // Domain event will be published after ID is set (in service layer)
        return post;
    }
    
    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================
    
    /**
     * Publish created event (called after save in service layer)
     */
    public void publishCreatedEvent() {
        registerEvent(new PostCreatedEvent(
            getId(),
            this.postId,
            this.authorId,
            this.professionId,
            this.content.getValue(),
            this.images.size()
        ));
    }
    
    /**
     * Like post
     * 
     * Business Rules:
     * - Can't like own post
     * - Can't like same post twice
     * - Only published posts can be liked
     */
    public void like(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        if (!this.status.isVisible()) {
            throw new IllegalStateException("Cannot like non-published post");
        }
        
        if (this.authorId.equals(userId)) {
            throw new IllegalStateException("Cannot like your own post");
        }
        
        Like like = Like.of(userId);
        boolean added = likes.add(like);
        
        if (added) {
            this.likeCount++;
            
            registerEvent(new PostLikedEvent(
                getId(),
                this.postId,
                userId,
                this.authorId
            ));
        }
    }
    
    /**
     * Unlike post
     * 
     * Idempotent operation - if not liked, does nothing
     */
    public void unlike(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        boolean removed = likes.removeIf(like -> like.getUserId().equals(userId));
        
        if (removed) {
            this.likeCount = Math.max(0, this.likeCount - 1);
            
            registerEvent(new PostUnlikedEvent(
                getId(),
                this.postId,
                userId
            ));
        }
    }
    
    /**
     * Add comment (called from service layer after comment creation)
     */
    public void incrementCommentCount() {
        this.commentCount++;
    }
    
    /**
     * Remove comment (called from service layer after comment deletion)
     */
    public void decrementCommentCount() {
        this.commentCount = Math.max(0, this.commentCount - 1);
    }
    
    /**
     * Delete post (soft delete)
     * 
     * Business Rule: Only author can delete
     */
    public void delete(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        if (!this.authorId.equals(userId)) {
            throw new IllegalStateException("Only post author can delete the post");
        }
        
        if (this.status == PostStatus.DELETED) {
            return; // Already deleted
        }
        
        this.status = PostStatus.DELETED;
        this.deletedAt = LocalDateTime.now();
        
        // updatedAt is handled by JPA auditing
        
        registerEvent(new PostDeletedEvent(
            getId(),
            this.postId,
            this.authorId
        ));
    }
    
    /**
     * Check if user has liked this post
     */
    public boolean isLikedBy(Long userId) {
        return likes.stream()
            .anyMatch(like -> like.getUserId().equals(userId));
    }
    
    /**
     * Get age in hours (for feed algorithm)
     */
    public long getAgeInHours() {
        return java.time.Duration.between(getCreatedAt(), LocalDateTime.now()).toHours();
    }
    
    /**
     * Check if post is visible in feed
     */
    public boolean isVisible() {
        return status.isVisible();
    }
    
    /**
     * Check if user is post author
     */
    public boolean isAuthor(Long userId) {
        return this.authorId.equals(userId);
    }
    
    // ============================================
    // SAVE/BOOKMARK METHODS
    // ============================================
    
    /**
     * Save/bookmark post by user
     * 
     * @param userId User ID who is saving the post
     */
    public void saveByUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        savedByUsers.add(userId);
    }
    
    /**
     * Unsave/remove bookmark from post
     * 
     * @param userId User ID who is removing the save
     */
    public void unsaveByUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        savedByUsers.remove(userId);
    }
    
    /**
     * Check if post is saved by user
     */
    public boolean isSavedBy(Long userId) {
        return savedByUsers.contains(userId);
    }
    
    // ============================================
    // SHARE METHODS
    // ============================================
    
    /**
     * Track share action
     * 
     * @param userId User ID who shared the post
     */
    public void share(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        this.shareCount++;
    }
}
