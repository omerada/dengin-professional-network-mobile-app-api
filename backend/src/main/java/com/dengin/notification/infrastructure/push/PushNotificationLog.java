package com.dengin.notification.infrastructure.push;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Push Notification Log Entity
 * 
 * Audit log for tracking push notification delivery.
 * Used for analytics, debugging, and compliance.
 */
@Entity
@Table(
    name = "push_notification_log",
    indexes = {
        @Index(name = "idx_push_log_user_id", columnList = "user_id"),
        @Index(name = "idx_push_log_sent_at", columnList = "sent_at")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushNotificationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "device_token_id")
    private UUID deviceTokenId;
    
    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "body", columnDefinition = "TEXT")
    private String body;
    
    @Column(name = "data", columnDefinition = "JSONB")
    @Convert(converter = JsonMapConverter.class)
    private Map<String, String> data;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DeliveryStatus status;
    
    @Column(name = "fcm_message_id")
    private String fcmMessageId;
    
    @Column(name = "error_code", length = 50)
    private String errorCode;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "sent_at", nullable = false)
    @Builder.Default
    private Instant sentAt = Instant.now();
    
    public enum DeliveryStatus {
        SENT,
        DELIVERED,
        FAILED,
        INVALID_TOKEN
    }
    
    /**
     * Create a success log entry
     */
    public static PushNotificationLog success(
        UUID userId,
        UUID deviceTokenId,
        String notificationType,
        String title,
        String body,
        String fcmMessageId
    ) {
        return PushNotificationLog.builder()
            .userId(userId)
            .deviceTokenId(deviceTokenId)
            .notificationType(notificationType)
            .title(title)
            .body(body)
            .status(DeliveryStatus.SENT)
            .fcmMessageId(fcmMessageId)
            .sentAt(Instant.now())
            .build();
    }
    
    /**
     * Create a failure log entry
     */
    public static PushNotificationLog failure(
        UUID userId,
        UUID deviceTokenId,
        String notificationType,
        String title,
        String body,
        String errorCode,
        String errorMessage
    ) {
        return PushNotificationLog.builder()
            .userId(userId)
            .deviceTokenId(deviceTokenId)
            .notificationType(notificationType)
            .title(title)
            .body(body)
            .status(DeliveryStatus.FAILED)
            .errorCode(errorCode)
            .errorMessage(errorMessage)
            .sentAt(Instant.now())
            .build();
    }
}
