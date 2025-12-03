package com.meslektas.moderation.domain.model;

import com.meslektas.common.domain.AggregateRoot;
import com.meslektas.moderation.domain.event.ContentReportedEvent;
import com.meslektas.moderation.domain.event.ContentReviewedEvent;
import com.meslektas.moderation.domain.event.ContentRemovedEvent;
import com.meslektas.moderation.domain.event.UserSanctionedEvent;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ContentReport Aggregate Root
 *
 * Represents a report submitted by a user about inappropriate content.
 *
 * Business Rules:
 * - Users can report content once (no duplicate reports)
 * - Auto-escalate if 5+ reports on same content
 * - Verified moderators can review reports
 * - Sanctions escalate: Warning → 7-day suspension → Permanent ban
 * - Content removed if moderator decision is to remove
 */
@Entity
@Table(name = "content_reports", indexes = {
        @Index(name = "idx_reports_content", columnList = "content_id, content_type"),
        @Index(name = "idx_reports_reporter", columnList = "reporter_id"),
        @Index(name = "idx_reports_status", columnList = "status"),
        @Index(name = "idx_reports_created", columnList = "created_at DESC")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentReport extends AggregateRoot {

    private static final int AUTO_ESCALATE_THRESHOLD = 5;

    @Column(name = "report_uuid", nullable = false, unique = true)
    private UUID reportUUID;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ReportType contentType;

    @Column(name = "content_id", nullable = false)
    private UUID contentId;

    @Column(name = "content_owner_id")
    private Long contentOwnerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private ReportReason reason;

    @Column(name = "description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Column(name = "moderator_id")
    private Long moderatorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision")
    private ModerationDecision decision;

    @Column(name = "moderator_notes", length = 1000)
    private String moderatorNotes;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ==================== Factory Methods ====================

    /**
     * Create a new content report.
     */
    public static ContentReport create(
            Long reporterId,
            ReportType contentType,
            UUID contentId,
            Long contentOwnerId,
            ReportReason reason,
            String description) {
        validateReporter(reporterId);
        validateContent(contentType, contentId);
        validateReason(reason);

        ContentReport report = new ContentReport();
        report.reportUUID = UUID.randomUUID();
        report.reporterId = reporterId;
        report.contentType = contentType;
        report.contentId = contentId;
        report.contentOwnerId = contentOwnerId;
        report.reason = reason;
        report.description = description;
        report.status = ReportStatus.PENDING;
        report.riskLevel = reason.isHighPriority() ? RiskLevel.HIGH : RiskLevel.MEDIUM;
        report.createdAt = LocalDateTime.now();
        report.updatedAt = report.createdAt;

        report.registerEvent(new ContentReportedEvent(
                ContentReportId.of(report.reportUUID),
                report.reporterId,
                report.contentType,
                report.contentId,
                report.reason));

        return report;
    }

    /**
     * System user ID for automated reports.
     */
    private static final Long SYSTEM_REPORTER_ID = 0L;

    /**
     * Create an automated content report from the moderation system.
     * Used when automated content analysis detects high-risk content.
     */
    public static ContentReport createAutomated(
            ReportType contentType,
            UUID contentId,
            ReportReason reason,
            String description) {
        validateContent(contentType, contentId);
        validateReason(reason);

        ContentReport report = new ContentReport();
        report.reportUUID = UUID.randomUUID();
        report.reporterId = SYSTEM_REPORTER_ID; // System reporter
        report.contentType = contentType;
        report.contentId = contentId;
        report.contentOwnerId = null; // Will be resolved by moderator
        report.reason = reason;
        report.description = "[Otomatik Tespit] " + description;
        report.status = ReportStatus.PENDING;
        report.riskLevel = RiskLevel.HIGH; // Automated flags are always high priority
        report.createdAt = LocalDateTime.now();
        report.updatedAt = report.createdAt;

        report.registerEvent(new ContentReportedEvent(
                ContentReportId.of(report.reportUUID),
                report.reporterId,
                report.contentType,
                report.contentId,
                report.reason));

        return report;
    }

    // ==================== Domain Methods ====================

    /**
     * Start reviewing this report.
     */
    public void startReview(Long moderatorId) {
        validateCanBeReviewed();

        if (moderatorId == null) {
            throw new IllegalArgumentException("Moderator ID cannot be null");
        }

        this.moderatorId = moderatorId;
        this.status = ReportStatus.UNDER_REVIEW;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Escalate this report to senior moderators.
     */
    public void escalate() {
        if (status.isFinal()) {
            throw new IllegalStateException("Cannot escalate resolved report");
        }

        this.status = ReportStatus.ESCALATED;
        this.escalatedAt = LocalDateTime.now();
        this.updatedAt = this.escalatedAt;
    }

    /**
     * Review and make a decision on this report.
     */
    public void review(
            Long moderatorId,
            ModerationDecision decision,
            String notes) {
        validateCanBeReviewed();

        if (moderatorId == null) {
            throw new IllegalArgumentException("Moderator ID cannot be null");
        }
        if (decision == null) {
            throw new IllegalArgumentException("Decision cannot be null");
        }

        this.moderatorId = moderatorId;
        this.decision = decision;
        this.moderatorNotes = notes;
        this.reviewedAt = LocalDateTime.now();
        this.updatedAt = this.reviewedAt;

        if (decision == ModerationDecision.APPROVE_CONTENT) {
            this.status = ReportStatus.RESOLVED_APPROVED;
        } else {
            this.status = ReportStatus.RESOLVED_REJECTED;
        }

        // Register reviewed event
        registerEvent(new ContentReviewedEvent(
                ContentReportId.of(this.reportUUID),
                moderatorId,
                this.contentType,
                this.contentId,
                decision));

        // Register content removed event if applicable
        if (decision.removesContent()) {
            registerEvent(new ContentRemovedEvent(
                    this.contentType,
                    this.contentId,
                    this.contentOwnerId,
                    this.reason,
                    moderatorId));
        }

        // Register sanction event if applicable
        if (decision.sanctionsUser() && contentOwnerId != null) {
            registerEvent(new UserSanctionedEvent(
                    contentOwnerId,
                    decision.getSanctionType(),
                    reason,
                    reportUUID,
                    moderatorId));
        }
    }

    /**
     * Dismiss this report as invalid.
     */
    public void dismiss(Long moderatorId, String reason) {
        validateCanBeReviewed();

        this.moderatorId = moderatorId;
        this.decision = ModerationDecision.APPROVE_CONTENT;
        this.moderatorNotes = reason;
        this.status = ReportStatus.DISMISSED;
        this.reviewedAt = LocalDateTime.now();
        this.updatedAt = this.reviewedAt;
    }

    /**
     * Set the risk level based on automated assessment.
     */
    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
        this.updatedAt = LocalDateTime.now();

        if (riskLevel == RiskLevel.HIGH) {
            escalate();
        }
    }

    // ==================== Query Methods ====================

    /**
     * Check if report is pending review.
     */
    public boolean isPending() {
        return status.isPending();
    }

    /**
     * Check if report is resolved.
     */
    public boolean isResolved() {
        return status.isFinal();
    }

    /**
     * Check if report is high priority.
     */
    public boolean isHighPriority() {
        return riskLevel == RiskLevel.HIGH || reason.isHighPriority();
    }

    /**
     * Get the report UUID.
     */
    public UUID getReportUUID() {
        return reportUUID;
    }
    
    /**
     * Get ContentReportId value object
     */
    public ContentReportId getReportId() {
        return ContentReportId.of(reportUUID);
    }

    /**
     * Get age in hours.
     */
    public long getAgeInHours() {
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toHours();
    }

    /**
     * Calculate priority score for queue ordering.
     * Higher score = higher priority.
     */
    public int calculatePriorityScore() {
        int score = 0;

        // Risk level component
        score += switch (riskLevel) {
            case HIGH -> 50;
            case MEDIUM -> 30;
            case LOW -> 10;
        };

        // High priority reason bonus
        if (reason.isHighPriority()) {
            score += 20;
        }

        // Age bonus (older reports get higher priority)
        score += (int) Math.min(getAgeInHours() * 2, 30);

        // Escalated bonus
        if (status == ReportStatus.ESCALATED) {
            score += 25;
        }

        return score;
    }

    // ==================== Validation ====================

    private static void validateReporter(Long reporterId) {
        if (reporterId == null) {
            throw new IllegalArgumentException("Reporter ID cannot be null");
        }
    }

    private static void validateContent(ReportType contentType, UUID contentId) {
        if (contentType == null) {
            throw new IllegalArgumentException("Content type cannot be null");
        }
        if (contentId == null) {
            throw new IllegalArgumentException("Content ID cannot be null");
        }
    }

    private static void validateReason(ReportReason reason) {
        if (reason == null) {
            throw new IllegalArgumentException("Report reason cannot be null");
        }
    }

    private void validateCanBeReviewed() {
        if (!status.canBeReviewed()) {
            throw new IllegalStateException("Report cannot be reviewed in current status: " + status);
        }
    }
}
