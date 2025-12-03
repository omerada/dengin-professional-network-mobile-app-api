package com.meslektas.notification.infrastructure.persistence;

import com.meslektas.notification.domain.model.Notification;
import com.meslektas.notification.domain.model.NotificationId;
import com.meslektas.notification.domain.model.NotificationStatus;
import com.meslektas.notification.domain.model.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository for Notification entity.
 */
@Repository
public interface SpringDataNotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Find notification by its domain ID (UUID).
     */
    @Query("SELECT n FROM Notification n WHERE n.notificationUUID = :id")
    Optional<Notification> findByNotificationUUID(@Param("id") UUID id);

    /**
     * Find all notifications for a recipient with pagination.
     */
    @Query("SELECT n FROM Notification n WHERE n.recipientId = :recipientId ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientId(@Param("recipientId") Long recipientId, Pageable pageable);

    /**
     * Find unread notifications for a recipient.
     */
    @Query("SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.status != 'READ' ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByRecipientId(@Param("recipientId") Long recipientId, Pageable pageable);

    /**
     * Find notifications by recipient and type.
     */
    @Query("SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.type = :type ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientIdAndType(
            @Param("recipientId") Long recipientId,
            @Param("type") NotificationType type,
            Pageable pageable);

    /**
     * Count unread notifications for a recipient.
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientId = :recipientId AND n.status != 'READ'")
    long countUnreadByRecipientId(@Param("recipientId") Long recipientId);

    /**
     * Count unread notifications by type.
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientId = :recipientId AND n.type = :type AND n.status != 'READ'")
    long countUnreadByRecipientIdAndType(@Param("recipientId") Long recipientId, @Param("type") NotificationType type);

    /**
     * Find pending notifications that need to be delivered.
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' AND n.expiresAt > :now ORDER BY n.createdAt ASC")
    List<Notification> findPendingNotifications(@Param("now") LocalDateTime now);

    /**
     * Find notifications created after a specific time (for batching).
     */
    @Query("SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.type = :type AND n.createdAt > :since AND n.status = 'PENDING'")
    List<Notification> findRecentByRecipientAndType(
            @Param("recipientId") Long recipientId,
            @Param("type") NotificationType type,
            @Param("since") LocalDateTime since);

    /**
     * Mark all notifications as read for a recipient.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt, n.updatedAt = :readAt WHERE n.recipientId = :recipientId AND n.status != 'READ'")
    int markAllAsRead(@Param("recipientId") Long recipientId, @Param("readAt") LocalDateTime readAt);

    /**
     * Mark notifications as read by IDs.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt, n.updatedAt = :readAt WHERE n.notificationUUID IN :ids AND n.recipientId = :recipientId")
    int markAsReadByIds(@Param("ids") List<UUID> ids, @Param("recipientId") Long recipientId,
            @Param("readAt") LocalDateTime readAt);

    /**
     * Delete expired notifications.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt < :now AND n.status = 'READ'")
    int deleteExpiredNotifications(@Param("now") LocalDateTime now);

    /**
     * Check if similar notification exists (for deduplication).
     */
    @Query("""
                SELECT COUNT(n) > 0 FROM Notification n
                WHERE n.recipientId = :recipientId
                AND n.type = :type
                AND n.status != 'READ'
                AND n.createdAt > :since
                AND CAST(n.metadata AS string) LIKE CONCAT('%', :referenceKey, '%')
            """)
    boolean existsSimilarNotification(
            @Param("recipientId") Long recipientId,
            @Param("type") NotificationType type,
            @Param("referenceKey") String referenceKey,
            @Param("since") LocalDateTime since);
}
