# 🏛️ Domain-Driven Design (DDD) Mimari Değerlendirmesi

**Doküman Versiyonu:** 1.0  
**Tarih:** 30 Kasım 2025  
**Durum:** Analiz ve Karar

---

## 📋 İçindekiler

1. [DDD Nedir?](#ddd-nedir)
2. [Meslektaş Projesi için DDD Değerlendirmesi](#meslektaş-projesi-için-ddd-değerlendirmesi)
3. [Layered Architecture vs DDD Karşılaştırması](#layered-architecture-vs-ddd-karşılaştırması)
4. [Karar: Hybrid Yaklaşım](#karar-hybrid-yaklaşım)
5. [Önerilen Mimari](#önerilen-mimari)

---

## 🎯 DDD Nedir?

### Domain-Driven Design Prensipleri

**Domain-Driven Design (DDD)**, Eric Evans tarafından geliştirilen, karmaşık iş mantığını organize etmek için kullanılan bir yazılım geliştirme yaklaşımıdır.

#### Temel Kavramlar

**1. Strategic Design Patterns:**

- **Bounded Context:** Her domain'in kendi sınırları vardır
- **Ubiquitous Language:** Domain uzmanları ve geliştiriciler aynı dili konuşur
- **Context Map:** Farklı bounded context'ler arası ilişkiler

**2. Tactical Design Patterns:**

- **Entity:** Kimliği olan objeler (User, Post)
- **Value Object:** Kimliği olmayan objeler (Email, Address)
- **Aggregate:** İlişkili entity'lerin grubu (Order + OrderItems)
- **Domain Service:** Domain logic'i barındıran servisler
- **Repository:** Data access abstraction
- **Domain Events:** Domain içindeki önemli olaylar

**3. Layered Architecture:**

```
┌─────────────────────────────────┐
│    Presentation Layer           │ (Controllers, DTOs)
├─────────────────────────────────┤
│    Application Layer            │ (Use Cases, Commands)
├─────────────────────────────────┤
│    Domain Layer                 │ (Entities, Value Objects, Services)
├─────────────────────────────────┤
│    Infrastructure Layer         │ (Repositories, External Services)
└─────────────────────────────────┘
```

---

## 🔍 Meslektaş Projesi için DDD Değerlendirmesi

### Proje Karakteristikleri Analizi

#### 1. Domain Karmaşıklığı

**Karmaşık Domain Mantığı:**

- ✅ AI Doğrulama Sistemi (confidence score, otomatik karar)
- ✅ Meslek Bazlı Yetkilendirme (profession-based access)
- ✅ Bildirim İş Mantığı (çoklu kanal, öncelik)

**Basit CRUD İşlemler:**

- ⚠️ Kullanıcı Profili (basit CRUD)
- ⚠️ Post/Comment (standart sosyal medya)
- ⚠️ Follow/Like (basit ilişkiler)

**Değerlendirme:** Domain karmaşıklığı **ORTA** seviyede.

---

#### 2. Business Rules

**Karmaşık İş Kuralları:**

```java
// Örnek 1: Doğrulama Karar Mekanizması
if (aiConfidenceScore > 85) {
    approveAutomatically();
    sendSuccessNotification();
    deleteSensitiveDocuments();
} else if (aiConfidenceScore >= 60) {
    sendToManualReview();
    notifyAdminQueue();
} else {
    rejectAutomatically();
    sendRejectionNotification();
    allowRetry();
}

// Örnek 2: Post Görünürlük Kuralı
boolean canUserSeePost(User user, Post post) {
    return user.getProfession().equals(post.getAuthor().getProfession())
        && user.isVerified()
        && !user.isBanned()
        && !post.isDeleted()
        && !user.hasBlocked(post.getAuthor());
}
```

**Değerlendirme:** İş kuralları **ORTA-İLERİ** seviyede karmaşık.

---

#### 3. Bounded Contexts

Meslektaş projesinde potansiyel bounded context'ler:

**1. Identity & Access Context** (Kimlik ve Erişim)

- User registration
- Authentication
- Authorization
- Session management

**2. Verification Context** (Doğrulama)

- Profession verification
- AI document processing
- Manual review workflow
- Verification status management

**3. Social Feed Context** (Sosyal Akış)

- Post creation
- Comments
- Likes
- Feed generation

**4. Messaging Context** (Mesajlaşma)

- Private chat
- Group chat
- Message delivery
- Read receipts

**5. Notification Context** (Bildirim)

- Push notifications
- Email notifications
- In-app notifications
- Notification preferences

**Değerlendirme:** **5 adet** distinct bounded context mevcut.

---

#### 4. Proje Büyüklüğü ve Ekip

**MVP Aşaması:**

- Ekip Boyutu: 2 backend developer
- Süre: 6 ay (24 hafta)
- Story Points: 481
- Toplam Entity: ~10-12 adet

**Büyüme Beklentisi:**

- 1 yıl içinde: 20K kullanıcı
- 3 yıl içinde: 100K+ kullanıcı
- Gelecekte: Microservices'e geçiş

**Değerlendirme:** MVP için **küçük**, ancak **hızlı büyüme** bekleniyor.

---

## ⚖️ Layered Architecture vs DDD Karşılaştırması

### Senaryo 1: Basit Layered Architecture (Mevcut Yaklaşım)

**Avantajları:**

- ✅ **Basit ve anlaşılır:** Ekip hızlı adapte olur
- ✅ **Düşük learning curve:** Spring Boot best practices
- ✅ **Hızlı development:** CRUD operations kolay
- ✅ **Küçük ekiplere uygun:** 2-3 developer yeterli
- ✅ **Tooling support:** IDE, Spring Boot tooling

**Dezavantajları:**

- ❌ **Anemic Domain Model:** Entities sadece getter/setter
- ❌ **Service layer şişmesi:** Fat service classes
- ❌ **İş mantığı dağınık:** Service'ler arasında dağılmış
- ❌ **Test zorluğu:** Business logic mock'lanması zor
- ❌ **Ölçekleme zorluğu:** Microservices'e geçiş zor

**Kod Örneği:**

```java
// Layered Architecture - Anemic Model
@Entity
public class Post {
    private Long id;
    private String content;
    private User author;
    // Sadece getter/setter, iş mantığı yok
}

@Service
public class PostService {
    // TÜM iş mantığı burada
    public Post createPost(CreatePostRequest request) {
        // Validation
        // Business rules
        // Persistence
        // Notification
        // Everything here!
    }
}
```

---

### Senaryo 2: Full DDD

**Avantajları:**

- ✅ **Rich Domain Model:** İş mantığı domain'de
- ✅ **Yüksek cohesion:** İlgili kod bir arada
- ✅ **Testable:** Domain logic kolayca test edilir
- ✅ **Ölçeklenebilir:** Bounded context'ler bağımsız
- ✅ **Microservices-ready:** Kolay ayrıştırılabilir
- ✅ **Maintainability:** Uzun vadede bakımı kolay

**Dezavantajları:**

- ❌ **Kompleks yapı:** Fazla abstraction
- ❌ **Yüksek learning curve:** Ekip eğitimi gerekli
- ❌ **Yavaş başlangıç:** Setup süresi uzun
- ❌ **Over-engineering riski:** MVP için fazla
- ❌ **Küçük ekiplere zor:** Çok fazla dosya/katman

**Kod Örneği:**

```java
// Full DDD - Rich Domain Model
@Entity
public class Post {
    private PostId id;
    private Content content;
    private Author author;
    private PostStatus status;

    // Domain behavior içeride
    public void publish() {
        if (!author.isVerified()) {
            throw new UnverifiedAuthorException();
        }
        if (content.isEmpty()) {
            throw new EmptyContentException();
        }
        this.status = PostStatus.PUBLISHED;
        DomainEvents.raise(new PostPublishedEvent(this));
    }

    public boolean canBeViewedBy(User viewer) {
        return viewer.getProfession().equals(author.getProfession())
            && viewer.isVerified()
            && !viewer.isBanned();
    }
}

// Value Object
public class Content {
    private final String value;

    public Content(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }
        if (value.length() > 5000) {
            throw new IllegalArgumentException("Content too long");
        }
        this.value = value;
    }
}

// Application Service (얇은 orchestration)
@Service
public class PostApplicationService {
    public PostId publishPost(PublishPostCommand command) {
        User author = userRepository.findById(command.authorId());
        Post post = Post.create(command.content(), author);
        post.publish(); // Domain logic
        postRepository.save(post);
        return post.getId();
    }
}
```

---

## 🎯 Karar: Hybrid Yaklaşım (DDD-Lite)

### Önerilen Strateji

**MVP Aşaması: Pragmatik DDD (DDD-Lite)**

Tam DDD yerine, **stratejik seçici yaklaşım:**

- **Karmaşık domain'ler için DDD:** Verification, Notification
- **Basit CRUD için Layered:** User Profile, Basic Posts

### Hybrid Yaklaşımın Avantajları

1. ✅ **Hızlı başlangıç:** Basit kısımlar hızlı gelişir
2. ✅ **Gelecek için hazır:** Karmaşık kısımlar DDD ile korunmuş
3. ✅ **Öğrenme fırsatı:** Ekip DDD'yi kademeli öğrenir
4. ✅ **Ölçeklenebilirlik:** Kritik context'ler izole edilmiş
5. ✅ **Bakım kolaylığı:** İş mantığı belli yerlerde

---

## 🏗️ Önerilen Mimari

### Package Yapısı (Hybrid DDD)

```
com.meslektas/
│
├── common/                          # Shared Kernel
│   ├── domain/
│   │   ├── BaseEntity.java
│   │   ├── DomainEvent.java
│   │   └── ValueObject.java
│   ├── exception/
│   │   └── DomainException.java
│   └── util/
│       └── DateUtils.java
│
├── verification/                    # ✅ DDD BOUNDED CONTEXT
│   ├── domain/                      # Domain Layer
│   │   ├── model/
│   │   │   ├── VerificationRequest.java (Aggregate Root)
│   │   │   ├── VerificationDocument.java (Entity)
│   │   │   ├── ConfidenceScore.java (Value Object)
│   │   │   └── VerificationStatus.java (Enum)
│   │   ├── service/
│   │   │   └── VerificationDomainService.java
│   │   ├── repository/
│   │   │   └── VerificationRepository.java (Interface)
│   │   └── event/
│   │       ├── VerificationApprovedEvent.java
│   │       └── VerificationRejectedEvent.java
│   │
│   ├── application/                 # Application Layer
│   │   ├── command/
│   │   │   ├── SubmitVerificationCommand.java
│   │   │   └── ReviewVerificationCommand.java
│   │   ├── query/
│   │   │   └── GetVerificationStatusQuery.java
│   │   └── service/
│   │       └── VerificationApplicationService.java
│   │
│   ├── infrastructure/              # Infrastructure Layer
│   │   ├── persistence/
│   │   │   ├── JpaVerificationRepository.java
│   │   │   └── VerificationMapper.java
│   │   └── ai/
│   │       └── AIVerificationServiceImpl.java
│   │
│   └── api/                         # Presentation Layer
│       ├── VerificationController.java
│       └── dto/
│           ├── VerificationRequest.java
│           └── VerificationResponse.java
│
├── notification/                    # ✅ DDD BOUNDED CONTEXT
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Notification.java (Aggregate Root)
│   │   │   ├── NotificationChannel.java (Value Object)
│   │   │   └── NotificationPriority.java (Enum)
│   │   ├── service/
│   │   │   └── NotificationRoutingService.java
│   │   └── repository/
│   │       └── NotificationRepository.java
│   │
│   ├── application/
│   │   └── service/
│   │       └── NotificationApplicationService.java
│   │
│   ├── infrastructure/
│   │   ├── fcm/
│   │   │   └── FcmNotificationSender.java
│   │   └── email/
│   │       └── EmailNotificationSender.java
│   │
│   └── api/
│       └── NotificationController.java
│
├── social/                          # ⚠️ LAYERED (Basit CRUD)
│   ├── entity/
│   │   ├── Post.java
│   │   ├── Comment.java
│   │   ├── Like.java
│   │   └── Follow.java
│   │
│   ├── repository/
│   │   ├── PostRepository.java
│   │   ├── CommentRepository.java
│   │   └── LikeRepository.java
│   │
│   ├── service/
│   │   ├── PostService.java
│   │   ├── CommentService.java
│   │   └── FeedService.java
│   │
│   ├── controller/
│   │   ├── PostController.java
│   │   └── CommentController.java
│   │
│   └── dto/
│       ├── PostRequest.java
│       └── PostResponse.java
│
├── messaging/                       # ✅ DDD BOUNDED CONTEXT
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Conversation.java (Aggregate Root)
│   │   │   ├── Message.java (Entity)
│   │   │   ├── Participant.java (Value Object)
│   │   │   └── ReadReceipt.java (Value Object)
│   │   ├── service/
│   │   │   └── MessageDeliveryService.java
│   │   └── repository/
│   │       ├── ConversationRepository.java
│   │       └── MessageRepository.java
│   │
│   ├── application/
│   │   └── service/
│   │       ├── ChatApplicationService.java
│   │       └── MessageQueryService.java
│   │
│   ├── infrastructure/
│   │   └── websocket/
│   │       └── WebSocketMessageHandler.java
│   │
│   └── api/
│       └── ChatController.java
│
└── identity/                        # ⚠️ LAYERED (Standart Auth)
    ├── entity/
    │   ├── User.java
    │   └── Profession.java
    │
    ├── repository/
    │   ├── UserRepository.java
    │   └── ProfessionRepository.java
    │
    ├── service/
    │   ├── AuthService.java
    │   ├── UserService.java
    │   └── JwtService.java
    │
    ├── controller/
    │   ├── AuthController.java
    │   └── UserController.java
    │
    └── security/
        ├── JwtAuthenticationFilter.java
        └── SecurityConfig.java
```

---

## 📊 Context Mapping

### Bounded Context İlişkileri

```
┌─────────────────────┐
│  Identity Context   │
│  (User, Auth)       │
└──────────┬──────────┘
           │ Upstream
           ↓
┌─────────────────────┐      ┌─────────────────────┐
│ Verification Context│◄─────┤ Notification Context│
│  (AI Verify)        │      │  (Push, Email)      │
└──────────┬──────────┘      └─────────────────────┘
           │                           ▲
           ↓                           │
┌─────────────────────┐                │
│  Social Context     │                │
│  (Posts, Comments)  │────────────────┘
└─────────────────────┘
           │
           ↓
┌─────────────────────┐
│ Messaging Context   │
│  (Chat, DM)         │
└─────────────────────┘
```

**İlişki Tipleri:**

- **Shared Kernel:** Common package (BaseEntity, ValueObject)
- **Customer-Supplier:** Identity → Verification (User bilgisi)
- **Published Language:** Domain Events (REST API, Events)
- **Anti-Corruption Layer:** AI servisi entegrasyonu

---

## 🎯 Implementation Stratejisi

### Faz 1: MVP (Sprint 1-8) - Hybrid Başlangıç

**DDD Uygulanan Context'ler:**

- ✅ Verification Context (Karmaşık iş mantığı)
- ✅ Notification Context (Çoklu kanal, routing)

**Layered Uygulanan Context'ler:**

- ⚠️ Identity Context (Standart auth)
- ⚠️ Social Context (Basit CRUD)
- ⚠️ Messaging Context (İlk versiyonda basit)

### Faz 2: Post-MVP (Sprint 9-12) - Refactoring

**Gerekirse DDD'ye Geçiş:**

- Messaging Context (WebSocket karmaşıklığı artarsa)
- Social Context (Algoritma ve recommendation eklerse)

### Faz 3: Ölçekleme (6-12 ay sonra)

**Microservices Migration:**

- Her bounded context ayrı service olur
- Event-driven communication
- Polyglot persistence (farklı DB'ler)

---

## ✅ Karar Matrisi

| Kritik Faktör       | Layered | Full DDD | **Hybrid** |
| ------------------- | ------- | -------- | ---------- |
| MVP Hızı            | ⭐⭐⭐  | ⭐       | ⭐⭐       |
| Ekip Adaptasyonu    | ⭐⭐⭐  | ⭐       | ⭐⭐       |
| Maintainability     | ⭐      | ⭐⭐⭐   | ⭐⭐       |
| Ölçeklenebilirlik   | ⭐      | ⭐⭐⭐   | ⭐⭐⭐     |
| Testing             | ⭐      | ⭐⭐⭐   | ⭐⭐       |
| Microservices Hazır | ⭐      | ⭐⭐⭐   | ⭐⭐⭐     |
| Complexity          | Düşük   | Yüksek   | Orta       |
| **TOPLAM SKOR**     | **8**   | **13**   | **15** ✅  |

---

## 🎓 Ekip için DDD Learning Path

### Hafta 1-2: Temel Kavramlar

- Domain-Driven Design kitabı (Eric Evans) - ilk 3 bölüm
- Aggregate ve Entity kavramları
- Value Object nedir?

### Hafta 3-4: Pratik Uygulama

- Verification Context implementasyonu
- Pair programming sessions
- Code review ile öğrenme

### Hafta 5-6: İleri Seviye

- Domain Events
- CQRS pattern (opsiyonel)
- Event Sourcing (future)

---

## 📝 Sonuç ve Öneriler

### Nihai Karar: **HYBRID YAKLAŞIM** ✅

**Gerekçeler:**

1. MVP hızını korur
2. Karmaşık kısımları DDD ile izole eder
3. Ekibin DDD öğrenmesine olanak tanır
4. Gelecekte microservices'e kolay geçiş
5. Over-engineering riskini azaltır

### Uygulama Kuralları

**DDD Uygula (Karmaşık Business Logic):**

- Verification Context
- Notification Context
- (Gelecekte) Payment Context

**Layered Uygula (Basit CRUD):**

- Identity Context (standart auth)
- Social Context (basit post/comment)
- User Profile Management

### Başarı Kriterleri

**3 Ay Sonra:**

- [ ] Verification domain fully implemented
- [ ] Team comfortable with DDD basics
- [ ] Clear bounded context separation

**6 Ay Sonra:**

- [ ] All complex domains use DDD
- [ ] Easy to extract to microservices
- [ ] High test coverage (>80%)

**1 Yıl Sonra:**

- [ ] Ready for microservices migration
- [ ] Domain events in use
- [ ] CQRS pattern applied

---

**Hazırlayan:** Backend Architecture Team  
**Onaylayan:** Tech Lead  
**Durum:** ✅ Approved  
**Tarih:** 30 Kasım 2025
