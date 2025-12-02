package com.meslektas.social.domain.repository;

import com.meslektas.social.domain.model.Post;
import com.meslektas.social.domain.model.PostId;
import com.meslektas.social.domain.model.PostStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Post Repository Interface
 * 
 * Domain repository for Post aggregate.
 * Infrastructure layer provides JPA implementation.
 */
public interface PostRepository {
    
    /**
     * Save post (create or update)
     */
    Post save(Post post);
    
    /**
     * Find by database ID
     */
    Optional<Post> findById(Long id);
    
    /**
     * Find by PostId (UUID)
     */
    Optional<Post> findByPostId(PostId postId);
    
    /**
     * Find posts by author
     * Ordered by creation date (newest first)
     */
    List<Post> findByAuthorId(Long authorId);
    
    /**
     * Find visible posts by author (excluding deleted)
     */
    List<Post> findVisiblePostsByAuthorId(Long authorId);
    
    /**
     * Find posts for feed generation
     * 
     * Used by feed algorithm to get posts from followed users
     * and same profession users.
     */
    List<Post> findPostsForFeed(
        List<Long> followedUserIds,
        Long professionId,
        LocalDateTime since,
        int limit
    );
    
    /**
     * Find trending posts (most liked in last 24h)
     */
    List<Post> findTrendingPosts(LocalDateTime since, int limit);
    
    /**
     * Count posts by author
     */
    long countByAuthorId(Long authorId);
    
    /**
     * Count visible posts by author
     */
    long countVisiblePostsByAuthorId(Long authorId);
    
    /**
     * Check if post exists and is visible
     */
    boolean existsByIdAndStatus(Long id, PostStatus status);
    
    /**
     * Delete post (used for hard delete after 30 days)
     */
    void delete(Post post);
}
