package com.dengin.social.domain.repository;

import com.dengin.social.domain.model.Post;
import com.dengin.social.domain.model.PostId;
import com.dengin.social.domain.model.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
            int limit);

    /**
     * Find posts for feed generation with cursor-based pagination
     * 
     * Used by feed algorithm to get posts from followed users
     * and same profession users, with optional cursor for infinite scroll.
     * 
     * @param followedUserIds List of followed user IDs
     * @param professionId    Optional profession filter
     * @param since           Only posts after this date
     * @param limit           Max posts to return
     * @param beforeId        Optional cursor - only get posts with ID less than
     *                        this
     */
    List<Post> findPostsForFeedWithCursor(
            List<Long> followedUserIds,
            Long professionId,
            LocalDateTime since,
            int limit,
            Long beforeId);

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
    
    /**
     * Find posts saved/bookmarked by a user with pagination
     * 
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of saved posts
     */
    Page<Post> findSavedPostsByUserId(Long userId, Pageable pageable);
}
