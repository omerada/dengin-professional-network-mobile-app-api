package com.meslektas.notification.domain.model;

/**
 * Enum representing delivery channels for notifications.
 */
public enum DeliveryChannel {

    /**
     * In-app notification (notification center)
     */
    IN_APP("in_app", "Uygulama içi"),

    /**
     * Email notification
     */
    EMAIL("email", "E-posta"),

    /**
     * Push notification (mobile/web)
     */
    PUSH("push", "Push bildirimi");

    private final String code;
    private final String displayName;

    DeliveryChannel(String code, String displayName) {
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
     * Check if this channel requires user consent (GDPR)
     */
    public boolean requiresConsent() {
        return this == EMAIL || this == PUSH;
    }

    /**
     * Check if this channel can be batched
     */
    public boolean supportsBatching() {
        return this == EMAIL;
    }
}
