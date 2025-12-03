package com.meslektas.shared.infrastructure.health;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for S3 Health Indicator
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.health.s3")
public class S3HealthProperties {
    
    /**
     * Enable/disable S3 health check
     */
    private boolean enabled = true;
    
    /**
     * S3 bucket name to check
     */
    private String bucketName;
    
    /**
     * AWS region
     */
    private String region = "eu-central-1";
}
