package com.meslektas.social.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Like (Value Object)
 * 
 * Represents a user liking a post.
 * Stored as collection in Post aggregate.
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "userId")
@Getter
public class Like {
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "liked_at", nullable = false)
    private LocalDateTime likedAt;
    
    private Like(Long userId, LocalDateTime likedAt) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (likedAt == null) {
            throw new IllegalArgumentException("Liked timestamp cannot be null");
        }
        
        this.userId = userId;
        this.likedAt = likedAt;
    }
    
    /**
     * Create new Like
     */
    public static Like of(Long userId) {
        return new Like(userId, LocalDateTime.now());
    }
    
    /**
     * Create Like with specific timestamp (for testing)
     */
    public static Like of(Long userId, LocalDateTime likedAt) {
        return new Like(userId, likedAt);
    }
    
    @Override
    public String toString() {
        return String.format("Like(userId=%d, at=%s)", userId, likedAt);
    }
}
