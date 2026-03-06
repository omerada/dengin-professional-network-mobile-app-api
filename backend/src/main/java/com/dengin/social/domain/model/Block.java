package com.dengin.social.domain.model;

import com.dengin.common.domain.AggregateRoot;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Block Aggregate Root
 * 
 * Represents block relationship between two users.
 * One-way relationship: blocker blocks blocked.
 * 
 * Business Rules:
 * - Can't block yourself
 * - Can't block same user twice
 * - Blocking removes follow relationship
 * - Blocked users can't send messages or see content
 */
@Entity
@Table(name = "user_blocks", uniqueConstraints = {
        @UniqueConstraint(name = "uk_blocker_blocked", columnNames = { "blocker_id", "blocked_id" })
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Block extends AggregateRoot {

    @Column(name = "blocker_id", nullable = false)
    private Long blockerId;

    @Column(name = "blocked_id", nullable = false)
    private Long blockedId;

    @Column(name = "reason")
    private String reason;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Create new block relationship
     * 
     * @param blockerId User who is blocking
     * @param blockedId User being blocked
     * @return New Block aggregate
     */
    public static Block create(Long blockerId, Long blockedId) {
        return create(blockerId, blockedId, null);
    }

    /**
     * Create new block relationship with reason
     * 
     * @param blockerId User who is blocking
     * @param blockedId User being blocked
     * @param reason    Optional reason for blocking
     * @return New Block aggregate
     */
    public static Block create(Long blockerId, Long blockedId, String reason) {
        // Validation
        if (blockerId == null) {
            throw new IllegalArgumentException("Blocker ID cannot be null");
        }
        if (blockedId == null) {
            throw new IllegalArgumentException("Blocked ID cannot be null");
        }
        if (blockerId.equals(blockedId)) {
            throw new IllegalStateException("Cannot block yourself");
        }

        Block block = new Block();
        block.blockerId = blockerId;
        block.blockedId = blockedId;
        block.reason = reason;

        // Register domain event
        block.registerEvent(new UserBlockedEvent(blockerId, blockedId));

        return block;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Update reason for blocking
     */
    public void updateReason(String reason) {
        this.reason = reason;
    }

    // ============================================
    // QUERY METHODS
    // ============================================

    /**
     * Check if this block is for a specific user pair
     */
    public boolean isBlockFor(Long blockerId, Long blockedId) {
        return this.blockerId.equals(blockerId) && this.blockedId.equals(blockedId);
    }
}
