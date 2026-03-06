package com.dengin.notification.application.dto;

import com.dengin.notification.domain.model.DeliveryChannel;
import com.dengin.notification.domain.model.NotificationType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.Set;

/**
 * Request DTO for updating notification preferences.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferencesRequest {

    /**
     * Master switch for all notifications.
     */
    private Boolean notificationsEnabled;

    /**
     * Email notifications enabled.
     */
    private Boolean emailEnabled;

    /**
     * Push notifications enabled.
     */
    private Boolean pushEnabled;

    /**
     * Quiet hours start (0-23).
     */
    @Min(value = 0, message = "Quiet hours start must be between 0 and 23")
    @Max(value = 23, message = "Quiet hours start must be between 0 and 23")
    private Integer quietHoursStart;

    /**
     * Quiet hours end (0-23).
     */
    @Min(value = 0, message = "Quiet hours end must be between 0 and 23")
    @Max(value = 23, message = "Quiet hours end must be between 0 and 23")
    private Integer quietHoursEnd;

    /**
     * Map of notification type to enabled channels.
     * Example: { "POST_LIKED": ["IN_APP", "PUSH"], "NEW_MESSAGE": ["IN_APP",
     * "EMAIL", "PUSH"] }
     */
    private Map<NotificationType, Set<DeliveryChannel>> typeSettings;
}
