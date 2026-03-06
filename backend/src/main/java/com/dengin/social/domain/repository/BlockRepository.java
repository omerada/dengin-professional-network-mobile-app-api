package com.dengin.social.domain.repository;

import com.dengin.social.domain.model.Block;

import java.util.List;
import java.util.Optional;

/**
 * Block Repository Interface
 * 
 * Domain repository for Block aggregate.
 */
public interface BlockRepository {
    
    /**
     * Save block relationship
     */
    Block save(Block block);
    
    /**
     * Find by database ID
     */
    Optional<Block> findById(Long id);
    
    /**
     * Find block relationship
     */
    Optional<Block> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
    
    /**
     * Check if user1 has blocked user2
     * 
     * @param blockerId User who might have blocked
     * @param blockedId User who might be blocked
     * @return true if block exists
     */
    boolean existsByBlockerAndBlocked(Long blockerId, Long blockedId);
    
    /**
     * Check if any block exists between two users (in either direction)
     * 
     * @param userId1 First user
     * @param userId2 Second user
     * @return true if any block exists
     */
    default boolean existsBlockBetween(Long userId1, Long userId2) {
        return existsByBlockerAndBlocked(userId1, userId2) || 
               existsByBlockerAndBlocked(userId2, userId1);
    }
    
    /**
     * Find all users blocked by given user
     */
    List<Block> findByBlockerId(Long blockerId);
    
    /**
     * Find all users who have blocked given user
     */
    List<Block> findByBlockedId(Long blockedId);
    
    /**
     * Count users blocked by given user
     */
    int countByBlockerId(Long blockerId);
    
    /**
     * Delete block relationship
     */
    void delete(Block block);
    
    /**
     * Delete block by blocker and blocked IDs
     */
    void deleteByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
}
