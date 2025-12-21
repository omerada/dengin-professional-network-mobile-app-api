package com.dengin.notification.api;

import com.dengin.notification.application.dto.NotificationResponse;
import com.dengin.notification.application.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * WebSocket controller for real-time notifications.
 * 
 * Handles WebSocket communication for notification updates.
 * Uses STOMP protocol over WebSocket for bidirectional communication.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class NotificationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    /**
     * Handle subscription to notifications.
     * Client subscribes to /user/queue/notifications
     */
    @MessageMapping("/notifications/subscribe")
    @SendToUser("/queue/notifications")
    public Map<String, Object> subscribeToNotifications(@AuthenticationPrincipal Jwt jwt) {
        Long userId = getUserIdFromJwt(jwt);
        log.info("User {} subscribed to notifications", userId);

        long unreadCount = notificationService.getUnreadCount(userId);

        return Map.of(
                "type", "SUBSCRIPTION_CONFIRMED",
                "unreadCount", unreadCount,
                "message", "Successfully subscribed to notifications");
    }

    /**
     * Handle marking a notification as read via WebSocket.
     */
    @MessageMapping("/notifications/mark-read")
    @SendToUser("/queue/notifications")
    public Map<String, Object> markAsRead(
            @Payload Map<String, String> payload,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = getUserIdFromJwt(jwt);
        String notificationIdStr = payload.get("notificationId");

        try {
            UUID notificationId = UUID.fromString(notificationIdStr);
            notificationService.markAsRead(notificationId, userId);

            long unreadCount = notificationService.getUnreadCount(userId);

            return Map.of(
                    "type", "NOTIFICATION_READ",
                    "notificationId", notificationId.toString(),
                    "unreadCount", unreadCount);
        } catch (IllegalArgumentException e) {
            log.error("Invalid notification ID: {}", notificationIdStr);
            return Map.of(
                    "type", "ERROR",
                    "message", "Invalid notification ID");
        }
    }

    /**
     * Handle marking all notifications as read via WebSocket.
     */
    @MessageMapping("/notifications/mark-all-read")
    @SendToUser("/queue/notifications")
    public Map<String, Object> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        Long userId = getUserIdFromJwt(jwt);

        notificationService.markAllAsRead(userId);

        return Map.of(
                "type", "ALL_NOTIFICATIONS_READ",
                "unreadCount", 0);
    }

    /**
     * Request unread count via WebSocket.
     */
    @MessageMapping("/notifications/unread-count")
    @SendToUser("/queue/notifications")
    public Map<String, Object> getUnreadCount(@AuthenticationPrincipal Jwt jwt) {
        Long userId = getUserIdFromJwt(jwt);

        long unreadCount = notificationService.getUnreadCount(userId);

        return Map.of(
                "type", "UNREAD_COUNT",
                "unreadCount", unreadCount);
    }

    // ==================== Push Methods for Real-time Updates ====================

    /**
     * Send a new notification to a specific user.
     * Called by NotificationService when a new notification is created.
     */
    public void sendNotificationToUser(Long userId, NotificationResponse notification) {
        log.debug("Sending real-time notification to user {}: {}", userId, notification.getNotificationId());

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                Map.of(
                        "type", "NEW_NOTIFICATION",
                        "notification", notification));
    }

    /**
     * Send unread count update to a specific user.
     */
    public void sendUnreadCountUpdate(Long userId, long unreadCount) {
        log.debug("Sending unread count update to user {}: {}", userId, unreadCount);

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                Map.of(
                        "type", "UNREAD_COUNT_UPDATE",
                        "unreadCount", unreadCount));
    }

    /**
     * Send notification read confirmation to a user.
     */
    public void sendNotificationReadConfirmation(Long userId, Long notificationId) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                Map.of(
                        "type", "NOTIFICATION_READ_CONFIRMED",
                        "notificationId", notificationId));
    }

    /**
     * Send batch notification update.
     */
    public void sendBatchNotifications(Long userId, List<NotificationResponse> notifications) {
        log.debug("Sending batch notifications to user {}: {} items", userId, notifications.size());

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                Map.of(
                        "type", "BATCH_NOTIFICATIONS",
                        "notifications", notifications,
                        "count", notifications.size()));
    }

    // ==================== Helper Methods ====================

    private Long getUserIdFromJwt(Jwt jwt) {
        return Long.parseLong(jwt.getSubject());
    }
}
