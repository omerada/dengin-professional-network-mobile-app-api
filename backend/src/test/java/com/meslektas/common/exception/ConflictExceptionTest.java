package com.dengin.common.exception;

import com.dengin.common.exception.BusinessException;
import com.dengin.common.exception.ConflictException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ConflictException Tests")
class ConflictExceptionTest {

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("should create exception with message only")
        void shouldCreateWithMessageOnly() {
            // when
            ConflictException exception = new ConflictException("Email already exists");

            // then
            assertThat(exception.getMessage()).isEqualTo("Email already exists");
            assertThat(exception.getErrorCode()).isEqualTo("CONFLICT");
        }

        @Test
        @DisplayName("should create exception with message and custom error code")
        void shouldCreateWithMessageAndErrorCode() {
            // when
            ConflictException exception = new ConflictException("Duplicate entry", "DUPLICATE_EMAIL");

            // then
            assertThat(exception.getMessage()).isEqualTo("Duplicate entry");
            assertThat(exception.getErrorCode()).isEqualTo("DUPLICATE_EMAIL");
        }

        @Test
        @DisplayName("should create exception with resource details")
        void shouldCreateWithResourceDetails() {
            // when
            ConflictException exception = new ConflictException("User", "email", "test@example.com");

            // then
            assertThat(exception.getMessage()).isEqualTo("User with email 'test@example.com' already exists");
            assertThat(exception.getErrorCode()).isEqualTo("CONFLICT");
        }
    }

    @Test
    @DisplayName("should be instance of BusinessException")
    void shouldBeInstanceOfBusinessException() {
        // when
        ConflictException exception = new ConflictException("Test");

        // then
        assertThat(exception).isInstanceOf(BusinessException.class);
        assertThat(exception).isInstanceOf(RuntimeException.class);
    }
}
