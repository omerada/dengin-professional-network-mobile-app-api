package com.meslektas.social.domain.model;

import com.meslektas.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Comment Entity
 * 
 * Part of Post aggregate - comments belong to posts.
 * 
 * Business Rules:
 * - Content: 1-500 characters
 * - Only verified users can comment
 * - Comment author or post author can delete comments
 * - Soft delete (deleted flag)
 */
@Entity
@Table(name = "comments")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Comment extends BaseEntity {
    
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "comment_id"))
    private CommentId commentId;
    
    @Column(name = "post_id", nullable = false)
    private Long postId;
    
    @Column(name = "commenter_id", nullable = false)
    private Long commenterId;
    
    @Embedded
    private CommentContent content;
    
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // ============================================
    // FACTORY METHOD
    // ============================================
    
    /**
     * Create new comment
     * 
     * @param postId Post ID this comment belongs to
     * @param commenterId User ID of commenter
     * @param content Comment content (1-500 chars)
     * @return New Comment entity
     */
    public static Comment create(
        Long postId,
        Long commenterId,
        CommentContent content
    ) {
        if (postId == null) {
            throw new IllegalArgumentException("Post ID cannot be null");
        }
        if (commenterId == null) {
            throw new IllegalArgumentException("Commenter ID cannot be null");
        }
        if (content == null) {
            throw new IllegalArgumentException("Content cannot be null");
        }
        
        Comment comment = new Comment();
        comment.commentId = CommentId.generate();
        comment.postId = postId;
        comment.commenterId = commenterId;
        comment.content = content;
        
        // createdAt is handled by BaseEntity @CreatedDate
        
        return comment;
    }
    
    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================
    
    /**
     * Delete comment (soft delete)
     * 
     * Business Rule: Only commenter or post author can delete
     */
    public void delete() {
        if (this.deleted) {
            return; // Already deleted
        }
        
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }
    
    /**
     * Check if user is comment author
     */
    public boolean isAuthor(Long userId) {
        return this.commenterId.equals(userId);
    }
    
    /**
     * Check if comment is visible
     */
    public boolean isVisible() {
        return !deleted;
    }
}
