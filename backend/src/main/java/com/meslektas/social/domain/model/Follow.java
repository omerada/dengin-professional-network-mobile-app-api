package com.meslektas.social.domain.model;

import com.meslektas.common.domain.AggregateRoot;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Follow Aggregate Root
 * 
 * Represents follow relationship between two users.
 * One-way relationship: follower follows following.
 * 
 * Business Rules:
 * - Can't follow yourself
 * - Can't follow same user twice
 * - Unfollowing non-followed user is no-op
 */
@Entity
@Table(
    name = "follows",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_follower_following",
            columnNames = {"follower_id", "following_id"}
        )
    }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Follow extends AggregateRoot {
    
    @Column(name = "follower_id", nullable = false)
    private Long followerId;
    
    @Column(name = "following_id", nullable = false)
    private Long followingId;
    
    // ============================================
    // FACTORY METHOD
    // ============================================
    
    /**
     * Create new follow relationship
     * 
     * @param followerId User who is following
     * @param followingId User being followed
     * @return New Follow aggregate
     */
    public static Follow create(Long followerId, Long followingId) {
        // Validation
        if (followerId == null) {
            throw new IllegalArgumentException("Follower ID cannot be null");
        }
        if (followingId == null) {
            throw new IllegalArgumentException("Following ID cannot be null");
        }
        if (followerId.equals(followingId)) {
            throw new IllegalStateException("Cannot follow yourself");
        }
        
        Follow follow = new Follow();
        follow.followerId = followerId;
        follow.followingId = followingId;
        
        // Event will be published after save (when ID is set)
        return follow;
    }
    
    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================
    
    /**
     * Publish created event (called after save in service layer)
     */
    public void publishCreatedEvent() {
        registerEvent(new UserFollowedEvent(
            getId(),
            this.followerId,
            this.followingId
        ));
    }
    
    /**
     * Publish deleted event (called before delete in service layer)
     */
    public void publishDeletedEvent() {
        registerEvent(new UserUnfollowedEvent(
            getId(),
            this.followerId,
            this.followingId
        ));
    }
}
