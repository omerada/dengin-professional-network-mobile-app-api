package com.dengin.social.infrastructure.persistence;

import com.dengin.social.domain.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * JPA Repository for Follow Aggregate
 * 
 * Infrastructure implementation using Spring Data JPA.
 */
@Repository
public interface JpaFollowRepository extends JpaRepository<Follow, Long> {
    
    /**
     * Find follow relationship
     */
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    /**
     * Find all users that the given user is following
     */
    @Query("SELECT f FROM Follow f WHERE f.followerId = :followerId ORDER BY f.createdAt DESC")
    List<Follow> findByFollowerId(@Param("followerId") Long followerId);
    
    /**
     * Find all users following the given user
     */
    @Query("SELECT f FROM Follow f WHERE f.followingId = :followingId ORDER BY f.createdAt DESC")
    List<Follow> findByFollowingId(@Param("followingId") Long followingId);
    
    /**
     * Get follower IDs (users following me)
     * Returns Set for efficient lookups in feed algorithm
     */
    @Query("SELECT f.followerId FROM Follow f WHERE f.followingId = :userId")
    Set<Long> getFollowerIds(@Param("userId") Long userId);
    
    /**
     * Get following IDs (users I'm following)
     * Returns Set for efficient lookups in feed algorithm
     */
    @Query("SELECT f.followingId FROM Follow f WHERE f.followerId = :userId")
    Set<Long> getFollowingIds(@Param("userId") Long userId);
    
    /**
     * Check if user A follows user B
     */
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    /**
     * Count followers (people following this user)
     */
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followingId = :userId")
    long countFollowers(@Param("userId") Long userId);
    
    /**
     * Count followers by following ID (alias for compatibility)
     */
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followingId = :userId")
    long countByFollowingId(@Param("userId") Long userId);
    
    /**
     * Count following (people this user follows)
     */
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followerId = :userId")
    long countFollowing(@Param("userId") Long userId);
    
    /**
     * Count following by follower ID (alias for compatibility)
     */
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followerId = :userId")
    long countByFollowerId(@Param("userId") Long userId);
    
    /**
     * Delete by follower and following IDs
     */
    @Modifying
    @Query("DELETE FROM Follow f WHERE f.followerId = :followerId AND f.followingId = :followingId")
    void deleteByFollowerIdAndFollowingId(
        @Param("followerId") Long followerId,
        @Param("followingId") Long followingId
    );
}
