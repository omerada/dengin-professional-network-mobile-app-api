package com.dengin.shared.infrastructure.health;

import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.verification.domain.model.VerificationStatus;
import com.dengin.verification.domain.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Custom Health Indicator for Application Business Metrics
 * 
 * Reports key business health indicators:
 * - Total users
 * - Active users (last 24h)
 * - Pending verifications
 * - System load indicators
 */
@Component("business")
@RequiredArgsConstructor
@Slf4j
public class BusinessHealthIndicator implements HealthIndicator {

    private final UserRepository userRepository;
    private final VerificationRequestRepository verificationRepository;

    // Thresholds for health status
    private static final int MAX_PENDING_VERIFICATIONS_WARNING = 100;
    private static final int MAX_PENDING_VERIFICATIONS_CRITICAL = 500;

    @Override
    public Health health() {
        try {
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countByLastLoginAfter(
                LocalDateTime.now().minusDays(1)
            );
            long pendingVerifications = verificationRepository.countByStatusIn(
                List.of(VerificationStatus.PENDING, VerificationStatus.AI_PROCESSING, VerificationStatus.PENDING_MANUAL_REVIEW)
            );
            
            Health.Builder builder = Health.up()
                .withDetail("totalUsers", totalUsers)
                .withDetail("activeUsersLast24h", activeUsers)
                .withDetail("pendingVerifications", pendingVerifications);
            
            // Check for warning/critical conditions
            if (pendingVerifications > MAX_PENDING_VERIFICATIONS_CRITICAL) {
                return builder
                    .status("DEGRADED")
                    .withDetail("warning", "High number of pending verifications")
                    .build();
            }
            
            if (pendingVerifications > MAX_PENDING_VERIFICATIONS_WARNING) {
                return builder
                    .withDetail("warning", "Elevated pending verifications")
                    .build();
            }
            
            return builder.build();
            
        } catch (Exception e) {
            log.error("Business health check failed: {}", e.getMessage());
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
