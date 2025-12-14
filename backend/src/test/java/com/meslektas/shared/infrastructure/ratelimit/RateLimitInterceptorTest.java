package com.dengin.shared.infrastructure.ratelimit;

import com.dengin.shared.infrastructure.ratelimit.RateLimit;
import com.dengin.shared.infrastructure.ratelimit.RateLimitInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.method.HandlerMethod;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RateLimitInterceptor
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RateLimitInterceptor Tests")
class RateLimitInterceptorTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private HandlerMethod handlerMethod;

    private RateLimitInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new RateLimitInterceptor(redisTemplate);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Nested
    @DisplayName("Rate Limit Enforcement Tests")
    class RateLimitEnforcementTests {

        @Test
        @DisplayName("should allow request within rate limit")
        void shouldAllowRequestWithinLimit() throws Exception {
            // Given
            Method method = RateLimitedController.class.getMethod("rateLimitedMethod");
            when(handlerMethod.getMethodAnnotation(RateLimit.class))
                .thenReturn(method.getAnnotation(RateLimit.class));
            when(request.getRemoteAddr()).thenReturn("192.168.1.1");
            when(valueOperations.get(anyString())).thenReturn("5");
            when(redisTemplate.getExpire(anyString(), eq(TimeUnit.SECONDS))).thenReturn(30L);

            // When
            boolean result = interceptor.preHandle(request, response, handlerMethod);

            // Then
            assertThat(result).isTrue();
            verify(valueOperations).increment(anyString());
        }

        @Test
        @DisplayName("should block request exceeding rate limit")
        void shouldBlockRequestExceedingLimit() throws Exception {
            // Given
            Method method = RateLimitedController.class.getMethod("rateLimitedMethod");
            when(handlerMethod.getMethodAnnotation(RateLimit.class))
                .thenReturn(method.getAnnotation(RateLimit.class));
            when(request.getRemoteAddr()).thenReturn("192.168.1.1");
            when(valueOperations.get(anyString())).thenReturn("10"); // At limit
            when(redisTemplate.getExpire(anyString(), eq(TimeUnit.SECONDS))).thenReturn(30L);

            StringWriter stringWriter = new StringWriter();
            PrintWriter printWriter = new PrintWriter(stringWriter);
            when(response.getWriter()).thenReturn(printWriter);

            // When
            boolean result = interceptor.preHandle(request, response, handlerMethod);

            // Then
            assertThat(result).isFalse();
            verify(response).setStatus(429);
            verify(response).setContentType("application/json");
        }

        @Test
        @DisplayName("should allow request when no rate limit annotation")
        void shouldAllowWhenNoAnnotation() throws Exception {
            // Given
            when(handlerMethod.getMethodAnnotation(RateLimit.class)).thenReturn(null);

            // When
            boolean result = interceptor.preHandle(request, response, handlerMethod);

            // Then
            assertThat(result).isTrue();
            verify(valueOperations, never()).get(anyString());
        }
    }

    @Nested
    @DisplayName("IP Address Extraction Tests")
    class IpAddressExtractionTests {

        @Test
        @DisplayName("should extract IP from X-Forwarded-For header")
        void shouldExtractFromXForwardedFor() throws Exception {
            // Given
            Method method = RateLimitedController.class.getMethod("rateLimitedMethod");
            when(handlerMethod.getMethodAnnotation(RateLimit.class))
                .thenReturn(method.getAnnotation(RateLimit.class));
            when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.195, 70.41.3.18");
            when(valueOperations.get(anyString())).thenReturn("0");
            when(valueOperations.increment(anyString())).thenReturn(1L);

            // When
            boolean result = interceptor.preHandle(request, response, handlerMethod);

            // Then
            assertThat(result).isTrue();
            verify(valueOperations).get(contains("203.0.113.195"));
        }

        @Test
        @DisplayName("should extract IP from X-Real-IP header")
        void shouldExtractFromXRealIp() throws Exception {
            // Given
            Method method = RateLimitedController.class.getMethod("rateLimitedMethod");
            when(handlerMethod.getMethodAnnotation(RateLimit.class))
                .thenReturn(method.getAnnotation(RateLimit.class));
            when(request.getHeader("X-Forwarded-For")).thenReturn(null);
            when(request.getHeader("X-Real-IP")).thenReturn("203.0.113.100");
            when(valueOperations.get(anyString())).thenReturn("0");
            when(valueOperations.increment(anyString())).thenReturn(1L);

            // When
            boolean result = interceptor.preHandle(request, response, handlerMethod);

            // Then
            assertThat(result).isTrue();
            verify(valueOperations).get(contains("203.0.113.100"));
        }

        @Test
        @DisplayName("should fallback to remote address")
        void shouldFallbackToRemoteAddress() throws Exception {
            // Given
            Method method = RateLimitedController.class.getMethod("rateLimitedMethod");
            when(handlerMethod.getMethodAnnotation(RateLimit.class))
                .thenReturn(method.getAnnotation(RateLimit.class));
            when(request.getHeader("X-Forwarded-For")).thenReturn(null);
            when(request.getHeader("X-Real-IP")).thenReturn(null);
            when(request.getRemoteAddr()).thenReturn("127.0.0.1");
            when(valueOperations.get(anyString())).thenReturn("0");
            when(valueOperations.increment(anyString())).thenReturn(1L);

            // When
            boolean result = interceptor.preHandle(request, response, handlerMethod);

            // Then
            assertThat(result).isTrue();
            verify(valueOperations).get(contains("127.0.0.1"));
        }
    }

    @Nested
    @DisplayName("Rate Limit Headers Tests")
    class HeadersTests {

        @Test
        @DisplayName("should add rate limit headers to response")
        void shouldAddRateLimitHeaders() throws Exception {
            // Given
            Method method = RateLimitedController.class.getMethod("rateLimitedMethod");
            when(handlerMethod.getMethodAnnotation(RateLimit.class))
                .thenReturn(method.getAnnotation(RateLimit.class));
            when(request.getRemoteAddr()).thenReturn("192.168.1.1");
            when(valueOperations.get(anyString())).thenReturn("5");
            when(valueOperations.increment(anyString())).thenReturn(6L);
            when(redisTemplate.getExpire(anyString(), eq(TimeUnit.SECONDS))).thenReturn(30L);

            // When
            interceptor.preHandle(request, response, handlerMethod);

            // Then
            verify(response).setHeader("X-RateLimit-Limit", "10");
            verify(response).setHeader(eq("X-RateLimit-Remaining"), anyString());
            verify(response).setHeader(eq("X-RateLimit-Reset"), anyString());
        }
    }

    @Nested
    @DisplayName("Custom Key Tests")
    class CustomKeyTests {

        @Test
        @DisplayName("should use custom key from annotation")
        void shouldUseCustomKey() throws Exception {
            // Given
            Method method = RateLimitedController.class.getMethod("customKeyMethod");
            when(handlerMethod.getMethodAnnotation(RateLimit.class))
                .thenReturn(method.getAnnotation(RateLimit.class));
            when(request.getRemoteAddr()).thenReturn("192.168.1.1");
            when(valueOperations.get(anyString())).thenReturn("0");
            when(valueOperations.increment(anyString())).thenReturn(1L);

            // When
            interceptor.preHandle(request, response, handlerMethod);

            // Then
            verify(valueOperations).get(contains("custom-key"));
        }
    }

    @Nested
    @DisplayName("Handler Type Tests")
    class HandlerTypeTests {

        @Test
        @DisplayName("should skip non-handler method objects")
        void shouldSkipNonHandlerMethod() throws Exception {
            // Given
            Object nonHandlerMethod = new Object();

            // When
            boolean result = interceptor.preHandle(request, response, nonHandlerMethod);

            // Then
            assertThat(result).isTrue();
            verify(valueOperations, never()).get(anyString());
        }
    }

    // Test controller classes for annotation testing
    static class RateLimitedController {
        @RateLimit(requests = 10, duration = 60)
        public void rateLimitedMethod() {}

        @RateLimit(requests = 5, duration = 30, key = "custom-key")
        public void customKeyMethod() {}
    }

    static class NonRateLimitedController {
        public void nonRateLimitedMethod() {}
    }
}
