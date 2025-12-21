package com.dengin.social.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Comment Content (Value Object)
 * 
 * Business Rules:
 * - Min 1 character
 * - Max 500 characters
 * - Cannot be blank
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode
@Getter
public class CommentContent {
    
    public static final int MIN_LENGTH = 1;
    public static final int MAX_LENGTH = 500;
    
    @Column(name = "content", length = 500, nullable = false)
    private String value;
    
    private CommentContent(String value) {
        validate(value);
        this.value = value.trim();
    }
    
    public static CommentContent of(String value) {
        return new CommentContent(value);
    }
    
    private void validate(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        
        String trimmed = value.trim();
        
        if (trimmed.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        
        if (trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Comment content cannot exceed %d characters", MAX_LENGTH)
            );
        }
    }
    
    public int length() {
        return value.length();
    }
    
    @Override
    public String toString() {
        return value;
    }
}
