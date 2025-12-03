package com.meslektas.social.infrastructure.persistence;

import com.meslektas.social.domain.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Block Aggregate
 * 
 * Infrastructure implementation using Spring Data JPA.
 */
@Repository
public interface JpaBlockRepository extends JpaRepository<Block, Long> {

    /**
     * Find block relationship by blocker and blocked
     */
    Optional<Block> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    /**
     * Check if user1 has blocked user2
     */
    @Query("SELECT COUNT(b) > 0 FROM Block b WHERE b.blockerId = :blockerId AND b.blockedId = :blockedId")
    boolean existsByBlockerAndBlocked(
            @Param("blockerId") Long blockerId,
            @Param("blockedId") Long blockedId);

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
     * Delete block by blocker and blocked IDs
     */
    void deleteByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
}
