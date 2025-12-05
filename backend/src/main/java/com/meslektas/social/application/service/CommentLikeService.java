package com.meslektas.social.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.social.domain.model.CommentLike;
import com.meslektas.social.domain.repository.CommentLikeRepository;
import com.meslektas.social.infrastructure.persistence.JpaCommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Comment Like Application Service
 * 
 * Orchestrates comment like/unlike operations:
 * - Like a comment
 * - Unlike a comment
 * - Get like count
 * - Check if user liked a comment
 * 
 * Business Rules:
 * - Users can only like a comment once
 * - Users can only unlike comments they've liked
 * - Like count is tracked per comment
 * 
 * Sprint 5-6: Social Features
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommentLikeService {

    private final CommentLikeRepository commentLikeRepository;
    private final JpaCommentRepository commentRepository;

    /**
     * Like a comment
     * 
     * @param commentId UUID of the comment to like
     * @param userId    ID of the user liking the comment
     * @return Updated like count
     * @throws ResourceNotFoundException if comment doesn't exist
     * @throws BusinessException         if user already liked the comment
     */
    @Transactional
    public long likeComment(UUID commentId, Long userId) {
        log.info("User {} liking comment {}", userId, commentId);

        // Validate comment exists
        boolean commentExists = commentRepository.findByCommentId(commentId).isPresent();
        if (!commentExists) {
            throw new ResourceNotFoundException("Comment", commentId.toString());
        }

        // Check if already liked
        if (commentLikeRepository.existsByCommentIdAndUserId(commentId, userId)) {
            log.debug("User {} already liked comment {}", userId, commentId);
            throw new BusinessException("Bu yorumu zaten beğendiniz", "ALREADY_LIKED");
        }

        // Create like
        CommentLike like = CommentLike.create(commentId, userId);
        commentLikeRepository.save(like);

        // Get updated count
        long newCount = commentLikeRepository.countByCommentId(commentId);
        log.info("Comment {} now has {} likes", commentId, newCount);

        return newCount;
    }

    /**
     * Unlike a comment
     * 
     * @param commentId UUID of the comment to unlike
     * @param userId    ID of the user unliking the comment
     * @return Updated like count
     * @throws ResourceNotFoundException if comment doesn't exist or user hasn't
     *                                   liked it
     */
    @Transactional
    public long unlikeComment(UUID commentId, Long userId) {
        log.info("User {} unliking comment {}", userId, commentId);

        // Validate comment exists
        boolean commentExists = commentRepository.findByCommentId(commentId).isPresent();
        if (!commentExists) {
            throw new ResourceNotFoundException("Comment", commentId.toString());
        }

        // Find the like
        CommentLike like = commentLikeRepository.findByCommentIdAndUserId(commentId, userId)
                .orElseThrow(() -> new BusinessException("Bu yorumu beğenmemişsiniz", "NOT_LIKED"));

        // Delete the like
        commentLikeRepository.delete(like);

        // Get updated count
        long newCount = commentLikeRepository.countByCommentId(commentId);
        log.info("Comment {} now has {} likes", commentId, newCount);

        return newCount;
    }

    /**
     * Get like count for a comment
     * 
     * @param commentId UUID of the comment
     * @return Number of likes
     */
    @Transactional(readOnly = true)
    public long getLikeCount(UUID commentId) {
        return commentLikeRepository.countByCommentId(commentId);
    }

    /**
     * Check if user has liked a comment
     * 
     * @param commentId UUID of the comment
     * @param userId    ID of the user
     * @return true if user has liked the comment
     */
    @Transactional(readOnly = true)
    public boolean hasUserLiked(UUID commentId, Long userId) {
        return commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);
    }

    /**
     * Toggle like status
     * Convenience method that likes if not liked, unlikes if already liked
     * 
     * @param commentId UUID of the comment
     * @param userId    ID of the user
     * @return CommentLikeResult with new status and count
     */
    @Transactional
    public CommentLikeResult toggleLike(UUID commentId, Long userId) {
        boolean isLiked = commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);

        if (isLiked) {
            long count = unlikeComment(commentId, userId);
            return new CommentLikeResult(false, count);
        } else {
            long count = likeComment(commentId, userId);
            return new CommentLikeResult(true, count);
        }
    }

    /**
     * Result of a like toggle operation
     */
    public record CommentLikeResult(boolean isLiked, long likeCount) {
    }
}
