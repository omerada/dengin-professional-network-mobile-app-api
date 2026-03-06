package com.dengin.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * AWS SDK Configuration
 * 
 * Provides beans for:
 * - S3Client: AWS S3 operations
 * - S3Presigner: Presigned URL generation
 * 
 * Development: Uses LocalStack endpoint
 * Production: Uses real AWS services
 * 
 * Note: RekognitionClient is configured in verification module
 */
@Configuration
public class AwsConfig {

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.endpoint:}")
    private String endpoint;

    /**
     * S3Client for S3 operations (upload, delete, head object)
     */
    @Bean
    public S3Client s3Client() {
        var credentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)
        );

        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .forcePathStyle(true); // Use path-style URLs for LocalStack compatibility

        // Use LocalStack endpoint for development
        if (endpoint != null && !endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        return builder.build();
    }

    /**
     * S3Presigner for generating presigned URLs
     */
    @Bean
    public S3Presigner s3Presigner() {
        var credentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)
        );

        var builder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .serviceConfiguration(
                    software.amazon.awssdk.services.s3.S3Configuration.builder()
                        .pathStyleAccessEnabled(true) // Use path-style URLs for LocalStack
                        .build()
                );

        // Use LocalStack endpoint for development
        if (endpoint != null && !endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        return builder.build();
    }
}
