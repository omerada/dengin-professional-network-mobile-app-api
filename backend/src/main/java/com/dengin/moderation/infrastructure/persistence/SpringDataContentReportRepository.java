package com.dengin.moderation.infrastructure.persistence;

import com.dengin.moderation.domain.model.ContentReport;
import com.dengin.moderation.domain.model.ReportStatus;
import com.dengin.moderation.domain.model.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for ContentReport.
 */
@Repository
public interface SpringDataContentReportRepository extends JpaRepository<ContentReport, UUID> {

    /**
     * Finds reports by content ID and type.
     */
    List<ContentReport> findByContentIdAndContentType(UUID contentId, ReportType contentType);

    /**
     * Counts reports by content ID and type.
     */
    int countByContentIdAndContentType(UUID contentId, ReportType contentType);

    /**
     * Checks if a report exists by reporter, content and type.
     */
    boolean existsByReporterIdAndContentIdAndContentType(Long reporterId, UUID contentId, ReportType contentType);

    /**
     * Finds reports by status.
     */
    List<ContentReport> findByStatus(ReportStatus status);

    /**
     * Finds pending reports ordered by risk level and creation date.
     */
    @Query("SELECT r FROM ContentReport r WHERE r.status = 'PENDING' " +
            "ORDER BY r.riskLevel DESC, r.createdAt ASC")
    List<ContentReport> findPendingReportsOrderedByPriority(Pageable pageable);

    /**
     * Finds reports by moderator ID.
     */
    List<ContentReport> findByModeratorIdAndStatus(Long moderatorId, ReportStatus status);

    /**
     * Finds reports by moderator ID without status filter.
     */
    List<ContentReport> findByModeratorId(Long moderatorId);

    /**
     * Finds reports within date range.
     */
    List<ContentReport> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Finds escalated reports.
     */
    @Query("SELECT r FROM ContentReport r WHERE r.status = 'ESCALATED' ORDER BY r.createdAt ASC")
    List<ContentReport> findEscalatedReports();

    /**
     * Finds reports by reported user.
     */
    List<ContentReport> findByContentOwnerId(Long contentOwnerId);

    /**
     * Finds reports by reporter.
     */
    List<ContentReport> findByReporterId(Long reporterId);

    /**
     * Counts pending reports.
     */
    @Query("SELECT COUNT(r) FROM ContentReport r WHERE r.status = 'PENDING'")
    int countPendingReports();

    /**
     * Counts reports by status.
     */
    int countByStatus(ReportStatus status);

    /**
     * Finds all reports with pagination.
     */
    Page<ContentReport> findAll(Pageable pageable);

    /**
     * Gets moderation queue statistics.
     */
    @Query("SELECT new map(" +
            "COUNT(r) as totalReports, " +
            "SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END) as pendingReports, " +
            "SUM(CASE WHEN r.status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as underReviewReports, " +
            "SUM(CASE WHEN r.status IN ('RESOLVED_APPROVED', 'RESOLVED_REJECTED') THEN 1 ELSE 0 END) as resolvedReports, "
            +
            "SUM(CASE WHEN r.status = 'ESCALATED' THEN 1 ELSE 0 END) as escalatedReports) " +
            "FROM ContentReport r")
    java.util.Map<String, Object> getStatisticsMap();

    /**
     * Gets average resolution time in hours using native query.
     */
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600) " +
            "FROM content_reports WHERE status IN ('RESOLVED_APPROVED', 'RESOLVED_REJECTED') AND reviewed_at IS NOT NULL",
            nativeQuery = true)
    Optional<Double> getAverageResolutionTimeHours();
}
