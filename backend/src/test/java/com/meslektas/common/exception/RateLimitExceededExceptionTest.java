package com.meslektas.common.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RateLimitExceededException Tests")
class RateLimitExceededExceptionTest {

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("should create exception with message only")
        void shouldCreateWithMessageOnly() {
            // when
            RateLimitExceededException exception = new RateLimitExceededException("Too many requests");

            // then
            assertThat(exception.getMessage()).isEqualTo("Too many requests");
            assertThat(exception.getErrorCode()).isEqualTo("RATE_LIMIT_EXCEEDED");
            assertThat(exception.getRetryAfterSeconds()).isEqualTo(60);
            assertThat(exception.getLimitType()).isEqualTo("default");
        }

        @Test
        @DisplayName("should create exception with message and retry after")
        void shouldCreateWithRetryAfter() {
            // when
            RateLimitExceededException exception = new RateLimitExceededException("Rate limit exceeded", 120);

            // then
            assertThat(exception.getMessage()).isEqualTo("Rate limit exceeded");
            assertThat(exception.getRetryAfterSeconds()).isEqualTo(120);
            assertThat(exception.getLimitType()).isEqualTo("default");
        }

        @Test
        @DisplayName("should create exception with all parameters")
        void shouldCreateWithAllParameters() {
            // when
            RateLimitExceededException exception = new RateLimitExceededException(
                    "API rate limit exceeded", 
                    300, 
                    "api-calls"
            );

            // then
            assertThat(exception.getMessage()).isEqualTo("API rate limit exceeded");
            assertThat(exception.getRetryAfterSeconds()).isEqualTo(300);
            assertThat(exception.getLimitType()).isEqualTo("api-calls");
            assertThat(exception.getErrorCode()).isEqualTo("RATE_LIMIT_EXCEEDED");
        }
    }

    @Nested
    @DisplayName("Rate Limit Types")
    class RateLimitTypes {

        @Test
        @DisplayName("should support login rate limit type")
        void shouldSupportLoginRateLimitType() {
            RateLimitExceededException exception = new RateLimitExceededException(
                    "Too many login attempts",
                    900,
                    "login-attempts"
            );

            assertThat(exception.getLimitType()).isEqualTo("login-attempts");
            assertThat(exception.getRetryAfterSeconds()).isEqualTo(900);
        }

        @Test
        @DisplayName("should support email rate limit type")
        void shouldSupportEmailRateLimitType() {
            RateLimitExceededException exception = new RateLimitExceededException(
                    "Too many password reset requests",
                    3600,
                    "password-reset"
            );

            assertThat(exception.getLimitType()).isEqualTo("password-reset");
            assertThat(exception.getRetryAfterSeconds()).isEqualTo(3600);
        }
    }
}
