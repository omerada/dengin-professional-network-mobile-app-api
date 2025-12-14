package com.dengin.common.config;

import io.sentry.Sentry;
import io.sentry.SentryOptions;
import io.sentry.spring.jakarta.EnableSentry;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.MethodArgumentNotValidException;

/**
 * Sentry configuration for error tracking and monitoring.
 *
 * Features:
 * - Captures unhandled exceptions
 * - Filters validation errors (reduces noise)
 * - Tracks releases for error correlation
 * - Samples transactions for performance monitoring
 *
 * Configuration:
 * - DSN: Set via SENTRY_DSN environment variable
 * - Environment: Set via SENTRY_ENVIRONMENT or spring.profiles.active
 * - Release: Set via application version
 */
@Configuration
@Profile("!test") // Disable in test environment
@EnableSentry(dsn = "${sentry.dsn:}")
public class SentryConfig {

    @Value("${spring.application.version:1.0.0}")
    private String applicationVersion;

    @Value("${spring.profiles.active:development}")
    private String environment;

    /**
     * Customize Sentry options.
     */
    @Bean
    public SentryOptions.BeforeSendCallback beforeSendCallback() {
        return (event, hint) -> {
            Throwable throwable = event.getThrowable();

            // Filter out validation exceptions (these are expected user errors)
            if (throwable instanceof ValidationException ||
                    throwable instanceof MethodArgumentNotValidException ||
                    throwable instanceof IllegalArgumentException) {
                return null; // Don't send to Sentry
            }

            // Filter out business exceptions (expected application errors)
            if (throwable != null &&
                    throwable.getClass().getName().contains("BusinessException")) {
                return null;
            }

            // Add custom context
            event.setTag("version", applicationVersion);
            event.setTag("environment", environment);

            return event;
        };
    }

    /**
     * Configure Sentry options programmatically.
     *
     * Note: Most options are configured via application.yml,
     * but some require programmatic setup.
     */
    @Bean
    public Sentry.OptionsConfiguration<SentryOptions> customOptionsConfiguration() {
        return options -> {
            // Set release version for tracking
            options.setRelease("meslektas-backend@" + applicationVersion);

            // Set environment
            options.setEnvironment(environment);

            // Performance monitoring - sample 20% of transactions
            options.setTracesSampleRate(0.2);

            // Enable performance profiling
            options.setProfilesSampleRate(0.1);

            // Don't send PII
            options.setSendDefaultPii(false);

            // Enable debug in development
            if ("development".equals(environment) || "local".equals(environment)) {
                options.setDebug(true);
            }
        };
    }
}
