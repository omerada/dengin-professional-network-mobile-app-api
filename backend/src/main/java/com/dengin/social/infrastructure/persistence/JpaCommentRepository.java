package com.dengin.social.infrastructure.persistence;

import com.dengin.social.domain.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA Repository for Comment Entity
 * 
 * Infrastructure implementation using Spring Data JPA.
 */
@Repository
public interface JpaCommentRepository extends JpaRepository<Comment, Long> {
    
    /**
     * Find by CommentId (UUID)
     */
    @Query("SELECT c FROM Comment c WHERE c.commentId.value = :commentId")
    Optional<Comment> findByCommentId(@Param("commentId") UUID commentId);
    
    /**
     * Find all comments for a post
     * Ordered by creation date (oldest first - conversation flow)
     */
    @Query("SELECT c FROM Comment c WHERE c.postId = :postId ORDER BY c.createdAt ASC")
    List<Comment> findByPostId(@Param("postId") Long postId);
    
    /**
     * Find visible comments (not deleted) for a post
     */
    @Query("SELECT c FROM Comment c WHERE c.postId = :postId AND c.deleted = false ORDER BY c.createdAt ASC")
    List<Comment> findVisibleByPostId(@Param("postId") Long postId);
    
    /**
     * Find comments by commenter
     */
    @Query("SELECT c FROM Comment c WHERE c.commenterId = :commenterId ORDER BY c.createdAt DESC")
    List<Comment> findByCommenterId(@Param("commenterId") Long commenterId);
    
    /**
     * Count comments on a post
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.postId = :postId")
    long countByPostId(@Param("postId") Long postId);
    
    /**
     * Count visible comments on a post
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.postId = :postId AND c.deleted = false")
    long countVisibleByPostId(@Param("postId") Long postId);
    
    /**
     * Count comments by user
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.commenterId = :commenterId AND c.deleted = false")
    long countByCommenterId(@Param("commenterId") Long commenterId);
    
    /**
     * Find paginated comments for a post (excluding deleted)
     * Ordered chronologically (oldest first)
     */
    @Query("SELECT c FROM Comment c WHERE c.postId = :postId AND c.deleted = false ORDER BY c.createdAt ASC")
    Page<Comment> findByPostIdAndDeletedFalse(@Param("postId") Long postId, Pageable pageable);
}
