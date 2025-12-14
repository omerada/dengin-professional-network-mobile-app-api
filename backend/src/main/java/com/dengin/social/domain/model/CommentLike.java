package com.dengin.social.domain.model;

import com.dengin.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * CommentLike Entity
 * 
 * Tracks likes on comments.
 * 
 * Business Rules:
 * - One like per user per comment
 * - Only verified users can like
 * - Liking own comment is allowed
 */
@Entity
@Table(name = "comment_likes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_comment_user_like", columnNames = { "comment_id", "user_id" })
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class CommentLike extends BaseEntity {

    @Column(name = "comment_id", nullable = false)
    private UUID commentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Create new comment like
     * 
     * @param commentId Comment ID being liked
     * @param userId    User ID who is liking
     * @return New CommentLike entity
     */
    public static CommentLike create(UUID commentId, Long userId) {
        if (commentId == null) {
            throw new IllegalArgumentException("Comment ID cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        CommentLike like = new CommentLike();
        like.commentId = commentId;
        like.userId = userId;

        return like;
    }

    // ============================================
    // QUERY METHODS
    // ============================================

    /**
     * Check if this like is from given user
     */
    public boolean isFromUser(Long userId) {
        return this.userId.equals(userId);
    }
}
