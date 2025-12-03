package com.meslektas.notification.application.dto;

import com.meslektas.notification.domain.model.DeliveryChannel;
import com.meslektas.notification.domain.model.NotificationStatus;
import com.meslektas.notification.domain.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Response DTO for a single notification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID notificationId;
    private NotificationType type;
    private String title;
    private String body;
    private String actionUrl;
    private Map<String, String> metadata;
    private NotificationStatus status;
    private Set<DeliveryChannel> deliveredChannels;
    private boolean read;
    private LocalDateTime readAt;
    private String relativeTime;
    private LocalDateTime createdAt;

    /**
     * Get icon name based on notification type.
     */
    public String getIcon() {
        return switch (type) {
            case NEW_FOLLOWER -> "person-add";
            case POST_LIKED -> "heart";
            case POST_COMMENTED -> "chat-bubble";
            case MENTION -> "at-symbol";
            case NEW_MESSAGE -> "mail";
            case VERIFICATION_APPROVED -> "checkmark-circle";
            case VERIFICATION_REJECTED -> "close-circle";
            case VERIFICATION_PENDING_REVIEW -> "time";
            case POST_FLAGGED, CONTENT_REMOVED, WARNING_ISSUED -> "warning";
            case WELCOME -> "hand-wave";
            case PASSWORD_RESET -> "key";
            case ACCOUNT_SUSPENDED -> "ban";
            case ACCOUNT_REACTIVATED -> "checkmark-circle";
        };
    }

    /**
     * Get color based on notification type.
     */
    public String getColor() {
        return switch (type) {
            case NEW_FOLLOWER -> "#3B82F6"; // Blue
            case POST_LIKED -> "#EF4444"; // Red
            case POST_COMMENTED -> "#10B981"; // Green
            case MENTION -> "#6366F1"; // Indigo
            case NEW_MESSAGE -> "#6366F1"; // Indigo
            case VERIFICATION_APPROVED, ACCOUNT_REACTIVATED -> "#10B981"; // Green
            case VERIFICATION_REJECTED, ACCOUNT_SUSPENDED -> "#EF4444"; // Red
            case VERIFICATION_PENDING_REVIEW -> "#F59E0B"; // Amber
            case POST_FLAGGED, CONTENT_REMOVED, WARNING_ISSUED -> "#F59E0B"; // Amber
            case WELCOME -> "#8B5CF6"; // Purple
            case PASSWORD_RESET -> "#6366F1"; // Indigo
        };
    }
}
