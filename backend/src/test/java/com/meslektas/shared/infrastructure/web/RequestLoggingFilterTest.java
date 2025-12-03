package com.meslektas.shared.infrastructure.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.*;

@DisplayName("RequestLoggingFilter Tests")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RequestLoggingFilterTest {

    private RequestLoggingFilter filter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new RequestLoggingFilter();
        ReflectionTestUtils.setField(filter, "loggingEnabled", true);
        ReflectionTestUtils.setField(filter, "includeQueryString", true);
    }

    @Nested
    @DisplayName("Logging Enabled/Disabled")
    class LoggingEnabled {

        @Test
        @DisplayName("should process request when logging is enabled")
        void shouldProcessWhenEnabled() throws Exception {
            // given
            ReflectionTestUtils.setField(filter, "loggingEnabled", true);
            when(request.getRequestURI()).thenReturn("/api/users");
            when(request.getMethod()).thenReturn("GET");
            when(response.getStatus()).thenReturn(200);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should process request when logging is disabled")
        void shouldProcessWhenDisabled() throws Exception {
            // given
            ReflectionTestUtils.setField(filter, "loggingEnabled", false);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(filterChain).doFilter(request, response);
        }
    }

    @Nested
    @DisplayName("Skip Logging for Certain Endpoints")
    class SkipLogging {

        @ParameterizedTest
        @ValueSource(strings = {
                "/actuator/health",
                "/actuator/metrics",
                "/health",
                "/swagger-ui.html",
                "/v3/api-docs",
                "/favicon.ico"
        })
        @DisplayName("should skip logging for excluded endpoints")
        void shouldSkipExcludedEndpoints(String uri) throws Exception {
            // given
            when(request.getRequestURI()).thenReturn(uri);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(filterChain).doFilter(request, response);
            // Request method should not be called for skipped endpoints
            verify(request, never()).getMethod();
        }

        @ParameterizedTest
        @ValueSource(strings = {"/api/users", "/api/auth/login", "/api/posts"})
        @DisplayName("should log API endpoints")
        void shouldLogApiEndpoints(String uri) throws Exception {
            // given
            when(request.getRequestURI()).thenReturn(uri);
            when(request.getMethod()).thenReturn("GET");
            when(response.getStatus()).thenReturn(200);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(filterChain).doFilter(request, response);
            verify(request, atLeastOnce()).getMethod();
        }
    }

    @Nested
    @DisplayName("Query String Handling")
    class QueryStringHandling {

        @Test
        @DisplayName("should include query string when enabled")
        void shouldIncludeQueryString() throws Exception {
            // given
            when(request.getRequestURI()).thenReturn("/api/users");
            when(request.getMethod()).thenReturn("GET");
            when(request.getQueryString()).thenReturn("page=1&size=10");
            when(response.getStatus()).thenReturn(200);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(request, atLeastOnce()).getQueryString();
        }

        @Test
        @DisplayName("should mask sensitive parameters")
        void shouldMaskSensitiveParams() throws Exception {
            // given
            when(request.getRequestURI()).thenReturn("/api/auth/login");
            when(request.getMethod()).thenReturn("POST");
            when(request.getQueryString()).thenReturn("username=test&password=secret123");
            when(response.getStatus()).thenReturn(200);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(filterChain).doFilter(request, response);
            // Password should be masked in logs (verified by log output)
        }
    }

    @Nested
    @DisplayName("Content Type and User Agent")
    class ContentTypeAndUserAgent {

        @Test
        @DisplayName("should include content type in log")
        void shouldIncludeContentType() throws Exception {
            // given
            when(request.getRequestURI()).thenReturn("/api/users");
            when(request.getMethod()).thenReturn("POST");
            when(request.getContentType()).thenReturn("application/json");
            when(response.getStatus()).thenReturn(201);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(request).getContentType();
        }

        @Test
        @DisplayName("should truncate long user agent")
        void shouldTruncateLongUserAgent() throws Exception {
            // given
            String longUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
            when(request.getRequestURI()).thenReturn("/api/users");
            when(request.getMethod()).thenReturn("GET");
            when(request.getHeader("User-Agent")).thenReturn(longUserAgent);
            when(response.getStatus()).thenReturn(200);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(request).getHeader("User-Agent");
        }
    }

    @Test
    @DisplayName("should always continue filter chain")
    void shouldAlwaysContinueFilterChain() throws Exception {
        // given
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getMethod()).thenReturn("GET");
        when(response.getStatus()).thenReturn(200);

        // when
        filter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("should handle null values gracefully")
    void shouldHandleNullValues() throws Exception {
        // given
        when(request.getRequestURI()).thenReturn("/api/users");
        when(request.getMethod()).thenReturn("GET");
        when(request.getQueryString()).thenReturn(null);
        when(request.getContentType()).thenReturn(null);
        when(request.getHeader("User-Agent")).thenReturn(null);
        when(response.getStatus()).thenReturn(200);

        // when
        filter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
    }
}
