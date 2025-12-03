package com.meslektas.messaging.domain.model;

import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Message ID Value Object
 * 
 * Represents a unique identifier for a message.
 * Uses UUID for globally unique identification.
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@EqualsAndHashCode
public class MessageId implements Serializable {

    private UUID value;

    private MessageId(UUID value) {
        this.value = value;
    }

    /**
     * Generate a new unique message ID
     */
    public static MessageId generate() {
        return new MessageId(UUID.randomUUID());
    }

    /**
     * Create from existing UUID
     */
    public static MessageId of(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Message ID cannot be null");
        }
        return new MessageId(value);
    }

    /**
     * Create from string representation
     */
    public static MessageId fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Message ID string cannot be null or blank");
        }
        return new MessageId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
