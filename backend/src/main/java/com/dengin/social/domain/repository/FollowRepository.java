package com.dengin.social.domain.repository;

import com.dengin.social.domain.model.Follow;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Follow Repository Interface
 * 
 * Domain repository for Follow aggregate.
 */
public interface FollowRepository {
    
    /**
     * Save follow relationship
     */
    Follow save(Follow follow);
    
    /**
     * Find by database ID
     */
    Optional<Follow> findById(Long id);
    
    /**
     * Find follow relationship
     */
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    /**
     * Find all users that the given user is following
     */
    List<Follow> findByFollowerId(Long followerId);
    
    /**
     * Find all users following the given user
     */
    List<Follow> findByFollowingId(Long followingId);
    
    /**
     * Get follower IDs (users following me)
     */
    Set<Long> getFollowerIds(Long userId);
    
    /**
     * Get following IDs (users I'm following)
     */
    Set<Long> getFollowingIds(Long userId);
    
    /**
     * Check if user A follows user B
     */
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    /**
     * Count followers (people following this user)
     */
    long countFollowers(Long userId);
    
    /**
     * Count followers by following ID (alias)
     */
    long countByFollowingId(Long userId);
    
    /**
     * Count following (people this user follows)
     */
    long countFollowing(Long userId);
    
    /**
     * Count following by follower ID (alias)
     */
    long countByFollowerId(Long userId);
    
    /**
     * Delete follow relationship
     */
    void delete(Follow follow);
    
    /**
     * Delete by follower and following IDs
     */
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
