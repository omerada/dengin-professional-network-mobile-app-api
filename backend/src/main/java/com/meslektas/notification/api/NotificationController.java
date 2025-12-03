package com.meslektas.notification.api;

import com.meslektas.notification.application.dto.*;
import com.meslektas.notification.application.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for notification management.
 * 
 * Provides endpoints for:
 * - Fetching notifications (paginated)
 * - Marking notifications as read
 * - Managing notification preferences
 * - Getting unread count
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "Notification management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get user's notifications with pagination.
     */
    @GetMapping
    @Operation(summary = "Get notifications", description = "Retrieve user's notifications with pagination support")
    @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully")
    public ResponseEntity<NotificationListResponse> getNotifications(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Only return unread notifications") @RequestParam(defaultValue = "false") boolean unreadOnly,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("GET /api/notifications - userId: {}, page: {}, size: {}, unreadOnly: {}",
                userId, page, size, unreadOnly);

        NotificationListResponse response = notificationService.getNotifications(userId, page, size, unreadOnly);

        log.info("Notifications retrieved - userId: {}, count: {}, unreadCount: {}",
                userId, response.getNotifications().size(), response.getUnreadCount());

        return ResponseEntity.ok(response);
    }

    /**
     * Get single notification by ID.
     */
    @GetMapping("/{notificationId}")
    @Operation(summary = "Get notification by ID")
    @ApiResponse(responseCode = "200", description = "Notification retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<NotificationResponse> getNotification(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("GET /api/notifications/{} - userId: {}", notificationId, userId);

        NotificationResponse response = notificationService.getNotification(notificationId, userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notification count.
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    @ApiResponse(responseCode = "200", description = "Unread count retrieved successfully")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        Long userId = getUserId(authentication);
        log.debug("GET /api/notifications/unread-count - userId: {}", userId);

        long count = notificationService.getUnreadCount(userId);

        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    /**
     * Mark single notification as read.
     */
    @PostMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    @ApiResponse(responseCode = "200", description = "Notification marked as read")
    @ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("POST /api/notifications/{}/read - userId: {}", notificationId, userId);

        NotificationResponse response = notificationService.markAsRead(notificationId, userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Mark multiple notifications as read.
     */
    @PostMapping("/mark-as-read")
    @Operation(summary = "Mark multiple notifications as read")
    @ApiResponse(responseCode = "200", description = "Notifications marked as read")
    public ResponseEntity<Map<String, Integer>> markAsRead(
            @Valid @RequestBody MarkAsReadRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("POST /api/notifications/mark-as-read - userId: {}, markAll: {}, ids: {}",
                userId, request.isMarkAll(),
                request.getNotificationIds() != null ? request.getNotificationIds().size() : 0);

        int count;
        if (request.isMarkAll()) {
            count = notificationService.markAllAsRead(userId);
        } else if (request.getNotificationIds() != null && !request.getNotificationIds().isEmpty()) {
            count = notificationService.markAsRead(request.getNotificationIds(), userId);
        } else {
            count = 0;
        }

        log.info("Notifications marked as read - userId: {}, count: {}", userId, count);

        return ResponseEntity.ok(Collections.singletonMap("markedAsRead", count));
    }

    /**
     * Get user's notification preferences.
     */
    @GetMapping("/preferences")
    @Operation(summary = "Get notification preferences")
    @ApiResponse(responseCode = "200", description = "Preferences retrieved successfully")
    public ResponseEntity<NotificationPreferencesResponse> getPreferences(Authentication authentication) {
        Long userId = getUserId(authentication);
        log.debug("GET /api/notifications/preferences - userId: {}", userId);

        NotificationPreferencesResponse response = notificationService.getPreferences(userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Update user's notification preferences.
     */
    @PutMapping("/preferences")
    @Operation(summary = "Update notification preferences")
    @ApiResponse(responseCode = "200", description = "Preferences updated successfully")
    public ResponseEntity<NotificationPreferencesResponse> updatePreferences(
            @Valid @RequestBody NotificationPreferencesRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("PUT /api/notifications/preferences - userId: {}", userId);

        NotificationPreferencesResponse response = notificationService.updatePreferences(userId, request);

        log.info("Notification preferences updated - userId: {}", userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Extract user ID from authentication.
     */
    private Long getUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }
}
