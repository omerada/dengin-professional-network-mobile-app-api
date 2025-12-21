package com.dengin.shared.infrastructure.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;

/**
 * Custom Health Indicator for AWS S3
 * 
 * Checks:
 * - S3 bucket accessibility
 * - AWS credentials validity
 * 
 * Only enabled when S3 storage is configured.
 */
@Component("s3")
@RequiredArgsConstructor
@Slf4j
public class S3HealthIndicator implements HealthIndicator {

    private final S3Client s3Client;
    private final S3HealthProperties properties;

    @Override
    public Health health() {
        if (!properties.isEnabled()) {
            return Health.up()
                .withDetail("status", "disabled")
                .withDetail("message", "S3 health check disabled in configuration")
                .build();
        }

        try {
            long startTime = System.currentTimeMillis();
            
            // Check if bucket exists and is accessible
            s3Client.headBucket(HeadBucketRequest.builder()
                .bucket(properties.getBucketName())
                .build());
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            return Health.up()
                .withDetail("bucket", properties.getBucketName())
                .withDetail("region", properties.getRegion())
                .withDetail("responseTimeMs", responseTime)
                .build();
                
        } catch (Exception e) {
            log.warn("S3 health check failed: {}", e.getMessage());
            return Health.down()
                .withDetail("bucket", properties.getBucketName())
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
