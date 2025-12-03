package com.meslektas.common.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * AWS Configuration
 * 
 * Configures AWS SDK clients for production and development.
 */
@Slf4j
@Configuration
public class AwsConfiguration {

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.endpoint:}")
    private String endpoint;

    /**
     * Production S3 Client
     */
    @Bean
    @Profile("prod")
    public S3Client productionS3Client() {
        log.info("Initializing production S3 client for region: {}", region);

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }

    /**
     * Production S3 Presigner for presigned URLs
     */
    @Bean
    @Profile("prod")
    public S3Presigner productionS3Presigner() {
        log.info("Initializing production S3 presigner for region: {}", region);

        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }

    /**
     * Development S3 Client (LocalStack)
     */
    @Bean
    @Profile("dev")
    public S3Client developmentS3Client() {
        log.info("Initializing LocalStack S3 client with endpoint: {}", endpoint);

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .endpointOverride(URI.create(endpoint))
                .forcePathStyle(true) // Required for LocalStack
                .build();
    }

    /**
     * Development S3 Presigner (LocalStack)
     */
    @Bean
    @Profile("dev")
    public S3Presigner developmentS3Presigner() {
        log.info("Initializing LocalStack S3 presigner with endpoint: {}", endpoint);

        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .endpointOverride(URI.create(endpoint))
                .build();
    }
}
