package com.dengin.shared.infrastructure.metrics;

import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.verification.domain.model.VerificationStatus;
import com.dengin.verification.domain.repository.VerificationRequestRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.binder.MeterBinder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Custom Business Metrics for Prometheus/Grafana
 * 
 * Exposes key application metrics:
 * - User statistics (total, active, verified)
 * - Verification pipeline metrics
 * - Performance indicators
 * 
 * Metrics are scraped by Prometheus via /actuator/prometheus endpoint.
 * 
 * Example Grafana queries:
 * - User growth: dengin_users_total
 * - Verification queue: dengin_verifications_pending
 * - Daily active users: dengin_users_active_24h
 */
@Component
@RequiredArgsConstructor
public class BusinessMetrics implements MeterBinder {

    private final UserRepository userRepository;
    private final VerificationRequestRepository verificationRepository;

    private static final String PREFIX = "dengin";

    @Override
    public void bindTo(MeterRegistry registry) {
        // ==================== User Metrics ====================
        
        Gauge.builder(PREFIX + "_users_total", userRepository, repo -> repo.count())
            .description("Total number of registered users")
            .tags(Tags.of("type", "total"))
            .register(registry);
        
        Gauge.builder(PREFIX + "_users_active_24h", this, m -> 
                userRepository.countByLastLoginAfter(LocalDateTime.now().minusDays(1)))
            .description("Users active in last 24 hours")
            .tags(Tags.of("type", "active"))
            .register(registry);
        
        // ==================== Verification Metrics ====================
        
        Gauge.builder(PREFIX + "_verifications_pending", this, m ->
                verificationRepository.countByStatusIn(List.of(
                    VerificationStatus.PENDING,
                    VerificationStatus.AI_PROCESSING,
                    VerificationStatus.PENDING_MANUAL_REVIEW
                )))
            .description("Pending verification requests")
            .tags(Tags.of("status", "pending"))
            .register(registry);
        
        Gauge.builder(PREFIX + "_verifications_approved", this, m ->
                verificationRepository.countByStatus(VerificationStatus.APPROVED))
            .description("Approved verification requests")
            .tags(Tags.of("status", "approved"))
            .register(registry);
        
        Gauge.builder(PREFIX + "_verifications_rejected", this, m ->
                verificationRepository.countByStatus(VerificationStatus.REJECTED))
            .description("Rejected verification requests")
            .tags(Tags.of("status", "rejected"))
            .register(registry);
        
        Gauge.builder(PREFIX + "_verifications_total", this, m ->
                verificationRepository.count())
            .description("Total verification requests")
            .tags(Tags.of("type", "total"))
            .register(registry);
        
        Gauge.builder(PREFIX + "_verifications_today", this, m ->
                verificationRepository.countBySubmittedAtAfter(
                    Instant.now().minus(24, ChronoUnit.HOURS)))
            .description("Verification requests submitted today")
            .tags(Tags.of("type", "today"))
            .register(registry);
        
        // ==================== Processing Time Metrics ====================
        
        Gauge.builder(PREFIX + "_verification_avg_processing_minutes", this, m -> {
                Double avg = verificationRepository.calculateAverageProcessingTimeMinutes();
                return avg != null ? avg : 0.0;
            })
            .description("Average verification processing time in minutes")
            .register(registry);
    }
}
