package com.meslektas.moderation.application.dto.request;

import com.meslektas.moderation.domain.model.ReportReason;
import com.meslektas.moderation.domain.model.ReportType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Request DTO for creating a content report.
 */
public record ReportRequest(
        @NotNull(message = "Content ID is required") UUID contentId,

        @NotNull(message = "Report type is required") ReportType type,

        @NotNull(message = "Report reason is required") ReportReason reason,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters") String description) {
    /**
     * Creates a report request with all fields.
     */
    public static ReportRequest of(UUID contentId, ReportType type, ReportReason reason, String description) {
        return new ReportRequest(contentId, type, reason, description);
    }

    /**
     * Creates a report request without description.
     */
    public static ReportRequest of(UUID contentId, ReportType type, ReportReason reason) {
        return new ReportRequest(contentId, type, reason, null);
    }
}
