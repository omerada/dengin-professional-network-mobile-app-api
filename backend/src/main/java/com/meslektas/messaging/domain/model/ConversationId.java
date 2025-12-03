package com.meslektas.messaging.domain.model;

import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Conversation ID Value Object
 * 
 * Represents a unique identifier for a conversation.
 * Uses UUID for globally unique identification.
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@EqualsAndHashCode
public class ConversationId implements Serializable {
    
    private UUID value;
    
    private ConversationId(UUID value) {
        this.value = value;
    }
    
    /**
     * Generate a new unique conversation ID
     */
    public static ConversationId generate() {
        return new ConversationId(UUID.randomUUID());
    }
    
    /**
     * Create from existing UUID
     */
    public static ConversationId of(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Conversation ID cannot be null");
        }
        return new ConversationId(value);
    }
    
    /**
     * Create from string representation
     */
    public static ConversationId fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Conversation ID string cannot be null or blank");
        }
        return new ConversationId(UUID.fromString(value));
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}
