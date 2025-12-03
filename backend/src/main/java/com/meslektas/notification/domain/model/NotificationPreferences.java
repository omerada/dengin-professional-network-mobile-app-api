package com.meslektas.notification.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Entity representing user notification preferences.
 * 
 * Determines which notification types are enabled for each delivery channel.
 * Users can customize their preferences to reduce notification noise.
 */
@Entity
@Table(name = "notification_preferences")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationPreferences {

    @Id
    @Column(name = "user_id")
    private Long userId;

    /**
     * Master switch - if false, no notifications are sent
     */
    @Column(name = "notifications_enabled", nullable = false)
    private boolean notificationsEnabled = true;

    /**
     * Email notifications enabled
     */
    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled = true;

    /**
     * Push notifications enabled
     */
    @Column(name = "push_enabled", nullable = false)
    private boolean pushEnabled = true;

    /**
     * Quiet hours start (e.g., 22:00)
     */
    @Column(name = "quiet_hours_start")
    private Integer quietHoursStart;

    /**
     * Quiet hours end (e.g., 08:00)
     */
    @Column(name = "quiet_hours_end")
    private Integer quietHoursEnd;

    /**
     * Disabled notification types for IN_APP channel
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "disabled_inapp_notifications", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type")
    private Set<NotificationType> disabledInAppTypes = EnumSet.noneOf(NotificationType.class);

    /**
     * Disabled notification types for EMAIL channel
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "disabled_email_notifications", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type")
    private Set<NotificationType> disabledEmailTypes = EnumSet.noneOf(NotificationType.class);

    /**
     * Disabled notification types for PUSH channel
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "disabled_push_notifications", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type")
    private Set<NotificationType> disabledPushTypes = EnumSet.noneOf(NotificationType.class);

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ==================== Factory Methods ====================

    /**
     * Create default preferences for a user
     */
    public static NotificationPreferences createDefault(Long userId) {
        NotificationPreferences prefs = new NotificationPreferences();
        prefs.userId = userId;
        prefs.notificationsEnabled = true;
        prefs.emailEnabled = true;
        prefs.pushEnabled = true;
        prefs.createdAt = LocalDateTime.now();
        prefs.updatedAt = prefs.createdAt;
        return prefs;
    }

    // ==================== Query Methods ====================

    /**
     * Check if a notification type is enabled for a specific channel
     */
    public boolean isEnabled(NotificationType type, DeliveryChannel channel) {
        // Check master switch
        if (!notificationsEnabled) {
            return false;
        }

        // System notifications cannot be disabled
        if (!type.isOptional()) {
            return true;
        }

        // Check channel-specific settings
        return switch (channel) {
            case IN_APP -> !disabledInAppTypes.contains(type);
            case EMAIL -> emailEnabled && !disabledEmailTypes.contains(type);
            case PUSH -> pushEnabled && !disabledPushTypes.contains(type);
        };
    }

    /**
     * Get enabled channels for a notification type
     */
    public Set<DeliveryChannel> getEnabledChannels(NotificationType type) {
        Set<DeliveryChannel> channels = EnumSet.noneOf(DeliveryChannel.class);

        for (DeliveryChannel channel : DeliveryChannel.values()) {
            if (isEnabled(type, channel)) {
                channels.add(channel);
            }
        }

        return channels;
    }

    /**
     * Check if currently in quiet hours
     */
    public boolean isInQuietHours() {
        if (quietHoursStart == null || quietHoursEnd == null) {
            return false;
        }

        int currentHour = LocalDateTime.now().getHour();

        if (quietHoursStart <= quietHoursEnd) {
            // Same day quiet hours (e.g., 14:00 - 18:00)
            return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
        } else {
            // Overnight quiet hours (e.g., 22:00 - 08:00)
            return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
        }
    }

    /**
     * Check if push notifications should be suppressed (quiet hours)
     */
    public boolean shouldSuppressPush() {
        return isInQuietHours();
    }

    // ==================== Mutator Methods ====================

    /**
     * Toggle master notification switch
     */
    public void setNotificationsEnabled(boolean enabled) {
        this.notificationsEnabled = enabled;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Toggle email notifications
     */
    public void setEmailEnabled(boolean enabled) {
        this.emailEnabled = enabled;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Toggle push notifications
     */
    public void setPushEnabled(boolean enabled) {
        this.pushEnabled = enabled;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Set quiet hours
     */
    public void setQuietHours(Integer start, Integer end) {
        if ((start == null) != (end == null)) {
            throw new IllegalArgumentException("Both start and end must be provided, or neither");
        }
        if (start != null && (start < 0 || start > 23)) {
            throw new IllegalArgumentException("Quiet hours start must be between 0 and 23");
        }
        if (end != null && (end < 0 || end > 23)) {
            throw new IllegalArgumentException("Quiet hours end must be between 0 and 23");
        }

        this.quietHoursStart = start;
        this.quietHoursEnd = end;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Disable a notification type for a channel
     */
    public void disable(NotificationType type, DeliveryChannel channel) {
        if (!type.isOptional()) {
            throw new IllegalArgumentException("Cannot disable " + type.name() + " notifications");
        }

        switch (channel) {
            case IN_APP -> disabledInAppTypes.add(type);
            case EMAIL -> disabledEmailTypes.add(type);
            case PUSH -> disabledPushTypes.add(type);
        }
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Enable a notification type for a channel
     */
    public void enable(NotificationType type, DeliveryChannel channel) {
        switch (channel) {
            case IN_APP -> disabledInAppTypes.remove(type);
            case EMAIL -> disabledEmailTypes.remove(type);
            case PUSH -> disabledPushTypes.remove(type);
        }
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Reset all preferences to defaults
     */
    public void resetToDefaults() {
        this.notificationsEnabled = true;
        this.emailEnabled = true;
        this.pushEnabled = true;
        this.quietHoursStart = null;
        this.quietHoursEnd = null;
        this.disabledInAppTypes.clear();
        this.disabledEmailTypes.clear();
        this.disabledPushTypes.clear();
        this.updatedAt = LocalDateTime.now();
    }
}
