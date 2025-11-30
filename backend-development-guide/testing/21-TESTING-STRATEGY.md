# Testing Strategy Kılavuzu

## 1. Genel Bakış

### 1.1 Test Pyramid

Meslektaş projesi dengeli test piramidi yaklaşımı kullanır:

```
        /\
       /E2E\         10% - End-to-End Tests (Slow, brittle)
      /------\
     /        \
    /Integration\ 30% - Integration Tests (Medium speed)
   /------------\
  /              \
 /   Unit Tests   \  60% - Unit Tests (Fast, isolated)
/------------------\
```

**Test Distribution:**

- **Unit Tests (60%):** Domain logic, value objects, services
- **Integration Tests (30%):** Repository, API endpoints, database
- **E2E Tests (10%):** Critical user flows

**Technology Stack:**

```
JUnit 5 (Jupiter)
Mockito (Mocking framework)
AssertJ (Fluent assertions)
Spring Boot Test
Testcontainers (Docker containers for integration tests)
REST Assured (API testing)
```

### 1.2 Test Types

**Unit Tests:**

- Domain model (Aggregates, Value Objects)
- Domain services
- Application services (with mocks)
- Mappers, converters
- Utilities

**Integration Tests:**

- Repository (with real database)
- REST API endpoints
- WebSocket connections
- AWS services (with LocalStack)
- Redis cache

**E2E Tests:**

- User registration → verification → post creation flow
- Messaging conversation flow
- Moderation flow

---

## 2. Unit Testing

### 2.1 Domain Model Tests

**Aggregate Test Example:**

```java
package com.meslektas.domain.social;

@DisplayName("Post Aggregate Tests")
class PostTest {

    private UserId authorId;
    private Profession profession;

    @BeforeEach
    void setUp() {
        authorId = UserId.of(UUID.randomUUID());
        profession = Profession.DOCTOR;
    }

    @Test
    @DisplayName("Should create post with valid content")
    void shouldCreatePostWithValidContent() {
        // Given
        PostContent content = new PostContent("Test content");
        List<PostImage> images = List.of();

        // When
        Post post = Post.create(authorId, profession, content, images);

        // Then
        assertThat(post).isNotNull();
        assertThat(post.getAuthorId()).isEqualTo(authorId);
        assertThat(post.getProfession()).isEqualTo(profession);
        assertThat(post.getContent()).isEqualTo(content);
        assertThat(post.getLikeCount()).isZero();
        assertThat(post.getCommentCount()).isZero();
    }

    @Test
    @DisplayName("Should publish PostCreatedEvent when post created")
    void shouldPublishPostCreatedEvent() {
        // Given
        PostContent content = new PostContent("Test content");

        // When
        Post post = Post.create(authorId, profession, content, List.of());

        // Then
        assertThat(post.getDomainEvents()).hasSize(1);
        assertThat(post.getDomainEvents().get(0))
            .isInstanceOf(PostCreatedEvent.class);

        PostCreatedEvent event = (PostCreatedEvent) post.getDomainEvents().get(0);
        assertThat(event.postId()).isEqualTo(post.getId());
        assertThat(event.authorId()).isEqualTo(authorId);
    }

    @Test
    @DisplayName("Should add like when user likes post")
    void shouldAddLikeWhenUserLikesPost() {
        // Given
        Post post = Post.create(authorId, profession, new PostContent("Test"), List.of());
        UserId likerId = UserId.of(UUID.randomUUID());

        // When
        post.addLike(likerId);

        // Then
        assertThat(post.getLikeCount()).isEqualTo(1);
        assertThat(post.getLikes()).contains(likerId);
        assertThat(post.getDomainEvents()).hasSize(2); // Created + Liked
        assertThat(post.getDomainEvents().get(1)).isInstanceOf(PostLikedEvent.class);
    }

    @Test
    @DisplayName("Should throw exception when user likes post twice")
    void shouldThrowExceptionWhenUserLikesPostTwice() {
        // Given
        Post post = Post.create(authorId, profession, new PostContent("Test"), List.of());
        UserId likerId = UserId.of(UUID.randomUUID());
        post.addLike(likerId);

        // When & Then
        assertThatThrownBy(() -> post.addLike(likerId))
            .isInstanceOf(AlreadyLikedException.class)
            .hasMessageContaining("already liked");
    }

    @Test
    @DisplayName("Should remove like when user unlikes post")
    void shouldRemoveLikeWhenUserUnlikesPost() {
        // Given
        Post post = Post.create(authorId, profession, new PostContent("Test"), List.of());
        UserId likerId = UserId.of(UUID.randomUUID());
        post.addLike(likerId);

        // When
        post.removeLike(likerId);

        // Then
        assertThat(post.getLikeCount()).isZero();
        assertThat(post.getLikes()).doesNotContain(likerId);
    }

    @Test
    @DisplayName("Should add comment with valid content")
    void shouldAddCommentWithValidContent() {
        // Given
        Post post = Post.create(authorId, profession, new PostContent("Test"), List.of());
        UserId commenterId = UserId.of(UUID.randomUUID());
        CommentContent commentContent = new CommentContent("Great post!");

        // When
        post.addComment(commenterId, commentContent);

        // Then
        assertThat(post.getCommentCount()).isEqualTo(1);
        assertThat(post.getComments()).hasSize(1);

        Comment comment = post.getComments().get(0);
        assertThat(comment.getCommenterId()).isEqualTo(commenterId);
        assertThat(comment.getContent()).isEqualTo(commentContent);
    }

    @Test
    @DisplayName("Should delete post and publish event")
    void shouldDeletePostAndPublishEvent() {
        // Given
        Post post = Post.create(authorId, profession, new PostContent("Test"), List.of());

        // When
        post.delete();

        // Then
        assertThat(post.isDeleted()).isTrue();
        assertThat(post.getDeletedAt()).isNotNull();
        assertThat(post.getDomainEvents()).hasSize(2); // Created + Deleted
    }
}
```

**Value Object Test Example:**

```java
@DisplayName("Email Value Object Tests")
class EmailTest {

    @Test
    @DisplayName("Should create email with valid format")
    void shouldCreateEmailWithValidFormat() {
        // When
        Email email = new Email("doctor@example.com");

        // Then
        assertThat(email.getValue()).isEqualTo("doctor@example.com");
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "invalid",
        "@example.com",
        "test@",
        "test space@example.com",
        ""
    })
    @DisplayName("Should throw exception for invalid email format")
    void shouldThrowExceptionForInvalidFormat(String invalidEmail) {
        // When & Then
        assertThatThrownBy(() -> new Email(invalidEmail))
            .isInstanceOf(InvalidEmailException.class);
    }

    @Test
    @DisplayName("Should be equal when emails are same")
    void shouldBeEqualWhenEmailsAreSame() {
        // Given
        Email email1 = new Email("test@example.com");
        Email email2 = new Email("test@example.com");

        // Then
        assertThat(email1).isEqualTo(email2);
        assertThat(email1.hashCode()).isEqualTo(email2.hashCode());
    }
}
```

### 2.2 Domain Service Tests

```java
@DisplayName("Verification Attempt Policy Tests")
class VerificationAttemptPolicyTest {

    private VerificationAttemptPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new VerificationAttemptPolicy();
    }

    @Test
    @DisplayName("Should allow new attempt when no previous attempts")
    void shouldAllowNewAttemptWhenNoPreviousAttempts() {
        // When
        boolean canSubmit = policy.canSubmitNewAttempt(Optional.empty());

        // Then
        assertThat(canSubmit).isTrue();
    }

    @Test
    @DisplayName("Should allow new attempt after 24 hours from rejection")
    void shouldAllowNewAttemptAfter24Hours() {
        // Given
        VerificationRequest previousRequest = createRejectedRequest(
            Instant.now().minus(25, ChronoUnit.HOURS)
        );

        // When
        boolean canSubmit = policy.canSubmitNewAttempt(Optional.of(previousRequest));

        // Then
        assertThat(canSubmit).isTrue();
    }

    @Test
    @DisplayName("Should not allow new attempt within 24 hours")
    void shouldNotAllowNewAttemptWithin24Hours() {
        // Given
        VerificationRequest previousRequest = createRejectedRequest(
            Instant.now().minus(12, ChronoUnit.HOURS)
        );

        // When
        boolean canSubmit = policy.canSubmitNewAttempt(Optional.of(previousRequest));

        // Then
        assertThat(canSubmit).isFalse();
    }

    @Test
    @DisplayName("Should not allow more than 3 attempts total")
    void shouldNotAllowMoreThan3Attempts() {
        // Given
        VerificationRequest previousRequest = createRequestWithAttempts(3);

        // When
        boolean canSubmit = policy.canSubmitNewAttempt(Optional.of(previousRequest));

        // Then
        assertThat(canSubmit).isFalse();
    }
}
```

### 2.3 Application Service Tests

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("Social Service Tests")
class SocialServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DomainEventPublisher eventPublisher;

    @InjectMocks
    private SocialService socialService;

    private User verifiedUser;

    @BeforeEach
    void setUp() {
        verifiedUser = createVerifiedUser();
    }

    @Test
    @DisplayName("Should create post when user is verified")
    void shouldCreatePostWhenUserIsVerified() {
        // Given
        CreatePostCommand command = new CreatePostCommand(
            verifiedUser.getId(),
            Profession.DOCTOR,
            "Test content",
            List.of()
        );

        when(userRepository.findById(verifiedUser.getId()))
            .thenReturn(Optional.of(verifiedUser));
        when(postRepository.save(any(Post.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        PostId postId = socialService.createPost(command);

        // Then
        assertThat(postId).isNotNull();
        verify(postRepository).save(any(Post.class));
        verify(eventPublisher).publishAll(anyList());
    }

    @Test
    @DisplayName("Should throw exception when user is not verified")
    void shouldThrowExceptionWhenUserNotVerified() {
        // Given
        User unverifiedUser = createUnverifiedUser();
        CreatePostCommand command = new CreatePostCommand(
            unverifiedUser.getId(),
            Profession.DOCTOR,
            "Test",
            List.of()
        );

        when(userRepository.findById(unverifiedUser.getId()))
            .thenReturn(Optional.of(unverifiedUser));

        // When & Then
        assertThatThrownBy(() -> socialService.createPost(command))
            .isInstanceOf(UnverifiedUserException.class)
            .hasMessageContaining("verified");

        verify(postRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should like post successfully")
    void shouldLikePostSuccessfully() {
        // Given
        Post post = createPost();
        UserId likerId = UserId.of(UUID.randomUUID());
        LikePostCommand command = new LikePostCommand(post.getId(), likerId);

        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));

        // When
        socialService.likePost(command);

        // Then
        verify(postRepository).save(argThat(p ->
            p.getLikes().contains(likerId)
        ));
        verify(eventPublisher).publishAll(anyList());
    }
}
```

---

## 3. Integration Testing

### 3.1 Repository Tests

**JPA Repository Test:**

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@DisplayName("User Repository Integration Tests")
class UserRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should save and find user by email")
    void shouldSaveAndFindUserByEmail() {
        // Given
        UserEntity user = new UserEntity();
        user.setEmail("doctor@example.com");
        user.setPasswordHash("hashed");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setProfession(Profession.DOCTOR);
        user.setVerificationStatus(VerificationStatus.UNVERIFIED);

        // When
        UserEntity saved = userJpaRepository.save(user);
        entityManager.flush();
        entityManager.clear();

        Optional<UserEntity> found = userJpaRepository.findByEmail("doctor@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getEmail()).isEqualTo("doctor@example.com");
    }

    @Test
    @DisplayName("Should check if email exists")
    void shouldCheckIfEmailExists() {
        // Given
        UserEntity user = createAndSaveUser("test@example.com");

        // When
        boolean exists = userJpaRepository.existsByEmail("test@example.com");
        boolean notExists = userJpaRepository.existsByEmail("other@example.com");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find verified users by profession")
    void shouldFindVerifiedUsersByProfession() {
        // Given
        createAndSaveVerifiedUser(Profession.DOCTOR);
        createAndSaveVerifiedUser(Profession.DOCTOR);
        createAndSaveVerifiedUser(Profession.NURSE);
        createAndSaveUnverifiedUser(Profession.DOCTOR);

        entityManager.flush();

        // When
        List<UserEntity> doctors = userJpaRepository
            .findVerifiedUsersByProfession(Profession.DOCTOR);

        // Then
        assertThat(doctors).hasSize(2);
        assertThat(doctors).allMatch(u ->
            u.getProfession() == Profession.DOCTOR &&
            u.getVerificationStatus() == VerificationStatus.VERIFIED
        );
    }
}
```

### 3.2 REST API Tests

**Controller Integration Test:**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@DisplayName("Post API Integration Tests")
class PostControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String authToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = createAndSaveVerifiedUser();
        authToken = generateToken(testUser);
    }

    @Test
    @DisplayName("POST /api/posts - Should create post successfully")
    void shouldCreatePostSuccessfully() throws Exception {
        // Given
        CreatePostRequest request = new CreatePostRequest(
            "Test post content",
            List.of()
        );

        // When & Then
        mockMvc.perform(post("/api/posts")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.postId").exists())
            .andExpect(jsonPath("$.content").value("Test post content"));
    }

    @Test
    @DisplayName("POST /api/posts - Should return 401 without authentication")
    void shouldReturn401WithoutAuthentication() throws Exception {
        // Given
        CreatePostRequest request = new CreatePostRequest("Test", List.of());

        // When & Then
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/posts - Should return 400 for invalid content")
    void shouldReturn400ForInvalidContent() throws Exception {
        // Given
        CreatePostRequest request = new CreatePostRequest("", List.of());

        // When & Then
        mockMvc.perform(post("/api/posts")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("GET /api/feed - Should return paginated feed")
    void shouldReturnPaginatedFeed() throws Exception {
        // Given
        createMultiplePosts(5);

        // When & Then
        mockMvc.perform(get("/api/feed")
                .header("Authorization", "Bearer " + authToken)
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(5))
            .andExpect(jsonPath("$.pageNumber").value(0))
            .andExpect(jsonPath("$.pageSize").value(20));
    }
}
```

### 3.3 REST Assured Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@DisplayName("Authentication API Tests with REST Assured")
class AuthenticationApiTest {

    @LocalServerPort
    private int port;

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    private RequestSpecification requestSpec;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        requestSpec = new RequestSpecBuilder()
            .setContentType(ContentType.JSON)
            .setAccept(ContentType.JSON)
            .build();
    }

    @Test
    @DisplayName("Should register new user successfully")
    void shouldRegisterNewUserSuccessfully() {
        // Given
        RegisterRequest request = new RegisterRequest(
            "newuser@example.com",
            "Password123!",
            "John",
            "Doe",
            "DOCTOR"
        );

        // When & Then
        given()
            .spec(requestSpec)
            .body(request)
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(200)
            .body("accessToken", notNullValue())
            .body("refreshToken", notNullValue())
            .body("user.email", equalTo("newuser@example.com"))
            .body("user.fullName", equalTo("John Doe"));
    }

    @Test
    @DisplayName("Should login with valid credentials")
    void shouldLoginWithValidCredentials() {
        // Given
        registerUser("login@example.com", "Password123!");

        LoginRequest request = new LoginRequest(
            "login@example.com",
            "Password123!"
        );

        // When & Then
        given()
            .spec(requestSpec)
            .body(request)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("accessToken", notNullValue())
            .body("tokenType", equalTo("Bearer"));
    }

    @Test
    @DisplayName("Should return 401 for invalid credentials")
    void shouldReturn401ForInvalidCredentials() {
        // Given
        LoginRequest request = new LoginRequest(
            "invalid@example.com",
            "wrong"
        );

        // When & Then
        given()
            .spec(requestSpec)
            .body(request)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401);
    }
}
```

---

## 4. E2E Testing

### 4.1 User Registration Flow

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@DisplayName("E2E: User Registration and Verification Flow")
class UserRegistrationFlowTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);

    @LocalServerPort
    private int port;

    @Test
    @DisplayName("Complete user journey: Register → Verify → Create Post")
    void completeUserJourney() {
        RestAssured.port = port;

        // Step 1: Register
        RegisterRequest registerRequest = new RegisterRequest(
            "journey@example.com",
            "Password123!",
            "John",
            "Doe",
            "DOCTOR"
        );

        String accessToken = given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(200)
            .extract()
            .path("accessToken");

        // Step 2: Upload verification documents
        SubmitVerificationRequest verificationRequest = new SubmitVerificationRequest(
            "ID_CARD",
            "123456789",
            "https://example.com/id.jpg",
            "https://example.com/selfie.jpg"
        );

        given()
            .header("Authorization", "Bearer " + accessToken)
            .contentType(ContentType.JSON)
            .body(verificationRequest)
        .when()
            .post("/api/verification/submit")
        .then()
            .statusCode(200);

        // Step 3: Verify status (simulated approval)
        given()
            .header("Authorization", "Bearer " + accessToken)
        .when()
            .get("/api/verification/status")
        .then()
            .statusCode(200)
            .body("status", equalTo("PENDING"));

        // Step 4: Create post (should fail - not verified yet)
        CreatePostRequest postRequest = new CreatePostRequest(
            "First post!",
            List.of()
        );

        given()
            .header("Authorization", "Bearer " + accessToken)
            .contentType(ContentType.JSON)
            .body(postRequest)
        .when()
            .post("/api/posts")
        .then()
            .statusCode(403); // Forbidden - not verified
    }
}
```

---

## 5. Test Data Builders

### 5.1 Domain Object Builders

```java
public class UserTestBuilder {

    private UserId id = UserId.of(UUID.randomUUID());
    private Email email = new Email("test@example.com");
    private Password password = new Password("hashed");
    private FullName fullName = new FullName("John", "Doe");
    private Profession profession = Profession.DOCTOR;
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;

    public static UserTestBuilder aUser() {
        return new UserTestBuilder();
    }

    public UserTestBuilder withId(UserId id) {
        this.id = id;
        return this;
    }

    public UserTestBuilder withEmail(String email) {
        this.email = new Email(email);
        return this;
    }

    public UserTestBuilder verified() {
        this.verificationStatus = VerificationStatus.VERIFIED;
        return this;
    }

    public UserTestBuilder withProfession(Profession profession) {
        this.profession = profession;
        return this;
    }

    public User build() {
        return User.reconstruct(
            id,
            email,
            password,
            fullName,
            profession,
            verificationStatus,
            null,
            new PrivacySettings(true, true),
            0,
            0,
            Set.of(),
            true,
            null,
            Instant.now()
        );
    }
}

// Usage
User user = UserTestBuilder.aUser()
    .withEmail("doctor@example.com")
    .withProfession(Profession.DOCTOR)
    .verified()
    .build();
```

---

## 6. Test Configuration

### 6.1 Test Properties

**application-test.yml:**

```yaml
spring:
  datasource:
    url: jdbc:tc:postgresql:15:///testdb
    driver-class-name: org.testcontainers.jdbc.ContainerDatabaseDriver

  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true

  redis:
    host: localhost
    port: 6379

  cache:
    type: none # Disable cache in tests

jwt:
  secret: test-secret-key-for-testing-only
  access-token-expiration: 900000

logging:
  level:
    com.meslektas: DEBUG
    org.hibernate.SQL: DEBUG
```

### 6.2 Test Base Classes

```java
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);

        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", redis::getFirstMappedPort);
    }
}
```

---

## 7. Best Practices

### 7.1 Test Naming

```java
// Pattern: should_ExpectedBehavior_When_StateUnderTest
@Test
void should_CreatePost_When_UserIsVerified() {}

@Test
void should_ThrowException_When_UserNotVerified() {}

// Use @DisplayName for clarity
@Test
@DisplayName("Should create post when user is verified")
void testCreatePost() {}
```

### 7.2 Test Structure (AAA Pattern)

```java
@Test
void testExample() {
    // Arrange (Given)
    User user = createVerifiedUser();
    CreatePostCommand command = new CreatePostCommand(...);

    // Act (When)
    PostId postId = service.createPost(command);

    // Assert (Then)
    assertThat(postId).isNotNull();
    verify(repository).save(any());
}
```

### 7.3 Mocking Guidelines

```java
// ✅ Good: Mock external dependencies
@Mock
private UserRepository userRepository;

@Mock
private EmailService emailService;

// ❌ Bad: Don't mock domain objects
// Domain objects should be real instances

// ✅ Good: Use ArgumentCaptor for verification
ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
verify(postRepository).save(postCaptor.capture());
assertThat(postCaptor.getValue().getContent()).isEqualTo(expectedContent);
```

---

## 8. Coverage Goals

### 8.1 Coverage Targets

```
Domain Layer: 90%+ (critical business logic)
Application Layer: 80%+
Infrastructure Layer: 60%+ (integration tests)
```

### 8.2 JaCoCo Configuration

**pom.xml:**

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

---

## 9. Özet

### Test Strategy:

- **Pyramid:** 60% unit, 30% integration, 10% E2E
- **Framework:** JUnit 5, Mockito, Testcontainers
- **Coverage:** Domain 90%+, Application 80%+

### Test Types:

- Unit: Domain model, services, value objects
- Integration: Repository, API, external services
- E2E: Critical user flows

### Best Practices:

- ✅ AAA pattern (Arrange-Act-Assert)
- ✅ Descriptive test names
- ✅ Test data builders
- ✅ Testcontainers for integration
- ✅ Mock external dependencies only
- ✅ High domain coverage

### Next:

- **Test Data Builders:** 22-TEST-DATA-BUILDERS.md (Builder pattern library)
