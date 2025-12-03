package com.meslektas.notification.domain.model;

import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Objects;

/**
 * Value Object representing notification content.
 * 
 * Contains:
 * - title: Short headline (max 100 chars)
 * - body: Detailed message (max 500 chars)
 * - actionUrl: Optional deep link URL
 */
@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationContent {

    private static final int MAX_TITLE_LENGTH = 100;
    private static final int MAX_BODY_LENGTH = 500;

    private String title;
    private String body;
    private String actionUrl;

    @Builder
    public NotificationContent(String title, String body, String actionUrl) {
        validateTitle(title);
        validateBody(body);

        this.title = title.trim();
        this.body = body != null ? body.trim() : null;
        this.actionUrl = actionUrl != null ? actionUrl.trim() : null;
    }

    /**
     * Create content with title only
     */
    public static NotificationContent ofTitle(String title) {
        return new NotificationContent(title, null, null);
    }

    /**
     * Create content with title and body
     */
    public static NotificationContent of(String title, String body) {
        return new NotificationContent(title, body, null);
    }

    /**
     * Create content with title, body and action URL
     */
    public static NotificationContent of(String title, String body, String actionUrl) {
        return new NotificationContent(title, body, actionUrl);
    }

    /**
     * Check if notification has an action URL
     */
    public boolean hasAction() {
        return actionUrl != null && !actionUrl.isBlank();
    }

    /**
     * Check if notification has body text
     */
    public boolean hasBody() {
        return body != null && !body.isBlank();
    }

    /**
     * Get preview text for notification (truncated body)
     */
    public String getPreview() {
        if (!hasBody()) {
            return title;
        }
        if (body.length() <= 100) {
            return body;
        }
        return body.substring(0, 97) + "...";
    }

    // ==================== Validation ====================

    private void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Notification title cannot be null or blank");
        }
        if (title.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException(
                    "Notification title cannot exceed " + MAX_TITLE_LENGTH + " characters");
        }
    }

    private void validateBody(String body) {
        if (body != null && body.length() > MAX_BODY_LENGTH) {
            throw new IllegalArgumentException(
                    "Notification body cannot exceed " + MAX_BODY_LENGTH + " characters");
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NotificationContent that = (NotificationContent) o;
        return Objects.equals(title, that.title) &&
               Objects.equals(body, that.body) &&
               Objects.equals(actionUrl, that.actionUrl);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title, body, actionUrl);
    }
}
