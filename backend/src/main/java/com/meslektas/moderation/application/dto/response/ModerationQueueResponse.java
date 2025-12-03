package com.meslektas.moderation.application.dto.response;

import com.meslektas.moderation.domain.model.ContentReport;
import com.meslektas.moderation.domain.model.ReportReason;
import com.meslektas.moderation.domain.model.ReportStatus;
import com.meslektas.moderation.domain.model.ReportType;
import com.meslektas.moderation.domain.model.RiskLevel;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for moderation queue item.
 */
public record ModerationQueueResponse(
        UUID id,
        Long reporterId,
        String reporterEmail,
        Long contentOwnerId,
        String contentOwnerEmail,
        UUID contentId,
        ReportType contentType,
        ReportReason reason,
        String description,
        ReportStatus status,
        RiskLevel riskLevel,
        int totalReportsOnContent,
        LocalDateTime createdAt,
        Long moderatorId,
        LocalDateTime escalatedAt) {
    /**
     * Creates a queue response from a domain entity.
     */
    public static ModerationQueueResponse from(
            ContentReport report,
            String reporterEmail,
            String contentOwnerEmail,
            int totalReportsOnContent) {
        return new ModerationQueueResponse(
                report.getReportId().getValue(),
                report.getReporterId(),
                reporterEmail,
                report.getContentOwnerId(),
                contentOwnerEmail,
                report.getContentId(),
                report.getContentType(),
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getRiskLevel(),
                totalReportsOnContent,
                report.getCreatedAt(),
                report.getModeratorId(),
                report.getEscalatedAt());
    }

    /**
     * Creates a simple queue response (without user emails).
     */
    public static ModerationQueueResponse simple(ContentReport report, int totalReportsOnContent) {
        return from(report, null, null, totalReportsOnContent);
    }

    /**
     * Pagination wrapper for queue responses.
     */
    public record Page(
            List<ModerationQueueResponse> items,
            int page,
            int size,
            long totalItems,
            int totalPages) {
        public static Page of(List<ModerationQueueResponse> items, int page, int size, long totalItems) {
            int totalPages = (int) Math.ceil((double) totalItems / size);
            return new Page(items, page, size, totalItems, totalPages);
        }
    }
}
