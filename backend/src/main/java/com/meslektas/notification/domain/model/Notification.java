package com.meslektas.notification.domain.model;

import com.meslektas.common.domain.AggregateRoot;
import com.meslektas.notification.domain.event.NotificationCreatedEvent;
import com.meslektas.notification.domain.event.NotificationDeliveredEvent;
import com.meslektas.notification.domain.event.NotificationReadEvent;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

/**
 * Notification Aggregate Root
 * 
 * Represents a notification sent to a user.
 * 
 * Business Rules:
 * - Notifications expire after 30 days
 * - Max 100 unread notifications per user
 * - Duplicate notifications can be grouped
 * - User preferences determine delivery channels
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_recipient", columnList = "recipient_id"),
        @Index(name = "idx_notifications_recipient_unread", columnList = "recipient_id, status"),
        @Index(name = "idx_notifications_type", columnList = "type"),
        @Index(name = "idx_notifications_created_at", columnList = "created_at DESC")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends AggregateRoot {

    private static final int EXPIRATION_DAYS = 30;

    @Column(name = "notification_uuid", nullable = false, unique = true)
    private UUID notificationUUID;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "title", column = @Column(name = "title", nullable = false)),
            @AttributeOverride(name = "body", column = @Column(name = "body")),
            @AttributeOverride(name = "actionUrl", column = @Column(name = "action_url"))
    })
    private NotificationContent content;

    @Column(name = "metadata", columnDefinition = "jsonb")
    @Convert(converter = NotificationMetadataConverter.class)
    private NotificationMetadata metadata;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NotificationStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_deliveries", joinColumns = @JoinColumn(name = "notification_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private Set<DeliveryChannel> deliveredChannels = EnumSet.noneOf(DeliveryChannel.class);

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ==================== Factory Methods ====================

    /**
     * Create a new notification
     */
    public static Notification create(
            Long recipientId,
            NotificationType type,
            NotificationContent content,
            NotificationMetadata metadata) {
        validateRecipient(recipientId);
        validateContent(content);

        Notification notification = new Notification();
        notification.notificationUUID = UUID.randomUUID();
        notification.recipientId = recipientId;
        notification.type = type;
        notification.content = content;
        notification.metadata = metadata != null ? metadata : NotificationMetadata.empty();
        notification.status = NotificationStatus.PENDING;
        notification.createdAt = LocalDateTime.now();
        notification.updatedAt = notification.createdAt;
        notification.expiresAt = notification.createdAt.plusDays(EXPIRATION_DAYS);

        notification.registerEvent(new NotificationCreatedEvent(
                NotificationId.of(notification.notificationUUID),
                notification.recipientId,
                notification.type,
                notification.content.getTitle()));

        return notification;
    }

    /**
     * Create notification with specific ID (for reconstruction)
     */
    public static Notification restore(
            NotificationId notificationId,
            Long recipientId,
            NotificationType type,
            NotificationContent content,
            NotificationMetadata metadata,
            NotificationStatus status,
            Set<DeliveryChannel> deliveredChannels,
            LocalDateTime readAt,
            LocalDateTime expiresAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        Notification notification = new Notification();
        notification.notificationUUID = notificationId.getValue();
        notification.recipientId = recipientId;
        notification.type = type;
        notification.content = content;
        notification.metadata = metadata;
        notification.status = status;
        notification.deliveredChannels = deliveredChannels != null ? EnumSet.copyOf(deliveredChannels)
                : EnumSet.noneOf(DeliveryChannel.class);
        notification.readAt = readAt;
        notification.expiresAt = expiresAt;
        notification.createdAt = createdAt;
        notification.updatedAt = updatedAt;
        return notification;
    }

    // ==================== Domain Methods ====================

    /**
     * Mark notification as read
     */
    public void markAsRead() {
        if (status == NotificationStatus.READ) {
            return; // Already read
        }

        if (status == NotificationStatus.EXPIRED) {
            throw new IllegalStateException("Cannot read expired notification");
        }

        this.status = NotificationStatus.READ;
        this.readAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        registerEvent(new NotificationReadEvent(NotificationId.of(notificationUUID), recipientId));
    }

    /**
     * Record delivery via a channel
     */
    public void recordDelivery(DeliveryChannel channel) {
        if (status.isFinal()) {
            return; // Don't update final notifications
        }

        deliveredChannels.add(channel);

        if (status == NotificationStatus.PENDING) {
            this.status = NotificationStatus.SENT;
        }
        if (!deliveredChannels.isEmpty() && status == NotificationStatus.SENT) {
            this.status = NotificationStatus.DELIVERED;
        }

        this.updatedAt = LocalDateTime.now();

        registerEvent(new NotificationDeliveredEvent(NotificationId.of(notificationUUID), recipientId, channel));
    }

    /**
     * Mark notification as failed
     */
    public void markAsFailed() {
        if (status.isFinal()) {
            return;
        }

        this.status = NotificationStatus.FAILED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Check if notification should expire
     */
    public void checkExpiration() {
        if (!status.isFinal() && LocalDateTime.now().isAfter(expiresAt)) {
            this.status = NotificationStatus.EXPIRED;
            this.updatedAt = LocalDateTime.now();
        }
    }

    // ==================== Query Methods ====================

    /**
     * Check if notification is read
     */
    public boolean isRead() {
        return status == NotificationStatus.READ;
    }

    /**
     * Check if notification is unread
     */
    public boolean isUnread() {
        return !isRead() && status != NotificationStatus.EXPIRED && status != NotificationStatus.FAILED;
    }

    /**
     * Check if notification has been delivered via a specific channel
     */
    public boolean wasDeliveredVia(DeliveryChannel channel) {
        return deliveredChannels.contains(channel);
    }

    /**
     * Check if notification is expired
     */
    public boolean isExpired() {
        return status == NotificationStatus.EXPIRED || LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Get notification age in hours
     */
    public long getAgeInHours() {
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toHours();
    }

    /**
     * Get notification age description / relative time
     */
    public String getRelativeTime() {
        long hours = getAgeInHours();
        if (hours < 1) {
            return "Az önce";
        } else if (hours < 24) {
            return hours + " saat önce";
        } else {
            long days = hours / 24;
            return days + " gün önce";
        }
    }

    public UUID getNotificationUUID() {
        return notificationUUID;
    }
    
    /**
     * Get NotificationId value object
     */
    public NotificationId getNotificationId() {
        return NotificationId.of(notificationUUID);
    }

    // ==================== Validation ====================

    private static void validateRecipient(Long recipientId) {
        if (recipientId == null) {
            throw new IllegalArgumentException("Recipient ID cannot be null");
        }
    }

    private static void validateContent(NotificationContent content) {
        if (content == null) {
            throw new IllegalArgumentException("Notification content cannot be null");
        }
    }
}
