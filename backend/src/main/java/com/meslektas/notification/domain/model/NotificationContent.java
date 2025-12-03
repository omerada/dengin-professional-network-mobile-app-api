package com.meslektas.notification.domain.model;

import lombok.Builder;
import lombok.Value;

/**
 * Value Object representing notification content.
 * 
 * Contains:
 * - title: Short headline (max 100 chars)
 * - body: Detailed message (max 500 chars)
 * - actionUrl: Optional deep link URL
 */
@Value
@Builder
public class NotificationContent {

    private static final int MAX_TITLE_LENGTH = 100;
    private static final int MAX_BODY_LENGTH = 500;

    String title;
    String body;
    String actionUrl;

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
}
