package com.meslektas.shared.infrastructure.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Authentication Metrics for monitoring login/registration performance
 * 
 * Tracks:
 * - Login attempts (success/failure)
 * - Registration counts
 * - Token refresh operations
 * - OAuth authentication
 * 
 * Usage in services:
 * <pre>{@code
 * @Autowired
 * private AuthMetrics authMetrics;
 * 
 * public AuthResponse login(LoginRequest request) {
 *     Timer.Sample sample = authMetrics.startLoginTimer();
 *     try {
 *         // ... login logic
 *         authMetrics.recordLoginSuccess();
 *         return response;
 *     } catch (Exception e) {
 *         authMetrics.recordLoginFailure(e.getClass().getSimpleName());
 *         throw e;
 *     } finally {
 *         authMetrics.stopLoginTimer(sample);
 *     }
 * }
 * }</pre>
 */
@Component
@RequiredArgsConstructor
public class AuthMetrics {

    private final MeterRegistry registry;
    private static final String PREFIX = "meslektas_auth";

    // ==================== Login Metrics ====================

    /**
     * Start timing a login operation
     */
    public Timer.Sample startLoginTimer() {
        return Timer.start(registry);
    }

    /**
     * Stop timing a login operation
     */
    public void stopLoginTimer(Timer.Sample sample) {
        sample.stop(Timer.builder(PREFIX + "_login_duration")
            .description("Time taken to process login requests")
            .register(registry));
    }

    /**
     * Record successful login
     */
    public void recordLoginSuccess() {
        Counter.builder(PREFIX + "_login_total")
            .tag("result", "success")
            .description("Total login attempts")
            .register(registry)
            .increment();
    }

    /**
     * Record failed login with reason
     */
    public void recordLoginFailure(String reason) {
        Counter.builder(PREFIX + "_login_total")
            .tag("result", "failure")
            .tag("reason", reason)
            .description("Total login attempts")
            .register(registry)
            .increment();
    }

    // ==================== Registration Metrics ====================

    /**
     * Record successful registration
     */
    public void recordRegistration() {
        Counter.builder(PREFIX + "_registration_total")
            .tag("result", "success")
            .description("Total registration attempts")
            .register(registry)
            .increment();
    }

    /**
     * Record failed registration
     */
    public void recordRegistrationFailure(String reason) {
        Counter.builder(PREFIX + "_registration_total")
            .tag("result", "failure")
            .tag("reason", reason)
            .description("Total registration attempts")
            .register(registry)
            .increment();
    }

    // ==================== Token Metrics ====================

    /**
     * Record token refresh
     */
    public void recordTokenRefresh() {
        Counter.builder(PREFIX + "_token_refresh_total")
            .tag("result", "success")
            .description("Total token refresh operations")
            .register(registry)
            .increment();
    }

    /**
     * Record token refresh failure
     */
    public void recordTokenRefreshFailure(String reason) {
        Counter.builder(PREFIX + "_token_refresh_total")
            .tag("result", "failure")
            .tag("reason", reason)
            .description("Total token refresh operations")
            .register(registry)
            .increment();
    }

    // ==================== OAuth Metrics ====================

    /**
     * Record OAuth authentication
     */
    public void recordOAuthLogin(String provider, boolean isNewUser) {
        Counter.builder(PREFIX + "_oauth_login_total")
            .tag("provider", provider)
            .tag("new_user", String.valueOf(isNewUser))
            .description("Total OAuth login attempts")
            .register(registry)
            .increment();
    }

    /**
     * Record OAuth failure
     */
    public void recordOAuthFailure(String provider, String reason) {
        Counter.builder(PREFIX + "_oauth_login_total")
            .tag("provider", provider)
            .tag("result", "failure")
            .tag("reason", reason)
            .description("Total OAuth login attempts")
            .register(registry)
            .increment();
    }

    // ==================== Password Reset Metrics ====================

    /**
     * Record password reset request
     */
    public void recordPasswordResetRequest() {
        Counter.builder(PREFIX + "_password_reset_request_total")
            .description("Total password reset requests")
            .register(registry)
            .increment();
    }

    /**
     * Record password reset completion
     */
    public void recordPasswordResetComplete() {
        Counter.builder(PREFIX + "_password_reset_complete_total")
            .description("Total completed password resets")
            .register(registry)
            .increment();
    }

    // ==================== Session Metrics ====================

    /**
     * Record session invalidation (logout, password change, etc.)
     */
    public void recordSessionInvalidation(String reason) {
        Counter.builder(PREFIX + "_session_invalidation_total")
            .tag("reason", reason)
            .description("Total session invalidations")
            .register(registry)
            .increment();
    }
}
