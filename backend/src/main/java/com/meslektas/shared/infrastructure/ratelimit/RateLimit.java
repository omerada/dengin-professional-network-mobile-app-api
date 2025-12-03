package com.meslektas.shared.infrastructure.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Rate Limit Annotation
 * 
 * Apply to controller methods to enable rate limiting.
 * 
 * Example:
 * <pre>
 * @RateLimit(requests = 10, duration = 60, key = "login")
 * public ResponseEntity<?> login(@RequestBody LoginRequest request) {
 *     // ...
 * }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    
    /**
     * Maximum number of requests allowed in the duration
     */
    int requests() default 60;
    
    /**
     * Duration window in seconds
     */
    int duration() default 60;
    
    /**
     * Rate limit key prefix (e.g., "login", "register", "api")
     * Combined with user IP or user ID for unique key
     */
    String key() default "default";
    
    /**
     * Whether to use user ID (if authenticated) or IP address
     * If true and user is not authenticated, falls back to IP
     */
    boolean useUserId() default false;
}
