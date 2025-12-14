package com.dengin.moderation.application.dto.response;

import com.dengin.moderation.domain.model.ContentReport;
import com.dengin.moderation.domain.model.ModerationDecision;
import com.dengin.moderation.domain.model.ReportReason;
import com.dengin.moderation.domain.model.ReportStatus;
import com.dengin.moderation.domain.model.ReportType;
import com.dengin.moderation.domain.model.RiskLevel;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for content report details.
 */
public record ReportResponse(
        UUID id,
        Long reporterId,
        Long contentOwnerId,
        UUID contentId,
        ReportType contentType,
        ReportReason reason,
        String description,
        ReportStatus status,
        RiskLevel riskLevel,
        Long moderatorId,
        String moderatorNotes,
        ModerationDecision decision,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt,
        LocalDateTime escalatedAt) {
    /**
     * Creates a response from a domain entity.
     */
    public static ReportResponse from(ContentReport report) {
        return new ReportResponse(
                report.getReportId().getValue(),
                report.getReporterId(),
                report.getContentOwnerId(),
                report.getContentId(),
                report.getContentType(),
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getRiskLevel(),
                report.getModeratorId(),
                report.getModeratorNotes(),
                report.getDecision(),
                report.getCreatedAt(),
                report.getReviewedAt(),
                report.getEscalatedAt());
    }

    /**
     * Creates a summary response (for list views).
     */
    public static ReportResponse summary(ContentReport report) {
        return new ReportResponse(
                report.getReportId().getValue(),
                report.getReporterId(),
                report.getContentOwnerId(),
                report.getContentId(),
                report.getContentType(),
                report.getReason(),
                null, // omit description in summary
                report.getStatus(),
                report.getRiskLevel(),
                report.getModeratorId(),
                null, // omit notes in summary
                report.getDecision(),
                report.getCreatedAt(),
                report.getReviewedAt(),
                report.getEscalatedAt());
    }
}
