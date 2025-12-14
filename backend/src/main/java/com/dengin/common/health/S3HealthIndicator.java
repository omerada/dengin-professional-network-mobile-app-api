package com.dengin.common.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;

/**
 * Custom health indicator for AWS S3 connectivity.
 *
 * Checks:
 * - S3 bucket accessibility
 * - AWS credentials validity
 * - Network connectivity to AWS
 */
@Component
public class S3HealthIndicator implements HealthIndicator {

    private final S3Client s3Client;
    private final String bucketName;

    public S3HealthIndicator(S3Client s3Client,
            @Value("${aws.s3.bucket-name:dengin-uploads}") String bucketName) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    @Override
    public Health health() {
        try {
            long startTime = System.currentTimeMillis();

            // Check if bucket exists and is accessible
            HeadBucketRequest request = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();

            s3Client.headBucket(request);
            long responseTime = System.currentTimeMillis() - startTime;

            return Health.up()
                    .withDetail("storage", "AWS S3")
                    .withDetail("bucket", bucketName)
                    .withDetail("status", "accessible")
                    .withDetail("responseTime", responseTime + "ms")
                    .build();

        } catch (Exception e) {
            return Health.down()
                    .withDetail("storage", "AWS S3")
                    .withDetail("bucket", bucketName)
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
