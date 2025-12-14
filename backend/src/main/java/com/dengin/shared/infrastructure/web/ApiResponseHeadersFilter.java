package com.dengin.shared.infrastructure.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

/**
 * Filter that adds standard API response headers for:
 * - API versioning
 * - Security headers
 * - Rate limit info
 * - Server timing
 */
@Component
@Order(2)
public class ApiResponseHeadersFilter extends OncePerRequestFilter {

    @Value("${app.api.version:v1}")
    private String apiVersion;
    
    @Value("${spring.application.name:meslektas}")
    private String applicationName;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            addResponseHeaders(response, duration);
        }
    }

    private void addResponseHeaders(HttpServletResponse response, long durationMs) {
        // API Version Header
        response.addHeader("X-API-Version", apiVersion);
        
        // Server timing for performance monitoring
        response.addHeader("Server-Timing", String.format("total;dur=%d", durationMs));
        
        // Request timestamp
        response.addHeader("X-Response-Time", Instant.now().toString());
        
        // Security headers (if not already set)
        if (!response.containsHeader("X-Content-Type-Options")) {
            response.addHeader("X-Content-Type-Options", "nosniff");
        }
        
        if (!response.containsHeader("X-Frame-Options")) {
            response.addHeader("X-Frame-Options", "DENY");
        }
        
        if (!response.containsHeader("X-XSS-Protection")) {
            response.addHeader("X-XSS-Protection", "1; mode=block");
        }
        
        if (!response.containsHeader("Cache-Control")) {
            response.addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
        
        if (!response.containsHeader("Pragma")) {
            response.addHeader("Pragma", "no-cache");
        }
    }
}
