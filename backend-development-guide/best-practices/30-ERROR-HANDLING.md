# Error Handling & Exception Management

**Version:** 1.0
**Last Updated:** 2024-01-15
**Target:** Spring Boot 3.2.x, Java 17+

---

## 1. Overview

Bu doküman Meslektaş projesinde exception handling, error response standardizasyonu ve hata yönetimi stratejilerini tanımlar.

---

## 2. Exception Hierarchy

### 2.1 Base Exceptions

**Domain Exceptions:**

```java
/**
 * Base exception for all domain-related errors.
 * These exceptions represent business rule violations.
 */
public abstract class DomainException extends RuntimeException {
    private final String errorCode;

    protected DomainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    protected DomainException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
```

**Infrastructure Exceptions:**

```java
/**
 * Base exception for all infrastructure-related errors.
 * These exceptions represent technical failures (database, external services, etc.).
 */
public abstract class InfrastructureException extends RuntimeException {
    private final String errorCode;

    protected InfrastructureException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    protected InfrastructureException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
```

**Application Exceptions:**

```java
/**
 * Base exception for application layer errors.
 * These exceptions represent validation or orchestration failures.
 */
public abstract class ApplicationException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> details;

    protected ApplicationException(String errorCode, String message) {
        this(errorCode, message, Map.of());
    }

    protected ApplicationException(String errorCode, String message, Map<String, Object> details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
```

---

### 2.2 Domain Exception Hierarchy

**Identity Context:**

```java
// User exceptions
public class UserNotFoundException extends DomainException {
    public UserNotFoundException(String email) {
        super("USER_NOT_FOUND", String.format("User not found with email: %s", email));
    }

    public UserNotFoundException(UserId userId) {
        super("USER_NOT_FOUND", String.format("User not found with id: %s", userId.getValue()));
    }
}

public class DuplicateEmailException extends DomainException {
    public DuplicateEmailException(String email) {
        super("DUPLICATE_EMAIL", String.format("Email already registered: %s", email));
    }
}

public class InvalidPasswordException extends DomainException {
    public InvalidPasswordException(String reason) {
        super("INVALID_PASSWORD", String.format("Invalid password: %s", reason));
    }
}

public class AccountSuspendedException extends DomainException {
    private final LocalDateTime suspendedUntil;

    public AccountSuspendedException(LocalDateTime suspendedUntil) {
        super("ACCOUNT_SUSPENDED",
              String.format("Account suspended until: %s", suspendedUntil));
        this.suspendedUntil = suspendedUntil;
    }

    public LocalDateTime getSuspendedUntil() {
        return suspendedUntil;
    }
}

public class AccountBannedException extends DomainException {
    public AccountBannedException(String reason) {
        super("ACCOUNT_BANNED", String.format("Account permanently banned: %s", reason));
    }
}

// Authentication exceptions
public class InvalidCredentialsException extends DomainException {
    public InvalidCredentialsException() {
        super("INVALID_CREDENTIALS", "Invalid email or password");
    }
}

public class MaxLoginAttemptsExceededException extends DomainException {
    private final int maxAttempts;
    private final Duration lockoutDuration;

    public MaxLoginAttemptsExceededException(int maxAttempts, Duration lockoutDuration) {
        super("MAX_LOGIN_ATTEMPTS_EXCEEDED",
              String.format("Maximum login attempts (%d) exceeded. Try again in %d minutes.",
                           maxAttempts, lockoutDuration.toMinutes()));
        this.maxAttempts = maxAttempts;
        this.lockoutDuration = lockoutDuration;
    }
}

public class InvalidTokenException extends DomainException {
    public InvalidTokenException(String tokenType) {
        super("INVALID_TOKEN", String.format("Invalid or expired %s token", tokenType));
    }
}
```

**Verification Context:**

```java
public class VerificationNotFoundException extends DomainException {
    public VerificationNotFoundException(VerificationRequestId id) {
        super("VERIFICATION_NOT_FOUND",
              String.format("Verification request not found: %s", id.getValue()));
    }
}

public class MaxVerificationAttemptsExceededException extends DomainException {
    private final int maxAttempts;

    public MaxVerificationAttemptsExceededException(int maxAttempts) {
        super("MAX_VERIFICATION_ATTEMPTS_EXCEEDED",
              String.format("Maximum verification attempts (%d) exceeded", maxAttempts));
        this.maxAttempts = maxAttempts;
    }
}

public class VerificationAlreadyCompletedException extends DomainException {
    public VerificationAlreadyCompletedException() {
        super("VERIFICATION_ALREADY_COMPLETED", "User is already verified");
    }
}

public class InvalidDocumentException extends DomainException {
    public InvalidDocumentException(String reason) {
        super("INVALID_DOCUMENT", String.format("Invalid document: %s", reason));
    }
}

public class FaceMatchFailedException extends DomainException {
    private final double similarity;
    private final double threshold;

    public FaceMatchFailedException(double similarity, double threshold) {
        super("FACE_MATCH_FAILED",
              String.format("Face match failed. Similarity: %.2f%%, Required: %.2f%%",
                           similarity, threshold));
        this.similarity = similarity;
        this.threshold = threshold;
    }
}
```

**Social Context:**

```java
public class PostNotFoundException extends DomainException {
    public PostNotFoundException(PostId postId) {
        super("POST_NOT_FOUND", String.format("Post not found: %s", postId.getValue()));
    }
}

public class UnauthorizedPostAccessException extends DomainException {
    public UnauthorizedPostAccessException() {
        super("UNAUTHORIZED_POST_ACCESS", "You don't have permission to access this post");
    }
}

public class ContentTooLongException extends DomainException {
    private final int maxLength;

    public ContentTooLongException(int maxLength) {
        super("CONTENT_TOO_LONG",
              String.format("Content exceeds maximum length of %d characters", maxLength));
        this.maxLength = maxLength;
    }
}

public class UnverifiedUserCannotPostException extends DomainException {
    public UnverifiedUserCannotPostException() {
        super("UNVERIFIED_USER_CANNOT_POST", "Only verified users can create posts");
    }
}

public class AlreadyFollowingException extends DomainException {
    public AlreadyFollowingException(UserId followedUserId) {
        super("ALREADY_FOLLOWING",
              String.format("Already following user: %s", followedUserId.getValue()));
    }
}

public class CannotFollowSelfException extends DomainException {
    public CannotFollowSelfException() {
        super("CANNOT_FOLLOW_SELF", "Cannot follow yourself");
    }
}
```

**Messaging Context:**

```java
public class ConversationNotFoundException extends DomainException {
    public ConversationNotFoundException(ConversationId conversationId) {
        super("CONVERSATION_NOT_FOUND",
              String.format("Conversation not found: %s", conversationId.getValue()));
    }
}

public class UnauthorizedConversationAccessException extends DomainException {
    public UnauthorizedConversationAccessException() {
        super("UNAUTHORIZED_CONVERSATION_ACCESS",
              "You don't have permission to access this conversation");
    }
}

public class MessageTooLongException extends DomainException {
    private final int maxLength;

    public MessageTooLongException(int maxLength) {
        super("MESSAGE_TOO_LONG",
              String.format("Message exceeds maximum length of %d characters", maxLength));
        this.maxLength = maxLength;
    }
}

public class CannotMessageSelfException extends DomainException {
    public CannotMessageSelfException() {
        super("CANNOT_MESSAGE_SELF", "Cannot send message to yourself");
    }
}
```

**Notification Context:**

```java
public class NotificationNotFoundException extends DomainException {
    public NotificationNotFoundException(NotificationId notificationId) {
        super("NOTIFICATION_NOT_FOUND",
              String.format("Notification not found: %s", notificationId.getValue()));
    }
}

public class MaxUnreadNotificationsExceededException extends DomainException {
    private final int maxUnread;

    public MaxUnreadNotificationsExceededException(int maxUnread) {
        super("MAX_UNREAD_NOTIFICATIONS_EXCEEDED",
              String.format("Maximum unread notifications (%d) exceeded", maxUnread));
        this.maxUnread = maxUnread;
    }
}
```

**Moderation Context:**

```java
public class ContentReportNotFoundException extends DomainException {
    public ContentReportNotFoundException(ContentReportId reportId) {
        super("CONTENT_REPORT_NOT_FOUND",
              String.format("Content report not found: %s", reportId.getValue()));
    }
}

public class DuplicateReportException extends DomainException {
    public DuplicateReportException(String contentId) {
        super("DUPLICATE_REPORT",
              String.format("You have already reported this content: %s", contentId));
    }
}

public class UnauthorizedModerationActionException extends DomainException {
    public UnauthorizedModerationActionException() {
        super("UNAUTHORIZED_MODERATION_ACTION",
              "You don't have permission to perform moderation actions");
    }
}
```

---

### 2.3 Infrastructure Exception Hierarchy

**Database Exceptions:**

```java
public class DatabaseException extends InfrastructureException {
    public DatabaseException(String message, Throwable cause) {
        super("DATABASE_ERROR", message, cause);
    }
}

public class OptimisticLockingException extends InfrastructureException {
    public OptimisticLockingException(String entityName, Object entityId) {
        super("OPTIMISTIC_LOCKING_FAILED",
              String.format("Optimistic locking failed for %s with id: %s", entityName, entityId));
    }
}
```

**External Service Exceptions:**

```java
public class ExternalServiceException extends InfrastructureException {
    private final String serviceName;

    public ExternalServiceException(String serviceName, String message) {
        super("EXTERNAL_SERVICE_ERROR",
              String.format("%s service error: %s", serviceName, message));
        this.serviceName = serviceName;
    }

    public ExternalServiceException(String serviceName, String message, Throwable cause) {
        super("EXTERNAL_SERVICE_ERROR",
              String.format("%s service error: %s", serviceName, message), cause);
        this.serviceName = serviceName;
    }
}

// AWS Services
public class S3StorageException extends ExternalServiceException {
    public S3StorageException(String message, Throwable cause) {
        super("AWS S3", message, cause);
    }
}

public class RekognitionException extends ExternalServiceException {
    public RekognitionException(String message, Throwable cause) {
        super("AWS Rekognition", message, cause);
    }
}

public class SESEmailException extends ExternalServiceException {
    public SESEmailException(String message, Throwable cause) {
        super("AWS SES", message, cause);
    }
}

public class FCMPushNotificationException extends ExternalServiceException {
    public FCMPushNotificationException(String message, Throwable cause) {
        super("Firebase Cloud Messaging", message, cause);
    }
}
```

**Cache Exceptions:**

```java
public class CacheException extends InfrastructureException {
    public CacheException(String message, Throwable cause) {
        super("CACHE_ERROR", message, cause);
    }
}
```

---

### 2.4 Application Exception Hierarchy

**Validation Exceptions:**

```java
public class ValidationException extends ApplicationException {
    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
    }

    public ValidationException(String field, String message) {
        super("VALIDATION_ERROR", message, Map.of("field", field));
    }

    public ValidationException(Map<String, String> fieldErrors) {
        super("VALIDATION_ERROR", "Validation failed", Map.of("errors", fieldErrors));
    }
}
```

**Rate Limiting Exceptions:**

```java
public class RateLimitExceededException extends ApplicationException {
    private final int limit;
    private final Duration window;
    private final Duration retryAfter;

    public RateLimitExceededException(int limit, Duration window, Duration retryAfter) {
        super("RATE_LIMIT_EXCEEDED",
              String.format("Rate limit exceeded: %d requests per %s. Retry after %d seconds.",
                           limit, formatDuration(window), retryAfter.toSeconds()),
              Map.of(
                  "limit", limit,
                  "window", window.toString(),
                  "retryAfter", retryAfter.toSeconds()
              ));
        this.limit = limit;
        this.window = window;
        this.retryAfter = retryAfter;
    }

    private static String formatDuration(Duration duration) {
        if (duration.toHours() > 0) {
            return duration.toHours() + " hours";
        } else if (duration.toMinutes() > 0) {
            return duration.toMinutes() + " minutes";
        } else {
            return duration.toSeconds() + " seconds";
        }
    }
}
```

---

## 3. Global Exception Handler

### 3.1 REST Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle domain exceptions (business rule violations)
     */
    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponse> handleDomainException(DomainException ex) {
        log.warn("Domain exception: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Business Rule Violation")
            .message(ex.getMessage())
            .errorCode(ex.getErrorCode())
            .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle infrastructure exceptions (technical failures)
     */
    @ExceptionHandler(InfrastructureException.class)
    public ResponseEntity<ErrorResponse> handleInfrastructureException(InfrastructureException ex) {
        log.error("Infrastructure exception: {}", ex.getMessage(), ex);

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.SERVICE_UNAVAILABLE.value())
            .error("Service Unavailable")
            .message("A technical error occurred. Please try again later.")
            .errorCode(ex.getErrorCode())
            .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    /**
     * Handle application exceptions (validation, rate limiting, etc.)
     */
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ErrorResponse> handleApplicationException(ApplicationException ex) {
        log.warn("Application exception: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Bad Request")
            .message(ex.getMessage())
            .errorCode(ex.getErrorCode())
            .details(ex.getDetails())
            .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle validation exceptions from @Valid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Failed")
            .message("Input validation failed")
            .errorCode("VALIDATION_ERROR")
            .details(Map.of("errors", errors))
            .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle rate limiting
     */
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitException(RateLimitExceededException ex) {
        log.warn("Rate limit exceeded: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.TOO_MANY_REQUESTS.value())
            .error("Too Many Requests")
            .message(ex.getMessage())
            .errorCode(ex.getErrorCode())
            .details(ex.getDetails())
            .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Retry-After",
                   String.valueOf(ex.getDetails().get("retryAfter")));

        return ResponseEntity
            .status(HttpStatus.TOO_MANY_REQUESTS)
            .headers(headers)
            .body(response);
    }

    /**
     * Handle authentication failures
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.UNAUTHORIZED.value())
            .error("Unauthorized")
            .message("Authentication failed")
            .errorCode("AUTHENTICATION_FAILED")
            .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handle authorization failures
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.FORBIDDEN.value())
            .error("Forbidden")
            .message("You don't have permission to access this resource")
            .errorCode("ACCESS_DENIED")
            .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Handle resource not found
     */
    @ExceptionHandler({
        UserNotFoundException.class,
        PostNotFoundException.class,
        ConversationNotFoundException.class,
        NotificationNotFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFoundException(DomainException ex) {
        log.warn("Resource not found: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Not Found")
            .message(ex.getMessage())
            .errorCode(ex.getErrorCode())
            .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle unexpected exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception ex) {
        log.error("Unexpected exception", ex);

        ErrorResponse response = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message("An unexpected error occurred. Please try again later.")
            .errorCode("INTERNAL_ERROR")
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

---

### 3.2 Error Response DTO

```java
@Data
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String errorCode;
    private Map<String, Object> details;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Map<String, Object> getDetails() {
        return details;
    }
}
```

**Example Error Responses:**

```json
// 400 Bad Request - Validation Error
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "errors": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}

// 400 Bad Request - Domain Exception
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Business Rule Violation",
  "message": "Email already registered: test@example.com",
  "errorCode": "DUPLICATE_EMAIL"
}

// 401 Unauthorized
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication failed",
  "errorCode": "AUTHENTICATION_FAILED"
}

// 403 Forbidden
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource",
  "errorCode": "ACCESS_DENIED"
}

// 404 Not Found
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with email: test@example.com",
  "errorCode": "USER_NOT_FOUND"
}

// 429 Too Many Requests
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded: 10 requests per 1 hour. Retry after 3600 seconds.",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 10,
    "window": "PT1H",
    "retryAfter": 3600
  }
}

// 500 Internal Server Error
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "errorCode": "INTERNAL_ERROR"
}

// 503 Service Unavailable - Infrastructure Exception
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 503,
  "error": "Service Unavailable",
  "message": "A technical error occurred. Please try again later.",
  "errorCode": "DATABASE_ERROR"
}
```

---

## 4. Retry Strategies

### 4.1 Retry Configuration

```java
@Configuration
public class RetryConfig {

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();

        // Retry 3 times with exponential backoff
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000);  // 1 second
        backOffPolicy.setMultiplier(2.0);         // Double each time
        backOffPolicy.setMaxInterval(10000);      // Max 10 seconds

        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);

        retryTemplate.setBackOffPolicy(backOffPolicy);
        retryTemplate.setRetryPolicy(retryPolicy);

        return retryTemplate;
    }
}
```

---

### 4.2 Retry Usage

```java
@Service
public class ExternalVerificationService {
    private final RetryTemplate retryTemplate;
    private final RekognitionClient rekognitionClient;

    public VerificationResult verifyDocument(Document document) {
        try {
            return retryTemplate.execute(context -> {
                log.info("Verification attempt #{}", context.getRetryCount() + 1);
                return rekognitionClient.detectFaces(document);
            });
        } catch (Exception ex) {
            throw new RekognitionException("Face detection failed after retries", ex);
        }
    }
}
```

---

### 4.3 @Retryable Annotation

```java
@Service
public class EmailService {

    @Retryable(
        value = {SESEmailException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    public void sendEmail(String to, String subject, String body) {
        try {
            sesClient.sendEmail(to, subject, body);
        } catch (SesException ex) {
            throw new SESEmailException("Failed to send email", ex);
        }
    }

    @Recover
    public void recoverFromEmailFailure(SESEmailException ex, String to, String subject, String body) {
        log.error("Failed to send email after retries. Recipient: {}", to, ex);
        // Fallback: Save to dead letter queue for manual processing
        deadLetterQueue.add(new FailedEmail(to, subject, body));
    }
}
```

---

## 5. Circuit Breaker Pattern

### 5.1 Resilience4j Configuration

```java
@Configuration
public class CircuitBreakerConfig {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)                    // Open if 50% fail
            .waitDurationInOpenState(Duration.ofSeconds(30))  // Wait 30s before half-open
            .slidingWindowSize(10)                       // Track last 10 calls
            .minimumNumberOfCalls(5)                     // Min 5 calls before calculating
            .permittedNumberOfCallsInHalfOpenState(3)    // Test with 3 calls in half-open
            .build();

        return CircuitBreakerRegistry.of(config);
    }
}
```

---

### 5.2 Circuit Breaker Usage

```java
@Service
public class VerificationService {
    private final CircuitBreaker circuitBreaker;
    private final RekognitionClient rekognitionClient;

    public VerificationService(CircuitBreakerRegistry registry) {
        this.circuitBreaker = registry.circuitBreaker("rekognition");
    }

    public VerificationResult verifyFace(String profileImage, String documentImage) {
        return circuitBreaker.executeSupplier(() -> {
            try {
                return rekognitionClient.compareFaces(profileImage, documentImage);
            } catch (RekognitionException ex) {
                throw new RekognitionException("Face comparison failed", ex);
            }
        });
    }
}
```

---

### 5.3 Fallback Mechanism

```java
@Service
public class VerificationService {

    public VerificationResult verifyFace(String profileImage, String documentImage) {
        try {
            return circuitBreaker.executeSupplier(() ->
                rekognitionClient.compareFaces(profileImage, documentImage)
            );
        } catch (CallNotPermittedException ex) {
            // Circuit is open - use fallback
            log.warn("Rekognition circuit breaker is open. Using manual review fallback.");
            return VerificationResult.requiresManualReview(
                "AI verification temporarily unavailable"
            );
        }
    }
}
```

---

## 6. Error Monitoring & Alerting

### 6.1 Sentry Integration

```java
@Component
public class SentryErrorHandler {

    public void captureException(Exception ex) {
        Sentry.captureException(ex);
    }

    public void captureException(Exception ex, Map<String, String> context) {
        Sentry.captureException(ex, scope -> {
            context.forEach(scope::setExtra);
        });
    }

    public void captureMessage(String message, SentryLevel level) {
        Sentry.captureMessage(message, level);
    }
}
```

---

### 6.2 Custom Error Tracking

```java
@Aspect
@Component
@Slf4j
public class ErrorTrackingAspect {
    private final SentryErrorHandler sentryErrorHandler;
    private final MeterRegistry meterRegistry;

    @AfterThrowing(
        pointcut = "execution(* com.meslektas..*(..))",
        throwing = "ex"
    )
    public void trackError(JoinPoint joinPoint, Exception ex) {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();
        String exceptionType = ex.getClass().getSimpleName();

        // Increment error counter
        meterRegistry.counter("errors",
            "class", className,
            "method", methodName,
            "exception", exceptionType
        ).increment();

        // Send to Sentry for critical errors
        if (isCriticalError(ex)) {
            Map<String, String> context = Map.of(
                "class", className,
                "method", methodName,
                "exceptionType", exceptionType
            );
            sentryErrorHandler.captureException(ex, context);
        }
    }

    private boolean isCriticalError(Exception ex) {
        return ex instanceof InfrastructureException ||
               ex instanceof NullPointerException ||
               ex instanceof IllegalStateException;
    }
}
```

---

## 7. Best Practices

### 7.1 Exception Handling Rules

**DO:**

- ✅ Use specific exception types
- ✅ Include meaningful error messages
- ✅ Add error codes for client handling
- ✅ Log exceptions with appropriate level
- ✅ Use try-with-resources for auto-closeable
- ✅ Catch specific exceptions first
- ✅ Document exceptions in JavaDoc

**DON'T:**

- ❌ Catch generic Exception (unless top-level)
- ❌ Swallow exceptions (empty catch)
- ❌ Expose sensitive information
- ❌ Use exceptions for control flow
- ❌ Create exception in loop
- ❌ Log and rethrow (double logging)

---

### 7.2 Error Logging

```java
// ✅ DOĞRU - Structured logging
@Service
@Slf4j
public class UserService {

    public User registerUser(RegisterUserCommand command) {
        try {
            log.info("Registering user with email: {}", command.email());

            User user = User.create(command);
            userRepository.save(user);

            log.info("User registered successfully. UserId: {}", user.getId());
            return user;

        } catch (DuplicateEmailException ex) {
            log.warn("Registration failed - duplicate email: {}", command.email());
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error during user registration. Email: {}",
                     command.email(), ex);
            throw new InfrastructureException("USER_REGISTRATION_FAILED",
                                            "User registration failed", ex);
        }
    }
}

// ❌ YANLIŞ - Poor logging
public User registerUser(RegisterUserCommand command) {
    try {
        User user = User.create(command);
        userRepository.save(user);
        return user;
    } catch (Exception ex) {
        ex.printStackTrace();  // Don't use printStackTrace
        throw ex;
    }
}
```

---

### 7.3 Transaction Rollback

```java
@Service
@Transactional
public class PostService {

    // ✅ DOĞRU - RuntimeException triggers rollback
    public Post createPost(CreatePostCommand command) {
        Post post = Post.create(command);
        postRepository.save(post);

        if (containsSpam(post.getContent())) {
            throw new ContentViolationException("Post contains spam");
            // Transaction automatically rolls back
        }

        return post;
    }

    // For checked exceptions, specify rollbackFor
    @Transactional(rollbackFor = Exception.class)
    public void processVerification(VerificationRequest request) throws ProcessingException {
        // Will rollback even for checked exceptions
    }
}
```

---

## 8. Error Response Examples by HTTP Status

### 400 Bad Request

- Validation errors
- Business rule violations
- Duplicate resources
- Invalid input format

### 401 Unauthorized

- Invalid credentials
- Missing token
- Expired token
- Invalid token

### 403 Forbidden

- Insufficient permissions
- Suspended account
- Banned account
- Resource access denied

### 404 Not Found

- User not found
- Post not found
- Conversation not found
- Resource doesn't exist

### 409 Conflict

- Optimistic locking failure
- Resource state conflict
- Concurrent modification

### 429 Too Many Requests

- Rate limit exceeded
- Too many login attempts
- Too many verification attempts

### 500 Internal Server Error

- Unexpected exceptions
- Programming errors
- Unhandled edge cases

### 503 Service Unavailable

- Database connection failed
- External service down
- Circuit breaker open
- System overload

---

## 9. Summary

### Key Principles:

- ✅ **Exception Hierarchy** - Domain, Infrastructure, Application
- ✅ **Error Codes** - Unique codes for client handling
- ✅ **Global Handler** - Centralized exception handling
- ✅ **Meaningful Messages** - Clear, actionable error messages
- ✅ **Proper Logging** - Structured logging with context
- ✅ **Retry & Fallback** - Resilience for external services
- ✅ **Circuit Breaker** - Fail fast, recover gracefully
- ✅ **Monitoring** - Track and alert on errors

### Exception Guidelines:

- Domain exceptions for business rules
- Infrastructure exceptions for technical failures
- Application exceptions for validation/orchestration
- Always include error code and message
- Log appropriately (DEBUG, INFO, WARN, ERROR)
- Never expose sensitive data in errors
- Use retry for transient failures
- Use circuit breaker for unstable services

**Result:** Robust, maintainable error handling system that provides great developer and user experience.
