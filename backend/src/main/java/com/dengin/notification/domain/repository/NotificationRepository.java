package com.dengin.notification.domain.repository;

import com.dengin.notification.domain.model.Notification;
import com.dengin.notification.domain.model.NotificationId;
import com.dengin.notification.domain.model.NotificationType;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Notification aggregate.
 * 
 * Domain-driven repository following DDD principles.
 * Implementation details are in infrastructure layer.
 */
public interface NotificationRepository {

    /**
     * Save a notification
     */
    Notification save(Notification notification);

    /**
     * Find notification by domain ID
     */
    Optional<Notification> findById(NotificationId id);

    /**
     * Find notification by UUID
     */
    Optional<Notification> findById(UUID id);

    /**
     * Find notifications for a recipient with pagination
     */
    Page<Notification> findByRecipientId(Long recipientId, int page, int size);

    /**
     * Find unread notifications for a recipient with pagination
     */
    Page<Notification> findUnreadByRecipientId(Long recipientId, int page, int size);

    /**
     * Find notifications by type for a recipient with pagination
     */
    Page<Notification> findByRecipientIdAndType(Long recipientId, NotificationType type, int page, int size);

    /**
     * Count unread notifications for a recipient
     */
    long countUnreadByRecipientId(Long recipientId);

    /**
     * Count unread notifications by type
     */
    long countUnreadByRecipientIdAndType(Long recipientId, NotificationType type);

    /**
     * Find pending notifications ready for delivery
     */
    List<Notification> findPendingNotifications();

    /**
     * Find recent notifications for batching
     */
    List<Notification> findRecentByRecipientAndType(Long recipientId, NotificationType type, LocalDateTime since);

    /**
     * Mark all notifications as read for a recipient
     */
    int markAllAsRead(Long recipientId);

    /**
     * Mark specific notifications as read
     */
    int markAsReadByIds(List<UUID> notificationIds, Long recipientId);

    /**
     * Delete expired notifications
     */
    int deleteExpiredNotifications();

    /**
     * Check if similar notification exists (for deduplication)
     */
    boolean existsSimilarNotification(Long recipientId, NotificationType type, String referenceKey,
            LocalDateTime since);

    /**
     * Delete notification
     */
    void delete(Notification notification);

    /**
     * Delete notification by ID
     */
    void deleteById(NotificationId id);
}
