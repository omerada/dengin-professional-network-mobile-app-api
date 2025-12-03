package com.meslektas.common.exception;

/**
 * Exception thrown when rate limit is exceeded.
 * Results in HTTP 429 Too Many Requests.
 */
public class RateLimitExceededException extends RuntimeException {

    private static final String ERROR_CODE = "RATE_LIMIT_EXCEEDED";
    
    private final long retryAfterSeconds;
    private final String limitType;

    public RateLimitExceededException(String message) {
        super(message);
        this.retryAfterSeconds = 60;
        this.limitType = "default";
    }

    public RateLimitExceededException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
        this.limitType = "default";
    }

    public RateLimitExceededException(String message, long retryAfterSeconds, String limitType) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
        this.limitType = limitType;
    }

    public String getErrorCode() {
        return ERROR_CODE;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }

    public String getLimitType() {
        return limitType;
    }
}
