package com.meslektas.notification.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for paginated notification list.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationListResponse {

    /**
     * List of notifications for current page.
     */
    private List<NotificationResponse> notifications;

    /**
     * Total count of unread notifications.
     */
    private long unreadCount;

    /**
     * Unread count grouped by notification type.
     */
    private Map<String, Long> unreadByType;

    /**
     * Current page number (0-indexed).
     */
    private int currentPage;

    /**
     * Page size.
     */
    private int pageSize;

    /**
     * Total number of pages.
     */
    private int totalPages;

    /**
     * Total number of notifications.
     */
    private long totalElements;

    /**
     * Whether there are more pages.
     */
    private boolean hasMore;

    /**
     * Whether this is the first page.
     */
    private boolean first;

    /**
     * Whether this is the last page.
     */
    private boolean last;
}
