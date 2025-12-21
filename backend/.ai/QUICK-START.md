# Quick Start Guide - AI Agent Development

**Purpose:** Hızlı başlangıç ve en sık kullanılan kod pattern'leri

---

## 🚀 Yeni Feature Ekleme (Step-by-Step)

### 1. Domain Model Oluştur

```java
// src/main/java/com/dengin/{context}/domain/model/YourEntity.java
package com.dengin.social.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "your_entities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YourEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 2. Repository Oluştur

```java
// src/main/java/com/dengin/{context}/domain/repository/YourRepository.java
package com.dengin.social.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface YourRepository extends JpaRepository<YourEntity, Long> {

    // Method name query
    List<YourEntity> findByName(String name);

    // JPQL query
    @Query("SELECT e FROM YourEntity e WHERE e.name LIKE %:keyword%")
    List<YourEntity> searchByKeyword(@Param("keyword") String keyword);
}
```

### 3. DTOs Oluştur

```java
// Request DTO
package com.dengin.social.application.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateYourEntityRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100)
    private String name;

    @Size(max = 1000)
    private String description;
}

// Response DTO
@Data
@Builder
public class YourEntityResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
```

### 4. Service Oluştur

```java
// src/main/java/com/dengin/{context}/application/service/YourService.java
package com.dengin.social.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class YourService {

    private final YourRepository repository;

    public YourEntityResponse create(CreateYourEntityRequest request) {
        log.info("Creating entity: {}", request.getName());

        YourEntity entity = YourEntity.builder()
            .name(request.getName())
            .description(request.getDescription())
            .build();

        YourEntity saved = repository.save(entity);

        return YourEntityResponse.builder()
            .id(saved.getId())
            .name(saved.getName())
            .description(saved.getDescription())
            .createdAt(saved.getCreatedAt())
            .build();
    }

    @Transactional(readOnly = true)
    public YourEntityResponse getById(Long id) {
        YourEntity entity = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Entity not found"));

        return mapToResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<YourEntityResponse> getAll() {
        return repository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    private YourEntityResponse mapToResponse(YourEntity entity) {
        return YourEntityResponse.builder()
            .id(entity.getId())
            .name(entity.getName())
            .description(entity.getDescription())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
```

### 5. Controller Oluştur

```java
// src/main/java/com/dengin/{context}/api/YourController.java
package com.dengin.social.api;

import com.dengin.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/your-entities")
@RequiredArgsConstructor
@Tag(name = "Your Entity", description = "Your entity management APIs")
public class YourController {

    private final YourService service;

    @PostMapping
    @Operation(summary = "Create new entity")
    public ResponseEntity<ApiResponse<YourEntityResponse>> create(
        @Valid @RequestBody CreateYourEntityRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        YourEntityResponse response = service.create(request);
        return ResponseEntity.ok(ApiResponse.success("Entity created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get entity by ID")
    public ResponseEntity<ApiResponse<YourEntityResponse>> getById(@PathVariable Long id) {
        YourEntityResponse response = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all entities")
    public ResponseEntity<ApiResponse<List<YourEntityResponse>>> getAll() {
        List<YourEntityResponse> response = service.getAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

### 6. Database Migration Oluştur

```sql
-- src/main/resources/db/migration/V015__create_your_entities_table.sql
CREATE TABLE your_entities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_your_entities_name ON your_entities(name);
```

---

## 📝 Sık Kullanılan Code Snippets

### Exception Handling

```java
// Custom Business Exception
throw new BusinessException("Invalid operation", "INVALID_OPERATION");

// Not Found
throw new ResourceNotFoundException("Entity not found with id: " + id);

// Forbidden
throw new ForbiddenException("You don't have permission");

// Unauthorized
throw new UnauthorizedException("Authentication required");
```

### Pagination

```java
// Service
@Transactional(readOnly = true)
public Page<YourEntityResponse> getPaginated(Pageable pageable) {
    return repository.findAll(pageable)
        .map(this::mapToResponse);
}

// Controller
@GetMapping
public ResponseEntity<Page<YourEntityResponse>> getAll(
    @PageableDefault(size = 20, sort = "createdAt", direction = Direction.DESC) Pageable pageable
) {
    return ResponseEntity.ok(service.getPaginated(pageable));
}
```

### File Upload (S3 Presigned URL)

```java
// Generate presigned URL
@PostMapping("/presigned-url")
public ResponseEntity<PresignedUrlResponse> generatePresignedUrl(
    @Valid @RequestBody PresignedUrlRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    String key = String.format("uploads/%d/%s", principal.getId(), UUID.randomUUID());
    String presignedUrl = s3Service.generatePresignedUrl(key, request.getContentType());

    return ResponseEntity.ok(PresignedUrlResponse.builder()
        .url(presignedUrl)
        .key(key)
        .expiresIn(300)
        .build());
}

// Confirm upload
@PutMapping("/confirm-upload")
public ResponseEntity<Void> confirmUpload(@RequestBody ConfirmUploadRequest request) {
    s3Service.validateUpload(request.getKey());
    // Update entity with S3 URL
    return ResponseEntity.ok().build();
}
```

### Async Processing

```java
@Service
public class AsyncService {

    @Async
    public CompletableFuture<ProcessResult> processAsync(Long id) {
        // Long-running task
        ProcessResult result = doHeavyProcessing(id);
        return CompletableFuture.completedFuture(result);
    }
}

// Configuration
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
```

### Caching

```java
@Service
public class CachedService {

    @Cacheable(value = "entities", key = "#id")
    public YourEntity getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @CacheEvict(value = "entities", key = "#id")
    public void update(Long id, UpdateRequest request) {
        // Update entity
    }

    @CacheEvict(value = "entities", allEntries = true)
    public void deleteAll() {
        // Clear all cache
    }
}
```

### Scheduled Tasks

```java
@Component
public class ScheduledTasks {

    @Scheduled(cron = "0 0 2 * * *")  // Every day at 2 AM
    public void cleanupOldData() {
        log.info("Running scheduled cleanup...");
        // Cleanup logic
    }

    @Scheduled(fixedDelay = 60000)  // Every minute
    public void periodicTask() {
        // Periodic task
    }
}
```

### WebSocket Message

```java
@MessageMapping("/your.action")
@SendTo("/topic/your-channel")
public YourMessage handleMessage(
    @Payload YourRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // Process message
    return new YourMessage(/* data */);
}

// Send from service
@Autowired
private SimpMessagingTemplate messagingTemplate;

messagingTemplate.convertAndSend("/topic/your-channel", message);
messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", notification);
```

---

## 🧪 Testing Patterns

### Unit Test

```java
@ExtendWith(MockitoExtension.class)
class YourServiceTest {

    @Mock
    private YourRepository repository;

    @InjectMocks
    private YourService service;

    @Test
    void shouldCreateEntity() {
        // Given
        CreateYourEntityRequest request = new CreateYourEntityRequest("Test", "Description");
        YourEntity entity = new YourEntity();
        entity.setId(1L);
        entity.setName("Test");

        when(repository.save(any())).thenReturn(entity);

        // When
        YourEntityResponse response = service.create(request);

        // Then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test");
        verify(repository, times(1)).save(any());
    }
}
```

### Integration Test

```java
@SpringBootTest
@Transactional
class YourServiceIntegrationTest {

    @Autowired
    private YourService service;

    @Autowired
    private YourRepository repository;

    @Test
    void shouldCreateAndRetrieve() {
        // Given
        CreateYourEntityRequest request = new CreateYourEntityRequest("Test", "Desc");

        // When
        YourEntityResponse created = service.create(request);
        YourEntityResponse retrieved = service.getById(created.getId());

        // Then
        assertThat(retrieved.getName()).isEqualTo("Test");
        assertThat(repository.count()).isEqualTo(1);
    }
}
```

### Controller Test

```java
@WebMvcTest(YourController.class)
class YourControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private YourService service;

    @Test
    void shouldCreateEntity() throws Exception {
        // Given
        YourEntityResponse response = YourEntityResponse.builder()
            .id(1L)
            .name("Test")
            .build();

        when(service.create(any())).thenReturn(response);

        // When/Then
        mockMvc.perform(post("/api/your-entities")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"description\":\"Desc\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Test"));
    }
}
```

---

## 🔧 Configuration Examples

### application.yml

```yaml
spring:
  application:
    name: dengin-backend

  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:dengin}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5

  jpa:
    hibernate:
      ddl-auto: validate # NEVER use 'update' in production
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        default_schema: public

  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: 6379
      timeout: 2000ms

  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}

# Custom app properties
app:
  jwt:
    secret: ${JWT_SECRET}
    expiration: 86400000 # 24h

  aws:
    s3:
      bucket: ${AWS_S3_BUCKET}
      region: eu-central-1
    cloudfront:
      domain: ${AWS_CLOUDFRONT_DOMAIN}

# Logging
logging:
  level:
    com.dengin: INFO
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

---

## 🐛 Common Issues & Solutions

### 1. LazyInitializationException

**Problem:**

```java
org.hibernate.LazyInitializationException: could not initialize proxy
```

**Solution:**

```java
// Use JOIN FETCH
@Query("SELECT e FROM Entity e LEFT JOIN FETCH e.lazyField WHERE e.id = :id")
Optional<Entity> findByIdWithLazy(@Param("id") Long id);

// Or use @Transactional(readOnly = true) on service method
```

### 2. N+1 Query Problem

**Problem:**

```
Hibernate: SELECT * FROM posts
Hibernate: SELECT * FROM users WHERE id = 1
Hibernate: SELECT * FROM users WHERE id = 2
... (N more queries)
```

**Solution:**

```java
@Query("SELECT p FROM Post p JOIN FETCH p.author")
List<Post> findAllWithAuthor();
```

### 3. Validation Not Working

**Problem:**

```java
@NotBlank  // Not working!
private String name;
```

**Solution:**

```java
// Add @Valid to controller
public ResponseEntity<?> create(@Valid @RequestBody Request request) { ... }
```

### 4. CORS Error

**Solution:**

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

## 📚 Useful Commands

```bash
# Build
mvn clean package -DskipTests

# Run locally
mvn spring-boot:run

# Run with profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
mvn test

# Run specific test
mvn test -Dtest=YourServiceTest

# Database migration
mvn flyway:info
mvn flyway:migrate
mvn flyway:clean  # DANGER: Drops all objects

# Docker
docker-compose up -d
docker-compose logs -f backend
docker-compose down

# Format code
mvn spotless:apply
```

---

**Last Updated:** 2025-12-09  
**For AI Agents:** Reference this for quick implementation patterns.
