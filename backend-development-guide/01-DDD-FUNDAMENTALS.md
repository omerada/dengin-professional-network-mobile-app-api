# DDD Fundamentals - Meslektaş Projesi

> **Strategic Domain-Driven Design temel kavramları ve proje uygulamaları**

---

## 📚 İçindekiler

1. [DDD Nedir?](#ddd-nedir)
2. [Strategic Design](#strategic-design)
3. [Tactical Design](#tactical-design)
4. [Meslektaş Projesi DDD Mapping](#meslektaş-projesi-ddd-mapping)
5. [Folder Structure](#folder-structure)

---

## 🎯 DDD Nedir?

**Domain-Driven Design (DDD)**, karmaşık iş mantığını yazılım modellerine dönüştürmek için kullanılan bir yaklaşımdır.

### Core Principles

```
1. Ubiquitous Language (Ortak Dil)
   → İş ekibi ve development ekibi aynı terimleri kullanır
   → Kod, business rules'ı direkt yansıtır

2. Bounded Context (Sınırlanmış Bağlam)
   → Her context kendi domain modeline sahip
   → Context'ler arası clear boundaries

3. Domain Model (Alan Modeli)
   → Business logic kod içinde
   → Anemic models değil, rich domain models

4. Aggregates (Kümeler)
   → İlgili entity'leri gruplar
   → Transaction boundary
   → Consistency boundary
```

---

## 🗺️ Strategic Design

Strategic DDD, **büyük resme** odaklanır: bounded context'ler ve aralarındaki ilişkiler.

### 1. Bounded Context

**Tanım:** Belirli bir domain model'in geçerli olduğu açık sınırlar.

**Meslektaş Projesi Context'leri:**

```
┌─────────────────────────────────────────────────────────────┐
│                    MESLEKTAŞ PLATFORM                       │
└─────────────────────────────────────────────────────────────┘
         │
         ├─► Identity Context (Upstream)
         │   └─ User, Profession, Authentication
         │
         ├─► Verification Context (Core Domain) ⭐
         │   └─ VerificationRequest, AI Pipeline, KVKK
         │
         ├─► Social Context
         │   └─ Post, Comment, Like, Feed
         │
         ├─► Messaging Context
         │   └─ Conversation, Message, WebSocket
         │
         ├─► Notification Context
         │   └─ Notification, Multi-channel delivery
         │
         └─► Moderation Context
             └─ Report, ModerationCase, Auto-moderation
```

### 2. Context Map

Context'ler arası ilişkiler:

```
┌──────────────────┐
│ Identity Context │ (Upstream - Provides User info)
└────────┬─────────┘
         │ User, Profession
         ↓
┌──────────────────────┐      ┌────────────────────┐
│ Verification Context │─────→│Notification Context│
│  (Core Domain)       │Events│ (Supporting)       │
└──────────┬───────────┘      └────────────────────┘
           │                           ▲
           │ VerificationApproved      │
           ↓ Event                     │
┌──────────────────┐                   │
│  Social Context  │───────────────────┘
│                  │  PostCreated Event
└──────────────────┘
           │
           ↓
┌──────────────────┐
│ Messaging Context│
└──────────────────┘
```

**Relationship Types:**

- **Shared Kernel:** `common` package (BaseEntity, DomainEvent)
- **Customer-Supplier:** Identity → Verification (User bilgisi)
- **Published Language:** REST API, Domain Events
- **Anti-Corruption Layer:** AWS SDK integration

### 3. Core Domain vs Supporting Domain

```
CORE DOMAIN (Competitive Advantage):
  ✅ Verification Context
     - AI-powered verification
     - Multi-stage pipeline
     - KVKK compliance
     - Bu sistemin unique değeri!

SUPPORTING DOMAINS:
  ⚙️ Identity Context - Standard auth
  ⚙️ Social Context - Standard social features
  ⚙️ Messaging Context - Standard messaging
  ⚙️ Notification Context - Standard notifications
  ⚙️ Moderation Context - Standard moderation
```

**Investment Strategy:**

- Core Domain → En çok effort, en iyi developers
- Supporting → Reusable patterns, libraries

---

## 🛠️ Tactical Design

Tactical DDD, **kod seviyesinde** pattern'ları tanımlar.

### 1. Building Blocks

#### Entity

```java
/**
 * Entity: Unique identity ile tanımlanan objeler
 * Lifecycle boyunca identity değişmez
 */
@Entity
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; // ← Unique identity

    private String email;
    private String fullName;

    // Equality: ID'ye göre
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User other = (User) o;
        return id != null && id.equals(other.id);
    }
}
```

**Özellikleri:**

- ✅ Unique ID
- ✅ Mutable state (email değişebilir)
- ✅ Equality = ID equality

#### Value Object

```java
/**
 * Value Object: Identity yok, value'ya göre eşitlik
 * Immutable
 */
public record Email(String value) {

    public Email {
        if (!value.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new InvalidEmailException(value);
        }
    }

    // Equality: Value'ya göre
    // Record otomatik equals/hashCode verir
}

// Usage
Email email1 = new Email("user@example.com");
Email email2 = new Email("user@example.com");
email1.equals(email2); // true (same value)
```

**Özellikleri:**

- ❌ No unique ID
- ✅ Immutable
- ✅ Equality = Value equality
- ✅ Self-validating

#### Aggregate

```java
/**
 * Aggregate: İlgili entity'leri gruplar
 * Transaction boundary
 * Consistency boundary
 */
public class VerificationRequest extends AggregateRoot {

    @Id
    private VerificationId id; // Aggregate Root ID

    // Aggregate içindeki entity'ler
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    private VerificationDocument document;

    @Embedded
    private ConfidenceScore confidenceScore;

    @Enumerated(EnumType.STRING)
    private VerificationStatus status;

    // Domain behavior (business rules)
    public void approve() {
        if (this.status != VerificationStatus.PENDING) {
            throw new IllegalStateException(
                "Only PENDING verifications can be approved"
            );
        }
        this.status = VerificationStatus.APPROVED;
        registerEvent(new VerificationApprovedEvent(this.id));
    }

    // Aggregate dışındaki entity'lere erişim YOK
    // User'a erişmek için → userId (foreign key)
    private UserId userId;
}
```

**Aggregate Rules:**

1. ✅ Bir Aggregate Root (VerificationRequest)
2. ✅ İçindeki entity'ler sadece root üzerinden erişilir
3. ✅ Transaction boundary (hepsi birlikte kaydedilir)
4. ✅ Consistency boundary (business rules enforce edilir)
5. ✅ Dışarıya sadece ID ile referans

#### Domain Service

```java
/**
 * Domain Service: Entity veya Value Object'e ait olmayan
 * domain logic
 */
@Service
public class ProfessionAccessPolicy {

    /**
     * Business rule: Sadece aynı meslek grubundakiler
     * birbirlerinin postlarını görebilir
     */
    public boolean canViewPost(User viewer, Post post) {
        // Complex business logic
        return viewer.getProfession().equals(post.getProfession())
            && viewer.isActive()
            && !viewer.isBanned()
            && !viewer.hasBlocked(post.getAuthor())
            && !post.isDeleted()
            && !post.isHiddenByModeration();
    }

    /**
     * Business rule: Doğrulanmış meslek değiştirilemez
     */
    public void validateProfessionChange(
        User user,
        Profession newProfession
    ) {
        if (user.isProfessionVerified()
            && !user.isGeneralCategory()) {
            throw new ProfessionChangeNotAllowedException(
                "Verified profession cannot be changed"
            );
        }
    }
}
```

**Ne zaman Domain Service?**

- ✅ Logic birden fazla aggregate'e aittir
- ✅ Stateless operation
- ✅ Domain concept (infrastructure değil)

#### Repository

```java
/**
 * Repository: Aggregate persistence abstraction
 * Interface domain layer'da, implementation infrastructure'da
 */
public interface VerificationRepository {

    // Aggregate root ile çalışır (VerificationRequest)
    VerificationRequest save(VerificationRequest request);

    Optional<VerificationRequest> findById(VerificationId id);

    // Domain-specific queries
    List<VerificationRequest> findPendingVerifications();

    Optional<VerificationRequest> findActiveByUserId(UserId userId);

    // Collection semantics (add/remove)
    void delete(VerificationRequest request);
}
```

**Repository Rules:**

1. ✅ Her aggregate root için bir repository
2. ✅ Interface domain layer'da
3. ✅ Implementation infrastructure layer'da
4. ✅ Aggregate bütünlüğünü korur

#### Domain Event

```java
/**
 * Domain Event: Domain'de gerçekleşen önemli olaylar
 * Past tense (zaten olmuş)
 */
public record VerificationApprovedEvent(
    VerificationId verificationId,
    UserId userId,
    Profession profession,
    Instant approvedAt
) implements DomainEvent {

    public VerificationApprovedEvent(VerificationId id) {
        this(
            id,
            // ... fetch from aggregate
            Instant.now()
        );
    }
}

// Aggregate'te event register edilir
public class VerificationRequest extends AggregateRoot {

    public void approve() {
        this.status = VerificationStatus.APPROVED;

        // Domain event
        registerEvent(new VerificationApprovedEvent(this.id));
    }
}

// Application service publish eder
@Service
@Transactional
public class VerificationApplicationService {

    private final ApplicationEventPublisher eventPublisher;

    public void approveVerification(VerificationId id) {
        VerificationRequest request = repository.findById(id)
            .orElseThrow();

        request.approve(); // Domain logic
        repository.save(request);

        // Publish events
        request.getEvents().forEach(eventPublisher::publishEvent);
        request.clearEvents();
    }
}

// Event listener (decoupled)
@Component
public class VerificationEventListener {

    @EventListener
    @Async
    public void onVerificationApproved(VerificationApprovedEvent event) {
        // Side effects
        notificationService.sendApprovalNotification(event.userId());
        documentDeletionService.deleteDocuments(event.verificationId());
        analyticsService.trackVerification(event);
    }
}
```

---

## 🏗️ Meslektaş Projesi DDD Mapping

### Business Rules → DDD Patterns

| Business Rule              | DDD Pattern                          | Context      |
| -------------------------- | ------------------------------------ | ------------ |
| AI Verification Pipeline   | **Domain Service** + **Aggregate**   | Verification |
| Confidence Calculation     | **Value Object** (ConfidenceScore)   | Verification |
| Profession Access Control  | **Domain Service** (AccessPolicy)    | Identity     |
| Auto-Moderation Thresholds | **Domain Service**                   | Moderation   |
| Message Delivery Semantics | **Aggregate** (Conversation)         | Messaging    |
| Multi-channel Notification | **Domain Service**                   | Notification |
| KVKK Document Deletion     | **Domain Event** + **Event Handler** | Verification |

### Aggregates Identified

```
1. VerificationRequest (Verification Context)
   ├─ VerificationDocument (Entity)
   ├─ ConfidenceScore (Value Object)
   └─ VerificationStatus (Enum)

2. User (Identity Context)
   ├─ Email (Value Object)
   ├─ Profession (Value Object)
   └─ UserStatus (Enum)

3. Post (Social Context)
   ├─ Comments (Entity collection)
   ├─ Likes (Value Object collection)
   └─ PostStatus (Enum)

4. Conversation (Messaging Context)
   ├─ Messages (Entity collection)
   ├─ Participants (Value Object collection)
   └─ ConversationStatus (Enum)

5. Notification (Notification Context)
   ├─ DeliveryStatus (Value Object)
   ├─ NotificationChannel (Enum)
   └─ Priority (Enum)

6. ModerationCase (Moderation Context)
   ├─ Reports (Entity collection)
   ├─ ModerationAction (Value Object)
   └─ CaseStatus (Enum)
```

### Value Objects Catalog

```java
// Identity Context
record Email(String value)
record PhoneNumber(String value)
record FullName(String firstName, String lastName)

// Verification Context
record ConfidenceScore(double value) // 0-100
record VerificationId(UUID value)
record DocumentType(String value) // DIPLOMA, LICENSE, etc.

// Social Context
record PostId(UUID value)
record CommentId(UUID value)
record LikeCount(int value)

// Common
record UserId(UUID value)
record Profession(String name, ProfessionCategory category)
```

---

## 📁 Folder Structure

### Package Organization

```
src/main/java/com/meslektas/
│
├── common/                           # Shared Kernel
│   ├── domain/
│   │   ├── AggregateRoot.java
│   │   ├── BaseEntity.java
│   │   ├── DomainEvent.java
│   │   └── ValueObject.java
│   ├── exception/
│   │   ├── DomainException.java
│   │   └── NotFoundException.java
│   └── util/
│
├── verification/                     # Bounded Context
│   ├── domain/                       # Domain Layer
│   │   ├── model/
│   │   │   ├── VerificationRequest.java (Aggregate Root)
│   │   │   ├── VerificationDocument.java (Entity)
│   │   │   ├── ConfidenceScore.java (Value Object)
│   │   │   └── VerificationStatus.java (Enum)
│   │   ├── service/
│   │   │   ├── AIVerificationService.java (Domain Service)
│   │   │   └── VerificationPolicy.java (Domain Service)
│   │   ├── repository/
│   │   │   └── VerificationRepository.java (Interface)
│   │   └── event/
│   │       ├── VerificationApprovedEvent.java
│   │       └── VerificationRejectedEvent.java
│   │
│   ├── application/                  # Application Layer
│   │   ├── command/
│   │   │   ├── SubmitVerificationCommand.java
│   │   │   └── ApproveVerificationCommand.java
│   │   ├── query/
│   │   │   └── GetVerificationStatusQuery.java
│   │   ├── service/
│   │   │   └── VerificationApplicationService.java
│   │   └── dto/
│   │       ├── VerificationRequestDTO.java
│   │       └── VerificationResponseDTO.java
│   │
│   ├── infrastructure/               # Infrastructure Layer
│   │   ├── persistence/
│   │   │   ├── VerificationJpaRepository.java
│   │   │   └── VerificationRepositoryImpl.java
│   │   └── ai/
│   │       └── AWSRekognitionAdapter.java
│   │
│   └── api/                          # API Layer
│       └── VerificationController.java
│
├── social/                           # Bounded Context
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── api/
│
├── messaging/                        # Bounded Context
├── notification/                     # Bounded Context
├── moderation/                       # Bounded Context
└── identity/                         # Bounded Context
```

### Layer Dependencies

```
┌─────────────────────────────────────────┐
│          API Layer (Controllers)        │
│  - REST endpoints                       │
│  - DTO validation                       │
└──────────────────┬──────────────────────┘
                   │ depends on
┌──────────────────▼──────────────────────┐
│      Application Layer (Services)       │
│  - Commands & Queries (CQRS)            │
│  - Orchestration                        │
│  - Transaction management               │
│  - DTO ←→ Domain mapping                │
└──────────────────┬──────────────────────┘
                   │ depends on
┌──────────────────▼──────────────────────┐
│         Domain Layer (Core)             │
│  - Aggregates, Entities                 │
│  - Value Objects                        │
│  - Domain Services                      │
│  - Domain Events                        │
│  - Repository Interfaces                │
│  ⚠️ NO DEPENDENCIES (pure business)     │
└──────────────────▲──────────────────────┘
                   │ implements
┌──────────────────┴──────────────────────┐
│      Infrastructure Layer               │
│  - JPA implementations                  │
│  - AWS SDK adapters                     │
│  - WebSocket handlers                   │
│  - Redis cache                          │
└─────────────────────────────────────────┘
```

**Dependency Rule:**

```
API → Application → Domain ← Infrastructure
                     ▲
                     │
              Pure business logic
              No framework dependencies
```

---

## 🎯 Key Takeaways

### DDD Benefits for Meslektaş

1. ✅ **Business Logic Clarity:** AI verification rules kod içinde açıkça görünür
2. ✅ **Testability:** Domain layer pure Java, easy unit testing
3. ✅ **Maintainability:** Business rule değişikliği = sadece domain layer
4. ✅ **Scalability:** Bounded contexts → kolay microservices migration
5. ✅ **Team Collaboration:** Ubiquitous language → ortak terminology

### Common Pitfalls to Avoid

1. ❌ **Anemic Domain Model:** Getter/setter only entities
2. ❌ **Domain Logic in Services:** Domain behavior aggregate'te olmalı
3. ❌ **Big Aggregates:** Aggregate küçük ve focused olmalı
4. ❌ **Ignoring Events:** Domain events critical for decoupling
5. ❌ **Framework Coupling:** Domain layer framework-agnostic olmalı

---

## 📚 Next Steps

1. ✅ Bu fundamentals'ı oku ve anla
2. ✅ **[03-VERIFICATION-CONTEXT.md](../contexts/03-VERIFICATION-CONTEXT.md)** - En karmaşık örnek
3. ✅ **[08-AGGREGATES-DESIGN.md](../patterns/08-AGGREGATES-DESIGN.md)** - Aggregate tasarım kuralları
4. ✅ **[11-DOMAIN-EVENTS.md](../patterns/11-DOMAIN-EVENTS.md)** - Event catalog
5. ✅ **[23-SPRINT-01-02.md](../sprints/23-SPRINT-01-02.md)** - İlk sprint

---

**Hazırlayan:** Senior Backend Architect  
**Tarih:** 30 Kasım 2025  
**Versiyon:** 1.0
