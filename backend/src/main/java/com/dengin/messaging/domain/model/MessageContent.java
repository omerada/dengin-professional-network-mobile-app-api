package com.dengin.messaging.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Message Content Value Object
 * 
 * Immutable value object representing message text content.
 * 
 * Business Rules:
 * - Content must be between 1 and 2000 characters
 * - Content cannot be null or blank
 * - Content is trimmed before validation
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@EqualsAndHashCode
public class MessageContent {

    public static final int MIN_LENGTH = 1;
    public static final int MAX_LENGTH = 2000;

    @Column(name = "content", nullable = false, length = MAX_LENGTH)
    private String value;

    private MessageContent(String value) {
        this.value = value;
    }

    /**
     * Create a new message content with validation
     * 
     * @param content The message text (1-2000 characters)
     * @return MessageContent value object
     * @throws IllegalArgumentException if content is invalid
     */
    public static MessageContent of(String content) {
        if (content == null) {
            throw new IllegalArgumentException("Message content cannot be null");
        }

        String trimmed = content.trim();

        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be blank");
        }

        if (trimmed.length() < MIN_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("Message content must be at least %d character(s)", MIN_LENGTH));
        }

        if (trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("Message content cannot exceed %d characters", MAX_LENGTH));
        }

        return new MessageContent(trimmed);
    }

    /**
     * Get the length of the content
     */
    public int length() {
        return value.length();
    }

    /**
     * Check if content contains a specific substring
     */
    public boolean contains(String substring) {
        return value.toLowerCase().contains(substring.toLowerCase());
    }

    /**
     * Get a preview of the content (for notifications)
     * 
     * @param maxLength Maximum length for preview
     * @return Truncated content with ellipsis if needed
     */
    public String getPreview(int maxLength) {
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + "...";
    }

    @Override
    public String toString() {
        return value;
    }
}
