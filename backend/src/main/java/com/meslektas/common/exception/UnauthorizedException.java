package com.meslektas.common.exception;

/**
 * Exception thrown when unauthorized access is attempted.
 */
public class UnauthorizedException extends BusinessException {
    
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }

    public UnauthorizedException() {
        super("Unauthorized access", "UNAUTHORIZED");
    }
}
