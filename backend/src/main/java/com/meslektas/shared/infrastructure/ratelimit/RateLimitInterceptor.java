package com.meslektas.shared.infrastructure.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Rate Limit Interceptor
 * 
 * Implements sliding window rate limiting using Redis.
 * 
 * Features:
 * - Per-user or per-IP rate limiting
 * - Configurable via @RateLimit annotation
 * - Returns 429 Too Many Requests when limit exceeded
 * - Adds rate limit headers to response
 * 
 * Headers:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining in window
 * - X-RateLimit-Reset: Seconds until window resets
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private static final String RATE_LIMIT_PREFIX = "rate_limit:";
    private static final String HEADER_LIMIT = "X-RateLimit-Limit";
    private static final String HEADER_REMAINING = "X-RateLimit-Remaining";
    private static final String HEADER_RESET = "X-RateLimit-Reset";
    private static final String HEADER_RETRY_AFTER = "Retry-After";
    
    private final StringRedisTemplate redisTemplate;
    
    @Override
    public boolean preHandle(
        HttpServletRequest request, 
        HttpServletResponse response, 
        Object handler
    ) throws Exception {
        
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        
        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);
        if (rateLimit == null) {
            return true;
        }
        
        String key = buildKey(request, rateLimit);
        int maxRequests = rateLimit.requests();
        int durationSeconds = rateLimit.duration();
        
        // Get current count
        String countStr = redisTemplate.opsForValue().get(key);
        int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;
        
        // Get TTL
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        long resetSeconds = ttl != null && ttl > 0 ? ttl : durationSeconds;
        
        // Check if limit exceeded
        if (currentCount >= maxRequests) {
            log.warn("Rate limit exceeded for key: {}", key);
            
            response.setStatus(429);
            response.setHeader(HEADER_LIMIT, String.valueOf(maxRequests));
            response.setHeader(HEADER_REMAINING, "0");
            response.setHeader(HEADER_RESET, String.valueOf(resetSeconds));
            response.setHeader(HEADER_RETRY_AFTER, String.valueOf(resetSeconds));
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"Çok fazla istek gönderdiniz. Lütfen " + resetSeconds + " saniye bekleyin.\"}"
            );
            
            return false;
        }
        
        // Increment counter
        Long newCount = redisTemplate.opsForValue().increment(key);
        
        // Set expiry if this is the first request
        if (newCount != null && newCount == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(durationSeconds));
            resetSeconds = durationSeconds;
        }
        
        int remaining = Math.max(0, maxRequests - (newCount != null ? newCount.intValue() : 0));
        
        // Add rate limit headers
        response.setHeader(HEADER_LIMIT, String.valueOf(maxRequests));
        response.setHeader(HEADER_REMAINING, String.valueOf(remaining));
        response.setHeader(HEADER_RESET, String.valueOf(resetSeconds));
        
        return true;
    }
    
    /**
     * Build rate limit key
     */
    private String buildKey(HttpServletRequest request, RateLimit rateLimit) {
        StringBuilder keyBuilder = new StringBuilder(RATE_LIMIT_PREFIX);
        keyBuilder.append(rateLimit.key()).append(":");
        
        if (rateLimit.useUserId()) {
            String userId = getUserId();
            if (userId != null) {
                keyBuilder.append("user:").append(userId);
                return keyBuilder.toString();
            }
        }
        
        // Fall back to IP
        keyBuilder.append("ip:").append(getClientIp(request));
        return keyBuilder.toString();
    }
    
    /**
     * Get authenticated user ID
     */
    private String getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return null;
    }
    
    /**
     * Get client IP address (handles proxies)
     */
    private String getClientIp(HttpServletRequest request) {
        // Check X-Forwarded-For header (load balancer/proxy)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // Take the first IP in the list
            return xForwardedFor.split(",")[0].trim();
        }
        
        // Check X-Real-IP header (nginx)
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        
        // Fall back to remote address
        return request.getRemoteAddr();
    }
}
