package com.dengin.social.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Post Identifier (Value Object)
 * 
 * UUID-based identifier for Post aggregate.
 * Immutable and unique across the system.
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode
@Getter
public class PostId implements Serializable {
    
    @Column(name = "post_id", nullable = false)
    private UUID value;
    
    private PostId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("PostId cannot be null");
        }
        this.value = value;
    }
    
    /**
     * Generate new unique PostId
     */
    public static PostId generate() {
        return new PostId(UUID.randomUUID());
    }
    
    /**
     * Create PostId from existing UUID
     */
    public static PostId of(UUID value) {
        return new PostId(value);
    }
    
    /**
     * Create PostId from string
     */
    public static PostId fromString(String value) {
        try {
            return new PostId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid PostId format: " + value, e);
        }
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}
