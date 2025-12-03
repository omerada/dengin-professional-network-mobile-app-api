package com.meslektas.moderation.application.service;

import com.meslektas.moderation.application.dto.request.ProcessAppealRequest;
import com.meslektas.moderation.application.dto.request.ReviewRequest;
import com.meslektas.moderation.application.dto.response.ModerationQueueResponse;
import com.meslektas.moderation.application.dto.response.ModerationStatsResponse;
import com.meslektas.moderation.application.dto.response.ReportResponse;
import com.meslektas.moderation.application.dto.response.SanctionResponse;
import com.meslektas.moderation.domain.model.ContentReport;
import com.meslektas.moderation.domain.model.UserSanction;
import com.meslektas.moderation.domain.model.ModerationDecision;
import com.meslektas.moderation.domain.model.ReportReason;
import com.meslektas.moderation.domain.model.ReportStatus;
import com.meslektas.moderation.domain.model.SanctionType;
import com.meslektas.moderation.domain.repository.ContentReportRepository;
import com.meslektas.moderation.domain.repository.UserSanctionRepository;
import com.meslektas.common.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Application service for moderation operations.
 * Handles moderator/admin-facing moderation functionality.
 */
@Service
@Transactional
public class ModerationService {

    private static final Logger log = LoggerFactory.getLogger(ModerationService.class);

    private final ContentReportRepository reportRepository;
    private final UserSanctionRepository sanctionRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ModerationService(
            ContentReportRepository reportRepository,
            UserSanctionRepository sanctionRepository,
            ApplicationEventPublisher eventPublisher) {
        this.reportRepository = reportRepository;
        this.sanctionRepository = sanctionRepository;
        this.eventPublisher = eventPublisher;
    }

    // ================== Report Management ==================

    /**
     * Gets the moderation queue with pending and escalated reports.
     *
     * @param limit maximum number of reports to return
     * @return list of queue items
     */
    @Transactional(readOnly = true)
    public List<ModerationQueueResponse> getQueue(int limit) {
        List<ContentReport> pendingReports = reportRepository.findPendingReports(limit);

        return pendingReports.stream()
                .map(report -> {
                    int totalReports = reportRepository.countByContentIdAndType(
                            report.getContentId(), report.getContentType());
                    return ModerationQueueResponse.simple(report, totalReports);
                })
                .collect(Collectors.toList());
    }

    /**
     * Gets escalated reports requiring urgent attention.
     *
     * @return list of escalated reports
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getEscalatedReports() {
        return reportRepository.findEscalatedReports()
                .stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Gets reports assigned to a specific moderator.
     *
     * @param moderatorId the moderator's ID
     * @param status      optional status filter
     * @return list of assigned reports
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getAssignedReports(Long moderatorId, ReportStatus status) {
        return reportRepository.findByModeratorId(moderatorId, status)
                .stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Assigns a report to a moderator.
     *
     * @param reportId    the report ID
     * @param moderatorId the moderator's ID
     * @return the updated report
     */
    public ReportResponse assignReport(UUID reportId, Long moderatorId) {
        ContentReport report = findReportOrThrow(reportId);
        report.startReview(moderatorId);

        ContentReport saved = reportRepository.save(report);
        log.info("Report assigned: reportId={}, moderatorId={}", reportId, moderatorId);

        return ReportResponse.from(saved);
    }

    /**
     * Reviews and takes action on a report.
     *
     * @param request     the review request
     * @param moderatorId the moderator's ID
     * @return the updated report
     */
    public ReportResponse reviewReport(ReviewRequest request, Long moderatorId) {
        request.validate();

        ContentReport report = findReportOrThrow(request.reportId());

        // Ensure report is assigned to this moderator
        if (report.getModeratorId() == null) {
            report.startReview(moderatorId);
        } else if (!report.getModeratorId().equals(moderatorId)) {
            throw new BusinessException(
                    "Bu rapor size atanmamış",
                    "NOT_ASSIGNED");
        }

        // Review the report
        report.review(moderatorId, request.decision(), request.notes());
        ContentReport savedReport = reportRepository.save(report);

        // Apply sanction if needed - handled by domain events
        log.info("Report reviewed: reportId={}, decision={}, moderatorId={}",
                request.reportId(), request.decision(), moderatorId);

        return ReportResponse.from(savedReport);
    }

    /**
     * Escalates a report for senior review.
     *
     * @param reportId    the report ID
     * @param moderatorId the moderator's ID
     * @return the updated report
     */
    public ReportResponse escalateReport(UUID reportId, Long moderatorId) {
        ContentReport report = findReportOrThrow(reportId);
        report.escalate();

        ContentReport saved = reportRepository.save(report);
        log.info("Report escalated: reportId={}, by={}", reportId, moderatorId);

        return ReportResponse.from(saved);
    }

    /**
     * Dismisses a report as invalid.
     *
     * @param reportId    the report ID
     * @param moderatorId the moderator's ID
     * @param reason      the reason for dismissal
     * @return the updated report
     */
    public ReportResponse dismissReport(UUID reportId, Long moderatorId, String reason) {
        ContentReport report = findReportOrThrow(reportId);
        report.dismiss(moderatorId, reason);

        ContentReport saved = reportRepository.save(report);
        log.info("Report dismissed: reportId={}, by={}, reason={}", reportId, moderatorId, reason);

        return ReportResponse.from(saved);
    }

    /**
     * Gets a report by ID.
     *
     * @param reportId the report ID
     * @return the report
     */
    @Transactional(readOnly = true)
    public ReportResponse getReport(UUID reportId) {
        ContentReport report = findReportOrThrow(reportId);
        return ReportResponse.from(report);
    }

    // ================== Sanction Management ==================

    /**
     * Gets all sanctions for a user.
     *
     * @param userId the user ID
     * @return list of sanctions
     */
    @Transactional(readOnly = true)
    public List<SanctionResponse> getUserSanctions(Long userId) {
        return sanctionRepository.findByUserId(userId)
                .stream()
                .map(SanctionResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Gets active sanctions for a user.
     *
     * @param userId the user ID
     * @return list of active sanctions
     */
    @Transactional(readOnly = true)
    public List<SanctionResponse> getActiveSanctions(Long userId) {
        return sanctionRepository.findActiveByUserId(userId)
                .stream()
                .map(SanctionResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Checks if a user has any active sanction.
     *
     * @param userId the user ID
     * @return true if sanctioned
     */
    @Transactional(readOnly = true)
    public boolean isUserSanctioned(Long userId) {
        return sanctionRepository.hasActiveSanction(userId);
    }

    /**
     * Gets pending appeals.
     *
     * @return list of sanctions with pending appeals
     */
    @Transactional(readOnly = true)
    public List<SanctionResponse> getPendingAppeals() {
        return sanctionRepository.findPendingAppeals()
                .stream()
                .map(SanctionResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Processes an appeal by lifting or maintaining the sanction.
     *
     * @param request     the appeal processing request
     * @param moderatorId the moderator's ID
     * @return the updated sanction
     */
    public SanctionResponse processAppeal(ProcessAppealRequest request, Long moderatorId) {
        UserSanction sanction = findSanctionOrThrow(request.sanctionId());

        if (request.approved()) {
            sanction.lift(moderatorId, request.notes());
        }

        UserSanction saved = sanctionRepository.save(sanction);

        log.info("Appeal processed: sanctionId={}, approved={}, by={}",
                request.sanctionId(), request.approved(), moderatorId);

        return SanctionResponse.from(saved);
    }

    /**
     * Revokes a sanction.
     *
     * @param sanctionId  the sanction ID
     * @param moderatorId the moderator's ID
     * @param reason      the reason for revocation
     */
    public void revokeSanction(UUID sanctionId, Long moderatorId, String reason) {
        UserSanction sanction = findSanctionOrThrow(sanctionId);

        sanction.lift(moderatorId, "Revoked: " + reason);
        sanctionRepository.save(sanction);

        log.info("Sanction revoked: sanctionId={}, by={}, reason={}",
                sanctionId, moderatorId, reason);
    }

    /**
     * Applies a sanction to a user.
     *
     * @param userId       the user ID
     * @param sanctionType the type of sanction
     * @param reason       the reason for sanction
     * @param reportId     optional related report ID
     * @param moderatorId  the moderator applying the sanction
     * @param notes        additional notes
     * @return the created sanction
     */
    public SanctionResponse applySanction(
            Long userId,
            SanctionType sanctionType,
            ReportReason reason,
            UUID reportId,
            Long moderatorId,
            String notes) {

        // Check for escalation based on previous sanctions
        int previousSanctionCount = sanctionRepository.countByUserId(userId);
        SanctionType effectiveType = sanctionType;

        // Auto-escalate if user has multiple previous sanctions
        if (sanctionType == SanctionType.WARNING && previousSanctionCount >= 2) {
            effectiveType = SanctionType.SUSPENSION_7_DAYS;
            log.info("Sanction auto-escalated to SUSPENSION for repeat offender: userId={}", userId);
        } else if (sanctionType.isSuspension() &&
                sanctionRepository.countByUserIdAndType(userId, SanctionType.SUSPENSION_7_DAYS) +
                        sanctionRepository.countByUserIdAndType(userId, SanctionType.SUSPENSION_30_DAYS) >= 2) {
            effectiveType = SanctionType.PERMANENT_BAN;
            log.info("Sanction auto-escalated to BAN for repeat offender: userId={}", userId);
        }

        UserSanction sanction = UserSanction.apply(
                userId,
                effectiveType,
                reason,
                reportId,
                moderatorId,
                notes);

        UserSanction saved = sanctionRepository.save(sanction);
        log.info("Sanction applied: userId={}, type={}", userId, effectiveType);

        return SanctionResponse.from(saved);
    }

    // ================== Statistics ==================

    /**
     * Gets moderation statistics for the dashboard.
     *
     * @return moderation statistics
     */
    @Transactional(readOnly = true)
    public ModerationStatsResponse getStatistics() {
        var reportStats = reportRepository.getStatistics();
        var sanctionStats = sanctionRepository.getStatistics();

        return ModerationStatsResponse.from(reportStats, sanctionStats);
    }

    /**
     * Gets reports within a date range.
     *
     * @param startDate start date
     * @param endDate   end date
     * @return list of reports
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getReportsByDateRange(
            LocalDateTime startDate, LocalDateTime endDate) {
        return reportRepository.findByDateRange(startDate, endDate)
                .stream()
                .map(ReportResponse::summary)
                .collect(Collectors.toList());
    }

    /**
     * Gets reports against a specific user.
     *
     * @param userId the user ID (content owner)
     * @return list of reports
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getReportsAgainstUser(Long userId) {
        return reportRepository.findByContentOwnerId(userId)
                .stream()
                .map(ReportResponse::summary)
                .collect(Collectors.toList());
    }

    // ================== Private Methods ==================

    private ContentReport findReportOrThrow(UUID reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException("Rapor bulunamad\u0131", "REPORT_NOT_FOUND"));
    }

    private UserSanction findSanctionOrThrow(UUID sanctionId) {
        return sanctionRepository.findById(sanctionId)
                .orElseThrow(() -> new BusinessException("Yapt\u0131r\u0131m bulunamad\u0131", "SANCTION_NOT_FOUND"));
    }
}
