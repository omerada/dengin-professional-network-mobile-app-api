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
 * Comment Identifier (Value Object)
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode
@Getter
public class CommentId implements Serializable {
    
    @Column(name = "comment_id", nullable = false)
    private UUID value;
    
    private CommentId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("CommentId cannot be null");
        }
        this.value = value;
    }
    
    public static CommentId generate() {
        return new CommentId(UUID.randomUUID());
    }
    
    public static CommentId of(UUID value) {
        return new CommentId(value);
    }
    
    public static CommentId fromString(String value) {
        try {
            return new CommentId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid CommentId format: " + value, e);
        }
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}
