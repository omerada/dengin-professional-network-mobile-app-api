package com.dengin.shared.infrastructure.web;

import com.dengin.shared.infrastructure.web.CorrelationIdFilter;
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
import org.slf4j.MDC;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("CorrelationIdFilter Tests")
@ExtendWith(MockitoExtension.class)
class CorrelationIdFilterTest {

    private CorrelationIdFilter filter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new CorrelationIdFilter();
        MDC.clear();
    }

    @Nested
    @DisplayName("Correlation ID Handling")
    class CorrelationIdHandling {

        @Test
        @DisplayName("should use existing correlation ID from header")
        void shouldUseExistingCorrelationId() throws Exception {
            // given
            String existingCorrelationId = "abc-123-def-456";
            when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn(existingCorrelationId);
            when(request.getMethod()).thenReturn("GET");
            when(request.getRequestURI()).thenReturn("/api/users");
            when(request.getRemoteAddr()).thenReturn("127.0.0.1");

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, existingCorrelationId);
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should generate new correlation ID if not present")
        void shouldGenerateNewCorrelationId() throws Exception {
            // given
            when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn(null);
            when(request.getMethod()).thenReturn("POST");
            when(request.getRequestURI()).thenReturn("/api/auth/login");
            when(request.getRemoteAddr()).thenReturn("192.168.1.1");

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader(eq(CorrelationIdFilter.CORRELATION_ID_HEADER), argThat(id -> 
                id != null && !id.isEmpty() && id.matches("^[a-f0-9-]+$")
            ));
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should generate new correlation ID for invalid format")
        void shouldGenerateNewForInvalidFormat() throws Exception {
            // given
            String invalidCorrelationId = "invalid<>id!@#";
            when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn(invalidCorrelationId);
            when(request.getMethod()).thenReturn("GET");
            when(request.getRequestURI()).thenReturn("/api/test");
            when(request.getRemoteAddr()).thenReturn("127.0.0.1");

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(response).addHeader(eq(CorrelationIdFilter.CORRELATION_ID_HEADER), argThat(id -> 
                id != null && !id.equals(invalidCorrelationId)
            ));
        }
    }

    @Nested
    @DisplayName("MDC Management")
    class MdcManagement {

        @Test
        @DisplayName("should clear MDC after filter execution")
        void shouldClearMdcAfterFilter() throws Exception {
            // given
            when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn("test-id");
            when(request.getMethod()).thenReturn("GET");
            when(request.getRequestURI()).thenReturn("/api/test");
            when(request.getRemoteAddr()).thenReturn("127.0.0.1");

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            assertThat(MDC.get(CorrelationIdFilter.MDC_CORRELATION_ID)).isNull();
            assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_METHOD)).isNull();
            assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_URI)).isNull();
        }

        @Test
        @DisplayName("should clear MDC even if exception occurs")
        void shouldClearMdcOnException() throws Exception {
            // given
            when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn("test-id");
            when(request.getMethod()).thenReturn("GET");
            when(request.getRequestURI()).thenReturn("/api/test");
            when(request.getRemoteAddr()).thenReturn("127.0.0.1");
            doThrow(new RuntimeException("Test exception")).when(filterChain).doFilter(request, response);

            // when & then
            try {
                filter.doFilterInternal(request, response, filterChain);
            } catch (RuntimeException e) {
                // expected
            }

            assertThat(MDC.get(CorrelationIdFilter.MDC_CORRELATION_ID)).isNull();
        }
    }

    @Nested
    @DisplayName("Client IP Detection")
    class ClientIpDetection {

        @Test
        @DisplayName("should extract IP from X-Forwarded-For header")
        void shouldExtractIpFromXForwardedFor() throws Exception {
            // given
            when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn("test-id");
            when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.195, 70.41.3.18, 150.172.238.178");
            when(request.getMethod()).thenReturn("GET");
            when(request.getRequestURI()).thenReturn("/api/test");

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then - filter should complete without error
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("should extract IP from X-Real-IP header")
        void shouldExtractIpFromXRealIp() throws Exception {
            // given
            when(request.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).thenReturn("test-id");
            when(request.getHeader("X-Forwarded-For")).thenReturn(null);
            when(request.getHeader("X-Real-IP")).thenReturn("203.0.113.195");
            when(request.getMethod()).thenReturn("GET");
            when(request.getRequestURI()).thenReturn("/api/test");

            // when
            filter.doFilterInternal(request, response, filterChain);

            // then
            verify(filterChain).doFilter(request, response);
        }
    }

    @Nested
    @DisplayName("Static Methods")
    class StaticMethods {

        @Test
        @DisplayName("should get current correlation ID from MDC")
        void shouldGetCurrentCorrelationId() {
            // given
            MDC.put(CorrelationIdFilter.MDC_CORRELATION_ID, "my-correlation-id");

            // when
            String result = CorrelationIdFilter.getCurrentCorrelationId();

            // then
            assertThat(result).isEqualTo("my-correlation-id");
            
            // cleanup
            MDC.clear();
        }

        @Test
        @DisplayName("should generate new correlation ID if not in MDC")
        void shouldGenerateIfNotInMdc() {
            // given
            MDC.clear();

            // when
            String result = CorrelationIdFilter.getCurrentCorrelationId();

            // then
            assertThat(result).isNotNull().isNotEmpty();
        }
    }
}
