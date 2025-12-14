package com.dengin.notification.domain.model;

/**
 * Enum representing notification status.
 */
public enum NotificationStatus {

    /**
     * Notification created but not yet delivered
     */
    PENDING("pending", "Beklemede"),

    /**
     * Notification sent via at least one channel
     */
    SENT("sent", "Gönderildi"),

    /**
     * Notification delivered to user
     */
    DELIVERED("delivered", "İletildi"),

    /**
     * Notification read by user
     */
    READ("read", "Okundu"),

    /**
     * Notification failed to deliver
     */
    FAILED("failed", "Başarısız"),

    /**
     * Notification expired (not delivered within time limit)
     */
    EXPIRED("expired", "Süresi doldu");

    private final String code;
    private final String displayName;

    NotificationStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Check if notification is in a terminal state
     */
    public boolean isFinal() {
        return this == READ || this == FAILED || this == EXPIRED;
    }

    /**
     * Check if notification has been delivered
     */
    public boolean isDelivered() {
        return this == DELIVERED || this == READ;
    }

    /**
     * Check if notification is still pending
     */
    public boolean isPending() {
        return this == PENDING || this == SENT;
    }
}
