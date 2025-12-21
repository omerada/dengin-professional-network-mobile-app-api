package com.dengin.moderation.application.dto.response;

import com.dengin.moderation.domain.repository.ContentReportRepository.ModerationStatistics;
import com.dengin.moderation.domain.repository.UserSanctionRepository.SanctionStatistics;

/**
 * Response DTO for moderation statistics/dashboard.
 */
public record ModerationStatsResponse(
        // Report Statistics
        int totalReports,
        int pendingReports,
        int underReviewReports,
        int resolvedReports,
        int escalatedReports,
        double averageResolutionTimeHours,

        // Sanction Statistics
        int totalSanctions,
        int activeWarnings,
        int activeSuspensions,
        int activeBans,
        int pendingAppeals,
        int approvedAppeals,
        int rejectedAppeals,

        // Queue Health
        String queueHealth,
        int estimatedWaitTimeMinutes) {
    /**
     * Queue health levels.
     */
    public enum QueueHealth {
        HEALTHY, // < 10 pending
        MODERATE, // 10-50 pending
        BUSY, // 50-100 pending
        CRITICAL // > 100 pending
    }

    /**
     * Creates a stats response from domain statistics.
     */
    public static ModerationStatsResponse from(
            ModerationStatistics reportStats,
            SanctionStatistics sanctionStats) {
        String queueHealth = calculateQueueHealth(reportStats.pendingReports());
        int estimatedWait = calculateEstimatedWait(
                reportStats.pendingReports(),
                reportStats.averageResolutionTimeHours());

        return new ModerationStatsResponse(
                reportStats.totalReports(),
                reportStats.pendingReports(),
                reportStats.underReviewReports(),
                reportStats.resolvedReports(),
                reportStats.escalatedReports(),
                reportStats.averageResolutionTimeHours(),
                sanctionStats.totalSanctions(),
                sanctionStats.activeWarnings(),
                sanctionStats.activeSuspensions(),
                sanctionStats.activeBans(),
                sanctionStats.pendingAppeals(),
                sanctionStats.approvedAppeals(),
                sanctionStats.rejectedAppeals(),
                queueHealth,
                estimatedWait);
    }

    /**
     * Calculates queue health based on pending reports.
     */
    private static String calculateQueueHealth(int pendingReports) {
        if (pendingReports < 10)
            return QueueHealth.HEALTHY.name();
        if (pendingReports < 50)
            return QueueHealth.MODERATE.name();
        if (pendingReports < 100)
            return QueueHealth.BUSY.name();
        return QueueHealth.CRITICAL.name();
    }

    /**
     * Estimates wait time in minutes based on queue size and average resolution
     * time.
     */
    private static int calculateEstimatedWait(int pendingReports, double avgResolutionHours) {
        if (pendingReports == 0)
            return 0;
        if (avgResolutionHours <= 0)
            avgResolutionHours = 2.0; // default to 2 hours

        // Assume 2 moderators working in parallel on average
        int estimatedMinutes = (int) (pendingReports * avgResolutionHours * 60 / 2);
        return Math.min(estimatedMinutes, 10080); // cap at 7 days
    }

    /**
     * Builder for creating custom stats responses.
     */
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private int totalReports;
        private int pendingReports;
        private int underReviewReports;
        private int resolvedReports;
        private int escalatedReports;
        private double averageResolutionTimeHours;
        private int totalSanctions;
        private int activeWarnings;
        private int activeSuspensions;
        private int activeBans;
        private int pendingAppeals;
        private int approvedAppeals;
        private int rejectedAppeals;

        public Builder totalReports(int totalReports) {
            this.totalReports = totalReports;
            return this;
        }

        public Builder pendingReports(int pendingReports) {
            this.pendingReports = pendingReports;
            return this;
        }

        public Builder underReviewReports(int underReviewReports) {
            this.underReviewReports = underReviewReports;
            return this;
        }

        public Builder resolvedReports(int resolvedReports) {
            this.resolvedReports = resolvedReports;
            return this;
        }

        public Builder escalatedReports(int escalatedReports) {
            this.escalatedReports = escalatedReports;
            return this;
        }

        public Builder averageResolutionTimeHours(double hours) {
            this.averageResolutionTimeHours = hours;
            return this;
        }

        public Builder totalSanctions(int totalSanctions) {
            this.totalSanctions = totalSanctions;
            return this;
        }

        public Builder activeWarnings(int activeWarnings) {
            this.activeWarnings = activeWarnings;
            return this;
        }

        public Builder activeSuspensions(int activeSuspensions) {
            this.activeSuspensions = activeSuspensions;
            return this;
        }

        public Builder activeBans(int activeBans) {
            this.activeBans = activeBans;
            return this;
        }

        public Builder pendingAppeals(int pendingAppeals) {
            this.pendingAppeals = pendingAppeals;
            return this;
        }

        public Builder approvedAppeals(int approvedAppeals) {
            this.approvedAppeals = approvedAppeals;
            return this;
        }

        public Builder rejectedAppeals(int rejectedAppeals) {
            this.rejectedAppeals = rejectedAppeals;
            return this;
        }

        public ModerationStatsResponse build() {
            String queueHealth = calculateQueueHealth(pendingReports);
            int estimatedWait = calculateEstimatedWait(pendingReports, averageResolutionTimeHours);

            return new ModerationStatsResponse(
                    totalReports, pendingReports, underReviewReports,
                    resolvedReports, escalatedReports, averageResolutionTimeHours,
                    totalSanctions, activeWarnings, activeSuspensions, activeBans,
                    pendingAppeals, approvedAppeals, rejectedAppeals,
                    queueHealth, estimatedWait);
        }
    }
}
