package com.meslektas.notification.application.dto;

import com.meslektas.notification.domain.model.DeliveryChannel;
import com.meslektas.notification.domain.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

/**
 * Response DTO for notification preferences.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferencesResponse {

    /**
     * User ID these preferences belong to.
     */
    private Long userId;

    /**
     * Master switch for all notifications.
     */
    private boolean notificationsEnabled;

    /**
     * Email notifications enabled.
     */
    private boolean emailEnabled;

    /**
     * Push notifications enabled.
     */
    private boolean pushEnabled;

    /**
     * Quiet hours start (0-23), null if not set.
     */
    private Integer quietHoursStart;

    /**
     * Quiet hours end (0-23), null if not set.
     */
    private Integer quietHoursEnd;

    /**
     * Currently in quiet hours.
     */
    private boolean inQuietHours;

    /**
     * Enabled channels for each notification type.
     * Key: notification type name
     * Value: set of enabled channels
     */
    private Map<String, Set<DeliveryChannel>> typeSettings;

    /**
     * Available notification types with descriptions.
     */
    private Map<String, NotificationTypeInfo> availableTypes;

    /**
     * Last updated timestamp.
     */
    private LocalDateTime updatedAt;

    /**
     * Info about a notification type.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationTypeInfo {
        private String name;
        private String displayName;
        private String description;
        private String category;
        private boolean optional;
    }
}
