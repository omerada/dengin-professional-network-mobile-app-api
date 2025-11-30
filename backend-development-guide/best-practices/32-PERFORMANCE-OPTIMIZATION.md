# Performance Optimization Guide

**Version:** 1.0
**Last Updated:** 2024-01-15
**Target:** Spring Boot 3.2.x, Java 17+

---

## 1. Overview

Bu doküman Meslektaş projesinde performans optimizasyonu stratejilerini, best practice'leri ve ölçüm metotlarını tanımlar.

---

## 2. Database Performance

### 2.1 N+1 Query Problem

**Problem:**

```java
// ❌ YANLIŞ - N+1 Query Problem
@Service
public class PostService {

    public List<PostDto> getAllPosts() {
        List<Post> posts = postRepository.findAll();  // 1 query

        return posts.stream()
            .map(post -> {
                User author = post.getAuthor();  // N additional queries
                String authorName = author.getFullName();

                List<Comment> comments = post.getComments();  // N additional queries

                return new PostDto(post, authorName, comments.size());
            })
            .toList();
    }
}
```

**Solution - Fetch Join:**

```java
// ✅ DOĞRU - Fetch Join
public interface PostRepository extends JpaRepository<PostEntity, UUID> {

    @Query("SELECT p FROM PostEntity p " +
           "LEFT JOIN FETCH p.author " +
           "WHERE p.id = :id")
    Optional<PostEntity> findByIdWithAuthor(@Param("id") UUID id);

    @Query("SELECT DISTINCT p FROM PostEntity p " +
           "LEFT JOIN FETCH p.author " +
           "LEFT JOIN FETCH p.comments " +
           "WHERE p.author.id = :authorId " +
           "ORDER BY p.createdAt DESC")
    List<PostEntity> findByAuthorIdWithDetails(@Param("authorId") UUID authorId);
}
```

**Solution - EntityGraph:**

```java
public interface PostRepository extends JpaRepository<PostEntity, UUID> {

    @EntityGraph(attributePaths = {"author", "comments"})
    List<PostEntity> findAll();

    @EntityGraph(attributePaths = {"author", "comments.author"})
    @Query("SELECT p FROM PostEntity p WHERE p.author.id = :authorId")
    List<PostEntity> findByAuthorId(@Param("authorId") UUID authorId);
}
```

**Solution - Batch Fetching:**

```java
@Entity
public class PostEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @BatchSize(size = 25)  // Fetch 25 authors at once
    private UserEntity author;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    @BatchSize(size = 25)
    private List<CommentEntity> comments;
}
```

---

### 2.2 Query Optimization

**Select Only Required Columns:**

```java
// ❌ YANLIŞ - Tüm kolonları çek
@Query("SELECT u FROM UserEntity u WHERE u.email = :email")
Optional<UserEntity> findByEmail(@Param("email") String email);

// ✅ DOĞRU - Sadece gerekli kolonları çek
@Query("SELECT new com.meslektas.application.user.dto.UserSummaryDto(" +
       "u.id, u.email, u.fullName, u.profession) " +
       "FROM UserEntity u WHERE u.email = :email")
Optional<UserSummaryDto> findUserSummaryByEmail(@Param("email") String email);
```

**Projection Interface:**

```java
public interface UserSummaryProjection {
    UUID getId();
    String getEmail();
    String getFullName();
    String getProfession();
}

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserSummaryProjection> findProjectionByEmail(String email);
}
```

**Pagination for Large Result Sets:**

```java
// ✅ DOĞRU - Pagination
@Service
public class PostService {

    public Page<PostDto> getUserPosts(UserId userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<PostEntity> posts = postRepository.findByAuthorId(
            userId.getValue(),
            pageable
        );

        return posts.map(this::toDto);
    }
}
```

---

### 2.3 Database Indexes

**Index Strategy:**

```sql
-- Primary key (automatic index)
CREATE TABLE users (
    id UUID PRIMARY KEY
);

-- Unique constraints (automatic index)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Frequently queried columns
CREATE INDEX idx_users_profession ON users(profession);
CREATE INDEX idx_users_verified ON users(is_verified);

-- Composite indexes for multi-column queries
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Partial indexes for filtered queries
CREATE INDEX idx_users_pending_verification ON users(status)
WHERE status = 'PENDING_VERIFICATION';

CREATE INDEX idx_posts_verified_authors ON posts(author_id, created_at)
WHERE author_verified = true;

-- Full-text search indexes
CREATE INDEX idx_posts_content_fts ON posts USING GIN(to_tsvector('turkish', content));
CREATE INDEX idx_messages_content_fts ON messages USING GIN(to_tsvector('turkish', content));
```

**Index Monitoring:**

```sql
-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;

-- Find missing indexes (slow queries)
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100  -- queries taking > 100ms
ORDER BY mean_time DESC
LIMIT 20;
```

---

### 2.4 Connection Pooling

**HikariCP Configuration:**

```yaml
# application.yml
spring:
  datasource:
    hikari:
      # Pool sizing
      minimum-idle: 5
      maximum-pool-size: 20

      # Connection lifecycle
      max-lifetime: 1800000 # 30 minutes
      connection-timeout: 30000 # 30 seconds
      idle-timeout: 600000 # 10 minutes

      # Performance tuning
      auto-commit: false
      connection-test-query: SELECT 1
      validation-timeout: 5000

      # Leak detection
      leak-detection-threshold: 60000 # 60 seconds

      # Pool name for monitoring
      pool-name: MeslektasHikariPool
```

**Connection Pool Sizing Formula:**

```
Optimal Pool Size = (Core Count * 2) + Effective Spindle Count

For CPU-bound: Core Count * 2
For IO-bound: Core Count * (1 + Wait Time / Service Time)

Example for 4 cores, mostly IO-bound:
Pool Size = 4 * 2 = 8 to 20
```

---

### 2.5 Query Caching

**Second-Level Cache (Hibernate):**

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-jcache</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        cache:
          use_second_level_cache: true
          use_query_cache: true
          region:
            factory_class: org.hibernate.cache.jcache.JCacheRegionFactory
        javax:
          cache:
            provider: org.ehcache.jsr107.EhcacheCachingProvider
```

```java
@Entity
@Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class UserEntity {
    // Rarely changing data
}
```

**Query Result Caching:**

```java
@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
    @Query("SELECT u FROM UserEntity u WHERE u.profession = :profession")
    List<UserEntity> findByProfession(@Param("profession") String profession);
}
```

---

### 2.6 Batch Operations

**Batch Insert:**

```java
// ✅ DOĞRU - Batch insert
@Service
@Transactional
public class NotificationService {

    @PersistenceContext
    private EntityManager entityManager;

    public void createNotifications(List<Notification> notifications) {
        int batchSize = 25;

        for (int i = 0; i < notifications.size(); i++) {
            entityManager.persist(notifications.get(i));

            if (i % batchSize == 0 && i > 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }

        entityManager.flush();
        entityManager.clear();
    }
}
```

```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 25
        order_inserts: true
        order_updates: true
```

**Batch Update:**

```java
@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, UUID> {

    @Modifying
    @Query("UPDATE MessageEntity m SET m.readAt = :readAt " +
           "WHERE m.conversationId = :conversationId " +
           "AND m.recipientId = :recipientId " +
           "AND m.readAt IS NULL")
    int markAllAsRead(
        @Param("conversationId") UUID conversationId,
        @Param("recipientId") UUID recipientId,
        @Param("readAt") LocalDateTime readAt
    );
}
```

---

## 3. Caching Strategy

### 3.1 Redis Caching

**Cache Configuration:**

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .disableCachingNullValues()
            .serializeKeysWith(
                SerializationPair.fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())
            );
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // User cache - 1 hour TTL
        cacheConfigurations.put("users",
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1)));

        // Feed cache - 5 minutes TTL
        cacheConfigurations.put("feed",
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5)));

        // Post cache - 15 minutes TTL
        cacheConfigurations.put("posts",
            RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(15)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(cacheConfiguration())
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
}
```

**Cache Usage:**

```java
@Service
public class UserService {

    @Cacheable(value = "users", key = "#userId.value", unless = "#result == null")
    public Optional<User> findById(UserId userId) {
        return userRepository.findById(userId.getValue())
            .map(userMapper::toDomain);
    }

    @CachePut(value = "users", key = "#result.id.value")
    public User update(User user) {
        UserEntity entity = userMapper.toEntity(user);
        UserEntity saved = userRepository.save(entity);
        return userMapper.toDomain(saved);
    }

    @CacheEvict(value = "users", key = "#userId.value")
    public void delete(UserId userId) {
        userRepository.deleteById(userId.getValue());
    }

    @CacheEvict(value = "users", allEntries = true)
    public void clearCache() {
        // Clear all user cache
    }
}
```

**Cache Aside Pattern:**

```java
@Service
@RequiredArgsConstructor
public class FeedService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final PostRepository postRepository;

    public List<Post> getUserFeed(UserId userId) {
        String cacheKey = "feed:" + userId.getValue();

        // Try cache first
        List<Post> cachedFeed = (List<Post>) redisTemplate.opsForValue().get(cacheKey);

        if (cachedFeed != null) {
            return cachedFeed;
        }

        // Cache miss - compute feed
        List<Post> feed = computeFeed(userId);

        // Store in cache (5 minutes TTL)
        redisTemplate.opsForValue().set(cacheKey, feed, Duration.ofMinutes(5));

        return feed;
    }

    private List<Post> computeFeed(UserId userId) {
        // Feed computation logic
        return postRepository.findRecentPosts(userId.getValue());
    }
}
```

---

### 3.2 Cache Warming

**Startup Cache Warming:**

```java
@Component
@RequiredArgsConstructor
public class CacheWarmer implements ApplicationListener<ApplicationReadyEvent> {

    private final UserService userService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("Starting cache warming...");

        warmUserCache();
        warmPopularPosts();

        log.info("Cache warming completed");
    }

    private void warmUserCache() {
        // Pre-load active users into cache
        List<User> activeUsers = userService.findActiveUsers();

        activeUsers.forEach(user -> {
            String cacheKey = "users:" + user.getId().getValue();
            redisTemplate.opsForValue().set(
                cacheKey,
                user,
                Duration.ofHours(1)
            );
        });

        log.info("Warmed {} users in cache", activeUsers.size());
    }

    private void warmPopularPosts() {
        // Pre-load popular posts
    }
}
```

---

### 3.3 Cache Invalidation

**Event-based Invalidation:**

```java
@Component
@RequiredArgsConstructor
public class CacheInvalidationEventHandler {

    private final CacheManager cacheManager;

    @EventListener
    @Async
    public void handleUserUpdated(UserUpdatedEvent event) {
        // Invalidate user cache
        Cache userCache = cacheManager.getCache("users");
        if (userCache != null) {
            userCache.evict(event.userId());
        }

        // Invalidate related caches
        Cache feedCache = cacheManager.getCache("feed");
        if (feedCache != null) {
            // Invalidate feeds of followers
            event.followerIds().forEach(feedCache::evict);
        }
    }

    @EventListener
    @Async
    public void handlePostCreated(PostCreatedEvent event) {
        // Invalidate author's feed and followers' feeds
        Cache feedCache = cacheManager.getCache("feed");
        if (feedCache != null) {
            feedCache.evict(event.authorId());
            event.followerIds().forEach(feedCache::evict);
        }
    }
}
```

---

## 4. API Performance

### 4.1 Async Processing

**@Async Methods:**

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Service
public class NotificationService {

    @Async("taskExecutor")
    public CompletableFuture<Void> sendEmailAsync(User user, String message) {
        emailService.send(user.getEmail(), message);
        return CompletableFuture.completedFuture(null);
    }

    @Async("taskExecutor")
    public CompletableFuture<Void> sendPushNotificationAsync(User user, String message) {
        pushService.send(user.getDeviceTokens(), message);
        return CompletableFuture.completedFuture(null);
    }
}
```

**Parallel Processing:**

```java
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final Executor taskExecutor;

    public VerificationResult processVerification(VerificationRequest request) {
        // Parallel processing
        CompletableFuture<FaceMatchResult> faceMatchFuture = CompletableFuture
            .supplyAsync(() -> verifyFaceMatch(request), taskExecutor);

        CompletableFuture<DocumentValidationResult> docValidationFuture = CompletableFuture
            .supplyAsync(() -> validateDocument(request), taskExecutor);

        CompletableFuture<OcrResult> ocrFuture = CompletableFuture
            .supplyAsync(() -> extractTextFromDocument(request), taskExecutor);

        // Wait for all to complete
        CompletableFuture.allOf(faceMatchFuture, docValidationFuture, ocrFuture).join();

        // Combine results
        return new VerificationResult(
            faceMatchFuture.join(),
            docValidationFuture.join(),
            ocrFuture.join()
        );
    }
}
```

---

### 4.2 Response Compression

**GZIP Compression:**

```yaml
# application.yml
server:
  compression:
    enabled: true
    mime-types:
      - application/json
      - application/xml
      - text/html
      - text/xml
      - text/plain
      - application/javascript
      - text/css
    min-response-size: 1024 # Compress responses > 1KB
```

---

### 4.3 HTTP/2

**Enable HTTP/2:**

```yaml
# application.yml
server:
  http2:
    enabled: true
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_KEY_STORE_PASSWORD}
    key-store-type: PKCS12
```

---

### 4.4 Rate Limiting

**Bucket4j Rate Limiting:**

```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.5.0</version>
</dependency>
```

```java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String userId = getUserId(request);

        Bucket bucket = resolveBucket(userId);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.getWriter().write("Too many requests");
        }
    }

    private Bucket resolveBucket(String userId) {
        return cache.computeIfAbsent(userId, key -> createBucket());
    }

    private Bucket createBucket() {
        // 100 requests per minute
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
}
```

**Redis-based Rate Limiting:**

```java
@Component
@RequiredArgsConstructor
public class RedisRateLimiter {

    private final RedisTemplate<String, String> redisTemplate;

    public boolean isAllowed(String key, int maxRequests, Duration window) {
        String rateLimitKey = "rate_limit:" + key;

        Long currentCount = redisTemplate.opsForValue().increment(rateLimitKey);

        if (currentCount == 1) {
            redisTemplate.expire(rateLimitKey, window);
        }

        return currentCount <= maxRequests;
    }
}
```

---

## 5. JVM Performance

### 5.1 JVM Tuning

**JVM Options:**

```bash
# Heap size
-Xms2g          # Initial heap size
-Xmx2g          # Maximum heap size (same as Xms to prevent resizing)

# Garbage Collection (G1GC)
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:InitiatingHeapOccupancyPercent=45

# GC Logging
-Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=5
-XX:GCLogFileSize=10M

# Memory
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
-XX:+AlwaysPreTouch

# Performance
-XX:+OptimizeStringConcat
-XX:+UseStringDeduplication
-XX:+UseCompressedOops

# Crash dumps
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/heap_dump.hprof

# Monitoring
-XX:+UnlockDiagnosticVMOptions
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
```

**Spring Boot application.yml:**

```yaml
spring:
  jmx:
    enabled: true

server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    max-connections: 10000
    accept-count: 100
```

---

### 5.2 Memory Management

**Object Pooling:**

```java
// For expensive objects
public class ExpensiveObjectPool {

    private final GenericObjectPool<ExpensiveObject> pool;

    public ExpensiveObjectPool() {
        GenericObjectPoolConfig<ExpensiveObject> config = new GenericObjectPoolConfig<>();
        config.setMaxTotal(20);
        config.setMaxIdle(10);
        config.setMinIdle(5);

        this.pool = new GenericObjectPool<>(new ExpensiveObjectFactory(), config);
    }

    public ExpensiveObject borrowObject() throws Exception {
        return pool.borrowObject();
    }

    public void returnObject(ExpensiveObject obj) {
        pool.returnObject(obj);
    }
}
```

**String Interning:**

```java
// ✅ DOĞRU - For frequently repeated strings
public class UserEntity {

    @Column(name = "profession")
    private String profession;

    public void setProfession(String profession) {
        // Intern profession strings (limited set of values)
        this.profession = profession.intern();
    }
}
```

---

## 6. Feed Algorithm Optimization

### 6.1 Materialized View

**Create Materialized View:**

```sql
-- Materialized view for feed scores
CREATE MATERIALIZED VIEW user_feed_scores AS
SELECT
    p.id AS post_id,
    p.author_id,
    p.created_at,
    p.content,
    COUNT(DISTINCT l.user_id) AS like_count,
    COUNT(DISTINCT c.id) AS comment_count,
    -- Time score (0-100)
    CASE
        WHEN p.created_at > NOW() - INTERVAL '1 day' THEN 100
        WHEN p.created_at > NOW() - INTERVAL '3 days' THEN 75
        WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 50
        ELSE 25
    END AS time_score,
    -- Engagement score (0-100)
    LEAST(100, (COUNT(DISTINCT l.user_id) * 2 + COUNT(DISTINCT c.id) * 5)) AS engagement_score
FROM posts p
LEFT JOIN post_likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
WHERE p.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.author_id, p.created_at, p.content;

-- Refresh strategy
CREATE INDEX idx_feed_scores_author_created ON user_feed_scores(author_id, created_at DESC);
CREATE INDEX idx_feed_scores_total ON user_feed_scores((time_score + engagement_score) DESC);

-- Refresh every 5 minutes
REFRESH MATERIALIZED VIEW CONCURRENTLY user_feed_scores;
```

**Query Materialized View:**

```java
@Repository
public interface FeedRepository {

    @Query(value = """
        SELECT
            fs.post_id,
            fs.time_score,
            fs.engagement_score,
            CASE
                WHEN f.following_id = fs.author_id THEN 100
                WHEN u.profession = :profession THEN 75
                ELSE 50
            END AS author_score,
            (fs.time_score * 0.4 +
             fs.engagement_score * 0.3 +
             author_score * 0.3) AS total_score
        FROM user_feed_scores fs
        LEFT JOIN follows f ON f.follower_id = :userId AND f.following_id = fs.author_id
        LEFT JOIN users u ON u.id = fs.author_id
        WHERE fs.created_at > NOW() - INTERVAL '7 days'
        ORDER BY total_score DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<FeedScore> computeFeed(
        @Param("userId") UUID userId,
        @Param("profession") String profession,
        @Param("limit") int limit
    );
}
```

---

### 6.2 Feed Pre-computation

**Scheduled Feed Generation:**

```java
@Component
@RequiredArgsConstructor
public class FeedPrecomputationScheduler {

    private final FeedService feedService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Scheduled(cron = "0 */5 * * * *")  // Every 5 minutes
    public void precomputeActiveUserFeeds() {
        List<UUID> activeUserIds = getActiveUserIds();

        activeUserIds.parallelStream()
            .forEach(userId -> {
                try {
                    List<Post> feed = feedService.computeFeed(new UserId(userId));

                    String cacheKey = "feed:" + userId;
                    redisTemplate.opsForValue().set(
                        cacheKey,
                        feed,
                        Duration.ofMinutes(10)
                    );
                } catch (Exception ex) {
                    log.error("Failed to precompute feed for user: {}", userId, ex);
                }
            });
    }

    private List<UUID> getActiveUserIds() {
        // Get users active in last 24 hours
        return userRepository.findActiveUserIds(LocalDateTime.now().minusDays(1));
    }
}
```

---

## 7. Image Optimization

### 7.1 Image Processing

**Thumbnail Generation:**

```java
@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Client s3Client;

    public void uploadProfileImage(MultipartFile file, UserId userId) throws IOException {
        BufferedImage original = ImageIO.read(file.getInputStream());

        // Generate thumbnails
        BufferedImage large = resizeImage(original, 800, 800);
        BufferedImage medium = resizeImage(original, 400, 400);
        BufferedImage small = resizeImage(original, 200, 200);

        // Upload to S3
        uploadToS3(large, userId, "profile-large.jpg");
        uploadToS3(medium, userId, "profile-medium.jpg");
        uploadToS3(small, userId, "profile-small.jpg");
    }

    private BufferedImage resizeImage(BufferedImage original, int width, int height) {
        Image scaled = original.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

        Graphics2D g2d = resized.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                            RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(scaled, 0, 0, null);
        g2d.dispose();

        return resized;
    }

    private void uploadToS3(BufferedImage image, UserId userId, String filename) {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", os);

        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(profileImagesBucket)
            .key(userId.getValue() + "/" + filename)
            .contentType("image/jpeg")
            .build();

        s3Client.putObject(request, RequestBody.fromBytes(os.toByteArray()));
    }
}
```

---

### 7.2 CDN Integration

**CloudFront Configuration:**

```java
@Configuration
public class CdnConfig {

    @Value("${aws.cloudfront.domain}")
    private String cloudFrontDomain;

    public String getImageUrl(UserId userId, String size) {
        return String.format("https://%s/%s/profile-%s.jpg",
                           cloudFrontDomain,
                           userId.getValue(),
                           size);
    }
}
```

---

## 8. Monitoring & Profiling

### 8.1 Performance Metrics

**Key Metrics:**

```java
@Component
@RequiredArgsConstructor
public class PerformanceMetrics {

    private final MeterRegistry meterRegistry;

    public void recordDatabaseQueryTime(String queryName, long milliseconds) {
        Timer.builder("database.query.time")
            .tag("query", queryName)
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(meterRegistry)
            .record(milliseconds, TimeUnit.MILLISECONDS);
    }

    public void recordCacheHitRate(String cacheName, boolean hit) {
        Counter.builder(hit ? "cache.hit" : "cache.miss")
            .tag("cache", cacheName)
            .register(meterRegistry)
            .increment();
    }

    public void recordApiResponseTime(String endpoint, long milliseconds) {
        Timer.builder("api.response.time")
            .tag("endpoint", endpoint)
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(meterRegistry)
            .record(milliseconds, TimeUnit.MILLISECONDS);
    }
}
```

---

### 8.2 Profiling Tools

**JProfiler Configuration:**

```bash
# Enable JMX for remote profiling
-Dcom.sun.management.jmxremote
-Dcom.sun.management.jmxremote.port=9010
-Dcom.sun.management.jmxremote.authenticate=false
-Dcom.sun.management.jmxremote.ssl=false
```

**VisualVM Monitoring:**

- Heap dump analysis
- Thread dump analysis
- CPU profiling
- Memory profiling

---

## 9. Load Testing

### 9.1 JMeter Test Plan

**Test Scenarios:**

```xml
<!-- User Registration Load Test -->
<ThreadGroup>
  <stringProp name="ThreadGroup.num_threads">100</stringProp>
  <stringProp name="ThreadGroup.ramp_time">30</stringProp>
  <stringProp name="ThreadGroup.duration">600</stringProp>
</ThreadGroup>

<!-- Feed Generation Load Test -->
<ThreadGroup>
  <stringProp name="ThreadGroup.num_threads">500</stringProp>
  <stringProp name="ThreadGroup.ramp_time">60</stringProp>
  <stringProp name="ThreadGroup.duration">600</stringProp>
</ThreadGroup>
```

---

### 9.2 Performance Targets

**Response Time Targets (p95):**

- User registration: < 1s
- Login: < 500ms
- Feed generation: < 1s
- Post creation: < 800ms
- Message sending: < 300ms
- Search: < 1s

**Throughput Targets:**

- 1000 concurrent users
- 10,000 requests per minute
- 99.9% uptime

**Resource Utilization:**

- CPU: < 70% average
- Memory: < 80% usage
- Database connections: < 80% of pool

---

## 10. Performance Checklist

### Database:

- ✅ N+1 queries eliminated
- ✅ Proper indexes created
- ✅ Connection pool optimized
- ✅ Query result pagination
- ✅ Batch operations for bulk inserts

### Caching:

- ✅ Redis configured with TTL
- ✅ Cache hit rate > 80%
- ✅ Proper cache invalidation
- ✅ Cache warming on startup

### API:

- ✅ Async processing for non-critical tasks
- ✅ Response compression enabled
- ✅ Rate limiting configured
- ✅ HTTP/2 enabled

### JVM:

- ✅ Heap size properly configured
- ✅ G1GC enabled
- ✅ GC logs enabled
- ✅ Memory leak detection

### Code:

- ✅ No string concatenation in loops
- ✅ Collections pre-sized
- ✅ Streams used efficiently
- ✅ AutoCloseable resources closed

---

## 11. Summary

### Key Principles:

- ✅ **Measure First** - Profile before optimizing
- ✅ **Database** - Optimize queries, use indexes
- ✅ **Caching** - Cache frequently accessed data
- ✅ **Async** - Non-blocking for I/O operations
- ✅ **Batch** - Process in batches when possible
- ✅ **Monitor** - Track metrics continuously

### Performance Goals:

- Response time: < 1s (p95)
- Throughput: 10K req/min
- Availability: 99.9%
- Cache hit rate: > 80%
- Database query: < 100ms

### Tools:

- **JProfiler** - JVM profiling
- **JMeter** - Load testing
- **Prometheus + Grafana** - Metrics monitoring
- **CloudWatch** - AWS monitoring
- **pg_stat_statements** - Database profiling

**Result:** High-performance, scalable backend application ready for production load.
