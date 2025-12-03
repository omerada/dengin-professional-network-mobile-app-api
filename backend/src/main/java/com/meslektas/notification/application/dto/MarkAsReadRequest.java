package com.meslektas.notification.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for marking notifications as read.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkAsReadRequest {

    /**
     * List of notification IDs to mark as read.
     * If null or empty, all notifications will be marked as read.
     */
    private List<UUID> notificationIds;

    /**
     * Whether to mark all notifications as read.
     */
    private boolean markAll;
}
