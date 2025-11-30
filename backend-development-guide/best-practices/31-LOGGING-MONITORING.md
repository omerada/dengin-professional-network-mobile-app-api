# Logging, Monitoring & Observability

**Version:** 1.0
**Last Updated:** 2024-01-15
**Target:** Spring Boot 3.2.x, Java 17+

---

## 1. Overview

Bu doküman Meslektaş projesinde logging stratejisi, monitoring, metrics collection ve observability best practice'lerini tanımlar.

---

## 2. Logging Strategy

### 2.1 Logging Framework

**SLF4J + Logback:**

```xml
<!-- pom.xml - Already included in spring-boot-starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-logging</artifactId>
</dependency>
```

**Logback Configuration:**

```xml
<!-- src/main/resources/logback-spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- Console Appender for Development -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- JSON Appender for Production -->
    <appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application-%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxHistory>30</maxHistory>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeContext>true</includeContext>
            <includeMdc>true</includeMdc>
            <includeTags>true</includeTags>
            <includeCallerData>false</includeCallerData>
        </encoder>
    </appender>

    <!-- Async Appender for Performance -->
    <appender name="ASYNC_JSON" class="ch.qos.logback.classic.AsyncAppender">
        <queueSize>512</queueSize>
        <discardingThreshold>0</discardingThreshold>
        <appender-ref ref="JSON_FILE"/>
    </appender>

    <!-- Root Logger -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_JSON"/>
    </root>

    <!-- Application Loggers -->
    <logger name="com.meslektas" level="DEBUG" additivity="false">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_JSON"/>
    </logger>

    <!-- Framework Loggers -->
    <logger name="org.springframework" level="INFO"/>
    <logger name="org.hibernate" level="WARN"/>
    <logger name="org.hibernate.SQL" level="DEBUG"/>
    <logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE"/>

    <!-- External Service Loggers -->
    <logger name="software.amazon.awssdk" level="WARN"/>
    <logger name="com.amazonaws" level="WARN"/>

    <!-- Profile-specific Configuration -->
    <springProfile name="dev">
        <logger name="com.meslektas" level="DEBUG"/>
        <logger name="org.hibernate.SQL" level="DEBUG"/>
    </springProfile>

    <springProfile name="prod">
        <logger name="com.meslektas" level="INFO"/>
        <logger name="org.hibernate.SQL" level="WARN"/>
    </springProfile>

</configuration>
```

---

### 2.2 Structured Logging

**Log Levels:**

- **TRACE:** Çok detaylı debug bilgisi (production'da asla)
- **DEBUG:** Development debugging (sadece dev/staging)
- **INFO:** Önemli business event'ler, başarılı işlemler
- **WARN:** Hata değil ama dikkat gerektiren durumlar
- **ERROR:** Hatalar, exception'lar

**Structured Log Format:**

```java
@Slf4j
@Service
public class UserService {

    public User registerUser(RegisterUserCommand command) {
        // ✅ DOĞRU - Structured logging with context
        log.info("User registration started. Email: {}", command.email());

        try {
            User user = User.create(command);
            userRepository.save(user);

            log.info("User registered successfully. " +
                    "UserId: {}, Email: {}, Profession: {}",
                    user.getId(),
                    user.getEmail(),
                    user.getProfession());

            return user;

        } catch (DuplicateEmailException ex) {
            log.warn("User registration failed - duplicate email. Email: {}",
                    command.email());
            throw ex;

        } catch (Exception ex) {
            log.error("User registration failed unexpectedly. Email: {}",
                     command.email(), ex);
            throw new ApplicationException("Registration failed", ex);
        }
    }

    // ❌ YANLIŞ - String concatenation, no context
    public User registerUserBad(RegisterUserCommand command) {
        log.info("Registering user: " + command.email());  // String concat

        try {
            User user = User.create(command);
            userRepository.save(user);

            log.info("User registered");  // No context
            return user;

        } catch (Exception ex) {
            log.error("Error: " + ex.getMessage());  // No stack trace
            throw ex;
        }
    }
}
```

---

### 2.3 MDC (Mapped Diagnostic Context)

**Request Correlation ID:**

```java
@Component
public class RequestCorrelationFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String correlationId = request.getHeader(CORRELATION_ID_HEADER);

        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Add to MDC
        MDC.put(CORRELATION_ID_MDC_KEY, correlationId);

        // Add to response header
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clean up MDC
            MDC.remove(CORRELATION_ID_MDC_KEY);
        }
    }
}
```

**User Context in MDC:**

```java
@Aspect
@Component
@Slf4j
public class UserContextAspect {

    @Around("@annotation(org.springframework.security.access.prepost.PreAuthorize)")
    public Object addUserToMDC(ProceedingJoinPoint joinPoint) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            String userId = authentication.getName();
            MDC.put("userId", userId);
        }

        try {
            return joinPoint.proceed();
        } finally {
            MDC.remove("userId");
        }
    }
}
```

**Logback Pattern with MDC:**

```xml
<encoder class="net.logstash.logback.encoder.LogstashEncoder">
    <customFields>{"application":"meslektas-backend"}</customFields>
    <fieldNames>
        <timestamp>@timestamp</timestamp>
        <message>message</message>
        <level>level</level>
        <logger>logger</logger>
        <thread>thread</thread>
    </fieldNames>
    <includeMdcKeyName>correlationId</includeMdcKeyName>
    <includeMdcKeyName>userId</includeMdcKeyName>
</encoder>
```

**Example JSON Log Output:**

```json
{
  "@timestamp": "2024-01-15T10:30:45.123Z",
  "application": "meslektas-backend",
  "level": "INFO",
  "logger": "com.meslektas.application.user.UserService",
  "thread": "http-nio-8080-exec-1",
  "message": "User registered successfully",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "profession": "DOCTOR"
  }
}
```

---

### 2.4 Business Event Logging

**Domain Events:**

```java
@Slf4j
@Component
public class DomainEventLogger {

    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Domain Event: UserRegistered. " +
                "UserId: {}, Email: {}, Profession: {}",
                event.userId(),
                event.email(),
                event.profession());
    }

    @EventListener
    public void handleVerificationSubmitted(VerificationSubmittedEvent event) {
        log.info("Domain Event: VerificationSubmitted. " +
                "VerificationId: {}, UserId: {}, DocumentType: {}",
                event.verificationId(),
                event.userId(),
                event.documentType());
    }

    @EventListener
    public void handlePostCreated(PostCreatedEvent event) {
        log.info("Domain Event: PostCreated. " +
                "PostId: {}, AuthorId: {}, ContentLength: {}",
                event.postId(),
                event.authorId(),
                event.contentLength());
    }

    @EventListener
    public void handleMessageSent(MessageSentEvent event) {
        log.info("Domain Event: MessageSent. " +
                "MessageId: {}, ConversationId: {}, SenderId: {}",
                event.messageId(),
                event.conversationId(),
                event.senderId());
    }
}
```

---

### 2.5 Performance Logging

**Method Execution Time:**

```java
@Aspect
@Component
@Slf4j
public class PerformanceLoggingAspect {

    @Around("@annotation(com.meslektas.common.PerformanceMonitored)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();

            long executionTime = System.currentTimeMillis() - startTime;

            if (executionTime > 1000) {
                log.warn("Slow method execution. Class: {}, Method: {}, Duration: {}ms",
                        className, methodName, executionTime);
            } else {
                log.debug("Method executed. Class: {}, Method: {}, Duration: {}ms",
                         className, methodName, executionTime);
            }

            return result;

        } catch (Throwable ex) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("Method failed. Class: {}, Method: {}, Duration: {}ms",
                     className, methodName, executionTime, ex);
            throw ex;
        }
    }
}

// Usage
@Service
public class FeedService {

    @PerformanceMonitored
    public List<Post> generateFeed(UserId userId) {
        // Feed generation logic
    }
}
```

---

## 3. Application Metrics

### 3.1 Micrometer Configuration

**Dependency:**

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>

<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-cloudwatch2</artifactId>
</dependency>
```

**Configuration:**

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
    metrics:
      enabled: true
  metrics:
    export:
      prometheus:
        enabled: true
      cloudwatch:
        enabled: true
        namespace: Meslektas
        step: 1m
    tags:
      application: meslektas-backend
      environment: ${spring.profiles.active}
    distribution:
      percentiles-histogram:
        http.server.requests: true
```

---

### 3.2 Custom Metrics

**Business Metrics:**

```java
@Component
public class BusinessMetrics {

    private final Counter userRegistrationCounter;
    private final Counter verificationSubmittedCounter;
    private final Counter postCreatedCounter;
    private final Counter messageSentCounter;

    private final Gauge activeUsersGauge;

    private final Timer feedGenerationTimer;
    private final Timer verificationProcessingTimer;

    public BusinessMetrics(MeterRegistry registry) {
        // Counters - always increasing
        this.userRegistrationCounter = Counter.builder("user.registration")
            .description("Total user registrations")
            .tag("type", "count")
            .register(registry);

        this.verificationSubmittedCounter = Counter.builder("verification.submitted")
            .description("Total verification submissions")
            .register(registry);

        this.postCreatedCounter = Counter.builder("post.created")
            .description("Total posts created")
            .register(registry);

        this.messageSentCounter = Counter.builder("message.sent")
            .description("Total messages sent")
            .register(registry);

        // Gauges - current value
        this.activeUsersGauge = Gauge.builder("user.active", this::getActiveUserCount)
            .description("Current active users")
            .register(registry);

        // Timers - measure duration
        this.feedGenerationTimer = Timer.builder("feed.generation")
            .description("Feed generation time")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);

        this.verificationProcessingTimer = Timer.builder("verification.processing")
            .description("Verification processing time")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }

    public void recordUserRegistration() {
        userRegistrationCounter.increment();
    }

    public void recordVerificationSubmitted() {
        verificationSubmittedCounter.increment();
    }

    public void recordPostCreated() {
        postCreatedCounter.increment();
    }

    public void recordMessageSent() {
        messageSentCounter.increment();
    }

    public void recordFeedGeneration(Runnable feedGeneration) {
        feedGenerationTimer.record(feedGeneration);
    }

    public <T> T recordVerificationProcessing(Supplier<T> verification) {
        return verificationProcessingTimer.record(verification);
    }

    private int getActiveUserCount() {
        // Query Redis or database for active user count
        return 0; // Placeholder
    }
}
```

**Usage in Service:**

```java
@Service
@RequiredArgsConstructor
public class UserService {
    private final BusinessMetrics businessMetrics;

    public User registerUser(RegisterUserCommand command) {
        User user = User.create(command);
        userRepository.save(user);

        // Record metric
        businessMetrics.recordUserRegistration();

        return user;
    }
}

@Service
@RequiredArgsConstructor
public class FeedService {
    private final BusinessMetrics businessMetrics;

    public List<Post> generateFeed(UserId userId) {
        return businessMetrics.recordFeedGeneration(() -> {
            // Feed generation logic
            return computeFeed(userId);
        });
    }
}
```

---

### 3.3 HTTP Metrics

**Automatic HTTP Metrics:**

```java
@Configuration
public class MetricsConfig {

    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
}

@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping("/register")
    @Timed(value = "http.user.register", description = "User registration endpoint")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        // Implementation
    }
}
```

**Custom HTTP Metrics:**

```java
@Component
public class HttpMetricsFilter extends OncePerRequestFilter {

    private final MeterRegistry meterRegistry;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            Timer.builder("http.request.duration")
                .tag("method", request.getMethod())
                .tag("uri", request.getRequestURI())
                .tag("status", String.valueOf(response.getStatus()))
                .register(meterRegistry)
                .record(duration, TimeUnit.MILLISECONDS);
        }
    }
}
```

---

### 3.4 Database Metrics

**Connection Pool Metrics:**

```yaml
# application.yml
spring:
  datasource:
    hikari:
      metrics:
        enabled: true
      pool-name: MeslektasHikariPool
```

**Query Performance Metrics:**

```java
@Aspect
@Component
public class DatabaseMetricsAspect {

    private final MeterRegistry meterRegistry;

    @Around("execution(* com.meslektas.infrastructure.persistence..*Repository.*(..))")
    public Object recordDatabaseQuery(ProceedingJoinPoint joinPoint) throws Throwable {
        String repositoryName = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        return Timer.builder("database.query")
            .tag("repository", repositoryName)
            .tag("method", methodName)
            .register(meterRegistry)
            .recordCallable(() -> {
                try {
                    return joinPoint.proceed();
                } catch (Throwable ex) {
                    throw new RuntimeException(ex);
                }
            });
    }
}
```

---

### 3.5 Cache Metrics

**Redis Cache Metrics:**

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration(MeterRegistry meterRegistry) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .disableCachingNullValues()
            .serializeValuesWith(
                SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())
            );
    }

    @Bean
    public CacheMetricsRegistrar cacheMetricsRegistrar(
        CacheManager cacheManager,
        MeterRegistry meterRegistry
    ) {
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                Gauge.builder("cache.size", cache, c -> c.getNativeCache())
                    .tag("cache", cacheName)
                    .register(meterRegistry);
            }
        });

        return new CacheMetricsRegistrar();
    }
}

@Component
public class CacheMetrics {
    private final MeterRegistry meterRegistry;

    public void recordCacheHit(String cacheName) {
        Counter.builder("cache.hit")
            .tag("cache", cacheName)
            .register(meterRegistry)
            .increment();
    }

    public void recordCacheMiss(String cacheName) {
        Counter.builder("cache.miss")
            .tag("cache", cacheName)
            .register(meterRegistry)
            .increment();
    }
}
```

---

## 4. Health Checks

### 4.1 Built-in Health Indicators

**Configuration:**

```yaml
# application.yml
management:
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
  health:
    db:
      enabled: true
    redis:
      enabled: true
    diskspace:
      enabled: true
```

**Health Endpoint Response:**

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "7.0.5"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 107374182400,
        "free": 53687091200,
        "threshold": 10485760,
        "exists": true
      }
    }
  }
}
```

---

### 4.2 Custom Health Indicators

**AWS S3 Health Check:**

```java
@Component
public class S3HealthIndicator implements HealthIndicator {

    private final S3Client s3Client;
    private final String bucketName;

    @Override
    public Health health() {
        try {
            HeadBucketRequest request = HeadBucketRequest.builder()
                .bucket(bucketName)
                .build();

            s3Client.headBucket(request);

            return Health.up()
                .withDetail("bucket", bucketName)
                .withDetail("status", "accessible")
                .build();

        } catch (Exception ex) {
            return Health.down()
                .withDetail("bucket", bucketName)
                .withDetail("error", ex.getMessage())
                .build();
        }
    }
}
```

**External API Health Check:**

```java
@Component
public class RekognitionHealthIndicator implements HealthIndicator {

    private final RekognitionClient rekognitionClient;

    @Override
    public Health health() {
        try {
            // Test with a simple API call
            ListCollectionsRequest request = ListCollectionsRequest.builder()
                .maxResults(1)
                .build();

            rekognitionClient.listCollections(request);

            return Health.up()
                .withDetail("service", "AWS Rekognition")
                .withDetail("status", "available")
                .build();

        } catch (Exception ex) {
            return Health.down()
                .withDetail("service", "AWS Rekognition")
                .withDetail("error", ex.getMessage())
                .build();
        }
    }
}
```

**Readiness Probe:**

```java
@Component
public class ApplicationReadinessHealthIndicator implements HealthIndicator {

    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public Health health() {
        // Check if application is ready to serve traffic

        try {
            // Test database
            userRepository.count();

            // Test Redis
            redisTemplate.opsForValue().get("health-check");

            return Health.up()
                .withDetail("status", "ready")
                .build();

        } catch (Exception ex) {
            return Health.down()
                .withDetail("status", "not ready")
                .withDetail("error", ex.getMessage())
                .build();
        }
    }
}
```

---

## 5. Distributed Tracing

### 5.1 Spring Cloud Sleuth (Micrometer Tracing)

**Dependency:**

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>

<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

**Configuration:**

```yaml
# application.yml
management:
  tracing:
    sampling:
      probability: 0.1 # 10% of requests
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans
```

**Custom Span:**

```java
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final Tracer tracer;
    private final RekognitionClient rekognitionClient;

    public VerificationResult verifyFace(String profileImage, String documentImage) {
        Span span = tracer.nextSpan().name("verify-face").start();

        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            span.tag("profileImage", profileImage);
            span.tag("documentImage", documentImage);

            VerificationResult result = rekognitionClient.compareFaces(
                profileImage,
                documentImage
            );

            span.tag("similarity", String.valueOf(result.getSimilarity()));
            span.tag("result", result.isPassed() ? "PASS" : "FAIL");

            return result;

        } catch (Exception ex) {
            span.error(ex);
            throw ex;
        } finally {
            span.end();
        }
    }
}
```

---

## 6. APM Integration

### 6.1 Sentry Configuration

**Dependency:**

```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-spring-boot-starter-jakarta</artifactId>
    <version>6.30.0</version>
</dependency>

<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-logback</artifactId>
    <version>6.30.0</version>
</dependency>
```

**Configuration:**

```yaml
# application.yml
sentry:
  dsn: ${SENTRY_DSN}
  environment: ${spring.profiles.active}
  release: meslektas-backend@${APPLICATION_VERSION}
  traces-sample-rate: 0.2 # 20% of transactions
  send-default-pii: false
  enable-tracing: true
  in-app-includes:
    - com.meslektas
```

**Custom Context:**

```java
@Component
public class SentryContextProvider {

    public void setUserContext(User user) {
        io.sentry.protocol.User sentryUser = new io.sentry.protocol.User();
        sentryUser.setId(user.getId().getValue().toString());
        sentryUser.setEmail(user.getEmail().getValue());
        sentryUser.setUsername(user.getFullName().getValue());

        Map<String, String> data = new HashMap<>();
        data.put("profession", user.getProfession().name());
        data.put("isVerified", String.valueOf(user.isVerified()));
        sentryUser.setData(data);

        Sentry.setUser(sentryUser);
    }

    public void addBreadcrumb(String message, String category) {
        Breadcrumb breadcrumb = new Breadcrumb();
        breadcrumb.setMessage(message);
        breadcrumb.setCategory(category);
        breadcrumb.setLevel(SentryLevel.INFO);

        Sentry.addBreadcrumb(breadcrumb);
    }

    public void setContext(String key, Object value) {
        Sentry.setExtra(key, value);
    }
}
```

---

### 6.2 New Relic (Alternative)

**Dependency:**

```xml
<dependency>
    <groupId>com.newrelic.agent.java</groupId>
    <artifactId>newrelic-api</artifactId>
    <version>8.6.0</version>
</dependency>
```

**Custom Transaction:**

```java
@Service
public class FeedService {

    public List<Post> generateFeed(UserId userId) {
        NewRelic.setTransactionName("Custom", "GenerateFeed");
        NewRelic.addCustomParameter("userId", userId.getValue().toString());

        long startTime = System.currentTimeMillis();

        try {
            List<Post> feed = computeFeed(userId);

            NewRelic.addCustomParameter("feedSize", feed.size());
            NewRelic.recordMetric("Custom/Feed/Size", feed.size());

            return feed;

        } finally {
            long duration = System.currentTimeMillis() - startTime;
            NewRelic.recordMetric("Custom/Feed/Duration", duration);
        }
    }
}
```

---

## 7. CloudWatch Integration

### 7.1 CloudWatch Logs

**AWS CloudWatch Appender:**

```xml
<dependency>
    <groupId>ca.pjer</groupId>
    <artifactId>logback-awslogs-appender</artifactId>
    <version>1.6.0</version>
</dependency>
```

**Logback Configuration:**

```xml
<appender name="AWS_LOGS" class="ca.pjer.logback.AwsLogsAppender">
    <layout>
        <pattern>%d{yyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </layout>
    <logGroupName>/aws/meslektas/backend</logGroupName>
    <logStreamName>${HOSTNAME}-${spring.profiles.active}</logStreamName>
    <logRegion>eu-west-1</logRegion>
    <maxBatchLogEvents>50</maxBatchLogEvents>
    <maxFlushTimeMillis>30000</maxFlushTimeMillis>
    <maxBlockTimeMillis>5000</maxBlockTimeMillis>
</appender>
```

---

### 7.2 CloudWatch Metrics

**Custom Metrics:**

```java
@Component
@RequiredArgsConstructor
public class CloudWatchMetrics {

    private final CloudWatchAsyncClient cloudWatchClient;

    public void publishMetric(String metricName, double value, String unit) {
        MetricDatum datum = MetricDatum.builder()
            .metricName(metricName)
            .value(value)
            .unit(StandardUnit.fromValue(unit))
            .timestamp(Instant.now())
            .build();

        PutMetricDataRequest request = PutMetricDataRequest.builder()
            .namespace("Meslektas/Backend")
            .metricData(datum)
            .build();

        cloudWatchClient.putMetricData(request);
    }

    public void recordUserRegistration() {
        publishMetric("UserRegistration", 1.0, "Count");
    }

    public void recordFeedGenerationTime(long milliseconds) {
        publishMetric("FeedGenerationTime", milliseconds, "Milliseconds");
    }
}
```

---

### 7.3 CloudWatch Alarms

**Alarm Configuration (Terraform):**

```hcl
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "meslektas-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors high 5XX error rate"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

resource "aws_cloudwatch_metric_alarm" "slow_response_time" {
  alarm_name          = "meslektas-slow-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This metric monitors slow API response time"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

---

## 8. Monitoring Dashboard

### 8.1 Prometheus + Grafana

**Prometheus Configuration:**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "meslektas-backend"
    metrics_path: "/actuator/prometheus"
    static_configs:
      - targets: ["localhost:8080"]
```

**Grafana Dashboard:**

```json
{
  "dashboard": {
    "title": "Meslektaş Backend Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_server_requests_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Database Connection Pool",
        "targets": [
          {
            "expr": "hikaricp_connections_active"
          },
          {
            "expr": "hikaricp_connections_idle"
          }
        ]
      },
      {
        "title": "JVM Memory",
        "targets": [
          {
            "expr": "jvm_memory_used_bytes{area=\"heap\"}"
          },
          {
            "expr": "jvm_memory_max_bytes{area=\"heap\"}"
          }
        ]
      }
    ]
  }
}
```

---

### 8.2 Key Metrics to Monitor

**Application Metrics:**

- Request rate (req/sec)
- Error rate (%)
- Response time (p50, p95, p99)
- Active users
- User registrations per day
- Posts created per day
- Messages sent per day
- Verification requests per day

**Infrastructure Metrics:**

- CPU utilization (%)
- Memory utilization (%)
- Disk usage (%)
- Network I/O (MB/s)

**Database Metrics:**

- Connection pool (active, idle)
- Query execution time (ms)
- Transaction rate (tx/sec)
- Slow queries (> 1s)
- Database size (GB)

**Cache Metrics:**

- Cache hit rate (%)
- Cache miss rate (%)
- Eviction rate
- Memory usage (MB)

**External Services:**

- AWS S3 API calls
- AWS Rekognition API calls
- AWS SES email sent
- FCM push notifications sent

---

## 9. Alerting Strategy

### 9.1 Alert Levels

**Critical (P1):**

- Application down (health check failing)
- Database unreachable
- High error rate (> 5%)
- Response time > 5s (p95)
- Disk usage > 90%

**High (P2):**

- Moderate error rate (2-5%)
- Slow response time (2-5s)
- External service failures
- Memory usage > 80%

**Medium (P3):**

- Low error rate (1-2%)
- Cache hit rate < 60%
- Slow database queries

**Low (P4):**

- Informational alerts
- Capacity warnings

---

### 9.2 Alert Channels

**SNS Topics:**

```hcl
resource "aws_sns_topic" "critical_alerts" {
  name = "meslektas-critical-alerts"
}

resource "aws_sns_topic_subscription" "critical_pagerduty" {
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "https"
  endpoint  = var.pagerduty_endpoint
}

resource "aws_sns_topic_subscription" "critical_email" {
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "email"
  endpoint  = "oncall@meslektas.com"
}
```

---

## 10. Logging Best Practices

### 10.1 DO's

✅ **Use appropriate log levels**
✅ **Include context (userId, correlationId)**
✅ **Use structured logging (JSON)**
✅ **Log business events**
✅ **Log performance metrics**
✅ **Use async logging**
✅ **Rotate log files**
✅ **Centralize logs (CloudWatch, ELK)**

### 10.2 DON'Ts

❌ **Don't log sensitive data (passwords, tokens)**
❌ **Don't use System.out.println**
❌ **Don't log in loops (high volume)**
❌ **Don't ignore exceptions**
❌ **Don't use string concatenation**
❌ **Don't log entire objects (performance)**

---

## 11. Summary

### Logging:

- **SLF4J + Logback** - Structured JSON logging
- **MDC** - Correlation ID, User context
- **Async Appenders** - Performance
- **CloudWatch Logs** - Centralized logging

### Metrics:

- **Micrometer** - Application metrics
- **Prometheus** - Metrics collection
- **CloudWatch Metrics** - AWS integration
- **Custom Metrics** - Business KPIs

### Monitoring:

- **Health Checks** - Readiness/Liveness probes
- **Distributed Tracing** - Request flow tracking
- **APM** - Sentry/New Relic
- **Grafana Dashboards** - Visualization

### Alerting:

- **CloudWatch Alarms** - Automated alerts
- **SNS** - Multi-channel notifications
- **PagerDuty** - On-call management
- **Severity Levels** - P1-P4 classification

**Result:** Comprehensive observability solution for production-grade application monitoring and troubleshooting.
