package com.meslektas.notification.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.notification.application.dto.*;
import com.meslektas.notification.domain.model.*;
import com.meslektas.notification.domain.repository.NotificationPreferencesRepository;
import com.meslektas.notification.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Application service for notification operations.
 * 
 * Handles notification CRUD, preferences management, and notification delivery.
 * Implements CQRS pattern with separate read and write operations.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferencesRepository preferencesRepository;

    private static final int MAX_UNREAD_NOTIFICATIONS = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    // ==================== Notification Creation ====================

    /**
     * Create a new notification.
     * Respects user preferences and deduplication rules.
     */
    @Transactional
    public NotificationResponse createNotification(
            Long recipientId,
            NotificationType type,
            String title,
            String body,
            String actionUrl,
            Map<String, String> metadata) {
        log.info("Creating notification for user {}: type={}", recipientId, type);

        // Check user preferences
        NotificationPreferences preferences = preferencesRepository.getOrCreate(recipientId);

        if (!preferences.isEnabled(type, DeliveryChannel.IN_APP)) {
            log.debug("Notification type {} is disabled for user {}", type, recipientId);
            return null;
        }

        // Check for duplicate notification (deduplication)
        String referenceKey = extractReferenceKey(metadata);
        if (referenceKey != null) {
            boolean exists = notificationRepository.existsSimilarNotification(
                    recipientId, type, referenceKey, LocalDateTime.now().minusHours(1));
            if (exists) {
                log.debug("Similar notification already exists for user {}", recipientId);
                return null;
            }
        }

        // Check max unread limit
        long unreadCount = notificationRepository.countUnreadByRecipientId(recipientId);
        if (unreadCount >= MAX_UNREAD_NOTIFICATIONS) {
            log.warn("User {} has reached max unread notifications limit", recipientId);
            // Could implement cleanup of oldest notifications here
        }

        // Create notification
        NotificationContent content = NotificationContent.of(title, body, actionUrl);
        NotificationMetadata notificationMetadata = metadata != null
                ? NotificationMetadata.of(metadata)
                : NotificationMetadata.empty();

        Notification notification = Notification.create(
                recipientId,
                type,
                content,
                notificationMetadata);

        notification = notificationRepository.save(notification);

        log.info("Notification {} created for user {}", notification.getNotificationUUID(), recipientId);

        return mapToResponse(notification);
    }

    /**
     * Create notification from domain event (internal use).
     */
    @Transactional
    public void createFromEvent(
            Long recipientId,
            NotificationType type,
            NotificationContent content,
            NotificationMetadata metadata) {
        // Check preferences
        NotificationPreferences preferences = preferencesRepository.getOrCreate(recipientId);

        if (!preferences.isEnabled(type, DeliveryChannel.IN_APP)) {
            return;
        }

        Notification notification = Notification.create(recipientId, type, content, metadata);
        notificationRepository.save(notification);

        log.debug("Notification created from event: type={}, recipient={}", type, recipientId);
    }

    // ==================== Notification Queries ====================

    /**
     * Get notifications for a user with pagination.
     */
    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications(Long userId, int page, int size, boolean unreadOnly) {
        log.debug("Fetching notifications for user {}: page={}, size={}, unreadOnly={}",
                userId, page, size, unreadOnly);

        if (size <= 0 || size > 50) {
            size = DEFAULT_PAGE_SIZE;
        }

        Page<Notification> notificationPage = unreadOnly
                ? notificationRepository.findUnreadByRecipientId(userId, page, size)
                : notificationRepository.findByRecipientId(userId, page, size);

        List<NotificationResponse> notifications = notificationPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        long unreadCount = notificationRepository.countUnreadByRecipientId(userId);

        // Get unread counts by type
        Map<String, Long> unreadByType = new HashMap<>();
        for (NotificationType type : NotificationType.values()) {
            long count = notificationRepository.countUnreadByRecipientIdAndType(userId, type);
            if (count > 0) {
                unreadByType.put(type.name(), count);
            }
        }

        return NotificationListResponse.builder()
                .notifications(notifications)
                .unreadCount(unreadCount)
                .unreadByType(unreadByType)
                .currentPage(page)
                .pageSize(size)
                .totalPages(notificationPage.getTotalPages())
                .totalElements(notificationPage.getTotalElements())
                .hasMore(notificationPage.hasNext())
                .first(notificationPage.isFirst())
                .last(notificationPage.isLast())
                .build();
    }

    /**
     * Get unread notification count.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByRecipientId(userId);
    }

    /**
     * Get a single notification by ID.
     */
    @Transactional(readOnly = true)
    public NotificationResponse getNotification(UUID notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId.toString()));

        // Verify ownership
        if (!notification.getRecipientId().equals(userId)) {
            throw new BusinessException("Bu bildirim size ait değil", "NOTIFICATION_ACCESS_DENIED");
        }

        return mapToResponse(notification);
    }

    // ==================== Mark as Read ====================

    /**
     * Mark a single notification as read.
     */
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, Long userId) {
        log.info("Marking notification {} as read for user {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId.toString()));

        // Verify ownership
        if (!notification.getRecipientId().equals(userId)) {
            throw new BusinessException("Bu bildirim size ait değil", "NOTIFICATION_ACCESS_DENIED");
        }

        notification.markAsRead();
        notification = notificationRepository.save(notification);

        return mapToResponse(notification);
    }

    /**
     * Mark multiple notifications as read.
     */
    @Transactional
    public int markAsRead(List<UUID> notificationIds, Long userId) {
        log.info("Marking {} notifications as read for user {}", notificationIds.size(), userId);
        return notificationRepository.markAsReadByIds(notificationIds, userId);
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user {}", userId);
        return notificationRepository.markAllAsRead(userId);
    }

    // ==================== Preferences ====================

    /**
     * Get user's notification preferences.
     */
    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getPreferences(Long userId) {
        NotificationPreferences preferences = preferencesRepository.getOrCreate(userId);
        return mapToPreferencesResponse(preferences);
    }

    /**
     * Update user's notification preferences.
     */
    @Transactional
    public NotificationPreferencesResponse updatePreferences(Long userId, NotificationPreferencesRequest request) {
        log.info("Updating notification preferences for user {}", userId);

        NotificationPreferences preferences = preferencesRepository.getOrCreate(userId);

        // Update master switches
        if (request.getNotificationsEnabled() != null) {
            preferences.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getEmailEnabled() != null) {
            preferences.setEmailEnabled(request.getEmailEnabled());
        }
        if (request.getPushEnabled() != null) {
            preferences.setPushEnabled(request.getPushEnabled());
        }

        // Update quiet hours
        if (request.getQuietHoursStart() != null || request.getQuietHoursEnd() != null) {
            preferences.setQuietHours(request.getQuietHoursStart(), request.getQuietHoursEnd());
        }

        // Update type-specific settings
        if (request.getTypeSettings() != null) {
            for (Map.Entry<NotificationType, Set<DeliveryChannel>> entry : request.getTypeSettings().entrySet()) {
                NotificationType type = entry.getKey();
                Set<DeliveryChannel> enabledChannels = entry.getValue();

                // Skip non-optional types
                if (!type.isOptional()) {
                    continue;
                }

                // Update each channel
                for (DeliveryChannel channel : DeliveryChannel.values()) {
                    if (enabledChannels.contains(channel)) {
                        preferences.enable(type, channel);
                    } else {
                        preferences.disable(type, channel);
                    }
                }
            }
        }

        preferences = preferencesRepository.save(preferences);

        log.info("Notification preferences updated for user {}", userId);

        return mapToPreferencesResponse(preferences);
    }

    // ==================== Cleanup ====================

    /**
     * Delete expired notifications.
     * Should be called periodically by a scheduled job.
     */
    @Transactional
    public int cleanupExpiredNotifications() {
        int deleted = notificationRepository.deleteExpiredNotifications();
        if (deleted > 0) {
            log.info("Deleted {} expired notifications", deleted);
        }
        return deleted;
    }

    // ==================== Mapping Methods ====================

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationUUID())
                .type(notification.getType())
                .title(notification.getContent().getTitle())
                .body(notification.getContent().getBody())
                .actionUrl(notification.getContent().getActionUrl())
                .metadata(notification.getMetadata().getData())
                .status(notification.getStatus())
                .deliveredChannels(notification.getDeliveredChannels())
                .read(notification.isRead())
                .readAt(notification.getReadAt())
                .relativeTime(notification.getRelativeTime())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private NotificationPreferencesResponse mapToPreferencesResponse(NotificationPreferences preferences) {
        // Build type settings map
        Map<String, Set<DeliveryChannel>> typeSettings = new HashMap<>();
        for (NotificationType type : NotificationType.values()) {
            typeSettings.put(type.name(), preferences.getEnabledChannels(type));
        }

        // Build available types info
        Map<String, NotificationPreferencesResponse.NotificationTypeInfo> availableTypes = new HashMap<>();
        for (NotificationType type : NotificationType.values()) {
            availableTypes.put(type.name(), NotificationPreferencesResponse.NotificationTypeInfo.builder()
                    .name(type.name())
                    .displayName(type.getDisplayName())
                    .description(type.getDescription())
                    .category(type.getCategoryName())
                    .optional(type.isOptional())
                    .build());
        }

        return NotificationPreferencesResponse.builder()
                .userId(preferences.getUserId())
                .notificationsEnabled(preferences.isNotificationsEnabled())
                .emailEnabled(preferences.isEmailEnabled())
                .pushEnabled(preferences.isPushEnabled())
                .quietHoursStart(preferences.getQuietHoursStart())
                .quietHoursEnd(preferences.getQuietHoursEnd())
                .inQuietHours(preferences.isInQuietHours())
                .typeSettings(typeSettings)
                .availableTypes(availableTypes)
                .updatedAt(preferences.getUpdatedAt())
                .build();
    }

    private String extractReferenceKey(Map<String, String> metadata) {
        if (metadata == null) {
            return null;
        }
        // Common reference keys for deduplication
        if (metadata.containsKey("postId")) {
            return "postId:" + metadata.get("postId");
        }
        if (metadata.containsKey("messageId")) {
            return "messageId:" + metadata.get("messageId");
        }
        if (metadata.containsKey("conversationId")) {
            return "conversationId:" + metadata.get("conversationId");
        }
        return null;
    }
}
