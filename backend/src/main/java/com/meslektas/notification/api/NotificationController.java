package com.meslektas.notification.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import com.meslektas.notification.application.dto.*;
import com.meslektas.notification.application.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notifications retrieved successfully")
    public ResponseEntity<ApiResponse<NotificationListResponse>> getNotifications(
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

        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", response));
    }

    /**
     * Get single notification by ID.
     */
    @GetMapping("/{notificationId}")
    @Operation(summary = "Get notification by ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification retrieved successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotification(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("GET /api/notifications/{} - userId: {}", notificationId, userId);

        NotificationResponse response = notificationService.getNotification(notificationId, userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get unread notification count.
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unread count retrieved successfully")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(Authentication authentication) {
        Long userId = getUserId(authentication);
        log.debug("GET /api/notifications/unread-count - userId: {}", userId);

        long count = notificationService.getUnreadCount(userId);

        return ResponseEntity.ok(ApiResponse.success(new UnreadCountResponse(count)));
    }

    /**
     * DTO for unread count response.
     */
    public record UnreadCountResponse(long unreadCount) {}

    /**
     * Mark single notification as read.
     */
    @PostMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification marked as read")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("POST /api/notifications/{}/read - userId: {}", notificationId, userId);

        NotificationResponse response = notificationService.markAsRead(notificationId, userId);

        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", response));
    }

    /**
     * Mark multiple notifications as read.
     */
    @PostMapping("/mark-as-read")
    @Operation(summary = "Mark multiple notifications as read")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notifications marked as read")
    public ResponseEntity<ApiResponse<MarkAsReadResponse>> markAsRead(
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

        return ResponseEntity.ok(ApiResponse.success("Notifications marked as read", new MarkAsReadResponse(count)));
    }

    /**
     * DTO for mark as read response.
     */
    public record MarkAsReadResponse(int markedAsRead) {}

    /**
     * Get user's notification preferences.
     */
    @GetMapping("/preferences")
    @Operation(summary = "Get notification preferences")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Preferences retrieved successfully")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> getPreferences(Authentication authentication) {
        Long userId = getUserId(authentication);
        log.debug("GET /api/notifications/preferences - userId: {}", userId);

        NotificationPreferencesResponse response = notificationService.getPreferences(userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update user's notification preferences.
     */
    @PutMapping("/preferences")
    @Operation(summary = "Update notification preferences")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Preferences updated successfully")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> updatePreferences(
            @Valid @RequestBody NotificationPreferencesRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        log.info("PUT /api/notifications/preferences - userId: {}", userId);

        NotificationPreferencesResponse response = notificationService.updatePreferences(userId, request);

        log.info("Notification preferences updated - userId: {}", userId);

        return ResponseEntity.ok(ApiResponse.success("Preferences updated successfully", response));
    }

    /**
     * Extract user ID from authentication.
     */
    private Long getUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl userDetails) {
            return userDetails.getId();
        }
        throw new IllegalStateException("Kullanıcı ID'si bulunamadı");
    }
}
