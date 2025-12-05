package com.meslektas.social.domain.repository;

import com.meslektas.social.domain.model.CommentLike;

import java.util.Optional;
import java.util.UUID;

/**
 * CommentLike Repository Interface
 * 
 * Domain repository for comment likes.
 */
public interface CommentLikeRepository {

    /**
     * Save comment like
     */
    CommentLike save(CommentLike like);

    /**
     * Find like by comment and user
     */
    Optional<CommentLike> findByCommentIdAndUserId(UUID commentId, Long userId);

    /**
     * Check if user has liked comment
     */
    boolean existsByCommentIdAndUserId(UUID commentId, Long userId);

    /**
     * Count likes for a comment
     */
    long countByCommentId(UUID commentId);

    /**
     * Delete comment like
     */
    void delete(CommentLike like);

    /**
     * Delete by comment and user
     */
    void deleteByCommentIdAndUserId(UUID commentId, Long userId);
}
