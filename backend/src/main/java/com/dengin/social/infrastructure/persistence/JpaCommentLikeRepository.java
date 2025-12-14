package com.dengin.social.infrastructure.persistence;

import com.dengin.social.domain.model.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA Repository for CommentLike Entity
 * 
 * Spring Data JPA implementation for comment likes persistence.
 */
@Repository
public interface JpaCommentLikeRepository extends JpaRepository<CommentLike, Long> {

    /**
     * Find a like by comment ID and user ID
     */
    @Query("SELECT cl FROM CommentLike cl WHERE cl.commentId = :commentId AND cl.userId = :userId")
    Optional<CommentLike> findByCommentIdAndUserId(
            @Param("commentId") UUID commentId,
            @Param("userId") Long userId);

    /**
     * Check if a user has liked a comment
     */
    @Query("SELECT CASE WHEN COUNT(cl) > 0 THEN true ELSE false END FROM CommentLike cl WHERE cl.commentId = :commentId AND cl.userId = :userId")
    boolean existsByCommentIdAndUserId(
            @Param("commentId") UUID commentId,
            @Param("userId") Long userId);

    /**
     * Count likes for a comment
     */
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.commentId = :commentId")
    long countByCommentId(@Param("commentId") UUID commentId);

    /**
     * Find all user IDs who liked a comment
     */
    @Query("SELECT cl.userId FROM CommentLike cl WHERE cl.commentId = :commentId ORDER BY cl.createdAt DESC")
    List<Long> findLikerIdsByCommentId(@Param("commentId") UUID commentId);

    /**
     * Find all likes for a comment (with pagination support if needed)
     */
    @Query("SELECT cl FROM CommentLike cl WHERE cl.commentId = :commentId ORDER BY cl.createdAt DESC")
    List<CommentLike> findAllByCommentId(@Param("commentId") UUID commentId);

    /**
     * Get like count for multiple comments (batch query for efficiency)
     */
    @Query("SELECT cl.commentId, COUNT(cl) FROM CommentLike cl WHERE cl.commentId IN :commentIds GROUP BY cl.commentId")
    List<Object[]> countByCommentIds(@Param("commentIds") List<UUID> commentIds);

    /**
     * Check if user liked any of the given comments (batch query)
     */
    @Query("SELECT cl.commentId FROM CommentLike cl WHERE cl.commentId IN :commentIds AND cl.userId = :userId")
    List<UUID> findLikedCommentIds(
            @Param("commentIds") List<UUID> commentIds,
            @Param("userId") Long userId);
}
