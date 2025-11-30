# DTO Mapping Kılavuzu

## 1. Genel Bakış

### 1.1 DTO Nedir?

DTO (Data Transfer Object), katmanlar arası veri taşıyan immutable nesnedir. Domain model'den bağımsızdır.

**DTO vs Domain Model:**

```
Domain Model:
- Business logic içerir
- Invariant'ları korur
- Private fields, encapsulation
- Rich behavior (methods)
- Database entity mapping

DTO:
- Sadece veri taşır
- Validation yok (controller'da yapılır)
- Public fields/getters
- Anemic (no behavior)
- JSON serialization optimize
```

**Katman Akışı:**

```
Client (JSON)
    ↓
Controller (Request DTO)
    ↓
Application Service (Command/Query)
    ↓
Domain Layer (Domain Model)
    ↓
Application Service (Response DTO)
    ↓
Controller (JSON)
    ↓
Client
```

### 1.2 Neden DTO?

**1. Separation of Concerns:**

- Domain model API contract'ına bağlı kalmaz
- Domain değişiklikleri API'yi etkilemez

**2. Performance:**

- Sadece gerekli alanlar serialize edilir
- Lazy loading problemleri önlenir

**3. Security:**

- Sensitive data exposure önlenir (password hash, internal IDs)

**4. Versioning:**

- API versioning kolaylaşır

**Meslektaş Context:**

- Request DTO: Client → Backend (validation container)
- Response DTO: Backend → Client (presentation model)
- Command/Query: Application layer input
- MapStruct: DTO ↔ Domain mapping

---

## 2. DTO Types

### 2.1 Request DTO

Client'tan gelen veri. Validation annotations içerir.

**Template:**

```java
public record CreatePostRequest(
    @NotBlank(message = "Content is required")
    @Size(max = 2000, message = "Content too long")
    String content,

    @Size(max = 4, message = "Max 4 images allowed")
    List<String> imageUrls
) {
    // Validation annotations only
    // No business logic
}
```

**Conversion to Command:**

```java
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
        @Valid @RequestBody CreatePostRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Convert DTO → Command
        CreatePostCommand command = new CreatePostCommand(
            UserId.from(userDetails.getUsername()),
            Profession.valueOf(userDetails.getProfession()),
            request.content(),
            request.imageUrls()
        );

        PostId postId = socialService.createPost(command);

        return ResponseEntity.ok(new PostResponse(postId.getValue().toString()));
    }
}
```

### 2.2 Response DTO

Backend'den client'a dönen veri. Domain model'den dönüştürülür.

**Template:**

```java
public record UserProfileResponse(
    String userId,
    String email,
    String fullName,
    String profession,
    String verificationStatus,
    String profileImageUrl,
    int postCount,
    int followerCount,
    Instant joinedAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
            user.getId().getValue().toString(),
            user.getEmail().getValue(),
            user.getFullName().getFullName(),
            user.getProfession().name(),
            user.getVerificationStatus().name(),
            user.getProfileImageUrl(),
            user.getPostCount(),
            user.getFollowerCount(),
            user.getCreatedAt()
        );
    }
}
```

### 2.3 Internal DTO (Query Result)

Query layer'da kullanılan DTO. Database projection için optimize.

**Template:**

```java
public record PostSummaryDTO(
    String postId,
    String authorId,
    String authorName,
    String content,
    int likeCount,
    int commentCount,
    Instant createdAt
) {
    // Used in query layer
    // Can be JPA projection
}
```

---

## 3. Meslektaş DTO Catalog

### 3.1 Identity Context DTOs

#### User Request DTOs

```java
// POST /api/auth/register
public record RegisterUserRequest(
    @NotBlank @Email
    String email,

    @NotBlank
    @Size(min = 8, max = 100)
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).*$")
    String password,

    @NotBlank
    String firstName,

    @NotBlank
    String lastName,

    @NotNull
    String profession  // DOCTOR, NURSE, etc.
) {}

// POST /api/auth/login
public record LoginRequest(
    @NotBlank @Email
    String email,

    @NotBlank
    String password
) {}

// PUT /api/users/{id}/profile-image
public record UpdateProfileImageRequest(
    @NotBlank
    @URL
    String imageUrl
) {}

// PUT /api/users/{id}/privacy
public record UpdatePrivacySettingsRequest(
    boolean profileVisible,
    boolean acceptMessages
) {}
```

#### User Response DTOs

```java
// GET /api/users/{id}
public record UserProfileResponse(
    String userId,
    String email,
    String fullName,
    String profession,
    String verificationStatus,
    String profileImageUrl,
    PrivacySettingsDTO privacySettings,
    int postCount,
    int followerCount,
    Instant joinedAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
            user.getId().getValue().toString(),
            user.getEmail().getValue(),
            user.getFullName().getFullName(),
            user.getProfession().name(),
            user.getVerificationStatus().name(),
            user.getProfileImageUrl(),
            PrivacySettingsDTO.from(user.getPrivacySettings()),
            user.getPostCount(),
            user.getFollowerCount(),
            user.getCreatedAt()
        );
    }
}

public record PrivacySettingsDTO(
    boolean profileVisible,
    boolean acceptMessages
) {
    public static PrivacySettingsDTO from(PrivacySettings settings) {
        return new PrivacySettingsDTO(
            settings.isProfileVisible(),
            settings.isAcceptMessages()
        );
    }
}

// POST /api/auth/login response
public record LoginResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    int expiresIn,
    UserProfileResponse user
) {}
```

### 3.2 Verification Context DTOs

#### Verification Request DTOs

```java
// POST /api/verification/submit
public record SubmitVerificationRequest(
    @NotBlank
    String documentType,  // ID_CARD, PASSPORT, DRIVER_LICENSE

    @NotBlank
    String documentNumber,

    @NotBlank
    @URL
    String idDocumentUrl,

    @NotBlank
    @URL
    String selfieUrl
) {}
```

#### Verification Response DTOs

```java
// GET /api/verification/status
public record VerificationStatusResponse(
    String requestId,
    String status,  // PENDING, APPROVED, REJECTED, PENDING_REVIEW
    String reason,
    int confidenceScore,
    Instant submittedAt,
    Instant reviewedAt
) {
    public static VerificationStatusResponse from(VerificationRequest request) {
        return new VerificationStatusResponse(
            request.getId().getValue().toString(),
            request.getStatus().name(),
            request.getRejectionReason(),
            request.getConfidenceScore() != null
                ? request.getConfidenceScore().getValue()
                : 0,
            request.getSubmittedAt(),
            request.getReviewedAt()
        );
    }
}

// GET /api/verification/requests (Admin)
public record VerificationRequestListItemResponse(
    String requestId,
    String userId,
    String userFullName,
    String status,
    int confidenceScore,
    Instant submittedAt
) {}
```

### 3.3 Social Context DTOs

#### Post Request DTOs

```java
// POST /api/posts
public record CreatePostRequest(
    @NotBlank
    @Size(max = 2000)
    String content,

    @Size(max = 4)
    List<@URL String> imageUrls
) {}

// POST /api/posts/{id}/comments
public record AddCommentRequest(
    @NotBlank
    @Size(max = 500)
    String content
) {}
```

#### Post Response DTOs

```java
// GET /api/feed
public record PostResponse(
    String postId,
    AuthorDTO author,
    String content,
    List<PostImageDTO> images,
    int likeCount,
    int commentCount,
    boolean isLikedByCurrentUser,
    Instant createdAt
) {
    public static PostResponse from(Post post, boolean isLiked) {
        return new PostResponse(
            post.getId().getValue().toString(),
            AuthorDTO.from(post.getAuthorId()),
            post.getContent().getValue(),
            post.getImages().stream()
                .map(PostImageDTO::from)
                .toList(),
            post.getLikeCount(),
            post.getCommentCount(),
            isLiked,
            post.getCreatedAt()
        );
    }
}

public record AuthorDTO(
    String userId,
    String fullName,
    String profession,
    String profileImageUrl,
    boolean isVerified
) {
    public static AuthorDTO from(UserId userId) {
        // Loaded from user repository
        User user = userRepository.findById(userId).orElseThrow();
        return new AuthorDTO(
            user.getId().getValue().toString(),
            user.getFullName().getFullName(),
            user.getProfession().name(),
            user.getProfileImageUrl(),
            user.isVerified()
        );
    }
}

public record PostImageDTO(
    String url,
    String format,
    int sizeBytes
) {
    public static PostImageDTO from(PostImage image) {
        return new PostImageDTO(
            image.getS3Url(),
            image.getFormat().name(),
            image.getSizeBytes()
        );
    }
}

// GET /api/posts/{id}
public record PostDetailsResponse(
    String postId,
    AuthorDTO author,
    String content,
    List<PostImageDTO> images,
    int likeCount,
    List<CommentDTO> comments,
    boolean isLikedByCurrentUser,
    Instant createdAt
) {}

public record CommentDTO(
    String commentId,
    AuthorDTO commenter,
    String content,
    Instant createdAt
) {
    public static CommentDTO from(Comment comment) {
        return new CommentDTO(
            comment.getId().getValue().toString(),
            AuthorDTO.from(comment.getCommenterId()),
            comment.getContent().getValue(),
            comment.getCreatedAt()
        );
    }
}
```

### 3.4 Messaging Context DTOs

#### Messaging Request DTOs

```java
// POST /api/conversations/{id}/messages
public record SendMessageRequest(
    @NotBlank
    @Size(max = 1000)
    String content
) {}
```

#### Messaging Response DTOs

```java
// GET /api/conversations
public record ConversationListItemResponse(
    String conversationId,
    ParticipantDTO otherParticipant,
    String lastMessagePreview,
    Instant lastMessageAt,
    long unreadCount
) {}

public record ParticipantDTO(
    String userId,
    String fullName,
    String profession,
    String profileImageUrl,
    boolean isVerified
) {}

// GET /api/conversations/{id}/messages
public record MessageResponse(
    String messageId,
    String senderId,
    String content,
    boolean isRead,
    Instant sentAt,
    Instant readAt
) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(
            message.getId().getValue().toString(),
            message.getSenderId().getValue().toString(),
            message.getContent().getValue(),
            message.isRead(),
            message.getSentAt(),
            message.getReadAt()
        );
    }
}
```

### 3.5 Notification Context DTOs

#### Notification Response DTOs

```java
// GET /api/notifications
public record NotificationResponse(
    String notificationId,
    String type,  // POST_LIKED, COMMENT_ADDED, MESSAGE_RECEIVED, etc.
    String title,
    String body,
    ActorDTO actor,
    Map<String, String> data,
    boolean isRead,
    Instant createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
            notification.getId().getValue().toString(),
            notification.getType().name(),
            notification.getTitle(),
            notification.getBody(),
            ActorDTO.from(notification.getActorId()),
            notification.getData(),
            notification.isRead(),
            notification.getCreatedAt()
        );
    }
}

public record ActorDTO(
    String userId,
    String fullName,
    String profileImageUrl
) {}
```

### 3.6 Moderation Context DTOs

#### Moderation Request DTOs

```java
// POST /api/moderation/reports
public record ReportContentRequest(
    String targetType,  // POST, USER
    String targetId,

    @NotBlank
    String violationType,  // SPAM, HARASSMENT, INAPPROPRIATE_CONTENT

    @NotBlank
    @Size(max = 500)
    String reason
) {}

// PUT /api/moderation/cases/{id}/review (Admin)
public record ReviewModerationCaseRequest(
    @NotBlank
    String decision,  // HIDE_CONTENT, SUSPEND_USER_1_DAY, DISMISS, etc.

    @NotBlank
    @Size(max = 500)
    String reviewNote
) {}
```

#### Moderation Response DTOs

```java
// GET /api/moderation/cases (Admin)
public record ModerationCaseResponse(
    String caseId,
    String targetType,
    String targetId,
    String status,
    int reportCount,
    List<ReportDTO> reports,
    String decision,
    Instant createdAt,
    Instant reviewedAt
) {}

public record ReportDTO(
    String reporterId,
    String violationType,
    String reason,
    Instant reportedAt
) {}
```

---

## 4. MapStruct Integration

### 4.1 MapStruct Setup

**Dependencies (pom.xml):**

```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>

<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-processor</artifactId>
    <version>1.5.5.Final</version>
    <scope>provided</scope>
</dependency>
```

**Maven Plugin:**

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <source>17</source>
        <target>17</target>
        <annotationProcessorPaths>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.5.5.Final</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

### 4.2 Mapper Interface

**Basic Mapper:**

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    UserProfileResponse toProfileResponse(User user);

    @Mapping(target = "userId", source = "id.value")
    @Mapping(target = "email", source = "email.value")
    @Mapping(target = "fullName", source = "fullName.fullName")
    UserProfileResponse toProfileResponseDetailed(User user);
}
```

**Complex Mapping:**

```java
@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "postId", source = "id.value")
    @Mapping(target = "author", expression = "java(mapAuthor(post))")
    @Mapping(target = "content", source = "content.value")
    @Mapping(target = "images", source = "images")
    @Mapping(target = "likeCount", expression = "java(post.getLikes().size())")
    @Mapping(target = "commentCount", expression = "java(post.getComments().size())")
    PostResponse toPostResponse(Post post);

    default AuthorDTO mapAuthor(Post post) {
        // Custom mapping logic
        User author = userRepository.findById(post.getAuthorId()).orElseThrow();
        return AuthorDTO.from(author);
    }

    @Mapping(target = "url", source = "s3Url")
    @Mapping(target = "format", source = "format")
    PostImageDTO toImageDTO(PostImage image);
}
```

### 4.3 Custom Converters

**Value Object Converter:**

```java
@Component
public class ValueObjectConverter {

    public String fromEmail(Email email) {
        return email != null ? email.getValue() : null;
    }

    public Email toEmail(String value) {
        return value != null ? new Email(value) : null;
    }

    public String fromUserId(UserId userId) {
        return userId != null ? userId.getValue().toString() : null;
    }

    public UserId toUserId(String value) {
        return value != null ? UserId.from(value) : null;
    }
}
```

**Mapper with Converter:**

```java
@Mapper(componentModel = "spring", uses = {ValueObjectConverter.class})
public interface UserMapper {

    UserProfileResponse toProfileResponse(User user);
    // Email, UserId automatically converted
}
```

---

## 5. Validation

### 5.1 Request Validation

Request DTO validation annotations kullanır.

**Standard Annotations:**

```java
public record CreatePostRequest(
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 2000, message = "Content must be 1-2000 characters")
    String content,

    @Size(max = 4, message = "Maximum 4 images allowed")
    List<@URL(message = "Invalid image URL") String> imageUrls
) {}
```

**Custom Validator:**

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ProfessionValidator.class)
public @interface ValidProfession {
    String message() default "Invalid profession";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class ProfessionValidator implements ConstraintValidator<ValidProfession, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;

        try {
            Profession.valueOf(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}

// Usage
public record RegisterUserRequest(
    @ValidProfession
    String profession
) {}
```

### 5.2 Response Validation

Response DTO validation gerekmez (backend kontrol eder).

---

## 6. JSON Serialization

### 6.1 Jackson Annotations

**Date Format:**

```java
public record PostResponse(
    String postId,
    String content,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    Instant createdAt
) {}
```

**Ignore Null:**

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserProfileResponse(
    String userId,
    String email,
    String profileImageUrl  // Omitted if null
) {}
```

**Property Naming:**

```java
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record UserProfileResponse(
    String userId,          // Serialized as "user_id"
    String fullName,        // Serialized as "full_name"
    String profileImageUrl  // Serialized as "profile_image_url"
) {}
```

### 6.2 Custom Serializer

**Enum Serializer:**

```java
public class ProfessionSerializer extends JsonSerializer<Profession> {

    @Override
    public void serialize(Profession value, JsonGenerator gen, SerializerProvider serializers)
            throws IOException {
        gen.writeStartObject();
        gen.writeStringField("code", value.name());
        gen.writeStringField("displayName", value.getDisplayName());
        gen.writeEndObject();
    }
}

// Usage
public record UserProfileResponse(
    @JsonSerialize(using = ProfessionSerializer.class)
    Profession profession
) {}
```

---

## 7. Best Practices

### 7.1 DTO Immutability

DTO'lar immutable olmalı (Java records kullan).

```java
// ✅ Good: Immutable record
public record UserProfileResponse(
    String userId,
    String fullName
) {}

// ❌ Bad: Mutable class
public class UserProfileResponse {
    private String userId;
    private String fullName;

    // Setters (BAD!)
    public void setUserId(String userId) { ... }
}
```

### 7.2 Nested DTOs

Complex response'lar nested DTO kullanır.

```java
// ✅ Good: Nested DTOs
public record PostResponse(
    String postId,
    AuthorDTO author,           // Nested
    List<CommentDTO> comments   // Nested list
) {}

// ❌ Bad: Flat structure
public record PostResponse(
    String postId,
    String authorId,
    String authorName,
    String authorProfession,
    // ... too many fields
) {}
```

### 7.3 Pagination DTOs

Paginated response'lar standard format kullanır.

```java
public record PageResponse<T>(
    List<T> content,
    int pageNumber,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean isFirst,
    boolean isLast
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }
}

// Usage
@GetMapping("/feed")
public PageResponse<PostResponse> getFeed(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) {
    Page<PostDTO> feedPage = feedService.getFeed(userId, page, size);
    Page<PostResponse> responsePage = feedPage.map(PostResponse::from);
    return PageResponse.from(responsePage);
}
```

### 7.4 Error Response DTO

Error response'lar standard format kullanır.

```java
public record ErrorResponse(
    String errorCode,
    String message,
    List<String> details,
    Instant timestamp
) {
    public static ErrorResponse of(String errorCode, String message) {
        return new ErrorResponse(
            errorCode,
            message,
            List.of(),
            Instant.now()
        );
    }

    public static ErrorResponse withDetails(
        String errorCode,
        String message,
        List<String> details
    ) {
        return new ErrorResponse(errorCode, message, details, Instant.now());
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException e) {
        ErrorResponse error = ErrorResponse.of("USER_NOT_FOUND", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
        MethodArgumentNotValidException e
    ) {
        List<String> details = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .toList();

        ErrorResponse error = ErrorResponse.withDetails(
            "VALIDATION_ERROR",
            "Invalid request",
            details
        );

        return ResponseEntity.badRequest().body(error);
    }
}
```

---

## 8. Testing DTO Mapping

### 8.1 MapStruct Test

```java
@SpringBootTest
class UserMapperTest {

    @Autowired
    private UserMapper userMapper;

    @Test
    void should_map_user_to_profile_response() {
        // Given
        User user = User.register(
            new Email("doctor@example.com"),
            new Password("hashed"),
            new FullName("John", "Doe"),
            Profession.DOCTOR
        );

        // When
        UserProfileResponse response = userMapper.toProfileResponse(user);

        // Then
        assertThat(response.email()).isEqualTo("doctor@example.com");
        assertThat(response.fullName()).isEqualTo("John Doe");
        assertThat(response.profession()).isEqualTo("DOCTOR");
    }
}
```

### 8.2 JSON Serialization Test

```java
@SpringBootTest
@AutoConfigureJsonTesters
class PostResponseJsonTest {

    @Autowired
    private JacksonTester<PostResponse> json;

    @Test
    void should_serialize_post_response() throws Exception {
        // Given
        PostResponse response = new PostResponse(
            "123",
            new AuthorDTO("456", "John Doe", "DOCTOR", null, true),
            "Test content",
            List.of(),
            10,
            5,
            true,
            Instant.now()
        );

        // When
        JsonContent<PostResponse> result = json.write(response);

        // Then
        assertThat(result).hasJsonPathStringValue("$.postId", "123");
        assertThat(result).hasJsonPathStringValue("$.author.fullName", "John Doe");
        assertThat(result).hasJsonPathNumberValue("$.likeCount", 10);
    }
}
```

---

## 9. Özet

### DTO Principles:

- **Immutable:** Java records
- **Validation:** Request DTO only
- **Mapping:** MapStruct or manual
- **Serialization:** Jackson
- **Standard Format:** Pagination, errors

### Meslektaş DTOs:

- **Request DTOs:** 15+ (validation container)
- **Response DTOs:** 25+ (presentation model)
- **Nested DTOs:** Author, Image, Comment, etc.
- **Pagination:** Standard PageResponse
- **Errors:** Standard ErrorResponse

### Best Practices:

- ✅ Use records for immutability
- ✅ Nested DTOs for complex data
- ✅ MapStruct for complex mapping
- ✅ Standard pagination format
- ✅ Global error handling

### Benefits:

- ✅ Clean separation (domain ↔ API)
- ✅ Type-safe mapping
- ✅ Validation at boundary
- ✅ Optimized serialization

### Next:

- **Infrastructure Layer:** 16-JPA-IMPLEMENTATION.md
