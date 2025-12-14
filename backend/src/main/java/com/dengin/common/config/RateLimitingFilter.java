package com.dengin.common.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Filter using Bucket4j
 * 
 * Limits:
 * - General endpoints: 100 requests/minute per IP
 * - Auth endpoints: 10 requests/minute per IP
 * - Upload endpoints: 20 requests/minute per IP
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    // Rate limit configurations
    private static final int GENERAL_LIMIT = 100;
    private static final int AUTH_LIMIT = 10;
    private static final int UPLOAD_LIMIT = 20;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        String clientIp = getClientIP(request);
        String path = request.getRequestURI();
        
        // Determine rate limit based on endpoint
        int limit = determineLimit(path);
        String bucketKey = clientIp + ":" + getLimitCategory(path);
        
        Bucket bucket = buckets.computeIfAbsent(bucketKey, k -> createBucket(limit));
        
        if (bucket.tryConsume(1)) {
            // Add rate limit headers
            response.addHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.addHeader("X-RateLimit-Remaining", 
                String.valueOf(bucket.getAvailableTokens()));
            response.addHeader("X-RateLimit-Reset", 
                String.valueOf(System.currentTimeMillis() / 1000 + 60));
            
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
            
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"success\":false,\"error\":{\"code\":\"RATE_LIMIT_EXCEEDED\"," +
                "\"message\":\"Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.\"}}"
            );
        }
    }
    
    private int determineLimit(String path) {
        if (path.startsWith("/api/auth")) {
            return AUTH_LIMIT;
        } else if (path.contains("/upload") || path.contains("/verification")) {
            return UPLOAD_LIMIT;
        }
        return GENERAL_LIMIT;
    }
    
    private String getLimitCategory(String path) {
        if (path.startsWith("/api/auth")) {
            return "auth";
        } else if (path.contains("/upload") || path.contains("/verification")) {
            return "upload";
        }
        return "general";
    }
    
    private Bucket createBucket(int limit) {
        Bandwidth bandwidth = Bandwidth.builder()
            .capacity(limit)
            .refillIntervally(limit, Duration.ofMinutes(1))
            .build();
        return Bucket.builder()
            .addLimit(bandwidth)
            .build();
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip rate limiting for health checks and static resources
        return path.startsWith("/actuator/health") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs");
    }
}
