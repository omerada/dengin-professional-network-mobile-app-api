package com.meslektas.verification.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;

import java.net.URI;

/**
 * AWS Rekognition Configuration
 * 
 * Configures AWS Rekognition client for AI verification.
 * Supports both AWS and LocalStack for development.
 */
@Configuration
@ConfigurationProperties(prefix = "aws.rekognition")
@Getter
@Setter
public class RekognitionConfig {
    
    private String region = "eu-central-1";
    private String accessKey;
    private String secretKey;
    private String endpoint; // For LocalStack
    private String bucketName = "meslektas-verifications"; // S3 bucket for verification documents
    
    @Bean
    public String verificationBucketName() {
        return bucketName;
    }
    
    @Bean
    public RekognitionClient rekognitionClient() {
        var builder = RekognitionClient.builder()
            .region(Region.of(region));
        
        // Credentials
        if (accessKey != null && secretKey != null) {
            AwsCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)
            );
            builder.credentialsProvider(credentialsProvider);
        }
        
        // LocalStack endpoint override
        if (endpoint != null && !endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(endpoint));
        }
        
        return builder.build();
    }
}
