package com.dengin.common.exception;

/**
 * Exception thrown when a resource already exists.
 * Results in HTTP 409 Conflict.
 * 
 * Use cases:
 * - Duplicate email during registration
 * - Duplicate resource creation
 * - Constraint violations
 */
public class ConflictException extends BusinessException {

    private static final String DEFAULT_ERROR_CODE = "CONFLICT";

    public ConflictException(String message) {
        super(message, DEFAULT_ERROR_CODE);
    }

    public ConflictException(String message, String errorCode) {
        super(message, errorCode);
    }

    public ConflictException(String resourceType, String field, Object value) {
        super(String.format("%s with %s '%s' already exists", resourceType, field, value), 
              DEFAULT_ERROR_CODE);
    }
}
