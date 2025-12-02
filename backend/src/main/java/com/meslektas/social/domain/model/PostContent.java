package com.meslektas.social.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Post Content (Value Object)
 * 
 * Business Rules:
 * - Min 10 characters
 * - Max 5000 characters
 * - Cannot be blank
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode
@Getter
public class PostContent {
    
    public static final int MIN_LENGTH = 10;
    public static final int MAX_LENGTH = 5000;
    
    @Column(name = "content", length = 5000, nullable = false)
    private String value;
    
    private PostContent(String value) {
        validate(value);
        this.value = value;
    }
    
    /**
     * Create PostContent with validation
     */
    public static PostContent of(String value) {
        return new PostContent(value);
    }
    
    private void validate(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Post content cannot be empty");
        }
        
        String trimmed = value.trim();
        
        if (trimmed.length() < MIN_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Post content must be at least %d characters", MIN_LENGTH)
            );
        }
        
        if (trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Post content cannot exceed %d characters", MAX_LENGTH)
            );
        }
    }
    
    /**
     * Get trimmed content
     */
    public String getTrimmed() {
        return value.trim();
    }
    
    /**
     * Get content length
     */
    public int length() {
        return value.length();
    }
    
    @Override
    public String toString() {
        return value;
    }
}
