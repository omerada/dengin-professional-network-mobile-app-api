package com.meslektas.common.api;

import com.meslektas.common.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@DisplayName("GlobalExceptionHandler Tests")
@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @Mock
    private HttpServletRequest request;

    @Mock
    private BindingResult bindingResult;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Nested
    @DisplayName("ResourceNotFoundException Handler")
    class ResourceNotFoundExceptionTests {

        @Test
        @DisplayName("should return 404 with error details")
        void shouldReturn404() {
            // given
            ResourceNotFoundException ex = new ResourceNotFoundException("User not found");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleResourceNotFound(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(404);
            assertThat(response.getBody().getMessage()).isEqualTo("User not found");
            assertThat(response.getBody().getPath()).isEqualTo("/api/test");
        }
    }

    @Nested
    @DisplayName("ValidationException Handler")
    class ValidationExceptionTests {

        @Test
        @DisplayName("should return 400 with validation error")
        void shouldReturn400() {
            // given
            ValidationException ex = new ValidationException("Invalid email format");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleValidation(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getError()).isEqualTo("Validation Error");
        }
    }

    @Nested
    @DisplayName("MethodArgumentNotValidException Handler")
    class MethodArgumentNotValidTests {

        @Test
        @DisplayName("should return 400 with field errors")
        void shouldReturn400WithFieldErrors() {
            // given
            FieldError fieldError = new FieldError("user", "email", "must not be blank");
            when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));
            
            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

            // when
            ResponseEntity<ErrorResponse> response = handler.handleMethodArgumentNotValid(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getValidationErrors()).containsEntry("email", "must not be blank");
        }
    }

    @Nested
    @DisplayName("UnauthorizedException Handler")
    class UnauthorizedExceptionTests {

        @Test
        @DisplayName("should return 401")
        void shouldReturn401() {
            // given
            UnauthorizedException ex = new UnauthorizedException("Invalid token");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleUnauthorized(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getError()).isEqualTo("Unauthorized");
        }
    }

    @Nested
    @DisplayName("AuthenticationException Handler")
    class AuthenticationExceptionTests {

        @Test
        @DisplayName("should return 401 with authentication error")
        void shouldReturn401() {
            // given
            BadCredentialsException ex = new BadCredentialsException("Bad credentials");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleAuthentication(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getErrorCode()).isEqualTo("AUTHENTICATION_ERROR");
        }
    }

    @Nested
    @DisplayName("AccessDeniedException Handler")
    class AccessDeniedExceptionTests {

        @Test
        @DisplayName("should return 403")
        void shouldReturn403() {
            // given
            AccessDeniedException ex = new AccessDeniedException("Access denied");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getErrorCode()).isEqualTo("ACCESS_DENIED");
        }
    }

    @Nested
    @DisplayName("ConflictException Handler")
    class ConflictExceptionTests {

        @Test
        @DisplayName("should return 409 for conflict")
        void shouldReturn409() {
            // given
            ConflictException ex = new ConflictException("User", "email", "test@example.com");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleConflict(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(409);
            assertThat(response.getBody().getError()).isEqualTo("Conflict");
            assertThat(response.getBody().getMessage()).contains("already exists");
        }
    }

    @Nested
    @DisplayName("RateLimitExceededException Handler")
    class RateLimitExceededExceptionTests {

        @Test
        @DisplayName("should return 429 with Retry-After header")
        void shouldReturn429WithRetryAfter() {
            // given
            RateLimitExceededException ex = new RateLimitExceededException(
                    "Too many requests",
                    120,
                    "login-attempts"
            );

            // when
            ResponseEntity<ErrorResponse> response = handler.handleRateLimitExceeded(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(429);
            
            HttpHeaders headers = response.getHeaders();
            assertThat(headers.getFirst("Retry-After")).isEqualTo("120");
            assertThat(headers.getFirst("X-RateLimit-Type")).isEqualTo("login-attempts");
        }
    }

    @Nested
    @DisplayName("MissingServletRequestParameterException Handler")
    class MissingParameterTests {

        @Test
        @DisplayName("should return 400 with parameter name")
        void shouldReturn400() {
            // given
            MissingServletRequestParameterException ex = 
                    new MissingServletRequestParameterException("page", "int");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleMissingParameter(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).contains("page");
            assertThat(response.getBody().getErrorCode()).isEqualTo("MISSING_PARAMETER");
        }
    }

    @Nested
    @DisplayName("MethodArgumentTypeMismatchException Handler")
    class TypeMismatchTests {

        @Test
        @DisplayName("should return 400 with type info")
        void shouldReturn400() {
            // given
            MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException(
                    "abc",
                    Integer.class,
                    "id",
                    null,
                    new NumberFormatException()
            );

            // when
            ResponseEntity<ErrorResponse> response = handler.handleTypeMismatch(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).contains("id");
            assertThat(response.getBody().getMessage()).contains("Integer");
            assertThat(response.getBody().getErrorCode()).isEqualTo("TYPE_MISMATCH");
        }
    }

    @Nested
    @DisplayName("BusinessException Handler")
    class BusinessExceptionTests {

        @Test
        @DisplayName("should return 400 with error code")
        void shouldReturn400() {
            // given
            BusinessException ex = new BusinessException("Profile not completed", "PROFILE_INCOMPLETE");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleBusiness(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getErrorCode()).isEqualTo("PROFILE_INCOMPLETE");
        }
    }

    @Nested
    @DisplayName("Generic Exception Handler")
    class GenericExceptionTests {

        @Test
        @DisplayName("should return 500 with generic message")
        void shouldReturn500() {
            // given
            Exception ex = new RuntimeException("Unexpected error");

            // when
            ResponseEntity<ErrorResponse> response = handler.handleGeneric(ex, request);

            // then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getErrorCode()).isEqualTo("INTERNAL_ERROR");
            // Should not expose internal error message
            assertThat(response.getBody().getMessage()).doesNotContain("Unexpected error");
        }
    }
}
