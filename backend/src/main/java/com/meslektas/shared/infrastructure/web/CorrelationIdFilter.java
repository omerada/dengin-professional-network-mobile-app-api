package com.meslektas.shared.infrastructure.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter that adds correlation ID to all requests for distributed tracing.
 * The correlation ID is:
 * - Extracted from X-Correlation-ID header if present
 * - Generated as UUID if not present
 * - Added to MDC for logging
 * - Added to response headers for client tracking
 */
@Slf4j
@Component
@Order(1)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String MDC_CORRELATION_ID = "correlationId";
    public static final String MDC_REQUEST_METHOD = "requestMethod";
    public static final String MDC_REQUEST_URI = "requestUri";
    public static final String MDC_REMOTE_ADDR = "remoteAddr";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        try {
            String correlationId = extractOrGenerateCorrelationId(request);
            
            // Add to MDC for logging
            MDC.put(MDC_CORRELATION_ID, correlationId);
            MDC.put(MDC_REQUEST_METHOD, request.getMethod());
            MDC.put(MDC_REQUEST_URI, request.getRequestURI());
            MDC.put(MDC_REMOTE_ADDR, getClientIp(request));
            
            // Add to response header
            response.addHeader(CORRELATION_ID_HEADER, correlationId);
            
            log.debug("Request started - Method: {}, URI: {}, CorrelationId: {}", 
                    request.getMethod(), request.getRequestURI(), correlationId);
            
            long startTime = System.currentTimeMillis();
            
            try {
                filterChain.doFilter(request, response);
            } finally {
                long duration = System.currentTimeMillis() - startTime;
                log.debug("Request completed - Status: {}, Duration: {}ms, CorrelationId: {}", 
                        response.getStatus(), duration, correlationId);
            }
            
        } finally {
            // Clear MDC to prevent memory leaks
            MDC.remove(MDC_CORRELATION_ID);
            MDC.remove(MDC_REQUEST_METHOD);
            MDC.remove(MDC_REQUEST_URI);
            MDC.remove(MDC_REMOTE_ADDR);
        }
    }

    private String extractOrGenerateCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        
        if (StringUtils.hasText(correlationId)) {
            // Validate format (should be UUID-like)
            if (isValidCorrelationId(correlationId)) {
                return correlationId;
            }
            log.warn("Invalid correlation ID format received: {}", correlationId);
        }
        
        return UUID.randomUUID().toString();
    }

    private boolean isValidCorrelationId(String correlationId) {
        // Allow UUID format or custom format (alphanumeric with dashes, max 64 chars)
        return correlationId.length() <= 64 && 
               correlationId.matches("^[a-zA-Z0-9-]+$");
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            // Get first IP from comma-separated list
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Get current correlation ID from MDC.
     * Useful for adding to async tasks or external calls.
     */
    public static String getCurrentCorrelationId() {
        String correlationId = MDC.get(MDC_CORRELATION_ID);
        return correlationId != null ? correlationId : UUID.randomUUID().toString();
    }
}
