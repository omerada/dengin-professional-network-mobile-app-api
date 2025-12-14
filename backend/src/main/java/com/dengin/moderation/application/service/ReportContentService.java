package com.dengin.moderation.application.service;

import com.dengin.moderation.application.dto.request.ReportRequest;
import com.dengin.moderation.application.dto.response.ReportResponse;
import com.dengin.moderation.domain.model.ContentReport;
import com.dengin.moderation.domain.model.ReportReason;
import com.dengin.moderation.domain.model.ReportStatus;
import com.dengin.moderation.domain.model.ReportType;
import com.dengin.moderation.domain.repository.ContentReportRepository;
import com.dengin.common.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Application service for content reporting functionality.
 * Handles user-facing report operations.
 */
@Service
@Transactional
public class ReportContentService {

    private static final Logger log = LoggerFactory.getLogger(ReportContentService.class);

    private final ContentReportRepository reportRepository;

    public ReportContentService(ContentReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    /**
     * Creates a new content report.
     *
     * @param request        the report request
     * @param reporterId     the ID of the user making the report
     * @param contentOwnerId the ID of the user who owns the content
     * @param contentText    optional content text for automated scoring
     * @return the created report
     */
    public ReportResponse createReport(
            ReportRequest request,
            Long reporterId,
            Long contentOwnerId,
            String contentText) {

        log.info("Creating report: reporter={}, contentId={}, type={}, reason={}",
                reporterId, request.contentId(), request.type(), request.reason());

        // Check for duplicate report
        if (reportRepository.existsByReporterAndContent(
                reporterId, request.contentId(), request.type())) {
            throw new BusinessException("Bu i\u00e7eri\u011fi zaten bildirdiniz", "DUPLICATE_REPORT");
        }

        // Prevent self-reporting
        if (reporterId.equals(contentOwnerId)) {
            throw new BusinessException("Kendi i\u00e7eri\u011finizi bildiremezsiniz", "SELF_REPORT");
        }

        // Create the report
        ContentReport report = ContentReport.create(
                reporterId,
                request.type(),
                request.contentId(),
                contentOwnerId,
                request.reason(),
                request.description());

        // Check report count for auto-escalation
        int existingReportCount = reportRepository.countByContentIdAndType(
                request.contentId(), request.type());
        if (existingReportCount >= 4) { // Will be 5th report
            report.escalate();
            log.info("Report auto-escalated: contentId={}, reportCount={}",
                    request.contentId(), existingReportCount + 1);
        }

        ContentReport savedReport = reportRepository.save(report);
        log.info("Report created successfully: id={}", savedReport.getReportId().getValue());

        return ReportResponse.from(savedReport);
    }

    /**
     * Gets reports submitted by a user.
     *
     * @param userId the user ID
     * @return list of reports
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getMyReports(Long userId) {
        return reportRepository.findByReporterId(userId)
                .stream()
                .map(ReportResponse::summary)
                .collect(Collectors.toList());
    }

    /**
     * Gets a specific report by ID.
     *
     * @param reportId the report ID
     * @param userId   the requesting user's ID
     * @return the report
     */
    @Transactional(readOnly = true)
    public ReportResponse getReport(UUID reportId, Long userId) {
        ContentReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException("Bildirim bulunamad\u0131", "REPORT_NOT_FOUND"));

        // Only allow reporter or moderators to view
        if (!report.getReporterId().equals(userId)) {
            throw new BusinessException("Bu bildirimi g\u00f6r\u00fcnt\u00fcleme yetkiniz yok", "ACCESS_DENIED");
        }

        return ReportResponse.from(report);
    }

    /**
     * Cancels a report if it's still pending.
     *
     * @param reportId the report ID
     * @param userId   the requesting user's ID
     */
    public void cancelReport(UUID reportId, Long userId) {
        ContentReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException("Bildirim bulunamad\u0131", "REPORT_NOT_FOUND"));

        if (!report.getReporterId().equals(userId)) {
            throw new BusinessException("Bu bildirimi iptal etme yetkiniz yok", "ACCESS_DENIED");
        }

        // Can only cancel pending reports
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new BusinessException("Sadece bekleyen raporlar iptal edilebilir", "CANNOT_CANCEL");
        }

        // Delete or mark as cancelled
        reportRepository.deleteById(report.getReportId());
        log.info("Report cancelled: id={}, userId={}", reportId, userId);
    }

    /**
     * Gets the count of reports for a specific content.
     *
     * @param contentId the content ID
     * @param type      the content type
     * @return the report count
     */
    @Transactional(readOnly = true)
    public int getReportCount(UUID contentId, ReportType type) {
        return reportRepository.countByContentIdAndType(contentId, type);
    }

    /**
     * Checks if a user has already reported specific content.
     *
     * @param userId    the user ID
     * @param contentId the content ID
     * @param type      the content type
     * @return true if already reported
     */
    @Transactional(readOnly = true)
    public boolean hasReported(Long userId, UUID contentId, ReportType type) {
        return reportRepository.existsByReporterAndContent(userId, contentId, type);
    }

    // ==================== Automated Moderation ====================

    /**
     * System user ID used for automated reports.
     * This is a reserved ID that represents the moderation system.
     */
    private static final Long SYSTEM_USER_ID = 0L;

    /**
     * Creates an automated report from the moderation system.
     * Used when automated content analysis detects high-risk content.
     *
     * @param type        the content type
     * @param contentId   the content ID
     * @param reason      the detected violation reason
     * @param description details about the automated detection
     * @return the created report
     */
    public ReportResponse createAutomatedReport(
            ReportType type,
            UUID contentId,
            ReportReason reason,
            String description) {

        log.info("Creating automated report: contentId={}, type={}, reason={}",
                contentId, type, reason);

        // Check if already auto-reported
        if (reportRepository.existsByReporterAndContent(SYSTEM_USER_ID, contentId, type)) {
            log.debug("Automated report already exists for content: {}", contentId);
            return null; // Already flagged
        }

        // Create report from system
        ContentReport report = ContentReport.createAutomated(
                type,
                contentId,
                reason,
                description);

        // Auto-escalate automated reports (they need immediate attention)
        report.escalate();

        ContentReport savedReport = reportRepository.save(report);
        log.warn("Automated report created: id={}, contentId={}, reason={}",
                savedReport.getReportId().getValue(), contentId, reason);

        return ReportResponse.from(savedReport);
    }
}
