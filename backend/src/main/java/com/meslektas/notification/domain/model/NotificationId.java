package com.meslektas.notification.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Value Object representing a unique notification identifier.
 */
@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode
public class NotificationId implements Serializable {

    @Column(name = "id", nullable = false)
    private UUID value;

    private NotificationId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Notification ID cannot be null");
        }
        this.value = value;
    }

    /**
     * Create a new random NotificationId
     */
    public static NotificationId generate() {
        return new NotificationId(UUID.randomUUID());
    }

    /**
     * Create NotificationId from UUID
     */
    public static NotificationId of(UUID value) {
        return new NotificationId(value);
    }

    /**
     * Create NotificationId from String
     */
    public static NotificationId fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Notification ID string cannot be null or blank");
        }
        try {
            return new NotificationId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid notification ID format: " + value);
        }
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
