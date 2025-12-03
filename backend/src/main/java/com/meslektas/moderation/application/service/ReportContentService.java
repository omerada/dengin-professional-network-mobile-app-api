package com.meslektas.moderation.application.service;

import com.meslektas.moderation.application.dto.request.ReportRequest;
import com.meslektas.moderation.application.dto.response.ReportResponse;
import com.meslektas.moderation.domain.model.ContentReport;
import com.meslektas.moderation.domain.model.ReportType;
import com.meslektas.moderation.domain.repository.ContentReportRepository;
import com.meslektas.moderation.domain.service.AutomatedModerationService;
import com.meslektas.moderation.domain.model.ModerationScore;
import com.meslektas.shared.exception.BusinessException;
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
    private final AutomatedModerationService automatedModerationService;

    public ReportContentService(
            ContentReportRepository reportRepository,
            AutomatedModerationService automatedModerationService) {
        this.reportRepository = reportRepository;
        this.automatedModerationService = automatedModerationService;
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
            throw new BusinessException("DUPLICATE_REPORT",
                    "Bu içeriği zaten bildirdiniz");
        }

        // Prevent self-reporting
        if (reporterId.equals(contentOwnerId)) {
            throw new BusinessException("SELF_REPORT",
                    "Kendi içeriğinizi bildiremezsiniz");
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
                .orElseThrow(() -> new BusinessException("REPORT_NOT_FOUND",
                        "Bildirim bulunamadı"));

        // Only allow reporter or moderators to view
        if (!report.getReporterId().equals(userId)) {
            throw new BusinessException("ACCESS_DENIED",
                    "Bu bildirimi görüntüleme yetkiniz yok");
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
                .orElseThrow(() -> new BusinessException("REPORT_NOT_FOUND",
                        "Bildirim bulunamadı"));

        if (!report.getReporterId().equals(userId)) {
            throw new BusinessException("ACCESS_DENIED",
                    "Bu bildirimi iptal etme yetkiniz yok");
        }

        // Can only cancel pending reports
        if (report.getStatus() != com.meslektas.moderation.domain.model.ReportStatus.PENDING) {
            throw new BusinessException("CANNOT_CANCEL",
                    "Sadece bekleyen raporlar iptal edilebilir");
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
}
