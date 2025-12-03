package com.meslektas.notification.domain.model;

import java.util.UUID;

/**
 * Value Object representing a unique notification identifier.
 */
public record NotificationId(UUID value) {

    public NotificationId {
        if (value == null) {
            throw new IllegalArgumentException("Notification ID cannot be null");
        }
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

    public UUID getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
