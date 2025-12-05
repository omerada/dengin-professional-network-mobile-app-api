package com.meslektas.social.infrastructure.persistence;

import com.meslektas.social.domain.model.Post;
import com.meslektas.social.domain.model.PostId;
import com.meslektas.social.domain.model.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA Repository for Post Aggregate
 * 
 * Infrastructure implementation of PostRepository domain interface.
 * Uses Spring Data JPA for persistence.
 */
@Repository
public interface JpaPostRepository extends JpaRepository<Post, Long> {

    /**
     * Find by PostId (UUID)
     */
    @Query("SELECT p FROM Post p WHERE p.postId.value = :postId")
    Optional<Post> findByPostId(@Param("postId") UUID postId);

    /**
     * Find posts by author
     * Ordered by creation date (newest first)
     */
    @Query("SELECT p FROM Post p WHERE p.authorId = :authorId ORDER BY p.createdAt DESC")
    List<Post> findByAuthorId(@Param("authorId") Long authorId);

    /**
     * Find visible posts by author (excluding deleted)
     */
    @Query("SELECT p FROM Post p WHERE p.authorId = :authorId AND p.status = 'PUBLISHED' ORDER BY p.createdAt DESC")
    List<Post> findVisiblePostsByAuthorId(@Param("authorId") Long authorId);

    /**
     * Find posts for feed generation with relevance scoring
     * 
     * Feed Algorithm:
     * - Posts from followed users OR same profession users
     * - Created within time window (since parameter)
     * - Only PUBLISHED status
     * - Ordered by created_at DESC for time-based scoring
     * 
     * Note: Relevance scoring is done in application layer (FeedService)
     */
    @Query(value = """
            SELECT p.* FROM posts p
            WHERE p.status = 'PUBLISHED'
            AND p.created_at >= :since
            AND (
                p.author_id IN (:followedUserIds)
                OR (:professionId IS NOT NULL AND p.profession_id = :professionId)
            )
            ORDER BY p.created_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Post> findPostsForFeed(
            @Param("followedUserIds") List<Long> followedUserIds,
            @Param("professionId") Long professionId,
            @Param("since") LocalDateTime since,
            @Param("limit") int limit);

    /**
     * Find posts for feed with cursor-based pagination
     * 
     * Same as findPostsForFeed but with cursor support for infinite scroll.
     * Returns posts with ID < beforeId for pagination.
     */
    @Query(value = """
            SELECT p.* FROM posts p
            WHERE p.status = 'PUBLISHED'
            AND p.created_at >= :since
            AND (:beforeId IS NULL OR p.id < :beforeId)
            AND (
                p.author_id IN (:followedUserIds)
                OR (:professionId IS NOT NULL AND p.profession_id = :professionId)
            )
            ORDER BY p.id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Post> findPostsForFeedWithCursor(
            @Param("followedUserIds") List<Long> followedUserIds,
            @Param("professionId") Long professionId,
            @Param("since") LocalDateTime since,
            @Param("limit") int limit,
            @Param("beforeId") Long beforeId);

    /**
     * Find trending posts (high engagement in recent period)
     * 
     * Trending criteria:
     * - Published status
     * - Created after 'since' timestamp
     * - Ordered by engagement score DESC
     * - Engagement = (like_count * 2) + (comment_count * 5)
     */
    @Query(value = """
            SELECT p.* FROM posts p
            WHERE p.status = 'PUBLISHED'
            AND p.created_at >= :since
            ORDER BY (p.like_count * 2 + p.comment_count * 5) DESC, p.created_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Post> findTrendingPosts(
            @Param("since") LocalDateTime since,
            @Param("limit") int limit);

    /**
     * Count posts by author
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.authorId = :authorId")
    long countByAuthorId(@Param("authorId") Long authorId);

    /**
     * Count visible posts by author
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.authorId = :authorId AND p.status = 'PUBLISHED'")
    long countVisiblePostsByAuthorId(@Param("authorId") Long authorId);

    /**
     * Check if post exists and has specific status
     */
    boolean existsByIdAndStatus(Long id, PostStatus status);
    
    /**
     * Find posts saved/bookmarked by a user with pagination
     * 
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of saved posts
     */
    @Query("SELECT p FROM Post p JOIN p.savedByUsers s WHERE s = :userId AND p.status = 'PUBLISHED' ORDER BY p.createdAt DESC")
    Page<Post> findSavedPostsByUserId(@Param("userId") Long userId, Pageable pageable);
}
