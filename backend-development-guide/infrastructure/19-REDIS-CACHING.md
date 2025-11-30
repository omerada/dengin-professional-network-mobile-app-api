# Redis Caching Kılavuzu

## 1. Genel Bakış

### 1.1 Redis Nedir?

Redis (Remote Dictionary Server), in-memory key-value data store'dur. Cache, session storage, pub/sub messaging için kullanılır.

**Use Cases:**

- **Cache:** Frequent queries, feed data, user profiles
- **Session:** User sessions, JWT blacklist
- **Rate Limiting:** API rate limits, message throttling
- **Pub/Sub:** WebSocket message broadcasting
- **Distributed Locks:** Concurrent operation coordination

**Meslektaş Context:**

```
Redis 7.x
Spring Data Redis 3.2.x
Lettuce (Redis client)
Cache Abstraction (@Cacheable)
```

**Architecture:**

```
Client Request
    ↓
Application Service
    ↓ Check Cache
Redis (Cache Hit → Return)
    ↓ Cache Miss
Database Query
    ↓
Store in Redis
    ↓
Return to Client
```

### 1.2 Cache Strategy

**Cache Patterns:**

- **Cache-Aside:** Application manages cache (most common)
- **Write-Through:** Write to cache and DB simultaneously
- **Write-Behind:** Write to cache first, DB later (async)
- **Read-Through:** Cache loads data from DB automatically

**Meslektaş Approach:** Cache-Aside with TTL

---

## 2. Redis Configuration

### 2.1 Dependencies

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>

<!-- Optional: Redis client (Lettuce included by default) -->
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
</dependency>
```

### 2.2 Redis Configuration

**application.yml:**

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: 2000ms

  cache:
    type: redis
    redis:
      time-to-live: 600000 # 10 minutes default
      cache-null-values: false
      key-prefix: "meslektas::"

# Custom cache TTLs
cache:
  ttl:
    user-profile: 3600000 # 1 hour
    feed: 300000 # 5 minutes
    post: 1800000 # 30 minutes
    verification-status: 60000 # 1 minute
    notifications: 120000 # 2 minutes
```

**RedisConfig:**

```java
package com.meslektas.infrastructure.redis.config;

@Configuration
@EnableCaching
@EnableRedisRepositories
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);

        if (!redisPassword.isEmpty()) {
            config.setPassword(redisPassword);
        }

        // Lettuce pool configuration
        LettucePoolingClientConfiguration poolConfig = LettucePoolingClientConfiguration.builder()
            .poolConfig(new GenericObjectPoolConfig<>() {{
                setMaxTotal(20);
                setMaxIdle(10);
                setMinIdle(5);
            }})
            .build();

        return new LettuceConnectionFactory(config, poolConfig);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(
        RedisConnectionFactory connectionFactory
    ) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Key serializer
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Value serializer (JSON)
        Jackson2JsonRedisSerializer<Object> serializer =
            new Jackson2JsonRedisSerializer<>(Object.class);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(
            objectMapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL
        );
        serializer.setObjectMapper(objectMapper);

        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()
                )
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()
                )
            )
            .disableCachingNullValues();

        // Custom cache configurations
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        cacheConfigurations.put("userProfiles",
            defaultConfig.entryTtl(Duration.ofHours(1)));

        cacheConfigurations.put("feed",
            defaultConfig.entryTtl(Duration.ofMinutes(5)));

        cacheConfigurations.put("posts",
            defaultConfig.entryTtl(Duration.ofMinutes(30)));

        cacheConfigurations.put("verificationStatus",
            defaultConfig.entryTtl(Duration.ofMinutes(1)));

        cacheConfigurations.put("notifications",
            defaultConfig.entryTtl(Duration.ofMinutes(2)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
}
```

---

## 3. Cache Implementation

### 3.1 User Profile Caching

**UserQueryService:**

```java
package com.meslektas.application.user;

@Service
@Transactional(readOnly = true)
public class UserQueryService {

    private final UserRepository userRepository;

    /**
     * Cache user profile for 1 hour
     */
    @Cacheable(value = "userProfiles", key = "#userId.value")
    public UserProfileDTO getUserProfile(UserId userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        return UserProfileDTO.from(user);
    }

    /**
     * Evict cache when profile updated
     */
    @CacheEvict(value = "userProfiles", key = "#userId.value")
    public void evictUserProfileCache(UserId userId) {
        // Cache automatically evicted
    }

    /**
     * Update cache after profile change
     */
    @CachePut(value = "userProfiles", key = "#userId.value")
    public UserProfileDTO updateUserProfileCache(UserId userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return UserProfileDTO.from(user);
    }
}
```

**Application Service Integration:**

```java
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserQueryService userQueryService;

    public void updateProfileImage(UserId userId, String imageUrl) {
        User user = userRepository.findById(userId).orElseThrow();
        user.updateProfileImage(imageUrl);
        userRepository.save(user);

        // Evict cache after update
        userQueryService.evictUserProfileCache(userId);
    }
}
```

### 3.2 Feed Caching

**FeedQueryService:**

```java
@Service
@Transactional(readOnly = true)
public class FeedQueryService {

    private final PostRepository postRepository;

    /**
     * Cache feed for 5 minutes
     * Key includes userId and page for different cache entries
     */
    @Cacheable(
        value = "feed",
        key = "#userId.value + ':' + #page + ':' + #size"
    )
    public Page<PostDTO> getFeed(UserId userId, int page, int size) {
        User user = userRepository.findById(userId).orElseThrow();

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findActiveByProfession(
            user.getProfession(),
            user.getBlockedUsers(),
            pageable
        );

        return posts.map(PostDTO::from);
    }

    /**
     * Evict all feed caches when new post created
     */
    @CacheEvict(value = "feed", allEntries = true)
    public void evictAllFeedCaches() {
        // All feed caches evicted
    }
}
```

**Event Handler:**

```java
@Component
public class FeedCacheInvalidator {

    private final FeedQueryService feedQueryService;

    @EventListener
    public void onPostCreated(PostCreatedEvent event) {
        // Invalidate all feed caches
        feedQueryService.evictAllFeedCaches();
    }

    @EventListener
    public void onPostDeleted(PostDeletedEvent event) {
        feedQueryService.evictAllFeedCaches();
    }
}
```

### 3.3 Verification Status Caching

**VerificationQueryService:**

```java
@Service
@Transactional(readOnly = true)
public class VerificationQueryService {

    /**
     * Cache verification status for 1 minute
     * Short TTL because status changes frequently
     */
    @Cacheable(
        value = "verificationStatus",
        key = "#userId.value"
    )
    public VerificationStatusDTO getVerificationStatus(UserId userId) {
        VerificationRequest latest = verificationRepository
            .findLatestByUserId(userId)
            .orElseThrow(() -> new VerificationNotFoundException());

        return VerificationStatusDTO.from(latest);
    }

    @CacheEvict(value = "verificationStatus", key = "#userId.value")
    public void evictVerificationStatusCache(UserId userId) {
        // Cache evicted
    }
}
```

---

## 4. Manual Cache Operations

### 4.1 RedisTemplate Usage

**Custom Cache Service:**

```java
@Service
public class RedisCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Set value with TTL
     */
    public void set(String key, Object value, Duration ttl) {
        redisTemplate.opsForValue().set(key, value, ttl);
    }

    /**
     * Get value
     */
    public <T> T get(String key, Class<T> type) {
        Object value = redisTemplate.opsForValue().get(key);
        return type.cast(value);
    }

    /**
     * Delete key
     */
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    /**
     * Check if key exists
     */
    public boolean exists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Increment counter
     */
    public Long increment(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    /**
     * Set with expiration (seconds)
     */
    public void setWithExpire(String key, Object value, long seconds) {
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(seconds));
    }

    /**
     * Get and delete (atomic)
     */
    public <T> T getAndDelete(String key, Class<T> type) {
        Object value = redisTemplate.opsForValue().getAndDelete(key);
        return type.cast(value);
    }
}
```

### 4.2 Hash Operations

**User Session Storage:**

```java
@Service
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String SESSION_PREFIX = "session:";

    public void createSession(String sessionId, SessionData data) {
        String key = SESSION_PREFIX + sessionId;

        Map<String, Object> sessionMap = Map.of(
            "userId", data.userId(),
            "email", data.email(),
            "loginAt", data.loginAt().toString(),
            "ipAddress", data.ipAddress()
        );

        redisTemplate.opsForHash().putAll(key, sessionMap);
        redisTemplate.expire(key, Duration.ofHours(24));
    }

    public SessionData getSession(String sessionId) {
        String key = SESSION_PREFIX + sessionId;
        Map<Object, Object> sessionMap = redisTemplate.opsForHash().entries(key);

        if (sessionMap.isEmpty()) {
            return null;
        }

        return new SessionData(
            (String) sessionMap.get("userId"),
            (String) sessionMap.get("email"),
            Instant.parse((String) sessionMap.get("loginAt")),
            (String) sessionMap.get("ipAddress")
        );
    }

    public void deleteSession(String sessionId) {
        String key = SESSION_PREFIX + sessionId;
        redisTemplate.delete(key);
    }
}
```

### 4.3 List Operations

**Recent Activity Tracking:**

```java
@Service
public class ActivityTracker {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String ACTIVITY_PREFIX = "activity:";
    private static final long MAX_ACTIVITIES = 50;

    public void trackActivity(UserId userId, String activity) {
        String key = ACTIVITY_PREFIX + userId.getValue();

        ActivityRecord record = new ActivityRecord(
            activity,
            Instant.now()
        );

        // Add to list (most recent first)
        redisTemplate.opsForList().leftPush(key, record);

        // Trim to max size
        redisTemplate.opsForList().trim(key, 0, MAX_ACTIVITIES - 1);

        // Set expiration
        redisTemplate.expire(key, Duration.ofDays(7));
    }

    public List<ActivityRecord> getRecentActivities(UserId userId, int limit) {
        String key = ACTIVITY_PREFIX + userId.getValue();

        List<Object> activities = redisTemplate.opsForList().range(key, 0, limit - 1);

        return activities.stream()
            .map(obj -> (ActivityRecord) obj)
            .toList();
    }
}
```

---

## 5. Rate Limiting

### 5.1 Rate Limiter Implementation

**RateLimiterService:**

```java
@Service
public class RateLimiterService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Check if rate limit exceeded (sliding window)
     */
    public boolean isRateLimitExceeded(
        String key,
        int maxRequests,
        Duration window
    ) {
        String rateLimitKey = "ratelimit:" + key;

        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - window.toMillis();

        // Remove old entries
        redisTemplate.opsForZSet().removeRangeByScore(
            rateLimitKey,
            0,
            windowStart
        );

        // Count entries in window
        Long count = redisTemplate.opsForZSet().zCard(rateLimitKey);

        if (count != null && count >= maxRequests) {
            return true;  // Rate limit exceeded
        }

        // Add current request
        redisTemplate.opsForZSet().add(rateLimitKey, currentTime, currentTime);

        // Set expiration
        redisTemplate.expire(rateLimitKey, window);

        return false;
    }

    /**
     * Get remaining requests
     */
    public int getRemainingRequests(
        String key,
        int maxRequests,
        Duration window
    ) {
        String rateLimitKey = "ratelimit:" + key;

        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - window.toMillis();

        // Count entries in window
        Long count = redisTemplate.opsForZSet().count(
            rateLimitKey,
            windowStart,
            currentTime
        );

        return Math.max(0, maxRequests - count.intValue());
    }
}
```

**Usage in Service:**

```java
@Service
public class MessagingService {

    private final RateLimiterService rateLimiterService;

    public MessageId sendMessage(SendMessageCommand command) {
        // Check rate limit: 10 messages per minute
        String rateLimitKey = "user:" + command.senderId().getValue() + ":messages";

        if (rateLimiterService.isRateLimitExceeded(
            rateLimitKey,
            10,
            Duration.ofMinutes(1)
        )) {
            throw new RateLimitExceededException("Too many messages. Please slow down.");
        }

        // Send message...
    }
}
```

### 5.2 API Rate Limiting

**RateLimitInterceptor:**

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;

    @Override
    public boolean preHandle(
        HttpServletRequest request,
        HttpServletResponse response,
        Object handler
    ) throws Exception {
        // Get user ID from JWT
        String userId = JwtTokenProvider.getUserIdFromRequest(request);

        // Rate limit: 100 requests per minute per user
        String rateLimitKey = "api:user:" + userId;

        if (rateLimiterService.isRateLimitExceeded(
            rateLimitKey,
            100,
            Duration.ofMinutes(1)
        )) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Rate limit exceeded");
            return false;
        }

        return true;
    }
}
```

---

## 6. Distributed Locks

### 6.1 RedLock Implementation

**DistributedLockService:**

```java
@Service
public class DistributedLockService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Acquire lock with timeout
     */
    public boolean acquireLock(String lockKey, String lockValue, Duration timeout) {
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(
            "lock:" + lockKey,
            lockValue,
            timeout
        );

        return Boolean.TRUE.equals(acquired);
    }

    /**
     * Release lock (only if owned)
     */
    public void releaseLock(String lockKey, String lockValue) {
        String currentValue = (String) redisTemplate.opsForValue().get("lock:" + lockKey);

        if (lockValue.equals(currentValue)) {
            redisTemplate.delete("lock:" + lockKey);
        }
    }

    /**
     * Execute with lock
     */
    public <T> T executeWithLock(
        String lockKey,
        Duration timeout,
        Supplier<T> operation
    ) {
        String lockValue = UUID.randomUUID().toString();

        boolean acquired = acquireLock(lockKey, lockValue, timeout);

        if (!acquired) {
            throw new LockAcquisitionException("Failed to acquire lock: " + lockKey);
        }

        try {
            return operation.get();
        } finally {
            releaseLock(lockKey, lockValue);
        }
    }
}
```

**Usage:**

```java
@Service
public class VerificationService {

    private final DistributedLockService lockService;

    public void processVerification(VerificationRequestId requestId) {
        String lockKey = "verification:" + requestId.getValue();

        // Prevent concurrent processing of same request
        lockService.executeWithLock(
            lockKey,
            Duration.ofMinutes(5),
            () -> {
                // Process verification
                return null;
            }
        );
    }
}
```

---

## 7. Cache Monitoring

### 7.1 Cache Statistics

**CacheMonitorService:**

```java
@Service
public class CacheMonitorService {

    private final RedisTemplate<String, Object> redisTemplate;

    public CacheStatistics getCacheStatistics(String cacheName) {
        String pattern = cacheName + "::*";

        Set<String> keys = redisTemplate.keys(pattern);

        if (keys == null) {
            return new CacheStatistics(cacheName, 0, 0, 0);
        }

        long totalSize = keys.size();
        long totalMemory = keys.stream()
            .mapToLong(key -> getKeyMemorySize(key))
            .sum();

        long avgTtl = keys.stream()
            .mapToLong(key -> getTtl(key))
            .filter(ttl -> ttl > 0)
            .average()
            .orElse(0);

        return new CacheStatistics(
            cacheName,
            totalSize,
            totalMemory,
            avgTtl
        );
    }

    private long getKeyMemorySize(String key) {
        // Estimate memory usage
        Object value = redisTemplate.opsForValue().get(key);
        if (value == null) return 0;

        // Simplified estimation
        return value.toString().length();
    }

    private long getTtl(String key) {
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return ttl != null ? ttl : -1;
    }
}
```

### 7.2 Cache Health Check

**CacheHealthIndicator:**

```java
@Component
public class CacheHealthIndicator implements HealthIndicator {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public Health health() {
        try {
            // Ping Redis
            String pong = redisTemplate.getConnectionFactory()
                .getConnection()
                .ping();

            if ("PONG".equals(pong)) {
                return Health.up()
                    .withDetail("redis", "Connected")
                    .build();
            } else {
                return Health.down()
                    .withDetail("redis", "No response")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("redis", "Connection failed")
                .withException(e)
                .build();
        }
    }
}
```

---

## 8. Best Practices

### 8.1 Key Naming Convention

```
meslektas::cacheName::key
meslektas::userProfiles::user:123
meslektas::feed::user:123:page:0:size:20
meslektas::posts::post:456
```

### 8.2 TTL Guidelines

```
User Profile: 1 hour (stable data)
Feed: 5 minutes (frequently changing)
Post Details: 30 minutes (moderate changes)
Verification Status: 1 minute (critical, fast-changing)
Notifications: 2 minutes (real-time preference)
```

### 8.3 Cache Eviction Strategy

```
@CacheEvict on write operations
@CachePut for selective updates
allEntries=true for global invalidation
Conditional eviction: condition = "#result != null"
```

---

## 9. Özet

### Redis Usage:

- **Cache:** Query results, DTOs
- **Session:** User sessions, JWT tokens
- **Rate Limiting:** API throttling, message limits
- **Pub/Sub:** WebSocket broadcasting
- **Locks:** Distributed coordination

### Cache Strategy:

- Cache-Aside pattern
- TTL-based expiration
- Event-driven invalidation
- Conditional caching

### Best Practices:

- ✅ Use @Cacheable for reads
- ✅ Use @CacheEvict for writes
- ✅ Set appropriate TTLs
- ✅ Monitor cache statistics
- ✅ Handle cache failures gracefully

### Next:

- **Security Implementation:** 20-SECURITY-IMPLEMENTATION.md (JWT, authorization)
