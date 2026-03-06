package com.dengin.moderation.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Value Object representing ContentReport identity.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentReportId implements Serializable {

    @Column(name = "id")
    private UUID value;

    private ContentReportId(UUID value) {
        this.value = value;
    }

    public static ContentReportId generate() {
        return new ContentReportId(UUID.randomUUID());
    }

    public static ContentReportId of(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("ContentReport ID cannot be null");
        }
        return new ContentReportId(value);
    }

    public static ContentReportId of(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("ContentReport ID cannot be blank");
        }
        return new ContentReportId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
