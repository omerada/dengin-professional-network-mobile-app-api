package com.meslektas.verification.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Async Configuration
 * 
 * Enables async event handling for domain events.
 * Used by verification event handlers to process events asynchronously.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Spring Boot auto-configures thread pool
    // Default: SimpleAsyncTaskExecutor
    // For production: configure custom ThreadPoolTaskExecutor if needed
}
