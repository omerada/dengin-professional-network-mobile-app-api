package com.meslektas.shared.infrastructure.ratelimit;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Rate Limit Configuration
 * 
 * Registers the rate limit interceptor for all endpoints.
 */
@Configuration
@RequiredArgsConstructor
public class RateLimitConfig implements WebMvcConfigurer {
    
    private final RateLimitInterceptor rateLimitInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns(
                "/api/health",
                "/api/actuator/**",
                "/api/swagger-ui/**",
                "/api/v3/api-docs/**"
            );
    }
}
