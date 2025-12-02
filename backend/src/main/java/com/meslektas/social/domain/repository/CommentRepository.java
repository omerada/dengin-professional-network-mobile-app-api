package com.meslektas.social.domain.repository;

import com.meslektas.social.domain.model.Comment;
import com.meslektas.social.domain.model.CommentId;

import java.util.List;
import java.util.Optional;

/**
 * Comment Repository Interface
 * 
 * Domain repository for Comment entity.
 */
public interface CommentRepository {
    
    /**
     * Save comment (create or update)
     */
    Comment save(Comment comment);
    
    /**
     * Find by database ID
     */
    Optional<Comment> findById(Long id);
    
    /**
     * Find by CommentId (UUID)
     */
    Optional<Comment> findByCommentId(CommentId commentId);
    
    /**
     * Find all comments for a post
     * Ordered by creation date (oldest first - chronological)
     */
    List<Comment> findByPostId(Long postId);
    
    /**
     * Find visible comments for a post (excluding deleted)
     */
    List<Comment> findVisibleByPostId(Long postId);
    
    /**
     * Find comments by commenter
     */
    List<Comment> findByCommenterId(Long commenterId);
    
    /**
     * Count comments by post
     */
    long countByPostId(Long postId);
    
    /**
     * Count visible comments by post
     */
    long countVisibleByPostId(Long postId);
    
    /**
     * Count comments by commenter
     */
    long countByCommenterId(Long commenterId);
    
    /**
     * Delete comment (hard delete - for cleanup)
     */
    void delete(Comment comment);
}
