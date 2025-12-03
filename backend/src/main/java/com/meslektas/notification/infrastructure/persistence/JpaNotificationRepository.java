package com.meslektas.notification.infrastructure.persistence;

import com.meslektas.notification.domain.model.Notification;
import com.meslektas.notification.domain.model.NotificationId;
import com.meslektas.notification.domain.model.NotificationStatus;
import com.meslektas.notification.domain.model.NotificationType;
import com.meslektas.notification.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA implementation of NotificationRepository.
 * 
 * Bridges domain repository interface with Spring Data JPA.
 */
@Repository
@RequiredArgsConstructor
public class JpaNotificationRepository implements NotificationRepository {

    private final SpringDataNotificationRepository springDataRepository;

    @Override
    public Notification save(Notification notification) {
        return springDataRepository.save(notification);
    }

    @Override
    public Optional<Notification> findById(NotificationId id) {
        return springDataRepository.findByNotificationUUID(id.getValue());
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return springDataRepository.findByNotificationUUID(id);
    }

    @Override
    public Page<Notification> findByRecipientId(Long recipientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return springDataRepository.findByRecipientId(recipientId, pageable);
    }

    @Override
    public Page<Notification> findUnreadByRecipientId(Long recipientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return springDataRepository.findUnreadByRecipientId(recipientId, pageable);
    }

    @Override
    public Page<Notification> findByRecipientIdAndType(Long recipientId, NotificationType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return springDataRepository.findByRecipientIdAndType(recipientId, type, pageable);
    }

    @Override
    public long countUnreadByRecipientId(Long recipientId) {
        return springDataRepository.countUnreadByRecipientId(recipientId);
    }

    @Override
    public long countUnreadByRecipientIdAndType(Long recipientId, NotificationType type) {
        return springDataRepository.countUnreadByRecipientIdAndType(recipientId, type);
    }

    @Override
    public List<Notification> findPendingNotifications() {
        return springDataRepository.findPendingNotifications(LocalDateTime.now());
    }

    @Override
    public List<Notification> findRecentByRecipientAndType(Long recipientId, NotificationType type,
            LocalDateTime since) {
        return springDataRepository.findRecentByRecipientAndType(recipientId, type, since);
    }

    @Override
    public int markAllAsRead(Long recipientId) {
        return springDataRepository.markAllAsRead(recipientId, LocalDateTime.now());
    }

    @Override
    public int markAsReadByIds(List<UUID> notificationIds, Long recipientId) {
        return springDataRepository.markAsReadByIds(notificationIds, recipientId, LocalDateTime.now());
    }

    @Override
    public int deleteExpiredNotifications() {
        return springDataRepository.deleteExpiredNotifications(LocalDateTime.now());
    }

    @Override
    public boolean existsSimilarNotification(Long recipientId, NotificationType type, String referenceKey,
            LocalDateTime since) {
        return springDataRepository.existsSimilarNotification(recipientId, type, referenceKey, since);
    }

    @Override
    public void delete(Notification notification) {
        springDataRepository.delete(notification);
    }

    @Override
    public void deleteById(NotificationId id) {
        springDataRepository.findByNotificationUUID(id.getValue())
                .ifPresent(springDataRepository::delete);
    }
}
