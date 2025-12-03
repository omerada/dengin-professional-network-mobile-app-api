package com.meslektas.shared.infrastructure.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filter for logging HTTP requests and responses.
 * Logs essential request information for auditing and debugging.
 * Sensitive data is masked.
 */
@Slf4j
@Component
@Order(3)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final List<String> SENSITIVE_HEADERS = Arrays.asList(
            "authorization", "cookie", "x-api-key", "x-auth-token"
    );
    
    private static final List<String> SENSITIVE_PARAMS = Arrays.asList(
            "password", "token", "secret", "apiKey", "accessToken", "refreshToken"
    );

    @Value("${app.logging.requests.enabled:true}")
    private boolean loggingEnabled;

    @Value("${app.logging.requests.include-query-string:true}")
    private boolean includeQueryString;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        if (!loggingEnabled || shouldSkipLogging(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();
        String requestInfo = buildRequestInfo(request);
        
        log.info(">>> Request: {}", requestInfo);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            log.info("<<< Response: {} {} - Status: {} - Duration: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    response.getStatus(),
                    duration);
        }
    }

    private boolean shouldSkipLogging(HttpServletRequest request) {
        String uri = request.getRequestURI();
        
        // Skip health checks, actuator endpoints, and static resources
        return uri.startsWith("/actuator") ||
               uri.startsWith("/health") ||
               uri.startsWith("/favicon.ico") ||
               uri.startsWith("/swagger") ||
               uri.startsWith("/v3/api-docs") ||
               uri.endsWith(".css") ||
               uri.endsWith(".js") ||
               uri.endsWith(".png") ||
               uri.endsWith(".jpg") ||
               uri.endsWith(".ico");
    }

    private String buildRequestInfo(HttpServletRequest request) {
        StringBuilder sb = new StringBuilder();
        
        sb.append(request.getMethod())
          .append(" ")
          .append(request.getRequestURI());
        
        if (includeQueryString && request.getQueryString() != null) {
            sb.append("?").append(maskSensitiveParams(request.getQueryString()));
        }
        
        // Add content type if present
        String contentType = request.getContentType();
        if (contentType != null) {
            sb.append(" [").append(contentType).append("]");
        }
        
        // Add user agent for debugging
        String userAgent = request.getHeader("User-Agent");
        if (userAgent != null && userAgent.length() > 50) {
            userAgent = userAgent.substring(0, 50) + "...";
        }
        if (userAgent != null) {
            sb.append(" UA: ").append(userAgent);
        }
        
        return sb.toString();
    }

    private String maskSensitiveParams(String queryString) {
        String masked = queryString;
        for (String param : SENSITIVE_PARAMS) {
            masked = masked.replaceAll(
                    "(?i)(" + param + "=)[^&]*", 
                    "$1[MASKED]"
            );
        }
        return masked;
    }
}
