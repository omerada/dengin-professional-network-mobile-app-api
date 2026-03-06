package com.dengin.common.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Application-wide metrics for monitoring and observability.
 *
 * Provides business and performance metrics that are pushed to CloudWatch,
 * Prometheus, or other monitoring systems via Micrometer.
 *
 * Metrics Categories:
 * - Business: User registrations, verifications, posts, messages
 * - Performance: Feed generation, database queries, API latency
 * - Moderation: High-risk content, reports, sanctions
 */
@Component
public class ApplicationMetrics {

    private final MeterRegistry meterRegistry;

    // Business Counters
    private final Counter userRegistrationCounter;
    private final Counter verificationSubmittedCounter;
    private final Counter verificationApprovedCounter;
    private final Counter verificationRejectedCounter;
    private final Counter postCreatedCounter;
    private final Counter commentCreatedCounter;
    private final Counter messageSentCounter;
    private final Counter connectionCreatedCounter;

    // Moderation Counters
    private final Counter reportCreatedCounter;
    private final Counter highRiskContentCounter;
    private final Counter sanctionAppliedCounter;

    // Performance Timers
    private final Timer feedGenerationTimer;
    private final Timer searchQueryTimer;

    public ApplicationMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // Initialize business counters
        this.userRegistrationCounter = Counter.builder("dengin.user.registration")
                .description("Number of user registrations")
                .tag("type", "registration")
                .register(meterRegistry);

        this.verificationSubmittedCounter = Counter.builder("dengin.verification.submitted")
                .description("Number of verification requests submitted")
                .register(meterRegistry);

        this.verificationApprovedCounter = Counter.builder("dengin.verification.approved")
                .description("Number of verifications approved")
                .register(meterRegistry);

        this.verificationRejectedCounter = Counter.builder("dengin.verification.rejected")
                .description("Number of verifications rejected")
                .register(meterRegistry);

        this.postCreatedCounter = Counter.builder("dengin.post.created")
                .description("Number of posts created")
                .register(meterRegistry);

        this.commentCreatedCounter = Counter.builder("dengin.comment.created")
                .description("Number of comments created")
                .register(meterRegistry);

        this.messageSentCounter = Counter.builder("dengin.message.sent")
                .description("Number of messages sent")
                .register(meterRegistry);

        this.connectionCreatedCounter = Counter.builder("dengin.connection.created")
                .description("Number of connections created")
                .register(meterRegistry);

        // Initialize moderation counters
        this.reportCreatedCounter = Counter.builder("dengin.moderation.report.created")
                .description("Number of content reports created")
                .register(meterRegistry);

        this.highRiskContentCounter = Counter.builder("dengin.moderation.high_risk")
                .description("Number of high-risk content detected")
                .register(meterRegistry);

        this.sanctionAppliedCounter = Counter.builder("dengin.moderation.sanction.applied")
                .description("Number of user sanctions applied")
                .register(meterRegistry);

        // Initialize performance timers
        this.feedGenerationTimer = Timer.builder("dengin.feed.generation")
                .description("Time to generate user feed")
                .register(meterRegistry);

        this.searchQueryTimer = Timer.builder("dengin.search.query")
                .description("Time for search queries")
                .register(meterRegistry);
    }

    // ==================== Business Metrics ====================

    /**
     * Record a user registration.
     */
    public void recordUserRegistration() {
        userRegistrationCounter.increment();
    }

    /**
     * Record a verification submission.
     */
    public void recordVerificationSubmitted() {
        verificationSubmittedCounter.increment();
    }

    /**
     * Record a verification approval.
     */
    public void recordVerificationApproved() {
        verificationApprovedCounter.increment();
    }

    /**
     * Record a verification rejection.
     */
    public void recordVerificationRejected() {
        verificationRejectedCounter.increment();
    }

    /**
     * Record a post creation.
     */
    public void recordPostCreated() {
        postCreatedCounter.increment();
    }

    /**
     * Record a comment creation.
     */
    public void recordCommentCreated() {
        commentCreatedCounter.increment();
    }

    /**
     * Record a message sent.
     */
    public void recordMessageSent() {
        messageSentCounter.increment();
    }

    /**
     * Record a connection creation.
     */
    public void recordConnectionCreated() {
        connectionCreatedCounter.increment();
    }

    // ==================== Moderation Metrics ====================

    /**
     * Record a content report creation.
     */
    public void recordReportCreated() {
        reportCreatedCounter.increment();
    }

    /**
     * Record high-risk content detection.
     */
    public void recordHighRiskContent() {
        highRiskContentCounter.increment();
    }

    /**
     * Record a sanction application.
     */
    public void recordSanctionApplied() {
        sanctionAppliedCounter.increment();
    }

    /**
     * Record a sanction with type tag.
     */
    public void recordSanctionApplied(String sanctionType) {
        meterRegistry.counter("dengin.moderation.sanction.applied",
                "type", sanctionType).increment();
    }

    // ==================== Performance Metrics ====================

    /**
     * Record feed generation time.
     *
     * @param milliseconds time in milliseconds
     */
    public void recordFeedGenerationTime(long milliseconds) {
        feedGenerationTimer.record(milliseconds, TimeUnit.MILLISECONDS);
    }

    /**
     * Record search query time.
     *
     * @param milliseconds time in milliseconds
     */
    public void recordSearchQueryTime(long milliseconds) {
        searchQueryTimer.record(milliseconds, TimeUnit.MILLISECONDS);
    }

    /**
     * Record database query time with query name tag.
     *
     * @param queryName    the name/identifier of the query
     * @param milliseconds time in milliseconds
     */
    public void recordDatabaseQueryTime(String queryName, long milliseconds) {
        Timer.builder("dengin.database.query")
                .tag("name", queryName)
                .register(meterRegistry)
                .record(milliseconds, TimeUnit.MILLISECONDS);
    }

    /**
     * Record API call latency.
     *
     * @param endpoint     the API endpoint
     * @param method       HTTP method
     * @param milliseconds time in milliseconds
     */
    public void recordApiLatency(String endpoint, String method, long milliseconds) {
        Timer.builder("dengin.api.latency")
                .tag("endpoint", endpoint)
                .tag("method", method)
                .register(meterRegistry)
                .record(milliseconds, TimeUnit.MILLISECONDS);
    }

    // ==================== Custom Metrics ====================

    /**
     * Get the underlying meter registry for custom metrics.
     *
     * @return the meter registry
     */
    public MeterRegistry getMeterRegistry() {
        return meterRegistry;
    }
}
