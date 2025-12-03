package com.meslektas.moderation.infrastructure.persistence;

import com.meslektas.moderation.domain.model.ContentReport;
import com.meslektas.moderation.domain.model.ContentReportId;
import com.meslektas.moderation.domain.model.ReportStatus;
import com.meslektas.moderation.domain.model.ReportType;
import com.meslektas.moderation.domain.repository.ContentReportRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA implementation of ContentReportRepository.
 * Acts as an adapter between domain and Spring Data.
 */
@Repository
@Transactional
public class JpaContentReportRepository implements ContentReportRepository {

    private final SpringDataContentReportRepository springDataRepository;
    private final ApplicationEventPublisher eventPublisher;

    public JpaContentReportRepository(
            SpringDataContentReportRepository springDataRepository,
            ApplicationEventPublisher eventPublisher) {
        this.springDataRepository = springDataRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public ContentReport save(ContentReport report) {
        ContentReport saved = springDataRepository.save(report);

        // Publish domain events
        saved.getEvents().forEach(eventPublisher::publishEvent);
        saved.clearEvents();

        return saved;
    }

    @Override
    public Optional<ContentReport> findById(ContentReportId id) {
        return springDataRepository.findById(id.getValue());
    }

    @Override
    public Optional<ContentReport> findById(UUID id) {
        return springDataRepository.findById(id);
    }

    @Override
    public List<ContentReport> findByContentIdAndType(UUID contentId, ReportType type) {
        return springDataRepository.findByContentIdAndContentType(contentId, type);
    }

    @Override
    public int countByContentIdAndType(UUID contentId, ReportType type) {
        return springDataRepository.countByContentIdAndContentType(contentId, type);
    }

    @Override
    public boolean existsByReporterAndContent(Long reporterId, UUID contentId, ReportType type) {
        return springDataRepository.existsByReporterIdAndContentIdAndContentType(reporterId, contentId, type);
    }

    @Override
    public List<ContentReport> findByStatus(ReportStatus status) {
        return springDataRepository.findByStatus(status);
    }

    @Override
    public List<ContentReport> findPendingReports(int limit) {
        return springDataRepository.findPendingReportsOrderedByPriority(PageRequest.of(0, limit));
    }

    @Override
    public List<ContentReport> findByModeratorId(Long moderatorId, ReportStatus status) {
        if (status != null) {
            return springDataRepository.findByModeratorIdAndStatus(moderatorId, status);
        }
        return springDataRepository.findByModeratorId(moderatorId);
    }

    @Override
    public List<ContentReport> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return springDataRepository.findByCreatedAtBetween(startDate, endDate);
    }

    @Override
    public List<ContentReport> findEscalatedReports() {
        return springDataRepository.findEscalatedReports();
    }

    @Override
    public List<ContentReport> findByContentOwnerId(Long contentOwnerId) {
        return springDataRepository.findByContentOwnerId(contentOwnerId);
    }

    @Override
    public List<ContentReport> findByReporterId(Long reporterId) {
        return springDataRepository.findByReporterId(reporterId);
    }

    @Override
    public int countPendingReports() {
        return springDataRepository.countPendingReports();
    }

    @Override
    public int countByStatus(ReportStatus status) {
        return springDataRepository.countByStatus(status);
    }

    @Override
    public void deleteById(ContentReportId id) {
        springDataRepository.deleteById(id.getValue());
    }

    @Override
    public List<ContentReport> findAll(int page, int size) {
        return springDataRepository.findAll(PageRequest.of(page, size)).getContent();
    }

    @Override
    public ModerationStatistics getStatistics() {
        Map<String, Object> stats = springDataRepository.getStatisticsMap();
        Double avgResolutionTime = springDataRepository.getAverageResolutionTimeHours().orElse(0.0);

        return new ModerationStatistics(
                ((Number) stats.getOrDefault("totalReports", 0)).intValue(),
                ((Number) stats.getOrDefault("pendingReports", 0)).intValue(),
                ((Number) stats.getOrDefault("underReviewReports", 0)).intValue(),
                ((Number) stats.getOrDefault("resolvedReports", 0)).intValue(),
                ((Number) stats.getOrDefault("escalatedReports", 0)).intValue(),
                avgResolutionTime);
    }
}
