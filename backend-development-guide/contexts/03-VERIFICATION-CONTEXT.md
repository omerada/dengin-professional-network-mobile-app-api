# Verification Context - AI-Powered Meslek Doğrulama

> **Bounded Context:** Verification  
> **Complexity:** ⭐⭐⭐⭐ Very High  
> **Core Domain:** ✅ Yes (Competitive Advantage)

---

## 📚 İçindekiler

1. [Context Overview](#context-overview)
2. [Domain Model](#domain-model)
3. [Aggregates](#aggregates)
4. [Domain Services](#domain-services)
5. [Domain Events](#domain-events)
6. [Business Rules](#business-rules)
7. [Integration Points](#integration-points)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 Context Overview

### Responsibility

Kullanıcıların mesleki belgelerini AI destekli olarak doğrulamak, KVKK uyumlu belge yönetimi, manuel inceleme süreci.

### Ubiquitous Language

```
VerificationRequest: Doğrulama talebi (Aggregate Root)
VerificationDocument: Yüklenen belge (diploma, sertifika)
SelfiePower: Doğrulama için çekilen selfie
ConfidenceScore: AI güven skoru (0-100%)
VerificationStatus: PENDING, APPROVED, REJECTED, MANUAL_REVIEW
AIVerificationResult: AI analiz sonucu
ManualReview: Admin manuel incelemesi
DocumentDeletion: KVKK uyumlu belge silinmesi
```

### Context Boundaries

```
IN SCOPE:
✅ Verification request lifecycle
✅ AI processing pipeline (6 stages)
✅ Document upload/storage
✅ Confidence score calculation
✅ Manual review workflow
✅ KVKK-compliant document deletion
✅ Retry logic (max 3 attempts)

OUT OF SCOPE:
❌ User authentication (Identity Context)
❌ Notification sending (Notification Context)
❌ User profile updates (Identity Context)
```

---

## 🏗️ Domain Model

### Aggregate: VerificationRequest

```java
/**
 * Verification Aggregate Root
 *
 * Business Rules:
 * - User can have only 1 active verification request
 * - Max 3 attempts per user (30-day cooldown after 3 failures)
 * - Documents auto-deleted after approval/rejection
 * - Manual review has 7-day document retention
 * - Confidence score >= 85% → AUTO APPROVE
 * - Confidence score 60-84% → MANUAL REVIEW
 * - Confidence score < 60% → AUTO REJECT
 */
@Entity
@Table(name = "verification_requests")
public class VerificationRequest extends AggregateRoot {

    @EmbeddedId
    private VerificationId id;

    @Embedded
    private UserId userId;

    @Embedded
    private Profession profession;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "document_id")
    private VerificationDocument document;

    @Embedded
    private SelfiePower selfie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status;

    @Embedded
    private ConfidenceScore confidenceScore;

    @Embedded
    private AIVerificationResult aiResult;

    @Embedded
    private ManualReview manualReview;

    @Column(name = "attempt_number")
    private int attemptNumber;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    // ============================================
    // FACTORY METHOD
    // ============================================

    public static VerificationRequest create(
        UserId userId,
        Profession profession,
        VerificationDocument document,
        SelfiePower selfie,
        int attemptNumber
    ) {
        VerificationRequest request = new VerificationRequest();
        request.id = VerificationId.generate();
        request.userId = userId;
        request.profession = profession;
        request.document = document;
        request.selfie = selfie;
        request.status = VerificationStatus.PENDING;
        request.attemptNumber = attemptNumber;
        request.submittedAt = Instant.now();
        request.expiresAt = Instant.now().plus(Duration.ofDays(7));

        request.registerEvent(new VerificationSubmittedEvent(
            request.id,
            request.userId,
            request.profession
        ));

        return request;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Process AI verification result
     * Business rule: Auto-decide based on confidence score
     */
    public void processAIResult(AIVerificationResult result) {
        if (this.status != VerificationStatus.PENDING) {
            throw new IllegalStateException(
                "Only PENDING verifications can be processed"
            );
        }

        this.aiResult = result;
        this.confidenceScore = result.getConfidenceScore();
        this.processedAt = Instant.now();

        // Apply business rules
        VerificationDecision decision = VerificationPolicy.decide(
            confidenceScore,
            result.getComponents()
        );

        switch (decision.getAction()) {
            case AUTO_APPROVE -> approve(decision.getReason());
            case AUTO_REJECT -> reject(decision.getReason());
            case MANUAL_REVIEW -> sendToManualReview(decision.getReason());
        }
    }

    /**
     * Approve verification
     * Business rule: Delete documents immediately (KVKK)
     */
    public void approve(String reason) {
        this.status = VerificationStatus.APPROVED;

        registerEvent(new VerificationApprovedEvent(
            this.id,
            this.userId,
            this.profession,
            this.confidenceScore,
            reason
        ));

        // KVKK: Schedule immediate document deletion
        scheduleDocumentDeletion();
    }

    /**
     * Reject verification
     * Business rule: Delete documents immediately (KVKK)
     */
    public void reject(String reason) {
        this.status = VerificationStatus.REJECTED;

        registerEvent(new VerificationRejectedEvent(
            this.id,
            this.userId,
            this.attemptNumber,
            reason
        ));

        // KVKK: Schedule immediate document deletion
        scheduleDocumentDeletion();
    }

    /**
     * Send to manual review
     * Business rule: 7-day document retention
     */
    public void sendToManualReview(String reason) {
        this.status = VerificationStatus.MANUAL_REVIEW;
        this.manualReview = ManualReview.create(reason);

        // Extend document retention to 7 days
        this.expiresAt = Instant.now().plus(Duration.ofDays(7));

        registerEvent(new ManualReviewRequiredEvent(
            this.id,
            this.userId,
            this.profession,
            reason
        ));
    }

    /**
     * Admin manual approval
     */
    public void approveManually(AdminId adminId, String notes) {
        if (this.status != VerificationStatus.MANUAL_REVIEW) {
            throw new IllegalStateException(
                "Only MANUAL_REVIEW verifications can be manually approved"
            );
        }

        this.status = VerificationStatus.APPROVED;
        this.manualReview.approve(adminId, notes);
        this.processedAt = Instant.now();

        registerEvent(new VerificationApprovedEvent(
            this.id,
            this.userId,
            this.profession,
            this.confidenceScore,
            "Manual approval by admin"
        ));

        scheduleDocumentDeletion();
    }

    /**
     * Admin manual rejection
     */
    public void rejectManually(AdminId adminId, String notes) {
        if (this.status != VerificationStatus.MANUAL_REVIEW) {
            throw new IllegalStateException(
                "Only MANUAL_REVIEW verifications can be manually rejected"
            );
        }

        this.status = VerificationStatus.REJECTED;
        this.manualReview.reject(adminId, notes);
        this.processedAt = Instant.now();

        registerEvent(new VerificationRejectedEvent(
            this.id,
            this.userId,
            this.attemptNumber,
            notes
        ));

        scheduleDocumentDeletion();
    }

    /**
     * Schedule document deletion (KVKK compliance)
     */
    private void scheduleDocumentDeletion() {
        registerEvent(new DocumentDeletionScheduledEvent(
            this.id,
            this.document.getDocumentUrl(),
            this.selfie.getSelfieUrl(),
            Instant.now() // Immediate deletion
        ));
    }

    /**
     * Check if verification is expired
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    /**
     * Can user retry?
     * Business rule: Max 3 attempts
     */
    public boolean canRetry() {
        return this.status == VerificationStatus.REJECTED
            && this.attemptNumber < 3;
    }
}
```

### Entity: VerificationDocument

```java
/**
 * Verification Document Entity
 * Part of VerificationRequest aggregate
 */
@Entity
@Table(name = "verification_documents")
public class VerificationDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @Column(name = "s3_bucket")
    private String s3Bucket;

    @Column(name = "s3_key")
    private String s3Key;

    // Factory
    public static VerificationDocument upload(
        DocumentType type,
        String s3Url,
        String filename,
        Long fileSize,
        String mimeType
    ) {
        // Validation
        if (fileSize > 10_000_000) { // 10MB
            throw new DocumentTooLargeException(fileSize);
        }

        if (!isValidMimeType(mimeType)) {
            throw new InvalidDocumentTypeException(mimeType);
        }

        VerificationDocument doc = new VerificationDocument();
        doc.documentType = type;
        doc.documentUrl = s3Url;
        doc.originalFilename = filename;
        doc.fileSizeBytes = fileSize;
        doc.mimeType = mimeType;
        doc.uploadedAt = Instant.now();

        return doc;
    }

    private static boolean isValidMimeType(String mimeType) {
        return List.of("image/jpeg", "image/png", "image/jpg", "application/pdf")
            .contains(mimeType.toLowerCase());
    }
}
```

### Value Objects

```java
/**
 * Confidence Score Value Object
 * Immutable, self-validating
 */
public record ConfidenceScore(double value) {

    public ConfidenceScore {
        if (value < 0.0 || value > 100.0) {
            throw new IllegalArgumentException(
                "Confidence score must be between 0 and 100"
            );
        }
    }

    public boolean isHighConfidence() {
        return value >= 85.0;
    }

    public boolean isLowConfidence() {
        return value < 60.0;
    }

    public boolean requiresManualReview() {
        return value >= 60.0 && value < 85.0;
    }

    public VerificationDecisionAction getDecisionAction() {
        if (isHighConfidence()) return VerificationDecisionAction.AUTO_APPROVE;
        if (isLowConfidence()) return VerificationDecisionAction.AUTO_REJECT;
        return VerificationDecisionAction.MANUAL_REVIEW;
    }
}

/**
 * AI Verification Result Value Object
 */
public record AIVerificationResult(
    ConfidenceScore confidenceScore,
    OCRResult ocrResult,
    FaceMatchResult faceMatchResult,
    LivenessResult livenessResult,
    DocumentAuthenticityResult authenticityResult,
    DataMatchResult dataMatchResult,
    Instant processedAt
) {

    public AIComponentScores getComponents() {
        return new AIComponentScores(
            ocrResult.confidence(),
            faceMatchResult.similarity(),
            livenessResult.confidence(),
            authenticityResult.score(),
            dataMatchResult.score()
        );
    }
}

/**
 * OCR Result Value Object
 */
public record OCRResult(
    String extractedName,
    String extractedProfession,
    String extractedInstitution,
    double confidence,
    List<String> detectedTexts
) {}

/**
 * Face Match Result Value Object
 */
public record FaceMatchResult(
    boolean isMatch,
    double similarity,
    FaceQuality faceQuality
) {}

/**
 * Liveness Result Value Object
 */
public record LivenessResult(
    boolean isLive,
    double confidence,
    boolean spoofingDetected
) {}

/**
 * Document Authenticity Result Value Object
 */
public record DocumentAuthenticityResult(
    boolean isAuthentic,
    double score,
    boolean hasValidLogo,
    boolean hasWatermark,
    boolean hasValidStructure
) {}

/**
 * Data Match Result Value Object
 */
public record DataMatchResult(
    double score,
    boolean nameMatches,
    boolean professionMatches,
    double nameMatchConfidence,
    double professionMatchConfidence
) {}

/**
 * Selfie Photo Value Object
 */
public record SelfiePower(
    String selfieUrl,
    String s3Bucket,
    String s3Key,
    Instant uploadedAt
) {}

/**
 * Manual Review Value Object
 */
@Embeddable
public class ManualReview {

    @Column(name = "review_reason")
    private String reason;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_notes")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_decision")
    private ReviewDecision decision;

    public static ManualReview create(String reason) {
        ManualReview review = new ManualReview();
        review.reason = reason;
        return review;
    }

    public void approve(AdminId adminId, String notes) {
        this.reviewedBy = adminId.value();
        this.reviewedAt = Instant.now();
        this.notes = notes;
        this.decision = ReviewDecision.APPROVED;
    }

    public void reject(AdminId adminId, String notes) {
        this.reviewedBy = adminId.value();
        this.reviewedAt = Instant.now();
        this.notes = notes;
        this.decision = ReviewDecision.REJECTED;
    }
}
```

---

## 🛠️ Domain Services

### AIVerificationService

```java
/**
 * Domain Service: AI Verification Pipeline
 *
 * Orchestrates 6-stage AI verification process:
 * 1. Document OCR (Text Detection)
 * 2. Face Detection in Document
 * 3. Face Comparison (Selfie vs Document)
 * 4. Liveness Detection
 * 5. Document Authenticity Check
 * 6. Data Validation and Matching
 */
@Service
public class AIVerificationService {

    private final OCRService ocrService;
    private final FaceComparisonService faceComparisonService;
    private final LivenessDetectionService livenessService;
    private final DocumentAuthenticityService authenticityService;
    private final DataMatchingService dataMatchingService;

    /**
     * Execute full AI verification pipeline
     */
    public AIVerificationResult verify(
        VerificationDocument document,
        SelfiePower selfie,
        UserInfo userInfo,
        Profession profession
    ) {
        // Stage 1 & 4: Parallel processing
        CompletableFuture<OCRResult> ocrFuture = CompletableFuture.supplyAsync(() ->
            ocrService.extractText(document.getDocumentUrl())
        );

        CompletableFuture<LivenessResult> livenessFuture = CompletableFuture.supplyAsync(() ->
            livenessService.checkLiveness(selfie.getSelfieUrl())
        );

        // Wait for both
        OCRResult ocrResult = ocrFuture.join();
        LivenessResult livenessResult = livenessFuture.join();

        // Stage 2 & 3: Face comparison
        FaceMatchResult faceMatchResult = faceComparisonService.compareFaces(
            document.getDocumentUrl(),
            selfie.getSelfieUrl()
        );

        // Stage 5: Document authenticity
        DocumentAuthenticityResult authenticityResult = authenticityService.verify(
            document.getDocumentUrl(),
            profession.category()
        );

        // Stage 6: Data matching
        DataMatchResult dataMatchResult = dataMatchingService.match(
            ocrResult,
            userInfo,
            profession
        );

        // Calculate weighted confidence score
        ConfidenceScore confidenceScore = calculateConfidenceScore(
            ocrResult,
            faceMatchResult,
            livenessResult,
            authenticityResult,
            dataMatchResult
        );

        return new AIVerificationResult(
            confidenceScore,
            ocrResult,
            faceMatchResult,
            livenessResult,
            authenticityResult,
            dataMatchResult,
            Instant.now()
        );
    }

    /**
     * Calculate weighted confidence score
     *
     * Formula:
     * Total = (OCR × 0.25) + (FaceMatch × 0.30) + (Liveness × 0.25)
     *       + (Authenticity × 0.15) + (DataMatch × 0.05)
     */
    private ConfidenceScore calculateConfidenceScore(
        OCRResult ocr,
        FaceMatchResult face,
        LivenessResult liveness,
        DocumentAuthenticityResult auth,
        DataMatchResult data
    ) {
        double score =
            (ocr.confidence() * 0.25) +
            (face.similarity() * 0.30) +
            (liveness.confidence() * 0.25) +
            (auth.score() * 0.15) +
            (data.score() * 0.05);

        return new ConfidenceScore(score);
    }
}
```

### VerificationPolicy

```java
/**
 * Domain Service: Verification Decision Policy
 *
 * Business rules for auto-approve/reject/manual-review
 */
public class VerificationPolicy {

    /**
     * Decide verification action based on confidence score
     */
    public static VerificationDecision decide(
        ConfidenceScore confidenceScore,
        AIComponentScores components
    ) {
        // Rule 1: High confidence → Auto approve
        if (confidenceScore.isHighConfidence()) {
            return VerificationDecision.autoApprove(
                "High confidence score: " + confidenceScore.value() + "%"
            );
        }

        // Rule 2: Low confidence → Auto reject
        if (confidenceScore.isLowConfidence()) {
            String reason = identifyRejectionReason(components);
            return VerificationDecision.autoReject(reason);
        }

        // Rule 3: Medium confidence → Manual review
        String reason = identifyReviewReason(components);
        return VerificationDecision.manualReview(reason);
    }

    private static String identifyRejectionReason(AIComponentScores scores) {
        if (scores.faceMatchSimilarity() < 90.0) {
            return "Face mismatch detected";
        }
        if (!scores.livenessConfidence() > 80.0) {
            return "Liveness check failed - possible spoofing";
        }
        if (scores.ocrConfidence() < 60.0) {
            return "Document quality too low";
        }
        return "Overall confidence too low";
    }

    private static String identifyReviewReason(AIComponentScores scores) {
        List<String> reasons = new ArrayList<>();

        if (scores.ocrConfidence() < 85.0) {
            reasons.add("OCR confidence borderline");
        }
        if (scores.faceMatchSimilarity() < 95.0) {
            reasons.add("Face match similarity borderline");
        }
        if (scores.authenticityScore() < 80.0) {
            reasons.add("Document authenticity uncertain");
        }

        return String.join(", ", reasons);
    }
}
```

### VerificationRetryPolicy

```java
/**
 * Domain Service: Retry Logic
 *
 * Business rules:
 * - Max 3 attempts per user
 * - 30-day cooldown after 3 failures
 * - 1-hour minimum between attempts
 */
public class VerificationRetryPolicy {

    public static void validateRetry(
        UserId userId,
        List<VerificationRequest> previousAttempts
    ) {
        // Check total attempts
        long totalAttempts = previousAttempts.size();
        if (totalAttempts >= 3) {
            // Check cooldown
            VerificationRequest lastAttempt = previousAttempts.get(0);
            Instant cooldownEnd = lastAttempt.getProcessedAt()
                .plus(Duration.ofDays(30));

            if (Instant.now().isBefore(cooldownEnd)) {
                throw new VerificationCooldownException(
                    "3 attempts failed. Retry after " + cooldownEnd
                );
            }
        }

        // Check minimum time between attempts
        if (!previousAttempts.isEmpty()) {
            VerificationRequest lastAttempt = previousAttempts.get(0);
            Instant nextAttemptAllowed = lastAttempt.getSubmittedAt()
                .plus(Duration.ofHours(1));

            if (Instant.now().isBefore(nextAttemptAllowed)) {
                throw new VerificationTooSoonException(
                    "Please wait 1 hour between attempts"
                );
            }
        }
    }

    public static int calculateAttemptNumber(List<VerificationRequest> previousAttempts) {
        return previousAttempts.size() + 1;
    }
}
```

---

## 📨 Domain Events

### VerificationSubmittedEvent

```java
public record VerificationSubmittedEvent(
    VerificationId verificationId,
    UserId userId,
    Profession profession,
    Instant submittedAt
) implements DomainEvent {}
```

**Event Listeners:**

- `AIProcessingEventListener` → Trigger AI verification (async)
- `NotificationEventListener` → Send "Processing" notification

### VerificationApprovedEvent

```java
public record VerificationApprovedEvent(
    VerificationId verificationId,
    UserId userId,
    Profession profession,
    ConfidenceScore confidenceScore,
    String approvalReason,
    Instant approvedAt
) implements DomainEvent {}
```

**Event Listeners:**

- `UserProfessionEventListener` → Update `user.isProfessionVerified = true`
- `NotificationEventListener` → Send "Approved" notification
- `DocumentDeletionEventListener` → Delete documents from S3 (KVKK)
- `AnalyticsEventListener` → Track verification success

### VerificationRejectedEvent

```java
public record VerificationRejectedEvent(
    VerificationId verificationId,
    UserId userId,
    int attemptNumber,
    String rejectionReason,
    int remainingAttempts,
    Instant rejectedAt
) implements DomainEvent {}
```

**Event Listeners:**

- `NotificationEventListener` → Send "Rejected" notification with retry info
- `DocumentDeletionEventListener` → Delete documents from S3 (KVKK)
- `AnalyticsEventListener` → Track rejection reasons

### ManualReviewRequiredEvent

```java
public record ManualReviewRequiredEvent(
    VerificationId verificationId,
    UserId userId,
    Profession profession,
    String reviewReason,
    Instant createdAt
) implements DomainEvent {}
```

**Event Listeners:**

- `AdminNotificationEventListener` → Notify admin team
- `UserNotificationEventListener` → Send "Under review" notification
- `SLATimerEventListener` → Set 24-48h review SLA

### DocumentDeletionScheduledEvent

```java
public record DocumentDeletionScheduledEvent(
    VerificationId verificationId,
    String documentUrl,
    String selfieUrl,
    Instant scheduledFor
) implements DomainEvent {}
```

**Event Listeners:**

- `DocumentDeletionService` → Delete from S3 immediately or at scheduled time

---

## 📋 Business Rules

### BR-VER-001: Single Active Verification

```
Rule: User can have only 1 PENDING or MANUAL_REVIEW verification at a time
Enforcement: Application Service (before creating new request)
Exception: VerificationAlreadyPendingException
```

### BR-VER-002: Maximum Attempts

```
Rule: Max 3 verification attempts per user
Cooldown: 30 days after 3rd failure
Enforcement: VerificationRetryPolicy
Exception: MaxAttemptsExceededException
```

### BR-VER-003: Confidence Thresholds

```
Rule:
  - Score >= 85% → AUTO_APPROVE
  - 60% <= Score < 85% → MANUAL_REVIEW
  - Score < 60% → AUTO_REJECT
Enforcement: VerificationPolicy.decide()
```

### BR-VER-004: AI Component Weights

```
Rule:
  - OCR Confidence: 25%
  - Face Match Similarity: 30%
  - Liveness Confidence: 25%
  - Document Authenticity: 15%
  - Data Match: 5%
Enforcement: AIVerificationService.calculateConfidenceScore()
```

### BR-VER-005: KVKK Document Deletion

```
Rule:
  - APPROVED → Immediate deletion
  - REJECTED → Immediate deletion
  - MANUAL_REVIEW → 7-day retention, then auto-delete
Enforcement: DocumentDeletionScheduledEvent
```

### BR-VER-006: Manual Review SLA

```
Rule: Admin must review within 24-48 hours
Enforcement: SLATimerEventListener
Alert: If not reviewed in 48 hours → escalate
```

### BR-VER-007: Document Size Limits

```
Rule:
  - Max file size: 10MB
  - Allowed formats: JPEG, PNG, PDF
Enforcement: VerificationDocument.upload()
Exception: DocumentTooLargeException
```

### BR-VER-008: Face Match Threshold

```
Rule: Face similarity must be >= 90% for match
Enforcement: FaceComparisonService
```

### BR-VER-009: Liveness Threshold

```
Rule: Liveness confidence must be >= 95% for real person
Enforcement: LivenessDetectionService
Anti-spoofing: Detect printed photos, screen displays
```

---

## 🔗 Integration Points

### Upstream Dependencies

```java
// Identity Context (Customer-Supplier)
public interface UserRepository {
    Optional<User> findById(UserId userId);
    void updateProfessionVerified(UserId userId, boolean verified);
}

// Need: User info, Profession
```

### Downstream Consumers

```java
// Notification Context (Published Language via Events)
// Consumes: VerificationApprovedEvent, VerificationRejectedEvent

// Identity Context (Published Language via Events)
// Consumes: VerificationApprovedEvent → updates User.isProfessionVerified
```

### External Services (Anti-Corruption Layer)

```java
// AWS Rekognition
public interface AWSRekognitionAdapter {
    OCRResult detectText(String imageUrl);
    FaceMatchResult compareFaces(String sourceImage, String targetImage);
    LivenessResult detectLiveness(String imageUrl);
}

// AWS S3
public interface DocumentStorageService {
    String uploadDocument(MultipartFile file, UserId userId);
    void deleteDocument(String documentUrl);
    String generatePresignedUrl(String documentUrl, Duration ttl);
}
```

---

## 🛠️ Implementation Guide

### Package Structure

```
verification/
├── domain/
│   ├── model/
│   │   ├── VerificationRequest.java (Aggregate Root)
│   │   ├── VerificationDocument.java (Entity)
│   │   ├── VerificationId.java (Value Object)
│   │   ├── ConfidenceScore.java (Value Object)
│   │   ├── AIVerificationResult.java (Value Object)
│   │   ├── SelfiePower.java (Value Object)
│   │   ├── ManualReview.java (Value Object)
│   │   └── VerificationStatus.java (Enum)
│   ├── service/
│   │   ├── AIVerificationService.java
│   │   ├── VerificationPolicy.java
│   │   └── VerificationRetryPolicy.java
│   ├── repository/
│   │   └── VerificationRepository.java (Interface)
│   └── event/
│       ├── VerificationSubmittedEvent.java
│       ├── VerificationApprovedEvent.java
│       ├── VerificationRejectedEvent.java
│       ├── ManualReviewRequiredEvent.java
│       └── DocumentDeletionScheduledEvent.java
│
├── application/
│   ├── command/
│   │   ├── SubmitVerificationCommand.java
│   │   ├── ApproveVerificationCommand.java
│   │   └── RejectVerificationCommand.java
│   ├── query/
│   │   ├── GetVerificationStatusQuery.java
│   │   └── ListPendingReviewsQuery.java
│   ├── service/
│   │   └── VerificationApplicationService.java
│   └── dto/
│       ├── VerificationRequestDTO.java
│       ├── VerificationResultDTO.java
│       └── ManualReviewDTO.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── VerificationJpaRepository.java
│   │   └── VerificationRepositoryImpl.java
│   ├── ai/
│   │   ├── AWSRekognitionAdapter.java
│   │   ├── OCRService.java
│   │   ├── FaceComparisonService.java
│   │   ├── LivenessDetectionService.java
│   │   └── DocumentAuthenticityService.java
│   ├── storage/
│   │   └── S3DocumentStorageService.java
│   └── event/
│       ├── VerificationEventListener.java
│       └── DocumentDeletionEventListener.java
│
└── api/
    └── VerificationController.java
```

### Repository Implementation

```java
public interface VerificationRepository {
    VerificationRequest save(VerificationRequest request);
    Optional<VerificationRequest> findById(VerificationId id);
    Optional<VerificationRequest> findActiveByUserId(UserId userId);
    List<VerificationRequest> findByUserIdOrderBySubmittedAtDesc(UserId userId);
    List<VerificationRequest> findPendingManualReviews();
    void delete(VerificationRequest request);
}
```

### Application Service Example

```java
@Service
@Transactional
public class VerificationApplicationService {

    private final VerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final AIVerificationService aiVerificationService;
    private final DocumentStorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Submit new verification request
     */
    public VerificationId submitVerification(SubmitVerificationCommand command) {
        UserId userId = command.userId();

        // Check for active verification
        verificationRepository.findActiveByUserId(userId)
            .ifPresent(existing -> {
                throw new VerificationAlreadyPendingException(userId);
            });

        // Check retry limits
        List<VerificationRequest> previousAttempts =
            verificationRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        VerificationRetryPolicy.validateRetry(userId, previousAttempts);

        // Upload documents to S3
        String documentUrl = storageService.uploadDocument(
            command.documentFile(),
            userId
        );
        String selfieUrl = storageService.uploadDocument(
            command.selfieFile(),
            userId
        );

        // Create domain objects
        VerificationDocument document = VerificationDocument.upload(
            command.documentType(),
            documentUrl,
            command.documentFile().getOriginalFilename(),
            command.documentFile().getSize(),
            command.documentFile().getContentType()
        );

        SelfiePower selfie = new SelfiePower(
            selfieUrl,
            "meslektas-verification",
            extractS3Key(selfieUrl),
            Instant.now()
        );

        int attemptNumber = VerificationRetryPolicy.calculateAttemptNumber(
            previousAttempts
        );

        // Create aggregate
        VerificationRequest request = VerificationRequest.create(
            userId,
            command.profession(),
            document,
            selfie,
            attemptNumber
        );

        // Save
        verificationRepository.save(request);

        // Publish events
        publishEvents(request);

        return request.getId();
    }

    private void publishEvents(VerificationRequest request) {
        request.getEvents().forEach(eventPublisher::publishEvent);
        request.clearEvents();
    }
}
```

---

**Complexity:** ⭐⭐⭐⭐ Very High  
**Lines of Code (estimated):** 2000-2500  
**Implementation Time:** Sprint 3-4 (4 weeks)

**Next:** [04-SOCIAL-CONTEXT.md](./04-SOCIAL-CONTEXT.md)
