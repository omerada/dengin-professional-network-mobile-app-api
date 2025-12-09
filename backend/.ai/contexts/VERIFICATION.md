# Verification Context - AI-Powered Profession Verification

## Overview

AI destekli meslek doğrulama sistemi. AWS Rekognition kullanarak 6 aşamalı doğrulama pipeline'ı ile kullanıcıların mesleki kimliklerini doğrular.

---

## Domain Model

### VerificationRequest (Aggregate Root)

```java
@Entity
@Table(name = "verification_requests")
public class VerificationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private Profession profession;

    @Enumerated(EnumType.STRING)
    private VerificationStatus status;  // PENDING, PROCESSING, APPROVED, REJECTED, MANUAL_REVIEW

    private String documentUrl;  // S3 URL
    private String selfieUrl;    // S3 URL

    // AI Analysis Results
    private Double confidenceScore;       // 0-100
    private Boolean documentDetected;
    private Boolean textExtracted;
    private Boolean dataMatched;
    private Boolean documentAuthentic;
    private Boolean faceMatched;
    private Boolean livenessDetected;

    private String rejectionReason;
    private String adminNotes;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    private LocalDateTime processedAt;

    // KVKK Compliance: Auto-delete after 30 days
    private LocalDateTime documentsDeletedAt;
}
```

### VerificationStatus (Enum)

```java
public enum VerificationStatus {
    PENDING,          // Submitted, waiting for processing
    PROCESSING,       // AI analysis in progress
    APPROVED,         // Auto-approved by AI
    REJECTED,         // Auto-rejected by AI
    MANUAL_REVIEW     // AI uncertain, needs human review
}
```

---

## AI Verification Pipeline (6 Stages)

### 1️⃣ Document Detection

**AWS Rekognition:** `DetectLabels`

```java
// Checks if uploaded image contains a document
Labels detected: "Document", "ID Card", "Passport", "License"
Confidence threshold: > 90%
```

**Fail Reasons:**

- No document detected
- Low quality image
- Document not fully visible

---

### 2️⃣ Text Extraction (OCR)

**AWS Rekognition:** `DetectText`

```java
// Extracts text from document
Expected fields:
- Full Name (TC Kimlik, Ehliyet, Diploma)
- Document Number
- Profession (for diplomas/licenses)
```

**Fail Reasons:**

- Text not readable (blur, low resolution)
- Missing required fields

---

### 3️⃣ Data Matching

**Domain Service:** `DataMatchingService`

```java
// Matches extracted text with user profile
Checks:
1. Name match (Levenshtein distance < 2)
2. Profession match (for professional licenses)
```

**Example:**

```
User Name: "Ahmet Yılmaz"
Extracted: "AHMET YILMAZ"
→ Match ✓

User Profession: DOCTOR
Document: "Tabip Diploması"
→ Match ✓
```

---

### 4️⃣ Document Authenticity Check

**AWS Rekognition:** `DetectFaces` + Custom Logic

```java
// Checks for signs of tampering/forgery
Checks:
1. Image quality consistency
2. No photo-of-photo detected
3. Document structure validation
```

---

### 5️⃣ Face Match (Selfie ↔ ID)

**AWS Rekognition:** `CompareFaces`

```java
// Compares selfie with ID photo
Similarity threshold: > 85%
```

**Example:**

```
Selfie: user_123_selfie.jpg
ID Photo: extracted from document
Similarity: 92.5%
→ Match ✓
```

---

### 6️⃣ Liveness Detection (Anti-Spoofing)

**AWS Rekognition:** `DetectFaces` (liveness indicators)

```java
// Checks if selfie is from a live person
Checks:
1. No screen/photo detected
2. Face orientation natural
3. Lighting consistency
```

---

## Decision Logic

```java
if (all 6 stages pass && confidenceScore >= 90) {
    → AUTO-APPROVE
} else if (confidenceScore < 50) {
    → AUTO-REJECT
} else {
    → MANUAL_REVIEW (human moderator)
}
```

---

## API Endpoints

### Submit Verification

```java
POST /api/verification/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "profession": "DOCTOR",
  "document": <file>,  // ID/Diploma/License
  "selfie": <file>
}

// Response
{
  "success": true,
  "message": "Verification submitted successfully",
  "data": {
    "id": 123,
    "status": "PENDING",
    "estimatedProcessingTime": "2-5 minutes"
  }
}
```

### Get Status

```java
GET /api/verification/{id}

// Response
{
  "id": 123,
  "status": "PROCESSING",
  "confidenceScore": 87.5,
  "stages": {
    "documentDetection": "PASSED",
    "textExtraction": "PASSED",
    "dataMatching": "PASSED",
    "documentAuthenticity": "IN_PROGRESS",
    "faceMatch": "PENDING",
    "livenessDetection": "PENDING"
  }
}
```

### User's Requests

```java
GET /api/verification/user/{userId}

// Returns all verification attempts (paginated)
```

---

## Business Rules

### Attempt Limits

```java
Max attempts: 3 per 24 hours
Cooldown: 24 hours after 3rd failed attempt
```

**Implementation:**

```java
@Service
public class VerificationAttemptPolicy {

    public void validateCanSubmit(Long userId) {
        List<VerificationRequest> recent = repository.findByUserIdAndSubmittedAtAfter(
            userId,
            LocalDateTime.now().minusHours(24)
        );

        if (recent.size() >= 3) {
            throw new BusinessException(
                "Maximum 3 attempts per 24 hours",
                "VERIFICATION_LIMIT_EXCEEDED"
            );
        }
    }
}
```

### KVKK Compliance (Data Protection)

```java
// Auto-delete documents after 30 days
@Scheduled(cron = "0 0 2 * * *")  // Every day at 2 AM
public void deleteOldDocuments() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

    List<VerificationRequest> old = repository.findBySubmittedAtBeforeAndDocumentsDeletedAtIsNull(cutoff);

    old.forEach(request -> {
        s3Service.deleteDocument(request.getDocumentUrl());
        s3Service.deleteDocument(request.getSelfieUrl());

        request.setDocumentUrl(null);
        request.setSelfieUrl(null);
        request.setDocumentsDeletedAt(LocalDateTime.now());
    });
}
```

### Profession-Specific Documents

```java
// Different professions require different documents
DOCTOR          → Tabip Diploması
NURSE           → Hemşire Diploması
LAWYER          → Baro Kimlik Kartı
ENGINEER        → Mühendislik Diploması / Oda Belgesi
TEACHER         → Öğretmen Belgesi
```

---

## Service Layer

### AIVerificationOrchestrator

```java
@Service
@Slf4j
public class AIVerificationOrchestrator {

    @Async
    public CompletableFuture<VerificationResult> process(Long verificationId) {
        VerificationRequest request = repository.findById(verificationId).orElseThrow();

        try {
            // Stage 1: Document Detection
            boolean docDetected = documentDetectionService.detect(request.getDocumentUrl());
            if (!docDetected) {
                return reject(request, "Document not detected");
            }

            // Stage 2: Text Extraction
            Map<String, String> extractedData = textExtractionService.extract(request.getDocumentUrl());
            if (extractedData.isEmpty()) {
                return reject(request, "Text extraction failed");
            }

            // Stage 3: Data Matching
            boolean dataMatched = dataMatchingService.match(request.getUserId(), extractedData);
            if (!dataMatched) {
                return reject(request, "Data mismatch");
            }

            // Stage 4: Document Authenticity
            boolean authentic = documentAuthenticityService.check(request.getDocumentUrl());
            if (!authentic) {
                return reject(request, "Document authenticity check failed");
            }

            // Stage 5: Face Match
            double faceSimilarity = faceMatchService.compare(
                request.getSelfieUrl(),
                extractedData.get("faceImage")
            );
            if (faceSimilarity < 85.0) {
                return reject(request, "Face match failed");
            }

            // Stage 6: Liveness Detection
            boolean alive = livenessDetectionService.detect(request.getSelfieUrl());
            if (!alive) {
                return reject(request, "Liveness detection failed");
            }

            // Calculate confidence
            double confidence = calculateConfidence(docDetected, dataMatched, authentic, faceSimilarity, alive);
            request.setConfidenceScore(confidence);

            // Decision
            if (confidence >= 90.0) {
                approve(request);
            } else if (confidence < 50.0) {
                reject(request, "Low confidence score");
            } else {
                manualReview(request);
            }

            return CompletableFuture.completedFuture(new VerificationResult(request));

        } catch (Exception e) {
            log.error("Verification failed: {}", e.getMessage());
            request.setStatus(VerificationStatus.MANUAL_REVIEW);
            repository.save(request);
            throw e;
        }
    }
}
```

---

## Integration Points

### → Identity Context

```java
// On approval
User user = userRepository.findById(request.getUserId()).orElseThrow();
user.setProfileVerified(true);
userRepository.save(user);

// Publish domain event
eventPublisher.publishEvent(new UserVerifiedEvent(user.getId()));
```

### → Notification Context

```java
// Send notification on status change
notificationService.send(
    request.getUserId(),
    NotificationType.VERIFICATION_STATUS,
    "Your verification has been " + status
);
```

---

## Manual Review (Admin Panel)

### Pending Reviews

```java
GET /api/admin/verification/pending

// Returns requests with status = MANUAL_REVIEW
```

### Approve

```java
POST /api/admin/verification/{id}/approve

{
  "notes": "Document verified manually"
}
```

### Reject

```java
POST /api/admin/verification/{id}/reject

{
  "reason": "Document not clear",
  "notes": "Please re-submit with better quality"
}
```

---

## Error Handling

```java
VERIFICATION_LIMIT_EXCEEDED (429)
→ Max 3 attempts per 24 hours

INVALID_DOCUMENT_TYPE (400)
→ Only jpeg/png allowed

FILE_TOO_LARGE (400)
→ Max 10MB per file

DOCUMENT_NOT_DETECTED (400)
→ No document found in image

DATA_MISMATCH (400)
→ Name/profession doesn't match

FACE_MATCH_FAILED (400)
→ Selfie doesn't match ID photo

LIVENESS_CHECK_FAILED (400)
→ Selfie appears to be a photo/screen
```

---

## Performance

### Async Processing

```java
// Verification runs in background
@Async
public CompletableFuture<VerificationResult> process(Long id) {
    // 2-5 minutes processing time
    // User can check status via polling or WebSocket
}
```

### Cost Optimization

```java
// AWS Rekognition pricing (as of 2025)
Document Detection: $1/1000 images
Text Extraction: $1.50/1000 images
Face Comparison: $1/1000 comparisons

Average cost per verification: ~$0.005
```

---

## Testing

### Integration Test

```java
@SpringBootTest
@Transactional
class AIVerificationOrchestratorTest {

    @Autowired
    private AIVerificationOrchestrator orchestrator;

    @MockBean
    private RekognitionClient rekognitionClient;

    @Test
    void shouldApproveValidVerification() {
        // Given
        VerificationRequest request = createTestRequest();
        mockRekognitionResponses();

        // When
        CompletableFuture<VerificationResult> future = orchestrator.process(request.getId());
        VerificationResult result = future.join();

        // Then
        assertThat(result.getStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(result.getConfidenceScore()).isGreaterThan(90.0);
    }
}
```

---

**Last Updated:** 2025-12-09
