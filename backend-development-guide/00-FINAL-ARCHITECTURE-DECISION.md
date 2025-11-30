# 🎯 NİHAİ MİMARİ KARARI: Strategic DDD

**Tarih:** 30 Kasım 2025  
**Karar:** **STRATEGIC DOMAIN-DRIVEN DESIGN (Tam DDD)**  
**Gerekçe:** Production-Ready, Scalable, Maintainable Architecture

---

## 📊 Karar Matrisi (Güncellenmiş)

Tüm proje dökümantasyonu (User Requirements, Business Rules, Database Schema, API Specs, AI Design) detaylı incelendikten sonra:

| Kritik Faktör             | Layered | Hybrid DDD | **Full DDD** |
| ------------------------- | ------- | ---------- | ------------ |
| MVP Hızı                  | ⭐⭐⭐  | ⭐⭐⭐     | ⭐⭐         |
| Ekip Adaptasyonu (2 dev)  | ⭐⭐⭐  | ⭐⭐       | ⭐⭐         |
| Maintainability           | ⭐      | ⭐⭐⭐     | ⭐⭐⭐       |
| Business Rules Management | ⭐      | ⭐⭐       | ⭐⭐⭐       |
| Testing & Quality         | ⭐⭐    | ⭐⭐⭐     | ⭐⭐⭐       |
| Ölçeklenebilirlik         | ⭐      | ⭐⭐⭐     | ⭐⭐⭐       |
| Microservices Migration   | ⭐      | ⭐⭐⭐     | ⭐⭐⭐       |
| AI Integration Complexity | ⭐      | ⭐⭐       | ⭐⭐⭐       |
| Event-Driven Architecture | ⭐      | ⭐⭐       | ⭐⭐⭐       |
| KVKK/Compliance           | ⭐⭐    | ⭐⭐⭐     | ⭐⭐⭐       |
| **TOPLAM SKOR**           | **11**  | **23**     | **27** ✅    |

---

## 🎯 NEDEN TAM DDD?

### 1. Karmaşık Business Rules (50+ kural)

Projede tespit edilen iş kuralları:

#### AI Doğrulama Kuralları (BR-004)

```
✅ Multi-Factor Verification:
  - OCR Confidence (25%)
  - Face Match Similarity (30%)
  - Liveness Detection (25%)
  - Document Authenticity (15%)
  - Data Match Score (5%)

✅ Decision Thresholds:
  - Score >= 85% → AUTO APPROVE
  - 60% <= Score < 85% → MANUAL REVIEW
  - Score < 60% → AUTO REJECT

✅ Retry Logic:
  - Max 3 attempts
  - 30-day cooldown after 3 failures
  - 1-hour minimum between attempts

✅ KVKK Compliance:
  - Immediate document deletion after approval
  - Immediate deletion after rejection
  - 7-day retention for manual review only
```

**DDD Solution:**

```java
// Verification Aggregate kapsüller tüm bu logic'i
public class VerificationRequest extends AggregateRoot {
    private VerificationId id;
    private VerificationDocument document;
    private ConfidenceScore confidenceScore;
    private VerificationStatus status;

    // Domain behavior
    public void processAIResult(AIVerificationResult result) {
        this.confidenceScore = result.getConfidenceScore();
        VerificationDecision decision = VerificationPolicy.decide(
            confidenceScore,
            result.getComponents()
        );

        switch (decision.getAction()) {
            case AUTO_APPROVE -> approve();
            case AUTO_REJECT -> reject(decision.getReason());
            case MANUAL_REVIEW -> sendToManualReview();
        }
    }

    private void approve() {
        this.status = VerificationStatus.APPROVED;
        registerEvent(new VerificationApprovedEvent(this.id));
        scheduleDocumentDeletion(); // KVKK
    }
}
```

#### Meslek-Bazlı Erişim Kuralları (BR-003)

```
✅ Profession-Based Visibility:
  - Feed: Sadece kendi meslek grubu
  - Chat: Sadece kendi meslek odası
  - Search: Sadece kendi meslek içinde

✅ Verification Constraints:
  - Doğrulanmış meslek değiştirilemez
  - Genel → Doğrulanmış geçiş: İZİNLİ
  - Doğrulanmış → Doğrulanmış: YASAK (Admin only)

✅ Access Control:
  - Banned user: Hiçbir içerik göremez
  - Unverified user: Limited access
  - Blocked user: Mutual blocking
```

**DDD Solution:**

```java
// Domain Service handles complex access logic
public class ProfessionAccessPolicy {

    public boolean canViewPost(User viewer, Post post) {
        return viewer.getProfession().equals(post.getProfession())
            && viewer.isActive()
            && !viewer.isBanned()
            && !viewer.hasBlocked(post.getAuthor())
            && !post.isDeleted();
    }

    public void changeProfession(User user, Profession newProfession) {
        if (user.isProfessionVerified() && !user.isGeneralCategory()) {
            throw new ProfessionChangeNotAllowedException(
                "Doğrulanmış meslek değiştirilemez"
            );
        }
        // ... logic
    }
}
```

#### Moderasyon Kuralları (BR-011 - BR-013)

```
✅ Auto-Moderation Thresholds:
  - 5 reports → Content hidden (auto)
  - 10 reports → User suspended (temp)
  - 3 suspensions → Permanent ban

✅ Ban Durations:
  - 1st violation: 1 day
  - 2nd violation: 7 days
  - 3rd violation: 30 days
  - 4th violation: PERMANENT

✅ Spam Detection:
  - Same content within 5 minutes
  - Excessive emoji (>20%)
  - URL shorteners
  - Blacklisted keywords
```

**DDD Solution:**

```java
// Moderation Aggregate
public class ModerationCase extends AggregateRoot {
    private List<Report> reports;
    private ModerationStatus status;
    private AutoModerationPolicy policy;

    public void addReport(Report report) {
        reports.add(report);

        if (policy.shouldAutoModerate(reports.size())) {
            autoModerate();
        }

        registerEvent(new ReportAddedEvent(this.id, report));
    }

    private void autoModerate() {
        ModerationAction action = policy.determineAction(
            reports.size(),
            target.getViolationHistory()
        );

        switch (action) {
            case HIDE_CONTENT -> hideContent();
            case SUSPEND_USER -> suspendUser(action.getDuration());
            case BAN_USER -> banUser();
        }
    }
}
```

---

### 2. AI Integration Complexity

AI Verification dökümantasyonunda 6-aşamalı pipeline:

```
Step 1: Document OCR (Text Detection)
  ↓ Extracts: name, profession, institution
Step 2: Face Detection in Document
  ↓ Extracts: face bounding box, quality score
Step 3: Face Comparison (Selfie vs Document)
  ↓ Similarity score (0-100%)
Step 4: Liveness Detection (Anti-spoofing)
  ↓ Confidence score, spoofing detection
Step 5: Document Authenticity Check
  ↓ Logo, watermark, structure validation
Step 6: Data Validation and Matching
  ↓ Name match, profession match, fuzzy logic
```

**DDD Solution:**

```java
// Verification Domain Service orchestrates pipeline
public class AIVerificationService {

    private final OCRService ocrService;
    private final FaceComparisonService faceService;
    private final LivenessDetectionService livenessService;
    private final DocumentAuthenticityService authService;

    public AIVerificationResult verify(
        VerificationDocument document,
        SelfiePower selfie
    ) {
        // Parallel processing
        CompletableFuture<OCRResult> ocrFuture =
            CompletableFuture.supplyAsync(() ->
                ocrService.extractText(document));

        CompletableFuture<LivenessResult> livenessFuture =
            CompletableFuture.supplyAsync(() ->
                livenessService.check(selfie));

        // Wait for both
        OCRResult ocr = ocrFuture.join();
        LivenessResult liveness = livenessFuture.join();

        // Sequential steps
        FaceMatchResult faceMatch = faceService.compare(
            document.extractFace(),
            selfie.getFace()
        );

        AuthenticityResult auth = authService.verify(
            document,
            ocr.getProfessionCategory()
        );

        // Calculate weighted confidence
        ConfidenceScore confidence = ConfidenceCalculator.calculate(
            ocr.getConfidence(),      // 25%
            faceMatch.getSimilarity(), // 30%
            liveness.getConfidence(),  // 25%
            auth.getScore(),           // 15%
            dataMatchScore             // 5%
        );

        return AIVerificationResult.builder()
            .confidence(confidence)
            .ocrResult(ocr)
            .faceMatch(faceMatch)
            .liveness(liveness)
            .authenticity(auth)
            .build();
    }
}
```

**Avantajlar:**

- Her AI component bağımsız service
- Unit testing kolay
- Mock'lama basit
- Parallel processing optimization
- Error handling izole edilmiş

---

### 3. Event-Driven Architecture İhtiyacı

Sistemde 30+ event tespit edildi:

#### Verification Events

```
VerificationSubmitted
  → Trigger AI processing (async)
  → Send "Processing" notification
  → Start timeout timer

VerificationApproved
  → Update User.isProfessionVerified = true
  → Delete documents from S3 (KVKK)
  → Send "Approved" notification
  → Grant profession access
  → Trigger analytics event

VerificationRejected
  → Update retry attempts
  → Send "Rejected" notification
  → Suggest improvements
  → Log rejection reason

ManualReviewRequired
  → Add to admin queue
  → Notify admin team
  → Send "Under Review" notification
  → Set 24-48h SLA timer
```

#### Social Events

```
PostCreated
  → Notify followers (async)
  → Update user stats
  → Index for search
  → Trigger content moderation check

PostLiked
  → Notify post author
  → Update like counter
  → Update author reputation score

CommentAdded
  → Notify post author
  → Notify parent comment author (if reply)
  → Update comment counter
  → Trigger spam detection

UserBlocked
  → Hide blocker's content from blocked user
  → Hide blocked user's content from blocker
  → Cancel pending notifications
  → Terminate active conversations
```

#### Messaging Events

```
MessageSent
  → Deliver to recipient (WebSocket)
  → Send push notification (if offline)
  → Update unread count
  → Update conversation.lastMessageAt
  → Trigger read receipt

MessageRead
  → Update read status
  → Notify sender (read receipt)
  → Clear notification

TypingStarted
  → Broadcast to conversation participants
  → Set timeout (30 seconds)
```

**DDD Solution:**

```java
// Domain Event Publisher
public abstract class AggregateRoot {
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    public List<DomainEvent> getEvents() {
        return List.copyOf(domainEvents);
    }

    public void clearEvents() {
        domainEvents.clear();
    }
}

// Application Service publishes events
@Service
@Transactional
public class VerificationApplicationService {

    private final ApplicationEventPublisher eventPublisher;

    public void submitVerification(SubmitVerificationCommand command) {
        // Create aggregate
        VerificationRequest request = VerificationRequest.create(...);
        request.submit(); // Domain behavior

        // Save
        repository.save(request);

        // Publish domain events
        request.getEvents().forEach(eventPublisher::publishEvent);
        request.clearEvents();
    }
}

// Event Listeners (decoupled)
@Component
public class VerificationEventListener {

    @EventListener
    @Async
    public void onVerificationSubmitted(VerificationSubmittedEvent event) {
        // Trigger AI processing
        aiVerificationService.processAsync(event.getVerificationId());
    }

    @EventListener
    @Async
    public void onVerificationApproved(VerificationApprovedEvent event) {
        // Delete documents (KVKK)
        documentDeletionService.deleteVerificationDocuments(
            event.getVerificationId()
        );

        // Send notification
        notificationService.sendVerificationApproval(
            event.getUserId()
        );
    }
}
```

---

### 4. Multiple Bounded Contexts

6 distinct bounded context tespit edildi:

```
1. Identity & Access Context
   - User, Profession, Auth
   - OAuth, JWT, Session
   - User blocking

2. Verification Context ⭐ (COMPLEX)
   - VerificationRequest aggregate
   - AI processing pipeline
   - Document lifecycle
   - KVKK compliance
   - Manual review workflow

3. Social Feed Context
   - Post aggregate
   - Comment aggregate
   - Like, Follow
   - Feed generation
   - Profession-based filtering

4. Messaging Context ⭐ (COMPLEX)
   - Conversation aggregate
   - Message entity
   - Read receipts
   - Typing indicators
   - WebSocket integration

5. Notification Context ⭐ (COMPLEX)
   - Notification aggregate
   - Multi-channel routing (Push/Email/In-app)
   - Preferences
   - Priority queue
   - Delivery status tracking

6. Moderation Context ⭐ (COMPLEX)
   - ModerationCase aggregate
   - Report handling
   - Auto-moderation rules
   - Ban lifecycle
   - Appeal process
```

**Context Map:**

```
┌──────────────────┐
│ Identity Context │ (Upstream)
└────────┬─────────┘
         │ Provides: User, Profession
         ↓
┌──────────────────────┐      ┌────────────────────┐
│ Verification Context │─────→│Notification Context│
│  (Core Domain)       │      │ (Supporting)       │
└──────────────────────┘      └────────────────────┘
         │                             ▲
         │ VerificationApproved        │
         ↓ Event                       │
┌──────────────────┐                   │
│  Social Context  │───────────────────┘
│                  │  PostCreated Event
└──────────────────┘
         │
         ↓
┌──────────────────┐
│ Messaging Context│
│                  │
└──────────────────┘
```

**Relationship Types:**

- **Shared Kernel:** Common (BaseEntity, ValueObject, DomainEvent)
- **Customer-Supplier:** Identity → Verification (User info)
- **Published Language:** Domain Events (REST API, Events)
- **Anti-Corruption Layer:** AI service integration

---

### 5. Microservices Migration Path

User Requirements'da belirtilen hedef:

```
MVP (6 months):
  - 500-2000 users
  - 5 professions
  - Monolith OK

Year 1:
  - 10-20K users
  - 25+ professions
  - Consider microservices split

Year 3:
  - 100K+ users
  - All professions
  - Definitely microservices
```

**DDD Advantage:**

Her bounded context zaten izole, microservices migration:

```
Phase 1 (Year 1):
  - Monolith → Modular Monolith (DDD)
  - Bounded contexts clear
  - Domain events in place

Phase 2 (Year 1.5):
  - Extract Verification Service (AI heavy)
  - Extract Notification Service (high load)
  - Keep Social/Messaging in monolith

Phase 3 (Year 2):
  - Extract Messaging Service (WebSocket)
  - Extract Moderation Service
  - Keep Identity in monolith (core)

Phase 4 (Year 3):
  - Full microservices architecture
  - Event-driven communication (Kafka/RabbitMQ)
  - API Gateway
```

**Migration Code:**

```
Before (Monolith - DDD):
  com.meslektas.verification.domain.VerificationRequest

After (Microservice):
  verification-service/
    src/main/java/com/meslektas/verification/
      domain/VerificationRequest.java  <- SAME CODE!

  Just copy-paste the bounded context!
```

---

## 🏗️ Final Architecture Decision

### ✅ STRATEGIC DDD (Full Domain-Driven Design)

**Implementation Plan:**

```
1. Bounded Contexts (6 contexts)
   ✅ Each context as Java package
   ✅ Clear boundaries
   ✅ Shared kernel (common)

2. Tactical Patterns
   ✅ Aggregates (VerificationRequest, Post, Conversation)
   ✅ Entities (Message, Comment)
   ✅ Value Objects (ConfidenceScore, Email, Profession)
   ✅ Domain Services (AIVerificationService, AccessPolicy)
   ✅ Repositories (interfaces in domain)
   ✅ Domain Events (30+ events)

3. Application Layer
   ✅ Commands (SubmitVerificationCommand)
   ✅ Queries (GetVerificationStatusQuery)
   ✅ Application Services (orchestration only)
   ✅ DTOs (separate from domain)

4. Infrastructure Layer
   ✅ JPA implementations
   ✅ AWS SDK integrations
   ✅ WebSocket handlers
   ✅ Event publishers
```

**Folder Structure:**

```
src/main/java/com/meslektas/
│
├── common/                      # Shared Kernel
│   ├── domain/
│   │   ├── AggregateRoot.java
│   │   ├── DomainEvent.java
│   │   └── ValueObject.java
│   ├── exception/
│   └── util/
│
├── verification/                # Bounded Context 1
│   ├── domain/
│   │   ├── model/
│   │   │   ├── VerificationRequest.java (Aggregate)
│   │   │   ├── VerificationDocument.java (Entity)
│   │   │   └── ConfidenceScore.java (Value Object)
│   │   ├── service/
│   │   │   └── AIVerificationService.java
│   │   ├── repository/
│   │   │   └── VerificationRepository.java (Interface)
│   │   └── event/
│   │       └── VerificationApprovedEvent.java
│   ├── application/
│   │   ├── command/
│   │   ├── query/
│   │   └── service/
│   ├── infrastructure/
│   │   ├── persistence/
│   │   └── ai/
│   └── api/
│       └── VerificationController.java
│
├── social/                      # Bounded Context 2
├── messaging/                   # Bounded Context 3
├── notification/                # Bounded Context 4
├── moderation/                  # Bounded Context 5
└── identity/                    # Bounded Context 6
```

---

## 📝 Sonuç

**Nihai Karar:** **STRATEGIC DDD (Full Domain-Driven Design)**

**Gerekçeler:**

1. ✅ 50+ karmaşık iş kuralı → Domain Model
2. ✅ 6-aşamalı AI pipeline → Domain Services
3. ✅ 30+ domain event → Event-Driven Architecture
4. ✅ 6 bounded context → Microservices-ready
5. ✅ KVKK compliance → Domain logic'de enforce edilir
6. ✅ Büyüme hedefi → Kolay scaling

**Trade-offs:**

- ❌ İlk setup süresi: +2-3 hafta (learning curve)
- ✅ Uzun vadede: Daha hızlı development
- ✅ Test edilebilirlik: Çok yüksek
- ✅ Bakım kolaylığı: Çok yüksek

**Ekip İçin:**

- Hafta 1-2: DDD training (online courses, Eric Evans kitabı)
- Hafta 3-4: Verification context ile pratik (en karmaşık)
- Hafta 5+: Diğer context'lerde hız kazanma

---

**Hazırlayan:** Senior Backend Architect  
**Onay:** Tech Lead & CTO  
**Tarih:** 30 Kasım 2025  
**Versiyon:** 2.0 (Final Decision)
