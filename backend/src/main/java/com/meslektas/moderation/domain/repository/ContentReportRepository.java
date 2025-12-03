package com.meslektas.moderation.domain.repository;

import com.meslektas.moderation.domain.model.ContentReport;
import com.meslektas.moderation.domain.model.ContentReportId;
import com.meslektas.moderation.domain.model.ReportStatus;
import com.meslektas.moderation.domain.model.ReportType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for ContentReport aggregate.
 * Follows DDD principles - domain-centric interface.
 */
public interface ContentReportRepository {

    /**
     * Saves a content report.
     *
     * @param report the report to save
     * @return the saved report
     */
    ContentReport save(ContentReport report);

    /**
     * Finds a report by its ID.
     *
     * @param id the report ID
     * @return the report if found
     */
    Optional<ContentReport> findById(ContentReportId id);

    /**
     * Finds a report by its UUID.
     *
     * @param id the UUID
     * @return the report if found
     */
    Optional<ContentReport> findById(UUID id);

    /**
     * Finds all reports for a specific content.
     *
     * @param contentId the content ID
     * @param type      the report type (POST, COMMENT, MESSAGE, USER)
     * @return list of reports
     */
    List<ContentReport> findByContentIdAndType(UUID contentId, ReportType type);

    /**
     * Counts reports for a specific content.
     *
     * @param contentId the content ID
     * @param type      the report type
     * @return the count
     */
    int countByContentIdAndType(UUID contentId, ReportType type);

    /**
     * Checks if a user has already reported specific content.
     *
     * @param reporterId the reporter's user ID
     * @param contentId  the content ID
     * @param type       the report type
     * @return true if already reported
     */
    boolean existsByReporterAndContent(Long reporterId, UUID contentId, ReportType type);

    /**
     * Finds all reports by status.
     *
     * @param status the report status
     * @return list of reports
     */
    List<ContentReport> findByStatus(ReportStatus status);

    /**
     * Finds pending reports ordered by priority and creation date.
     *
     * @param limit maximum number of reports to return
     * @return list of pending reports
     */
    List<ContentReport> findPendingReports(int limit);

    /**
     * Finds reports assigned to a specific moderator.
     *
     * @param moderatorId the moderator's user ID
     * @param status      optional status filter
     * @return list of reports
     */
    List<ContentReport> findByModeratorId(Long moderatorId, ReportStatus status);

    /**
     * Finds reports created within a date range.
     *
     * @param startDate the start date
     * @param endDate   the end date
     * @return list of reports
     */
    List<ContentReport> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Finds escalated reports.
     *
     * @return list of escalated reports
     */
    List<ContentReport> findEscalatedReports();

    /**
     * Finds reports by content owner (reported user).
     *
     * @param contentOwnerId the content owner's user ID
     * @return list of reports against this user
     */
    List<ContentReport> findByContentOwnerId(Long contentOwnerId);

    /**
     * Finds reports submitted by a user.
     *
     * @param reporterId the reporter's user ID
     * @return list of reports submitted by this user
     */
    List<ContentReport> findByReporterId(Long reporterId);

    /**
     * Counts pending reports.
     *
     * @return count of pending reports
     */
    int countPendingReports();

    /**
     * Counts reports by status.
     *
     * @param status the status
     * @return count
     */
    int countByStatus(ReportStatus status);

    /**
     * Deletes a report (soft delete recommended).
     *
     * @param id the report ID
     */
    void deleteById(ContentReportId id);

    /**
     * Finds all reports with pagination.
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @return list of reports
     */
    List<ContentReport> findAll(int page, int size);

    /**
     * Gets moderation queue statistics.
     *
     * @return statistics including counts by status, average resolution time, etc.
     */
    ModerationStatistics getStatistics();

    /**
     * Statistics record for moderation queue.
     */
    record ModerationStatistics(
            int totalReports,
            int pendingReports,
            int underReviewReports,
            int resolvedReports,
            int escalatedReports,
            double averageResolutionTimeHours) {
    }
}
