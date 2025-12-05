package com.meslektas.common.api;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.common.exception.ConflictException;
import com.meslektas.common.exception.RateLimitExceededException;
import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.common.exception.UnauthorizedException;
import com.meslektas.common.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static com.meslektas.common.api.ErrorCodes.*;

/**
 * Global exception handler for all REST controllers.
 * Provides consistent error responses across the application.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFound(
                        ResourceNotFoundException ex,
                        HttpServletRequest request) {
                log.warn("Resource not found: {}", ex.getMessage());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.NOT_FOUND.value())
                                .error("Not Found")
                                .message(ex.getMessage())
                                .errorCode(ex.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        @ExceptionHandler(ValidationException.class)
        public ResponseEntity<ErrorResponse> handleValidation(
                        ValidationException ex,
                        HttpServletRequest request) {
                log.warn("Validation error: {}", ex.getMessage());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Validation Error")
                                .message(ex.getMessage())
                                .errorCode(ex.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.badRequest().body(error);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                Map<String, String> validationErrors = new HashMap<>();
                ex.getBindingResult().getAllErrors().forEach(error -> {
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        validationErrors.put(fieldName, errorMessage);
                });

                log.warn("Validation errors: {}", validationErrors);

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Validation Error")
                                .message("Geçersiz giriş parametreleri")
                                .errorCode(VALIDATION_ERROR)
                                .path(request.getRequestURI())
                                .validationErrors(validationErrors)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.badRequest().body(error);
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponse> handleUnauthorized(
                        UnauthorizedException ex,
                        HttpServletRequest request) {
                log.warn("Unauthorized access: {}", ex.getMessage());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.UNAUTHORIZED.value())
                                .error("Unauthorized")
                                .message(ex.getMessage())
                                .errorCode(ex.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ErrorResponse> handleAuthentication(
                        AuthenticationException ex,
                        HttpServletRequest request) {
                log.warn("Authentication failed: {}", ex.getMessage());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.UNAUTHORIZED.value())
                                .error("Authentication Failed")
                                .message("Geçersiz kimlik bilgileri")
                                .errorCode(AUTH_INVALID_CREDENTIALS)
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDenied(
                        AccessDeniedException ex,
                        HttpServletRequest request) {
                log.warn("Access denied: {}", ex.getMessage());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.FORBIDDEN.value())
                                .error("Forbidden")
                                .message("Bu kaynağa erişim izniniz bulunmamaktadır")
                                .errorCode(SYSTEM_ACCESS_DENIED)
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ErrorResponse> handleBusiness(
                        BusinessException ex,
                        HttpServletRequest request) {
                log.warn("Business exception: {}", ex.getMessage());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Business Error")
                                .message(ex.getMessage())
                                .errorCode(ex.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.badRequest().body(error);
        }

        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<ErrorResponse> handleConflict(
                        ConflictException ex,
                        HttpServletRequest request) {
                log.warn("Conflict: {}", ex.getMessage());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.CONFLICT.value())
                                .error("Conflict")
                                .message(ex.getMessage())
                                .errorCode(ex.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        @ExceptionHandler(RateLimitExceededException.class)
        public ResponseEntity<ErrorResponse> handleRateLimitExceeded(
                        RateLimitExceededException ex,
                        HttpServletRequest request) {
                log.warn("Rate limit exceeded: {} - Type: {}", ex.getMessage(), ex.getLimitType());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                                .error("Too Many Requests")
                                .message(ex.getMessage())
                                .errorCode(ex.getErrorCode())
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                HttpHeaders headers = new HttpHeaders();
                headers.add("Retry-After", String.valueOf(ex.getRetryAfterSeconds()));
                headers.add("X-RateLimit-Type", ex.getLimitType());

                return ResponseEntity
                                .status(HttpStatus.TOO_MANY_REQUESTS)
                                .headers(headers)
                                .body(error);
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ErrorResponse> handleMissingParameter(
                        MissingServletRequestParameterException ex,
                        HttpServletRequest request) {
                log.warn("Missing parameter: {}", ex.getParameterName());

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Bad Request")
                                .message(String.format("Zorunlu parametre '%s' eksik", ex.getParameterName()))
                                .errorCode(SYSTEM_MISSING_PARAMETER)
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.badRequest().body(error);
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ErrorResponse> handleTypeMismatch(
                        MethodArgumentTypeMismatchException ex,
                        HttpServletRequest request) {
                log.warn("Type mismatch for parameter: {}", ex.getName());

                String expectedType = ex.getRequiredType() != null
                                ? ex.getRequiredType().getSimpleName()
                                : "unknown";

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error("Bad Request")
                                .message(String.format("'%s' parametresi %s tipinde olmalıdır", ex.getName(),
                                                expectedType))
                                .errorCode(SYSTEM_TYPE_MISMATCH)
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.badRequest().body(error);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGeneric(
                        Exception ex,
                        HttpServletRequest request) {
                log.error("Unexpected error occurred", ex);

                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .error("Internal Server Error")
                                .message("Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.")
                                .errorCode(SYSTEM_INTERNAL_ERROR)
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
}
