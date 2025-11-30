# Test Data Builders Kılavuzu

## 1. Genel Bakış

### 1.1 Builder Pattern Neden Kullanılır?

**Problemler:**

- Test data oluşturma karmaşık ve tekrarlayıcı
- Her test için yeni instance oluşturma zahmetli
- Default değerler merkezi yönetilemiyor
- Test data değişiklikleri tüm testleri etkiliyor

**Builder Pattern Faydaları:**

```
✅ Okunabilir test kodu
✅ Merkezi default değerler
✅ Fluent API (zincirleme metodlar)
✅ Test izolasyonu
✅ Kolay maintenance
```

**Örnek Karşılaştırma:**

```java
// ❌ Without Builder (Verbose, Hard to maintain)
@Test
void testCreatePost() {
    User user = new User(
        UserId.of(UUID.randomUUID()),
        new Email("test@example.com"),
        new Password("hashed"),
        new FullName("John", "Doe"),
        Profession.DOCTOR,
        VerificationStatus.VERIFIED,
        null,
        new PrivacySettings(true, true),
        0, 0, Set.of(), true, null,
        Instant.now()
    );
    // ... test logic
}

// ✅ With Builder (Clean, Maintainable)
@Test
void testCreatePost() {
    User user = aUser().verified().build();
    // ... test logic
}
```

---

## 2. Domain Object Builders

### 2.1 User Builder

```java
package com.meslektas.testing.builders;

public class UserTestBuilder {

    private UserId id = UserId.of(UUID.randomUUID());
    private Email email = new Email("test@example.com");
    private Password password = Password.fromHash("$2a$10$hashedpassword");
    private FullName fullName = new FullName("Test", "User");
    private Profession profession = Profession.DOCTOR;
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;
    private ProfileImage profileImage = null;
    private PrivacySettings privacySettings = new PrivacySettings(true, true);
    private int followerCount = 0;
    private int followingCount = 0;
    private Set<UserId> blockedUsers = new HashSet<>();
    private boolean active = true;
    private Instant deletedAt = null;
    private Instant createdAt = Instant.now();

    public static UserTestBuilder aUser() {
        return new UserTestBuilder();
    }

    public static UserTestBuilder aDoctor() {
        return new UserTestBuilder()
            .withProfession(Profession.DOCTOR);
    }

    public static UserTestBuilder aNurse() {
        return new UserTestBuilder()
            .withProfession(Profession.NURSE);
    }

    public static UserTestBuilder aVerifiedUser() {
        return new UserTestBuilder()
            .verified();
    }

    public UserTestBuilder withId(UserId id) {
        this.id = id;
        return this;
    }

    public UserTestBuilder withEmail(String email) {
        this.email = new Email(email);
        return this;
    }

    public UserTestBuilder withFullName(String firstName, String lastName) {
        this.fullName = new FullName(firstName, lastName);
        return this;
    }

    public UserTestBuilder withProfession(Profession profession) {
        this.profession = profession;
        return this;
    }

    public UserTestBuilder verified() {
        this.verificationStatus = VerificationStatus.VERIFIED;
        return this;
    }

    public UserTestBuilder pending() {
        this.verificationStatus = VerificationStatus.PENDING;
        return this;
    }

    public UserTestBuilder rejected() {
        this.verificationStatus = VerificationStatus.REJECTED;
        return this;
    }

    public UserTestBuilder withFollowerCount(int count) {
        this.followerCount = count;
        return this;
    }

    public UserTestBuilder withFollowingCount(int count) {
        this.followingCount = count;
        return this;
    }

    public UserTestBuilder withBlockedUser(UserId userId) {
        this.blockedUsers.add(userId);
        return this;
    }

    public UserTestBuilder inactive() {
        this.active = false;
        return this;
    }

    public UserTestBuilder deleted() {
        this.deletedAt = Instant.now();
        return this;
    }

    public UserTestBuilder withCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
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
            profileImage,
            privacySettings,
            followerCount,
            followingCount,
            blockedUsers,
            active,
            deletedAt,
            createdAt
        );
    }
}
```

**Usage Examples:**

```java
// Simple user
User user = aUser().build();

// Verified doctor
User doctor = aDoctor().verified().build();

// User with specific email
User user = aUser()
    .withEmail("doctor@hospital.com")
    .verified()
    .build();

// User with followers
User popular = aUser()
    .verified()
    .withFollowerCount(1000)
    .withFollowingCount(50)
    .build();

// Deleted user
User deleted = aUser()
    .deleted()
    .build();
```

### 2.2 Post Builder

```java
public class PostTestBuilder {

    private PostId id = PostId.of(UUID.randomUUID());
    private UserId authorId = UserId.of(UUID.randomUUID());
    private Profession profession = Profession.DOCTOR;
    private PostContent content = new PostContent("Test post content");
    private List<PostImage> images = new ArrayList<>();
    private int likeCount = 0;
    private int commentCount = 0;
    private Set<UserId> likes = new HashSet<>();
    private List<Comment> comments = new ArrayList<>();
    private boolean deleted = false;
    private Instant deletedAt = null;
    private Instant createdAt = Instant.now();

    public static PostTestBuilder aPost() {
        return new PostTestBuilder();
    }

    public static PostTestBuilder aPostBy(UserId authorId) {
        return new PostTestBuilder()
            .withAuthorId(authorId);
    }

    public static PostTestBuilder aDoctorPost() {
        return new PostTestBuilder()
            .withProfession(Profession.DOCTOR);
    }

    public PostTestBuilder withId(PostId id) {
        this.id = id;
        return this;
    }

    public PostTestBuilder withAuthorId(UserId authorId) {
        this.authorId = authorId;
        return this;
    }

    public PostTestBuilder withProfession(Profession profession) {
        this.profession = profession;
        return this;
    }

    public PostTestBuilder withContent(String content) {
        this.content = new PostContent(content);
        return this;
    }

    public PostTestBuilder withImage(String imageUrl) {
        this.images.add(new PostImage(imageUrl, images.size()));
        return this;
    }

    public PostTestBuilder withImages(List<String> imageUrls) {
        for (int i = 0; i < imageUrls.size(); i++) {
            this.images.add(new PostImage(imageUrls.get(i), i));
        }
        return this;
    }

    public PostTestBuilder withLikes(int count) {
        this.likeCount = count;
        for (int i = 0; i < count; i++) {
            this.likes.add(UserId.of(UUID.randomUUID()));
        }
        return this;
    }

    public PostTestBuilder withLike(UserId userId) {
        this.likes.add(userId);
        this.likeCount = this.likes.size();
        return this;
    }

    public PostTestBuilder withComment(Comment comment) {
        this.comments.add(comment);
        this.commentCount = this.comments.size();
        return this;
    }

    public PostTestBuilder withComments(int count) {
        for (int i = 0; i < count; i++) {
            Comment comment = Comment.create(
                UserId.of(UUID.randomUUID()),
                new CommentContent("Test comment " + i)
            );
            this.comments.add(comment);
        }
        this.commentCount = count;
        return this;
    }

    public PostTestBuilder deleted() {
        this.deleted = true;
        this.deletedAt = Instant.now();
        return this;
    }

    public PostTestBuilder withCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public Post build() {
        return Post.reconstruct(
            id,
            authorId,
            profession,
            content,
            images,
            likeCount,
            commentCount,
            likes,
            comments,
            deleted,
            deletedAt,
            createdAt
        );
    }
}
```

**Usage Examples:**

```java
// Simple post
Post post = aPost().build();

// Post by specific user
Post post = aPostBy(userId).build();

// Popular post with likes and comments
Post popular = aPost()
    .withContent("Great medical insight!")
    .withLikes(100)
    .withComments(25)
    .build();

// Post with images
Post imagePost = aPost()
    .withContent("Check these X-rays")
    .withImages(List.of(
        "https://example.com/xray1.jpg",
        "https://example.com/xray2.jpg"
    ))
    .build();
```

### 2.3 Verification Request Builder

```java
public class VerificationRequestTestBuilder {

    private VerificationRequestId id = VerificationRequestId.of(UUID.randomUUID());
    private UserId userId = UserId.of(UUID.randomUUID());
    private VerificationType verificationType = VerificationType.ID_CARD;
    private DocumentNumber documentNumber = new DocumentNumber("12345678901");
    private DocumentImage documentImage = new DocumentImage("https://example.com/doc.jpg");
    private SelfieImage selfieImage = new SelfieImage("https://example.com/selfie.jpg");
    private VerificationStatus status = VerificationStatus.PENDING;
    private AIVerificationResult aiResult = null;
    private ManualReviewResult manualResult = null;
    private int attemptCount = 1;
    private Instant submittedAt = Instant.now();
    private Instant reviewedAt = null;

    public static VerificationRequestTestBuilder aVerificationRequest() {
        return new VerificationRequestTestBuilder();
    }

    public static VerificationRequestTestBuilder anIdCardVerification() {
        return new VerificationRequestTestBuilder()
            .withVerificationType(VerificationType.ID_CARD);
    }

    public static VerificationRequestTestBuilder aDiplomaVerification() {
        return new VerificationRequestTestBuilder()
            .withVerificationType(VerificationType.DIPLOMA);
    }

    public VerificationRequestTestBuilder withUserId(UserId userId) {
        this.userId = userId;
        return this;
    }

    public VerificationRequestTestBuilder withVerificationType(VerificationType type) {
        this.verificationType = type;
        return this;
    }

    public VerificationRequestTestBuilder withDocumentNumber(String number) {
        this.documentNumber = new DocumentNumber(number);
        return this;
    }

    public VerificationRequestTestBuilder pending() {
        this.status = VerificationStatus.PENDING;
        return this;
    }

    public VerificationRequestTestBuilder approved() {
        this.status = VerificationStatus.APPROVED;
        this.reviewedAt = Instant.now();
        return this;
    }

    public VerificationRequestTestBuilder rejected() {
        this.status = VerificationStatus.REJECTED;
        this.reviewedAt = Instant.now();
        return this;
    }

    public VerificationRequestTestBuilder withAIResult(float faceMatchConfidence, boolean documentValid) {
        this.aiResult = new AIVerificationResult(
            faceMatchConfidence,
            documentValid,
            Map.of("analysis", "test"),
            Instant.now()
        );
        return this;
    }

    public VerificationRequestTestBuilder withManualReview(UserId reviewerId, String notes) {
        this.manualResult = new ManualReviewResult(
            reviewerId,
            notes,
            Instant.now()
        );
        return this;
    }

    public VerificationRequestTestBuilder withAttemptCount(int count) {
        this.attemptCount = count;
        return this;
    }

    public VerificationRequest build() {
        return VerificationRequest.reconstruct(
            id,
            userId,
            verificationType,
            documentNumber,
            documentImage,
            selfieImage,
            status,
            aiResult,
            manualResult,
            attemptCount,
            submittedAt,
            reviewedAt
        );
    }
}
```

### 2.4 Message Builder

```java
public class MessageTestBuilder {

    private MessageId id = MessageId.of(UUID.randomUUID());
    private ConversationId conversationId = ConversationId.of(UUID.randomUUID());
    private UserId senderId = UserId.of(UUID.randomUUID());
    private UserId recipientId = UserId.of(UUID.randomUUID());
    private MessageContent content = new MessageContent("Test message");
    private MessageAttachment attachment = null;
    private boolean read = false;
    private Instant readAt = null;
    private boolean deleted = false;
    private Instant deletedAt = null;
    private Instant sentAt = Instant.now();

    public static MessageTestBuilder aMessage() {
        return new MessageTestBuilder();
    }

    public static MessageTestBuilder aMessageFrom(UserId senderId) {
        return new MessageTestBuilder()
            .withSenderId(senderId);
    }

    public MessageTestBuilder withConversationId(ConversationId conversationId) {
        this.conversationId = conversationId;
        return this;
    }

    public MessageTestBuilder withSenderId(UserId senderId) {
        this.senderId = senderId;
        return this;
    }

    public MessageTestBuilder withRecipientId(UserId recipientId) {
        this.recipientId = recipientId;
        return this;
    }

    public MessageTestBuilder withContent(String content) {
        this.content = new MessageContent(content);
        return this;
    }

    public MessageTestBuilder withAttachment(String imageUrl) {
        this.attachment = new MessageAttachment(imageUrl);
        return this;
    }

    public MessageTestBuilder read() {
        this.read = true;
        this.readAt = Instant.now();
        return this;
    }

    public MessageTestBuilder deleted() {
        this.deleted = true;
        this.deletedAt = Instant.now();
        return this;
    }

    public MessageTestBuilder withSentAt(Instant sentAt) {
        this.sentAt = sentAt;
        return this;
    }

    public Message build() {
        return Message.reconstruct(
            id,
            conversationId,
            senderId,
            recipientId,
            content,
            attachment,
            read,
            readAt,
            deleted,
            deletedAt,
            sentAt
        );
    }
}
```

---

## 3. DTO Builders

### 3.1 Request DTO Builders

```java
public class CreatePostRequestBuilder {

    private String content = "Test post content";
    private List<String> imageUrls = new ArrayList<>();

    public static CreatePostRequestBuilder aCreatePostRequest() {
        return new CreatePostRequestBuilder();
    }

    public CreatePostRequestBuilder withContent(String content) {
        this.content = content;
        return this;
    }

    public CreatePostRequestBuilder withImage(String imageUrl) {
        this.imageUrls.add(imageUrl);
        return this;
    }

    public CreatePostRequestBuilder withImages(List<String> imageUrls) {
        this.imageUrls = new ArrayList<>(imageUrls);
        return this;
    }

    public CreatePostRequest build() {
        return new CreatePostRequest(content, imageUrls);
    }
}
```

```java
public class RegisterRequestBuilder {

    private String email = "test@example.com";
    private String password = "Password123!";
    private String firstName = "Test";
    private String lastName = "User";
    private String profession = "DOCTOR";

    public static RegisterRequestBuilder aRegisterRequest() {
        return new RegisterRequestBuilder();
    }

    public RegisterRequestBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    public RegisterRequestBuilder withPassword(String password) {
        this.password = password;
        return this;
    }

    public RegisterRequestBuilder withFullName(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
        return this;
    }

    public RegisterRequestBuilder withProfession(String profession) {
        this.profession = profession;
        return this;
    }

    public RegisterRequest build() {
        return new RegisterRequest(
            email,
            password,
            firstName,
            lastName,
            profession
        );
    }
}
```

### 3.2 Response DTO Builders

```java
public class UserProfileResponseBuilder {

    private String userId = UUID.randomUUID().toString();
    private String email = "test@example.com";
    private String fullName = "Test User";
    private String profession = "DOCTOR";
    private String verificationStatus = "VERIFIED";
    private String profileImageUrl = null;
    private int followerCount = 0;
    private int followingCount = 0;
    private boolean following = false;

    public static UserProfileResponseBuilder aUserProfileResponse() {
        return new UserProfileResponseBuilder();
    }

    public UserProfileResponseBuilder verified() {
        this.verificationStatus = "VERIFIED";
        return this;
    }

    public UserProfileResponseBuilder withFollowerCount(int count) {
        this.followerCount = count;
        return this;
    }

    public UserProfileResponseBuilder following() {
        this.following = true;
        return this;
    }

    public UserProfileResponse build() {
        return new UserProfileResponse(
            userId,
            email,
            fullName,
            profession,
            verificationStatus,
            profileImageUrl,
            followerCount,
            followingCount,
            following
        );
    }
}
```

---

## 4. Entity Builders

### 4.1 JPA Entity Builders

```java
public class UserEntityBuilder {

    private UUID id = UUID.randomUUID();
    private String email = "test@example.com";
    private String passwordHash = "$2a$10$hashedpassword";
    private String firstName = "Test";
    private String lastName = "User";
    private Profession profession = Profession.DOCTOR;
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;
    private String profileImageUrl = null;
    private boolean profileVisibleToAll = true;
    private boolean allowsMessagesFromAll = true;
    private int followerCount = 0;
    private int followingCount = 0;
    private boolean active = true;
    private Instant deletedAt = null;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public static UserEntityBuilder aUserEntity() {
        return new UserEntityBuilder();
    }

    public UserEntityBuilder withId(UUID id) {
        this.id = id;
        return this;
    }

    public UserEntityBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    public UserEntityBuilder verified() {
        this.verificationStatus = VerificationStatus.VERIFIED;
        return this;
    }

    public UserEntityBuilder withProfession(Profession profession) {
        this.profession = profession;
        return this;
    }

    public UserEntity build() {
        UserEntity entity = new UserEntity();
        entity.setId(id);
        entity.setEmail(email);
        entity.setPasswordHash(passwordHash);
        entity.setFirstName(firstName);
        entity.setLastName(lastName);
        entity.setProfession(profession);
        entity.setVerificationStatus(verificationStatus);
        entity.setProfileImageUrl(profileImageUrl);
        entity.setProfileVisibleToAll(profileVisibleToAll);
        entity.setAllowsMessagesFromAll(allowsMessagesFromAll);
        entity.setFollowerCount(followerCount);
        entity.setFollowingCount(followingCount);
        entity.setActive(active);
        entity.setDeletedAt(deletedAt);
        entity.setCreatedAt(createdAt);
        entity.setUpdatedAt(updatedAt);
        return entity;
    }
}
```

```java
public class PostEntityBuilder {

    private UUID id = UUID.randomUUID();
    private UUID authorId = UUID.randomUUID();
    private Profession profession = Profession.DOCTOR;
    private String content = "Test post content";
    private List<String> imageUrls = new ArrayList<>();
    private int likeCount = 0;
    private int commentCount = 0;
    private boolean deleted = false;
    private Instant deletedAt = null;
    private Instant createdAt = Instant.now();

    public static PostEntityBuilder aPostEntity() {
        return new PostEntityBuilder();
    }

    public PostEntityBuilder withAuthorId(UUID authorId) {
        this.authorId = authorId;
        return this;
    }

    public PostEntityBuilder withContent(String content) {
        this.content = content;
        return this;
    }

    public PostEntityBuilder withLikeCount(int count) {
        this.likeCount = count;
        return this;
    }

    public PostEntity build() {
        PostEntity entity = new PostEntity();
        entity.setId(id);
        entity.setAuthorId(authorId);
        entity.setProfession(profession);
        entity.setContent(content);
        entity.setImageUrls(imageUrls);
        entity.setLikeCount(likeCount);
        entity.setCommentCount(commentCount);
        entity.setDeleted(deleted);
        entity.setDeletedAt(deletedAt);
        entity.setCreatedAt(createdAt);
        return entity;
    }
}
```

---

## 5. Test Fixtures

### 5.1 Common Test Data

```java
public class TestFixtures {

    // Common User Fixtures
    public static final User VERIFIED_DOCTOR = aUser()
        .withEmail("doctor@hospital.com")
        .withFullName("Dr. John", "Doe")
        .withProfession(Profession.DOCTOR)
        .verified()
        .build();

    public static final User VERIFIED_NURSE = aUser()
        .withEmail("nurse@hospital.com")
        .withFullName("Jane", "Smith")
        .withProfession(Profession.NURSE)
        .verified()
        .build();

    public static final User UNVERIFIED_USER = aUser()
        .withEmail("unverified@example.com")
        .build();

    // Common Post Fixtures
    public static final Post SAMPLE_POST = aPost()
        .withContent("Great medical insight!")
        .withLikes(10)
        .withComments(5)
        .build();

    // Common Email Fixtures
    public static final Email VALID_EMAIL = new Email("test@example.com");
    public static final Email DOCTOR_EMAIL = new Email("doctor@hospital.com");

    // Common Profession Fixtures
    public static final Profession DEFAULT_PROFESSION = Profession.DOCTOR;

    // Time Fixtures
    public static final Instant NOW = Instant.now();
    public static final Instant ONE_HOUR_AGO = NOW.minus(1, ChronoUnit.HOURS);
    public static final Instant ONE_DAY_AGO = NOW.minus(1, ChronoUnit.DAYS);
    public static final Instant ONE_WEEK_AGO = NOW.minus(7, ChronoUnit.DAYS);

    // Private constructor to prevent instantiation
    private TestFixtures() {
        throw new AssertionError("Cannot instantiate TestFixtures");
    }
}
```

### 5.2 Test Data Factory

```java
public class TestDataFactory {

    private static final AtomicInteger EMAIL_COUNTER = new AtomicInteger(0);

    /**
     * Creates unique email for each test
     */
    public static String uniqueEmail() {
        return "test" + EMAIL_COUNTER.incrementAndGet() + "@example.com";
    }

    /**
     * Creates unique email with prefix
     */
    public static String uniqueEmail(String prefix) {
        return prefix + EMAIL_COUNTER.incrementAndGet() + "@example.com";
    }

    /**
     * Creates multiple verified users
     */
    public static List<User> createVerifiedUsers(int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> aUser()
                .withEmail(uniqueEmail("user" + i))
                .verified()
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Creates multiple posts by same author
     */
    public static List<Post> createPostsByAuthor(UserId authorId, int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> aPost()
                .withAuthorId(authorId)
                .withContent("Post content " + i)
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Creates conversation with messages
     */
    public static Conversation createConversationWithMessages(
        UserId user1Id,
        UserId user2Id,
        int messageCount
    ) {
        Conversation conversation = Conversation.create(user1Id, user2Id);

        for (int i = 0; i < messageCount; i++) {
            UserId senderId = i % 2 == 0 ? user1Id : user2Id;
            UserId recipientId = i % 2 == 0 ? user2Id : user1Id;

            Message message = aMessage()
                .withConversationId(conversation.getId())
                .withSenderId(senderId)
                .withRecipientId(recipientId)
                .withContent("Message " + i)
                .build();

            conversation.addMessage(message);
        }

        return conversation;
    }
}
```

---

## 6. Complex Scenario Builders

### 6.1 Social Network Scenario

```java
public class SocialNetworkScenarioBuilder {

    private User mainUser;
    private List<User> followers = new ArrayList<>();
    private List<User> following = new ArrayList<>();
    private List<Post> posts = new ArrayList<>();

    public static SocialNetworkScenarioBuilder aSocialNetwork() {
        return new SocialNetworkScenarioBuilder();
    }

    public SocialNetworkScenarioBuilder withMainUser(User user) {
        this.mainUser = user;
        return this;
    }

    public SocialNetworkScenarioBuilder withFollowers(int count) {
        this.followers = TestDataFactory.createVerifiedUsers(count);
        return this;
    }

    public SocialNetworkScenarioBuilder withFollowing(int count) {
        this.following = TestDataFactory.createVerifiedUsers(count);
        return this;
    }

    public SocialNetworkScenarioBuilder withPosts(int count) {
        this.posts = TestDataFactory.createPostsByAuthor(
            mainUser.getId(),
            count
        );
        return this;
    }

    public SocialNetworkScenario build() {
        return new SocialNetworkScenario(
            mainUser,
            followers,
            following,
            posts
        );
    }

    public static class SocialNetworkScenario {
        private final User mainUser;
        private final List<User> followers;
        private final List<User> following;
        private final List<Post> posts;

        public SocialNetworkScenario(
            User mainUser,
            List<User> followers,
            List<User> following,
            List<Post> posts
        ) {
            this.mainUser = mainUser;
            this.followers = followers;
            this.following = following;
            this.posts = posts;
        }

        public User getMainUser() { return mainUser; }
        public List<User> getFollowers() { return followers; }
        public List<User> getFollowing() { return following; }
        public List<Post> getPosts() { return posts; }
    }
}
```

**Usage:**

```java
@Test
void testSocialNetworkScenario() {
    // Given
    User mainUser = aUser().verified().build();

    SocialNetworkScenario scenario = aSocialNetwork()
        .withMainUser(mainUser)
        .withFollowers(100)
        .withFollowing(50)
        .withPosts(20)
        .build();

    // When
    List<Post> feed = feedService.getFeed(mainUser.getId());

    // Then
    assertThat(feed).isNotEmpty();
}
```

### 6.2 Verification Process Scenario

```java
public class VerificationProcessScenarioBuilder {

    private User user;
    private VerificationRequest request;
    private AIVerificationResult aiResult;
    private ManualReviewResult manualResult;

    public static VerificationProcessScenarioBuilder aVerificationProcess() {
        return new VerificationProcessScenarioBuilder();
    }

    public VerificationProcessScenarioBuilder withUser(User user) {
        this.user = user;
        return this;
    }

    public VerificationProcessScenarioBuilder withPendingRequest() {
        this.request = aVerificationRequest()
            .withUserId(user.getId())
            .pending()
            .build();
        return this;
    }

    public VerificationProcessScenarioBuilder withAIApproval() {
        this.aiResult = new AIVerificationResult(
            0.95f,
            true,
            Map.of("faceMatch", "high confidence"),
            Instant.now()
        );
        return this;
    }

    public VerificationProcessScenarioBuilder withManualApproval(UserId reviewerId) {
        this.manualResult = new ManualReviewResult(
            reviewerId,
            "Verified manually",
            Instant.now()
        );
        return this;
    }

    public VerificationProcessScenario build() {
        return new VerificationProcessScenario(
            user,
            request,
            aiResult,
            manualResult
        );
    }

    public static class VerificationProcessScenario {
        private final User user;
        private final VerificationRequest request;
        private final AIVerificationResult aiResult;
        private final ManualReviewResult manualResult;

        // Constructor and getters...
    }
}
```

---

## 7. Test Helpers

### 7.1 Authentication Helper

```java
public class AuthenticationTestHelper {

    private final JwtTokenProvider tokenProvider;

    public AuthenticationTestHelper(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    /**
     * Generates JWT token for test user
     */
    public String generateToken(User user) {
        return tokenProvider.generateAccessToken(
            user.getId().getValue().toString(),
            user.getEmail().getValue(),
            List.of(user.getVerificationStatus().name())
        );
    }

    /**
     * Generates expired token for testing
     */
    public String generateExpiredToken(User user) {
        // Implementation depends on JWT library
        return tokenProvider.generateTokenWithCustomExpiry(
            user.getId().getValue().toString(),
            Instant.now().minus(1, ChronoUnit.HOURS)
        );
    }

    /**
     * Creates authenticated HTTP headers
     */
    public HttpHeaders createAuthHeaders(User user) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(generateToken(user));
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
```

### 7.2 Database Helper

```java
@Component
public class DatabaseTestHelper {

    @Autowired
    private TestEntityManager entityManager;

    /**
     * Persists and flushes entity
     */
    public <T> T persistAndFlush(T entity) {
        entityManager.persist(entity);
        entityManager.flush();
        return entity;
    }

    /**
     * Clears persistence context
     */
    public void clearContext() {
        entityManager.flush();
        entityManager.clear();
    }

    /**
     * Saves multiple entities
     */
    public <T> List<T> persistAll(List<T> entities) {
        entities.forEach(entityManager::persist);
        entityManager.flush();
        return entities;
    }

    /**
     * Executes native SQL for setup
     */
    public void executeSQL(String sql) {
        entityManager.getEntityManager()
            .createNativeQuery(sql)
            .executeUpdate();
    }
}
```

### 7.3 Time Helper

```java
public class TimeTestHelper {

    /**
     * Creates instant from date string
     */
    public static Instant instant(String dateTime) {
        return Instant.parse(dateTime);
    }

    /**
     * Creates instant X days ago
     */
    public static Instant daysAgo(int days) {
        return Instant.now().minus(days, ChronoUnit.DAYS);
    }

    /**
     * Creates instant X hours ago
     */
    public static Instant hoursAgo(int hours) {
        return Instant.now().minus(hours, ChronoUnit.HOURS);
    }

    /**
     * Creates instant X minutes ago
     */
    public static Instant minutesAgo(int minutes) {
        return Instant.now().minus(minutes, ChronoUnit.MINUTES);
    }

    /**
     * Freezes time for testing
     */
    public static Clock fixedClock(Instant instant) {
        return Clock.fixed(instant, ZoneId.systemDefault());
    }
}
```

---

## 8. Best Practices

### 8.1 Builder Naming Conventions

```java
// ✅ Good: Clear factory method names
UserTestBuilder.aUser()
UserTestBuilder.aVerifiedUser()
UserTestBuilder.aDoctor()

// ✅ Good: Descriptive fluent methods
.withEmail("test@example.com")
.verified()
.withFollowerCount(100)

// ❌ Bad: Unclear names
UserTestBuilder.create()
UserTestBuilder.user()
.email()  // Not clear if setter or getter
```

### 8.2 Builder Organization

```java
// ✅ Good: Organized structure
public class UserTestBuilder {
    // 1. Fields with defaults
    private UserId id = UserId.of(UUID.randomUUID());

    // 2. Factory methods
    public static UserTestBuilder aUser() { }

    // 3. Fluent setters
    public UserTestBuilder withEmail(String email) { }

    // 4. State modifiers
    public UserTestBuilder verified() { }

    // 5. Build method
    public User build() { }
}
```

### 8.3 Test Data Isolation

```java
// ✅ Good: Each test creates fresh data
@Test
void test1() {
    User user = aUser().build();  // New instance
}

@Test
void test2() {
    User user = aUser().build();  // New instance
}

// ❌ Bad: Shared mutable state
private static final User SHARED_USER = aUser().build();

@Test
void test1() {
    SHARED_USER.verify();  // Mutates shared state
}
```

### 8.4 Meaningful Defaults

```java
// ✅ Good: Realistic defaults
private String email = "test@example.com";
private VerificationStatus status = VerificationStatus.UNVERIFIED;
private boolean active = true;

// ❌ Bad: Meaningless defaults
private String email = "a";
private VerificationStatus status = null;  // Will cause NPE
```

---

## 9. Complete Example

### 9.1 Complex Test with Builders

```java
@Test
@DisplayName("Should generate feed with posts from followed users")
void shouldGenerateFeedWithPostsFromFollowedUsers() {
    // Given: Main user following 3 doctors
    User mainUser = aUser()
        .withEmail("follower@example.com")
        .verified()
        .build();

    User doctor1 = aDoctor()
        .withEmail("doctor1@hospital.com")
        .verified()
        .build();

    User doctor2 = aDoctor()
        .withEmail("doctor2@hospital.com")
        .verified()
        .build();

    User doctor3 = aDoctor()
        .withEmail("doctor3@hospital.com")
        .verified()
        .build();

    // Save users
    userRepository.saveAll(List.of(mainUser, doctor1, doctor2, doctor3));

    // Create follows
    mainUser.follow(doctor1.getId());
    mainUser.follow(doctor2.getId());
    mainUser.follow(doctor3.getId());

    // Create posts
    Post post1 = aPost()
        .withAuthorId(doctor1.getId())
        .withContent("Medical insight 1")
        .withLikes(50)
        .withCreatedAt(hoursAgo(2))
        .build();

    Post post2 = aPost()
        .withAuthorId(doctor2.getId())
        .withContent("Medical insight 2")
        .withLikes(30)
        .withCreatedAt(hoursAgo(1))
        .build();

    Post post3 = aPost()
        .withAuthorId(doctor3.getId())
        .withContent("Medical insight 3")
        .withCreatedAt(minutesAgo(30))
        .build();

    postRepository.saveAll(List.of(post1, post2, post3));

    // When
    FeedQuery query = new FeedQuery(mainUser.getId(), 0, 20);
    PagedResult<PostResponse> feed = feedService.getFeed(query);

    // Then
    assertThat(feed.getContent()).hasSize(3);
    assertThat(feed.getContent())
        .extracting(PostResponse::getContent)
        .containsExactly(
            "Medical insight 3",  // Most recent
            "Medical insight 2",
            "Medical insight 1"
        );
}
```

---

## 10. Özet

### Builder Pattern Benefits:

- **Okunabilirlik:** Test kodu anlaşılır ve temiz
- **Bakım:** Merkezi default değerler, kolay değişiklik
- **Esneklik:** Fluent API ile ihtiyaca özel data
- **İzolasyon:** Her test kendi data'sını oluşturur

### Test Data Builder Types:

- **Domain Builders:** User, Post, Message, VerificationRequest
- **DTO Builders:** Request/Response DTOs
- **Entity Builders:** JPA entities
- **Scenario Builders:** Complex multi-object scenarios

### Best Practices:

- ✅ Meaningful defaults
- ✅ Fluent method chaining
- ✅ Factory methods for common cases
- ✅ Test data isolation
- ✅ Realistic test data
- ✅ Helper utilities for common operations

### Next:

- **Sprint Planning:** 23-SPRINT-01-02.md (Project setup, Identity context)
