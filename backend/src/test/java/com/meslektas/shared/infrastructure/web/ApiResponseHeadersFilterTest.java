package com.meslektas.shared.infrastructure.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@DisplayName("ApiResponseHeadersFilter Tests")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ApiResponseHeadersFilterTest {

    private ApiResponseHeadersFilter filter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new ApiResponseHeadersFilter();
        ReflectionTestUtils.setField(filter, "apiVersion", "v1");
        ReflectionTestUtils.setField(filter, "applicationName", "meslektas");
    }

    @Nested
    @DisplayName("API Version Header")
    class ApiVersionHeader {

        @Test
        @DisplayName("should add X-API-Version header")
        void shouldAddApiVersionHeader() throws Exception {
            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader("X-API-Version", "v1");
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should use configured API version")
        void shouldUseConfiguredApiVersion() throws Exception {
            // given
            ReflectionTestUtils.setField(filter, "apiVersion", "v2");

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader("X-API-Version", "v2");
        }
    }

    @Nested
    @DisplayName("Timing Headers")
    class TimingHeaders {

        @Test
        @DisplayName("should add Server-Timing header")
        void shouldAddServerTimingHeader() throws Exception {
            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader(eq("Server-Timing"), anyString());
        }

        @Test
        @DisplayName("should add X-Response-Time header")
        void shouldAddResponseTimeHeader() throws Exception {
            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader(eq("X-Response-Time"), anyString());
        }
    }

    @Nested
    @DisplayName("Security Headers")
    class SecurityHeaders {

        @Test
        @DisplayName("should add X-Content-Type-Options if not present")
        void shouldAddContentTypeOptions() throws Exception {
            // given
            when(response.containsHeader("X-Content-Type-Options")).thenReturn(false);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader("X-Content-Type-Options", "nosniff");
        }

        @Test
        @DisplayName("should not override existing X-Content-Type-Options")
        void shouldNotOverrideContentTypeOptions() throws Exception {
            // given
            when(response.containsHeader("X-Content-Type-Options")).thenReturn(true);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response, never()).addHeader(eq("X-Content-Type-Options"), anyString());
        }

        @Test
        @DisplayName("should add X-Frame-Options if not present")
        void shouldAddFrameOptions() throws Exception {
            // given
            when(response.containsHeader("X-Frame-Options")).thenReturn(false);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader("X-Frame-Options", "DENY");
        }

        @Test
        @DisplayName("should add X-XSS-Protection if not present")
        void shouldAddXssProtection() throws Exception {
            // given
            when(response.containsHeader("X-XSS-Protection")).thenReturn(false);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader("X-XSS-Protection", "1; mode=block");
        }

        @Test
        @DisplayName("should add Cache-Control if not present")
        void shouldAddCacheControl() throws Exception {
            // given
            when(response.containsHeader("Cache-Control")).thenReturn(false);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }

        @Test
        @DisplayName("should add Pragma if not present")
        void shouldAddPragma() throws Exception {
            // given
            when(response.containsHeader("Pragma")).thenReturn(false);

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader("Pragma", "no-cache");
        }
    }

    @Test
    @DisplayName("should continue filter chain")
    void shouldContinueFilterChain() throws Exception {
        // when
        filter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
    }
}
