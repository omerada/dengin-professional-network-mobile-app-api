# Domain Service Kılavuzu

## 1. Genel Bakış

### 1.1 Domain Service Nedir?

Domain Service, domain logic'in aggregate veya value object'e ait olmadığı durumlarda kullanılan stateless servislerdir. Aggregate'lerin veya entity'lerin doğal bir parçası olmayan, ancak domain layer'a ait olan operasyonları içerir.

**Temel Özellikler:**

- **Stateless:** Instance state tutmaz
- **Domain Logic:** Business logic içerir (infrastructure değil)
- **Multi-Aggregate:** Birden fazla aggregate ile çalışabilir
- **Named After Ubiquitous Language:** İsimlendirme domain'den gelir

**Entity/Aggregate vs Domain Service:**

```
Aggregate/Entity:
- Kendi state'ini yönetir
- Tek aggregate sınırı içinde çalışır
- Identity'si vardır
- Örnek: User.blockUser(), Post.addLike()

Domain Service:
- State tutmaz
- Birden fazla aggregate ile çalışabilir
- Identity'si yoktur
- Örnek: AIVerificationService, ProfessionFeedService
```

**Meslektaş Projesi Context:**

- 12 Domain Service tanımlandı
- Her service domain layer'da (infrastructure'dan bağımsız)
- Multi-aggregate orchestration yapıyorlar
- Business rule enforcement sağlıyorlar

### 1.2 Domain Service Ne Zaman Kullanılır?

**✅ Domain Service Kullan:**

1. **Multi-Aggregate Operation:** İki veya daha fazla aggregate'i koordine eden logic
2. **Domain Calculation:** Aggregate'e ait olmayan hesaplama
3. **Domain Policy:** Business rule enforcement
4. **External Domain Integration:** Domain logic gerektiren dış sistem entegrasyonu

**❌ Domain Service Kullanma:**

1. **Single Aggregate Operation:** Aggregate kendi method'unu kullanmalı
2. **Infrastructure Logic:** Repository, HTTP client, email sender → Application Service
3. **CRUD Operations:** Basit kayıt/güncelleme → Application Service
4. **Presentation Logic:** DTO mapping, formatting → Application Service

**Karar Ağacı:**

```
Logic aggregate'in doğal sorumluluğu mu?
  └─ Evet → Aggregate method kullan
  └─ Hayır → Birden fazla aggregate ile çalışıyor mu?
       └─ Evet → Domain Service kullan
       └─ Hayır → Domain hesaplama/policy mi?
            └─ Evet → Domain Service kullan
            └─ Hayır → Application Service kullan
```

**Meslektaş Örnekleri:**

**Aggregate Method (Doğru):**

```java
// Post aggregate kendi like'ını yönetir
Post post = postRepository.findById(postId);
post.addLike(userId);  // Aggregate method
postRepository.save(post);
```

**Domain Service (Doğru):**

```java
// AI verification 6 stage içeriyor, VerificationRequest aggregate'ine sığmıyor
AIVerificationService service = ...;
AIVerificationResult result = service.verifyDocument(
    verificationRequest.getIdDocument(),
    verificationRequest.getSelfie()
);
```

**Application Service (Doğru):**

```java
// DTO mapping, transaction management → Application Service
@Transactional
public PostResponse createPost(CreatePostRequest request) {
    Post post = Post.create(...);  // Aggregate factory
    postRepository.save(post);
    return PostMapper.toResponse(post);  // DTO mapping
}
```

---

## 2. Domain Service Tasarım Prensipleri

### 2.1 Stateless (State Tutma)

**Prensip:** Domain service instance state tutmamalıdır.

**Yanlış (Stateful):**

```java
❌ YANLIŞ:
public class VerificationService {

    private VerificationRequest currentRequest;  // STATE - YANLIŞ!

    public void startVerification(VerificationRequest request) {
        this.currentRequest = request;  // State tutma
    }

    public AIVerificationResult processOCR() {
        // currentRequest'i kullanıyor - YANLIŞ!
        return ocrService.process(currentRequest.getIdDocument());
    }
}
```

**Doğru (Stateless):**

```java
✅ DOĞRU:
public class AIVerificationService {

    // Dependencies (stateless services)
    private final OCRService ocrService;
    private final FaceComparisonService faceComparisonService;

    // Method parametresi olarak al, state tutma
    public AIVerificationResult verify(Document idDocument, Document selfie) {
        OCRResult ocrResult = ocrService.extractText(idDocument);
        FaceMatchResult faceResult = faceComparisonService.compare(idDocument, selfie);
        // ...
        return new AIVerificationResult(...);
    }
}
```

### 2.2 Domain Language (Ubiquitous Language)

**Prensip:** Service isimleri domain'den gelmeli.

**Yanlış İsimlendirme:**

```java
❌ YANLIŞ:
public class PostManager { }  // Generic, domain dili değil
public class UserHelper { }  // Technical, domain concept değil
public class DataProcessor { }  // Infrastructure smell
```

**Doğru İsimlendirme:**

```java
✅ DOĞRU:
public class ProfessionFeedService { }  // Domain concept: "Meslek bazlı feed"
public class AIVerificationService { }  // Domain concept: "AI ile doğrulama"
public class SpamDetectionService { }  // Domain concept: "Spam tespiti"
public class ModerationPolicyService { }  // Domain concept: "Moderasyon politikası"
```

**Method İsimlendirme:**

```java
✅ DOĞRU:
class AIVerificationService {
    AIVerificationResult verifyDocument(...);  // Domain verb: "verify"
    ConfidenceScore calculateConfidence(...);  // Domain verb: "calculate"
}

class ProfessionFeedService {
    List<Post> filterByProfession(...);  // Domain verb: "filter"
    boolean canUserSeePost(...);  // Domain question: "can user see?"
}
```

### 2.3 Domain Layer (Katman Bağımsızlığı)

**Prensip:** Domain service sadece domain layer'a depend etmelidir.

**Dependency Kuralları:**

```
Domain Service:
  ✅ Domain Entity/Aggregate
  ✅ Value Object
  ✅ Domain Event
  ✅ Domain Service (diğer)
  ❌ Repository (infrastructure)
  ❌ HTTP Client (infrastructure)
  ❌ Email Sender (infrastructure)
  ❌ DTO (application)
```

**Yanlış (Infrastructure Dependency):**

```java
❌ YANLIŞ:
public class PostService {

    private final PostRepository postRepository;  // Repository - YANLIŞ!
    private final EmailSender emailSender;  // Infrastructure - YANLIŞ!

    public void sharePost(Post post, List<Email> recipients) {
        postRepository.save(post);  // Infrastructure logic
        emailSender.send(...);  // Infrastructure logic
    }
}
```

**Doğru (Pure Domain):**

```java
✅ DOĞRU:
// Domain Service - Pure domain logic
public class ProfessionFeedService {

    // Domain service dependency OK
    private final PostContentPolicy contentPolicy;

    public List<Post> filterByProfession(
        List<Post> posts,  // Method parameter olarak al
        Profession profession,
        UserId currentUserId,
        Set<UserId> blockedUsers
    ) {
        return posts.stream()
            .filter(post -> post.getProfession().equals(profession))
            .filter(post -> !blockedUsers.contains(post.getAuthorId()))
            .filter(post -> contentPolicy.isAllowed(post, currentUserId))
            .toList();
    }
}

// Application Service - Infrastructure orchestration
@Service
@Transactional
public class PostApplicationService {

    private final PostRepository postRepository;  // Infrastructure OK burada
    private final ProfessionFeedService feedService;  // Domain service

    public List<PostDTO> getFeed(UserId userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Post> allPosts = postRepository.findByProfession(user.getProfession());

        // Domain service çağrısı
        List<Post> filteredPosts = feedService.filterByProfession(
            allPosts,
            user.getProfession(),
            userId,
            user.getBlockedUsers()
        );

        return filteredPosts.stream()
            .map(PostMapper::toDTO)
            .toList();
    }
}
```

### 2.4 Interface Segregation

**Prensip:** Domain service interface'i domain layer'da, implementation detayları ayırılabilir.

**Pattern:**

```java
// Domain Layer - Interface
public interface AIVerificationService {
    AIVerificationResult verify(Document idDocument, Document selfie);
    ConfidenceScore calculateConfidence(AIStageResults stageResults);
}

// Infrastructure Layer - AWS Implementation
@Service
public class AWSRekognitionVerificationService implements AIVerificationService {

    private final AmazonRekognition rekognitionClient;  // AWS SDK

    @Override
    public AIVerificationResult verify(Document idDocument, Document selfie) {
        // AWS Rekognition API calls
        DetectTextResult ocrResult = rekognitionClient.detectText(...);
        CompareFacesResult faceResult = rekognitionClient.compareFaces(...);
        // ...
    }
}
```

**Avantajları:**

- Domain layer infrastructure'dan bağımsız
- Test edilebilirlik (mock implementation)
- Vendor değişikliği kolay (AWS → Google Cloud Vision)

---

## 3. Meslektaş Domain Service Katalog

### 3.1 Verification Context Services

#### AIVerificationService

**Amaç:** AI-powered document verification (6-stage pipeline)

**Sorumluluklar:**

- OCR (text extraction)
- Face comparison (ID vs selfie)
- Liveness detection
- Document authenticity check
- Data validation
- Confidence score calculation

**Interface:**

```java
public interface AIVerificationService {

    /**
     * 6-stage AI verification pipeline
     *
     * @param idDocument Kimlik belgesi
     * @param selfie Kullanıcı selfie
     * @return AI verification sonuçları
     * @throws DocumentProcessingException AI processing hatası
     */
    AIVerificationResult verify(Document idDocument, Document selfie);

    /**
     * Weighted confidence score hesaplama
     * OCR: 25%, Face: 30%, Liveness: 25%, Authenticity: 15%, Data: 5%
     */
    ConfidenceScore calculateConfidence(
        OCRResult ocrResult,
        FaceMatchResult faceMatchResult,
        LivenessResult livenessResult,
        AuthenticityResult authenticityResult,
        DataValidationResult dataValidationResult
    );

    /**
     * OCR ile çıkarılan text'i parse et
     */
    ExtractedData parseOCRText(String ocrText);
}
```

**Implementation Sketch:**

```java
@Service
public class AWSRekognitionVerificationService implements AIVerificationService {

    private final AmazonRekognition rekognitionClient;
    private final S3Service s3Service;

    @Override
    public AIVerificationResult verify(Document idDocument, Document selfie) {
        // Stage 1: OCR
        OCRResult ocrResult = performOCR(idDocument);

        // Stage 2: Face Comparison
        FaceMatchResult faceResult = compareFaces(idDocument, selfie);

        // Stage 3: Liveness Detection
        LivenessResult livenessResult = detectLiveness(selfie);

        // Stage 4: Document Authenticity
        AuthenticityResult authenticityResult = checkAuthenticity(idDocument);

        // Stage 5: Data Validation
        ExtractedData extracted = parseOCRText(ocrResult.getExtractedText());
        DataValidationResult dataResult = validateData(extracted);

        // Stage 6: Confidence Score
        ConfidenceScore finalScore = calculateConfidence(
            ocrResult, faceResult, livenessResult, authenticityResult, dataResult
        );

        return new AIVerificationResult(
            ocrResult, faceResult, livenessResult,
            authenticityResult, dataResult, finalScore, Instant.now()
        );
    }

    @Override
    public ConfidenceScore calculateConfidence(...) {
        int weighted = (int) (
            ocrResult.getScore() * 0.25 +
            faceMatchResult.getScore() * 0.30 +
            livenessResult.getScore() * 0.25 +
            authenticityResult.getScore() * 0.15 +
            dataValidationResult.getScore() * 0.05
        );
        return new ConfidenceScore(Math.min(weighted, 100));
    }

    private OCRResult performOCR(Document document) {
        DetectTextRequest request = new DetectTextRequest()
            .withImage(new Image().withS3Object(
                new S3Object()
                    .withBucket(s3Service.getBucketName())
                    .withName(s3Service.getKeyFromUrl(document.getS3Url()))
            ));

        DetectTextResult result = rekognitionClient.detectText(request);

        String extractedText = result.getTextDetections().stream()
            .filter(t -> t.getType().equals("LINE"))
            .map(TextDetection::getDetectedText)
            .collect(Collectors.joining(" "));

        int confidence = (int) result.getTextDetections().stream()
            .mapToDouble(TextDetection::getConfidence)
            .average()
            .orElse(0);

        boolean passed = confidence >= 80;
        String reason = passed ? "OCR successful" : "Low OCR confidence";

        return new OCRResult(passed, confidence, extractedText, reason);
    }

    private FaceMatchResult compareFaces(Document idDocument, Document selfie) {
        CompareFacesRequest request = new CompareFacesRequest()
            .withSourceImage(new Image().withS3Object(...))  // ID document
            .withTargetImage(new Image().withS3Object(...))  // Selfie
            .withSimilarityThreshold(80F);

        CompareFacesResult result = rekognitionClient.compareFaces(request);

        if (result.getFaceMatches().isEmpty()) {
            return new FaceMatchResult(false, 0, 0.0, "No face match found");
        }

        FaceMatch match = result.getFaceMatches().get(0);
        double similarity = match.getSimilarity();
        int score = (int) similarity;
        boolean passed = similarity >= 85;

        return new FaceMatchResult(passed, score, similarity,
            passed ? "Face match successful" : "Similarity below threshold");
    }

    private LivenessResult detectLiveness(Document selfie) {
        // AWS Rekognition Face Liveness API
        // Implementation details...
        // Detect if photo is from a real person (not a printed photo)

        boolean passed = true;  // Placeholder
        int score = 90;
        return new LivenessResult(passed, score, "Liveness detected");
    }

    private AuthenticityResult checkAuthenticity(Document idDocument) {
        // Check for document tampering, watermarks, security features
        // AWS Rekognition or custom ML model

        boolean passed = true;  // Placeholder
        int score = 85;
        return new AuthenticityResult(passed, score, "Document authentic");
    }
}
```

**Business Rules:**

- BR-VER-003: Confidence score thresholds (85%+ auto-approve, 60-85% manual, <60% reject)
- BR-VER-004: Max 3 attempts
- Cost: $0.00406 per verification (AWS Rekognition pricing)

**Neden Domain Service?**

- Multi-stage complex calculation (aggregate'e sığmaz)
- External system integration (AWS Rekognition) ama domain logic içeriyor
- Business rule enforcement (confidence thresholds)

---

#### VerificationAttemptPolicy

**Amaç:** Verification attempt business rules

**Sorumluluklar:**

- Max attempt check (3 kez)
- Cooldown period enforcement (24 saat)
- Retry strategy

**Interface:**

```java
public interface VerificationAttemptPolicy {

    /**
     * Kullanıcı yeni attempt yapabilir mi?
     */
    boolean canSubmitNewAttempt(VerificationRequest request);

    /**
     * Cooldown period kaldı mı?
     */
    Duration getRemainingCooldown(VerificationRequest request);

    /**
     * Max attempt'e ulaşıldı mı?
     */
    boolean hasReachedMaxAttempts(VerificationRequest request);
}
```

**Implementation:**

```java
@Service
public class VerificationAttemptPolicyImpl implements VerificationAttemptPolicy {

    private static final int MAX_ATTEMPTS = 3;
    private static final Duration COOLDOWN_PERIOD = Duration.ofHours(24);

    @Override
    public boolean canSubmitNewAttempt(VerificationRequest request) {
        if (hasReachedMaxAttempts(request)) {
            return false;
        }

        if (request.getLastAttemptAt() == null) {
            return true;
        }

        Instant cooldownEnd = request.getLastAttemptAt().plus(COOLDOWN_PERIOD);
        return Instant.now().isAfter(cooldownEnd);
    }

    @Override
    public Duration getRemainingCooldown(VerificationRequest request) {
        if (request.getLastAttemptAt() == null) {
            return Duration.ZERO;
        }

        Instant cooldownEnd = request.getLastAttemptAt().plus(COOLDOWN_PERIOD);
        Instant now = Instant.now();

        if (now.isAfter(cooldownEnd)) {
            return Duration.ZERO;
        }

        return Duration.between(now, cooldownEnd);
    }

    @Override
    public boolean hasReachedMaxAttempts(VerificationRequest request) {
        return request.getAttemptCount() >= MAX_ATTEMPTS;
    }
}
```

**Business Rules:**

- BR-VER-002: Max 3 attempts
- BR-VER-006: 24 saat cooldown period

---

### 3.2 Social Context Services

#### ProfessionFeedService

**Amaç:** Profession-based post filtering

**Sorumluluklar:**

- Profession-based visibility
- Blocked user filtering
- Content policy enforcement

**Interface:**

```java
public interface ProfessionFeedService {

    /**
     * Kullanıcının görebileceği post'ları filtrele
     */
    List<Post> filterByProfession(
        List<Post> posts,
        Profession profession,
        UserId currentUserId,
        Set<UserId> blockedUsers
    );

    /**
     * Kullanıcı bu post'u görebilir mi?
     */
    boolean canUserSeePost(Post post, UserId userId, Set<UserId> blockedUsers);
}
```

**Implementation:**

```java
@Service
public class ProfessionFeedServiceImpl implements ProfessionFeedService {

    private final PostContentPolicy contentPolicy;

    @Override
    public List<Post> filterByProfession(
        List<Post> posts,
        Profession profession,
        UserId currentUserId,
        Set<UserId> blockedUsers
    ) {
        return posts.stream()
            // Rule 1: Same profession only (BR-SOC-001)
            .filter(post -> post.getProfession().equals(profession))

            // Rule 2: Not from blocked user
            .filter(post -> !blockedUsers.contains(post.getAuthorId()))

            // Rule 3: Not hidden/deleted
            .filter(post -> post.getStatus() == PostStatus.ACTIVE)

            // Rule 4: Content policy check
            .filter(post -> contentPolicy.isAllowed(post, currentUserId))

            // Sort by creation date (newest first)
            .sorted(Comparator.comparing(Post::getCreatedAt).reversed())
            .toList();
    }

    @Override
    public boolean canUserSeePost(Post post, UserId userId, Set<UserId> blockedUsers) {
        // Blocked user check
        if (blockedUsers.contains(post.getAuthorId())) {
            return false;
        }

        // Post status check
        if (post.getStatus() != PostStatus.ACTIVE) {
            return false;
        }

        // Author can always see own post
        if (post.getAuthorId().equals(userId)) {
            return true;
        }

        // Content policy
        return contentPolicy.isAllowed(post, userId);
    }
}
```

**Business Rules:**

- BR-SOC-001: Sadece aynı profession post'ları göster
- Blocked user'lar filtrelenir
- HIDDEN/DELETED post'lar gösterilmez

**Neden Domain Service?**

- Multi-entity logic (Post + User blocked list)
- Business policy enforcement
- Reusable filtering logic

---

#### PostContentPolicy

**Amaç:** Post content moderation ve spam detection

**Interface:**

```java
public interface PostContentPolicy {

    /**
     * Post içeriği policy'e uygun mu?
     */
    boolean isAllowed(Post post, UserId viewerId);

    /**
     * Post spam mi?
     */
    boolean isSpam(PostContent content);

    /**
     * Post içeriği kurallara uygun mu? (pre-publish check)
     */
    ValidationResult validateContent(PostContent content, List<PostImage> images);
}
```

**Implementation:**

```java
@Service
public class PostContentPolicyImpl implements PostContentPolicy {

    private final SpamDetectionService spamDetectionService;

    @Override
    public boolean isAllowed(Post post, UserId viewerId) {
        // Author can always see
        if (post.getAuthorId().equals(viewerId)) {
            return true;
        }

        // Hidden posts not allowed
        if (post.getStatus() == PostStatus.HIDDEN) {
            return false;
        }

        // Deleted posts not allowed
        if (post.getStatus() == PostStatus.DELETED) {
            return false;
        }

        return true;
    }

    @Override
    public boolean isSpam(PostContent content) {
        SpamScore score = spamDetectionService.calculateSpamScore(content.getValue());
        return score.isSpam();
    }

    @Override
    public ValidationResult validateContent(PostContent content, List<PostImage> images) {
        List<String> errors = new ArrayList<>();

        // Max 2000 characters (BR-SOC-004)
        if (content.getValue().length() > 2000) {
            errors.add("Content cannot exceed 2000 characters");
        }

        // Max 4 images (BR-SOC-003)
        if (images.size() > 4) {
            errors.add("Cannot attach more than 4 images");
        }

        // Spam check
        if (isSpam(content)) {
            errors.add("Content detected as spam");
        }

        return errors.isEmpty()
            ? ValidationResult.success()
            : ValidationResult.failure(errors);
    }
}
```

**Business Rules:**

- BR-SOC-003: Max 4 images
- BR-SOC-004: Max 2000 characters
- Spam detection integration

---

### 3.3 Messaging Context Services

#### ConversationMatchingService

**Amaç:** Conversation participant matching ve duplicate check

**Sorumluluklar:**

- Same profession check
- Blocked user check
- Existing conversation check

**Interface:**

```java
public interface ConversationMatchingService {

    /**
     * İki kullanıcı konuşabilir mi?
     */
    boolean canStartConversation(
        UserId user1Id,
        Profession user1Profession,
        Set<UserId> user1BlockedUsers,
        UserId user2Id,
        Profession user2Profession,
        Set<UserId> user2BlockedUsers
    );

    /**
     * Conversation zaten var mı?
     */
    Optional<ConversationId> findExistingConversation(
        UserId user1Id,
        UserId user2Id
    );
}
```

**Implementation:**

```java
@Service
public class ConversationMatchingServiceImpl implements ConversationMatchingService {

    @Override
    public boolean canStartConversation(
        UserId user1Id,
        Profession user1Profession,
        Set<UserId> user1BlockedUsers,
        UserId user2Id,
        Profession user2Profession,
        Set<UserId> user2BlockedUsers
    ) {
        // Self-messaging not allowed (BR-MSG-002)
        if (user1Id.equals(user2Id)) {
            return false;
        }

        // Same profession required (BR-MSG-001)
        if (!user1Profession.equals(user2Profession)) {
            return false;
        }

        // Blocked check (BR-MSG-003)
        if (user1BlockedUsers.contains(user2Id) ||
            user2BlockedUsers.contains(user1Id)) {
            return false;
        }

        return true;
    }

    @Override
    public Optional<ConversationId> findExistingConversation(
        UserId user1Id,
        UserId user2Id
    ) {
        // Note: This method signature violates pure domain service
        // (repository access needed). Should be in Application Service.
        throw new UnsupportedOperationException(
            "Use Application Service for repository access"
        );
    }
}
```

**Business Rules:**

- BR-MSG-001: Same profession only
- BR-MSG-002: No self-messaging
- BR-MSG-003: Blocked users cannot message

---

#### MessageRateLimitService

**Amaç:** Message rate limiting policy

**Interface:**

```java
public interface MessageRateLimitService {

    /**
     * Kullanıcı rate limit'i aşmış mı?
     * 60 msg/min per user, 10 msg/min per conversation
     */
    boolean hasExceededRateLimit(
        UserId userId,
        ConversationId conversationId,
        List<Instant> recentMessageTimestamps
    );

    /**
     * Rate limit'e ne kadar kaldı?
     */
    Duration getRateLimitCooldown(
        UserId userId,
        List<Instant> recentMessageTimestamps
    );
}
```

**Implementation:**

```java
@Service
public class MessageRateLimitServiceImpl implements MessageRateLimitService {

    private static final int USER_MAX_MESSAGES_PER_MINUTE = 60;
    private static final int CONVERSATION_MAX_MESSAGES_PER_MINUTE = 10;

    @Override
    public boolean hasExceededRateLimit(
        UserId userId,
        ConversationId conversationId,
        List<Instant> recentMessageTimestamps
    ) {
        Instant oneMinuteAgo = Instant.now().minus(1, ChronoUnit.MINUTES);

        long messagesInLastMinute = recentMessageTimestamps.stream()
            .filter(timestamp -> timestamp.isAfter(oneMinuteAgo))
            .count();

        // User-level rate limit (BR-MSG-005)
        if (messagesInLastMinute >= USER_MAX_MESSAGES_PER_MINUTE) {
            return true;
        }

        // Conversation-level rate limit (BR-MSG-005)
        if (messagesInLastMinute >= CONVERSATION_MAX_MESSAGES_PER_MINUTE) {
            return true;
        }

        return false;
    }

    @Override
    public Duration getRateLimitCooldown(
        UserId userId,
        List<Instant> recentMessageTimestamps
    ) {
        if (recentMessageTimestamps.isEmpty()) {
            return Duration.ZERO;
        }

        Instant oldestInWindow = recentMessageTimestamps.stream()
            .min(Instant::compareTo)
            .orElseThrow();

        Instant windowEnd = oldestInWindow.plus(1, ChronoUnit.MINUTES);
        Instant now = Instant.now();

        if (now.isAfter(windowEnd)) {
            return Duration.ZERO;
        }

        return Duration.between(now, windowEnd);
    }
}
```

**Business Rules:**

- BR-MSG-005: 60 msg/min per user
- BR-MSG-005: 10 msg/min per conversation

---

### 3.4 Notification Context Services

#### NotificationRoutingService

**Amaç:** Notification channel routing ve priority handling

**Interface:**

```java
public interface NotificationRoutingService {

    /**
     * Notification hangi channel'lara gönderilmeli?
     */
    Set<NotificationChannel> determineChannels(
        Notification notification,
        UserNotificationPreferences preferences
    );

    /**
     * Priority'e göre delivery stratejisi
     */
    DeliveryStrategy getDeliveryStrategy(NotificationPriority priority);
}
```

**Implementation:**

```java
@Service
public class NotificationRoutingServiceImpl implements NotificationRoutingService {

    @Override
    public Set<NotificationChannel> determineChannels(
        Notification notification,
        UserNotificationPreferences preferences
    ) {
        Set<NotificationChannel> channels = new HashSet<>();

        // IN_APP always enabled (BR-NOT-001)
        channels.add(NotificationChannel.IN_APP);

        // URGENT priority bypasses preferences (BR-NOT-002)
        if (notification.getPriority() == NotificationPriority.URGENT) {
            channels.add(NotificationChannel.PUSH);
            channels.add(NotificationChannel.EMAIL);
            return channels;
        }

        // PUSH channel (respect preferences)
        if (preferences.isPushEnabled() &&
            preferences.isTypeEnabled(notification.getType())) {
            channels.add(NotificationChannel.PUSH);
        }

        // EMAIL channel (respect preferences)
        if (preferences.isEmailEnabled() &&
            preferences.isTypeEnabled(notification.getType())) {
            channels.add(NotificationChannel.EMAIL);
        }

        return channels;
    }

    @Override
    public DeliveryStrategy getDeliveryStrategy(NotificationPriority priority) {
        return switch (priority) {
            case URGENT -> DeliveryStrategy.IMMEDIATE;
            case HIGH -> DeliveryStrategy.IMMEDIATE;
            case NORMAL -> DeliveryStrategy.IMMEDIATE;
            case LOW -> DeliveryStrategy.BATCH;  // BR-NOT-005: Batch aggregation
        };
    }
}

public enum DeliveryStrategy {
    IMMEDIATE,  // Send immediately
    BATCH       // Aggregate and send in batches (e.g., every 15 minutes)
}
```

**Business Rules:**

- BR-NOT-001: IN_APP always enabled
- BR-NOT-002: URGENT bypasses preferences
- BR-NOT-005: LOW priority batched

---

#### NotificationTemplateService

**Amaç:** Notification content template rendering

**Interface:**

```java
public interface NotificationTemplateService {

    /**
     * Template'den notification content oluştur
     */
    NotificationContent render(
        NotificationType type,
        Map<String, String> placeholders
    );

    /**
     * Email HTML template
     */
    String renderEmailTemplate(
        NotificationType type,
        Map<String, String> placeholders
    );
}
```

**Implementation:**

```java
@Service
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    @Override
    public NotificationContent render(
        NotificationType type,
        Map<String, String> placeholders
    ) {
        return switch (type) {
            case POST_LIKED -> new NotificationContent(
                "Yeni Beğeni",
                placeholders.get("actorName") + " gönderinizi beğendi",
                Map.of("postId", placeholders.get("postId"))
            );

            case COMMENT_ADDED -> new NotificationContent(
                "Yeni Yorum",
                placeholders.get("actorName") + " gönderinize yorum yaptı: " +
                truncate(placeholders.get("commentPreview"), 50),
                Map.of(
                    "postId", placeholders.get("postId"),
                    "commentId", placeholders.get("commentId")
                )
            );

            case MESSAGE_RECEIVED -> new NotificationContent(
                "Yeni Mesaj",
                placeholders.get("actorName") + ": " +
                truncate(placeholders.get("messagePreview"), 100),
                Map.of("conversationId", placeholders.get("conversationId"))
            );

            case VERIFICATION_APPROVED -> new NotificationContent(
                "Doğrulama Onaylandı",
                "Meslek doğrulamanız onaylandı. Artık tam erişime sahipsiniz!",
                Map.of()
            );

            case VERIFICATION_REJECTED -> new NotificationContent(
                "Doğrulama Reddedildi",
                "Meslek doğrulamanız reddedildi. Sebep: " + placeholders.get("reason"),
                Map.of()
            );

            // ... diğer notification tipleri
        };
    }

    private String truncate(String text, int maxLength) {
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + "...";
    }
}
```

---

### 3.5 Moderation Context Services

#### SpamDetectionService

**Amaç:** Automatic spam detection

**Interface:**

```java
public interface SpamDetectionService {

    /**
     * Content spam mi?
     */
    SpamScore calculateSpamScore(String content);

    /**
     * URL shortener detection
     */
    boolean containsUrlShortener(String content);

    /**
     * Excessive emoji detection
     */
    boolean hasExcessiveEmojis(String content);
}
```

**Implementation:**

```java
@Service
public class SpamDetectionServiceImpl implements SpamDetectionService {

    private static final List<String> URL_SHORTENERS = List.of(
        "bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "t.co"
    );

    @Override
    public SpamScore calculateSpamScore(String content) {
        int score = 0;

        // Emoji ratio check (>30% → +30 points)
        if (getEmojiRatio(content) > 0.3) {
            score += 30;
        }

        // URL shortener check (+40 points)
        if (containsUrlShortener(content)) {
            score += 40;
        }

        // Excessive caps check (>50% → +20 points)
        if (getCapsRatio(content) > 0.5) {
            score += 20;
        }

        // Repeated characters check (+10 points)
        if (content.matches(".*([!?.]){5,}.*")) {
            score += 10;
        }

        return new SpamScore(Math.min(score, 100));
    }

    @Override
    public boolean containsUrlShortener(String content) {
        String lowerContent = content.toLowerCase();
        return URL_SHORTENERS.stream()
            .anyMatch(lowerContent::contains);
    }

    @Override
    public boolean hasExcessiveEmojis(String content) {
        return getEmojiRatio(content) > 0.3;
    }

    private double getEmojiRatio(String content) {
        long emojiCount = content.codePoints()
            .filter(cp -> cp >= 0x1F600 && cp <= 0x1F64F)
            .count();
        return (double) emojiCount / content.length();
    }

    private double getCapsRatio(String content) {
        long capsCount = content.chars().filter(Character::isUpperCase).count();
        long letterCount = content.chars().filter(Character::isLetter).count();
        if (letterCount == 0) return 0;
        return (double) capsCount / letterCount;
    }
}
```

**Business Rules:**

- SpamScore ≥70 → Auto-hide
- 3 spam content → Auto-suspend

---

#### ModerationPolicyService

**Amaç:** Moderation action decision policy

**Interface:**

```java
public interface ModerationPolicyService {

    /**
     * Report count'a göre otomatik action
     */
    Optional<ModerationAction> determineAutoAction(int reportCount);

    /**
     * Kullanıcının ihlal geçmişine göre suspend duration
     */
    SuspensionDuration calculateSuspensionDuration(ViolationHistory history);

    /**
     * Manual review gerekli mi?
     */
    boolean requiresManualReview(ModerationCase moderationCase);
}
```

**Implementation:**

```java
@Service
public class ModerationPolicyServiceImpl implements ModerationPolicyService {

    private static final int AUTO_HIDE_THRESHOLD = 5;
    private static final int AUTO_SUSPEND_THRESHOLD = 10;

    @Override
    public Optional<ModerationAction> determineAutoAction(int reportCount) {
        if (reportCount >= AUTO_SUSPEND_THRESHOLD) {
            // BR-MOD-002: 10 reports → auto-suspend
            return Optional.of(ModerationAction.AUTO_SUSPEND);
        }

        if (reportCount >= AUTO_HIDE_THRESHOLD) {
            // BR-MOD-001: 5 reports → auto-hide
            return Optional.of(ModerationAction.AUTO_HIDE);
        }

        return Optional.empty();
    }

    @Override
    public SuspensionDuration calculateSuspensionDuration(ViolationHistory history) {
        // BR-MOD-003: Escalating bans (1d → 7d → 30d → permanent)
        return history.getNextSuspensionDuration();
    }

    @Override
    public boolean requiresManualReview(ModerationCase moderationCase) {
        // High-severity violations always require manual review
        if (moderationCase.getSeverity() == Severity.HIGH) {
            return true;
        }

        // Appeals require manual review
        if (moderationCase.getStatus() == ModerationStatus.APPEALED) {
            return true;
        }

        // Multiple reports from same user (potential abuse)
        long uniqueReporters = moderationCase.getReports().stream()
            .map(Report::getReporterId)
            .distinct()
            .count();

        if (uniqueReporters < moderationCase.getReports().size() * 0.5) {
            return true;  // Less than 50% unique reporters
        }

        return false;
    }
}
```

**Business Rules:**

- BR-MOD-001: 5 reports → auto-hide
- BR-MOD-002: 10 reports → auto-suspend
- BR-MOD-003: Escalating bans
- BR-MOD-004: 48h manual review SLA

---

## 4. Domain Service Testing

### 4.1 Unit Testing (Mock Dependencies)

```java
class AIVerificationServiceTest {

    private AIVerificationService verificationService;
    private OCRService ocrService;
    private FaceComparisonService faceComparisonService;

    @BeforeEach
    void setup() {
        ocrService = mock(OCRService.class);
        faceComparisonService = mock(FaceComparisonService.class);
        // ... other mocks

        verificationService = new AWSRekognitionVerificationService(
            ocrService, faceComparisonService, ...
        );
    }

    @Test
    void should_approve_when_confidence_above_85() {
        // Given
        when(ocrService.extractText(any())).thenReturn(
            new OCRResult(true, 90, "John Doe", "Success")
        );
        when(faceComparisonService.compare(any(), any())).thenReturn(
            new FaceMatchResult(true, 95, 95.5, "Match found")
        );
        // ... other stage mocks (all high scores)

        // When
        AIVerificationResult result = verificationService.verify(idDocument, selfie);

        // Then
        assertThat(result.getFinalScore().getValue()).isGreaterThanOrEqualTo(85);
        assertThat(result.getFinalScore().getDecision())
            .isEqualTo(VerificationDecision.AUTO_APPROVE);
    }

    @Test
    void should_reject_when_confidence_below_60() {
        // Given - low scores
        when(ocrService.extractText(any())).thenReturn(
            new OCRResult(false, 40, "", "Low confidence")
        );
        // ...

        // When
        AIVerificationResult result = verificationService.verify(idDocument, selfie);

        // Then
        assertThat(result.getFinalScore().getValue()).isLessThan(60);
        assertThat(result.getFinalScore().getDecision())
            .isEqualTo(VerificationDecision.REJECT);
    }
}
```

### 4.2 Integration Testing (Real Dependencies)

```java
@SpringBootTest
class AIVerificationServiceIntegrationTest {

    @Autowired
    private AIVerificationService verificationService;

    @Test
    void should_verify_real_document() {
        // Given - real AWS S3 test files
        Document idDocument = new Document(
            DocumentType.ID_CARD,
            "12345678901",
            LocalDate.now().minusYears(5),
            LocalDate.now().plusYears(5),
            "s3://test-bucket/test-id.jpg"
        );

        Document selfie = new Document(...);

        // When - real AWS Rekognition call
        AIVerificationResult result = verificationService.verify(idDocument, selfie);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFinalScore().getValue()).isBetween(0, 100);
    }
}
```

---

## 5. Domain Service vs Application Service

### 5.1 Karşılaştırma

```
Domain Service:
✅ Pure domain logic
✅ Stateless
✅ Domain layer (no infrastructure)
✅ Business rule enforcement
✅ Multi-aggregate coordination
❌ Repository access
❌ Transaction management
❌ DTO mapping

Application Service:
✅ Use case orchestration
✅ Transaction management
✅ Repository access
✅ DTO mapping
✅ Infrastructure coordination
❌ Business logic (delegate to domain)
❌ Multi-aggregate domain logic
```

### 5.2 Örnek: Post Like Use Case

```java
// Domain Service - Business logic
public class PostLikePolicy {
    public boolean canLike(Post post, UserId userId) {
        // Business rule: Author cannot like own post
        if (post.getAuthorId().equals(userId)) {
            return false;
        }

        // Business rule: Already liked
        if (post.getLikes().contains(userId)) {
            return false;
        }

        return true;
    }
}

// Application Service - Use case orchestration
@Service
@Transactional
public class PostApplicationService {

    private final PostRepository postRepository;
    private final PostLikePolicy likePolicy;  // Domain service
    private final ApplicationEventPublisher eventPublisher;

    public void likePost(PostId postId, UserId userId) {
        // 1. Repository access (infrastructure)
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException());

        // 2. Domain service - business rule check
        if (!likePolicy.canLike(post, userId)) {
            throw new CannotLikePostException();
        }

        // 3. Aggregate - state change
        post.addLike(userId);

        // 4. Repository save (infrastructure)
        postRepository.save(post);

        // 5. Event publish (infrastructure)
        eventPublisher.publishEvent(new PostLikedEvent(postId, userId));
    }
}
```

---

## 6. Özet

### Domain Service Prensipleri:

1. **Stateless:** Instance state tutma
2. **Domain Language:** İsimlendirme ubiquitous language'den
3. **Domain Layer:** Infrastructure'dan bağımsız
4. **Multi-Aggregate:** Birden fazla aggregate ile çalışabilir
5. **Business Logic:** Pure domain logic (no CRUD)

### Meslektaş Domain Service Summary:

- **12 Domain Service:** AI Verification, Profession Feed, Spam Detection, vb.
- **Pure Domain Logic:** Infrastructure'dan bağımsız
- **Business Rule Enforcement:** 45+ business rule enforce ediliyor
- **Testable:** Mock/stub ile kolayca test edilebilir

### Next Steps:

- **Domain Events:** 11-DOMAIN-EVENTS.md (Event catalog + handlers)
- **Repositories:** 12-REPOSITORIES.md (Aggregate persistence patterns)
