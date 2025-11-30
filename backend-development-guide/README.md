# 🚀 Meslektaş Backend Development Guide

> **Production-Ready Strategic DDD Implementation Guide**  
> Complete documentation for AI-assisted development

---

## 📚 Dökümantasyon Yapısı

Bu guide, **Strategic Domain-Driven Design** ile production-ready backend geliştirmek için gereken **TÜM** detayları içerir. Her bölüm bağımsız okunabilir ve AI agent'lar tarafından direkt kullanılabilir.

---

## 🗺️ Navigasyon

### 1️⃣ Mimari Kararlar

- **[00-FINAL-ARCHITECTURE-DECISION.md](./00-FINAL-ARCHITECTURE-DECISION.md)** - Nihai mimari kararı ve gerekçeler
- **[01-DDD-FUNDAMENTALS.md](./01-DDD-FUNDAMENTALS.md)** - DDD temel kavramlar ve proje uygulaması

### 2️⃣ Bounded Contexts (6 Context)

- **[02-IDENTITY-CONTEXT.md](./contexts/02-IDENTITY-CONTEXT.md)** - User, Auth, Profession
- **[03-VERIFICATION-CONTEXT.md](./contexts/03-VERIFICATION-CONTEXT.md)** - AI Verification Pipeline ⭐ COMPLEX
- **[04-SOCIAL-CONTEXT.md](./contexts/04-SOCIAL-CONTEXT.md)** - Posts, Comments, Likes
- **[05-MESSAGING-CONTEXT.md](./contexts/05-MESSAGING-CONTEXT.md)** - Chat, WebSocket ⭐ COMPLEX
- **[06-NOTIFICATION-CONTEXT.md](./contexts/06-NOTIFICATION-CONTEXT.md)** - Multi-channel notifications ⭐ COMPLEX
- **[07-MODERATION-CONTEXT.md](./contexts/07-MODERATION-CONTEXT.md)** - Auto-moderation, Reports ⭐ COMPLEX

### 3️⃣ Tactical Patterns

- **[08-AGGREGATES-DESIGN.md](./patterns/08-AGGREGATES-DESIGN.md)** - Aggregate design rules ve örnekler
- **[09-VALUE-OBJECTS.md](./patterns/09-VALUE-OBJECTS.md)** - Value object catalog
- **[10-DOMAIN-SERVICES.md](./patterns/10-DOMAIN-SERVICES.md)** - Domain service patterns
- **[11-DOMAIN-EVENTS.md](./patterns/11-DOMAIN-EVENTS.md)** - Event catalog ve event handling
- **[12-REPOSITORIES.md](./patterns/12-REPOSITORIES.md)** - Repository patterns ve implementation

### 4️⃣ Application Layer

- **[13-CQRS-PATTERN.md](./application/13-CQRS-PATTERN.md)** - Commands & Queries
- **[14-APPLICATION-SERVICES.md](./application/14-APPLICATION-SERVICES.md)** - Orchestration layer
- **[15-DTO-MAPPING.md](./application/15-DTO-MAPPING.md)** - DTO design ve MapStruct

### 5️⃣ Infrastructure

- **[16-JPA-IMPLEMENTATION.md](./infrastructure/16-JPA-IMPLEMENTATION.md)** - Entity mapping, repositories
- **[17-AWS-INTEGRATION.md](./infrastructure/17-AWS-INTEGRATION.md)** - S3, Rekognition, SES
- **[18-WEBSOCKET-SETUP.md](./infrastructure/18-WEBSOCKET-SETUP.md)** - WebSocket + STOMP
- **[19-REDIS-CACHING.md](./infrastructure/19-REDIS-CACHING.md)** - Cache strategy
- **[20-SECURITY-IMPLEMENTATION.md](./infrastructure/20-SECURITY-IMPLEMENTATION.md)** - JWT, OAuth, KVKK

### 6️⃣ Testing

- **[21-TESTING-STRATEGY.md](./testing/21-TESTING-STRATEGY.md)** - Unit, Integration, E2E tests
- **[22-TEST-DATA-BUILDERS.md](./testing/22-TEST-DATA-BUILDERS.md)** - Test fixtures ve builders

### 7️⃣ Sprint Planning

- **[23-SPRINT-01-02.md](./sprints/23-SPRINT-01-02.md)** - Sprint 1-2: Foundation & Identity
- **[24-SPRINT-03-04.md](./sprints/24-SPRINT-03-04.md)** - Sprint 3-4: Verification & AI
- **[25-SPRINT-05-06.md](./sprints/25-SPRINT-05-06.md)** - Sprint 5-6: Social Feed
- **[26-SPRINT-07-08.md](./sprints/26-SPRINT-07-08.md)** - Sprint 7-8: Messaging
- **[27-SPRINT-09-10.md](./sprints/27-SPRINT-09-10.md)** - Sprint 9-10: Notifications & Moderation
- **[28-SPRINT-11-12.md](./sprints/28-SPRINT-11-12.md)** - Sprint 11-12: Performance & Production

### 8️⃣ Best Practices

- **[29-CODE-STANDARDS.md](./best-practices/29-CODE-STANDARDS.md)** - Coding conventions
- **[30-ERROR-HANDLING.md](./best-practices/30-ERROR-HANDLING.md)** - Exception strategy
- **[31-LOGGING-MONITORING.md](./best-practices/31-LOGGING-MONITORING.md)** - Observability
- **[32-PERFORMANCE-OPTIMIZATION.md](./best-practices/32-PERFORMANCE-OPTIMIZATION.md)** - N+1, caching, indexing

---

## 🎯 Hızlı Başlangıç

### Yeni Geliştiriciler İçin

1. ✅ **[00-FINAL-ARCHITECTURE-DECISION.md](./00-FINAL-ARCHITECTURE-DECISION.md)** okuyun (Neden DDD?)
2. ✅ **[01-DDD-FUNDAMENTALS.md](./01-DDD-FUNDAMENTALS.md)** çalışın (DDD 101)
3. ✅ **[03-VERIFICATION-CONTEXT.md](./contexts/03-VERIFICATION-CONTEXT.md)** inceleyin (En karmaşık örnek)
4. ✅ **[23-SPRINT-01-02.md](./sprints/23-SPRINT-01-02.md)** ile başlayın

### AI Agents İçin

1. Context bazlı development: İlgili `contexts/*.md` dosyasını oku
2. Pattern ihtiyacı: `patterns/*.md` dosyalarına bak
3. Implementation: `infrastructure/*.md` ve `application/*.md` kullan
4. Testing: `testing/*.md` stratejisini uygula

---

## 📋 Proje Bilgileri

### Tech Stack

```yaml
Backend Framework: Spring Boot 3.2.x
Language: Java 17 LTS
Database: PostgreSQL 15
Cache: Redis 7.x
Migration: Flyway
Security: Spring Security 6, JWT
AI: AWS Rekognition
Storage: AWS S3
Email: AWS SES
Real-time: WebSocket + STOMP
Testing: JUnit 5, Mockito, Testcontainers
Build: Maven
```

### Bounded Contexts Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      MESLEKTAŞ PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────────┐                 │
│  │   Identity   │───→│   Verification   │ (CORE DOMAIN)   │
│  │   Context    │    │     Context      │                 │
│  └──────────────┘    └────────┬─────────┘                 │
│         │                     │                            │
│         ↓                     ↓                            │
│  ┌──────────────┐    ┌──────────────┐                     │
│  │    Social    │    │  Messaging   │                     │
│  │   Context    │    │   Context    │                     │
│  └──────┬───────┘    └──────┬───────┘                     │
│         │                   │                              │
│         └────────┬──────────┘                              │
│                  ↓                                          │
│         ┌─────────────────┐      ┌──────────────┐         │
│         │  Notification   │      │  Moderation  │         │
│         │    Context      │      │   Context    │         │
│         └─────────────────┘      └──────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Project Goals

```
MVP (6 months):
  - 500-2K users
  - 5 professions
  - Core features
  - Monolith architecture

Year 1:
  - 10-20K users
  - 25+ professions
  - Full features
  - Modular monolith

Year 3:
  - 100K+ users
  - All professions
  - Microservices migration
  - Event-driven architecture
```

---

## 🛠️ Development Workflow

### Feature Development

```bash
# 1. Context seç
Hangi bounded context? → contexts/{CONTEXT}.md oku

# 2. Domain model tasarla
patterns/08-AGGREGATES-DESIGN.md → Aggregate rules
patterns/09-VALUE-OBJECTS.md → Value objects
patterns/10-DOMAIN-SERVICES.md → Domain logic

# 3. Application layer
application/13-CQRS-PATTERN.md → Commands/Queries
application/14-APPLICATION-SERVICES.md → Orchestration

# 4. Infrastructure
infrastructure/16-JPA-IMPLEMENTATION.md → Persistence
infrastructure/20-SECURITY-IMPLEMENTATION.md → Security

# 5. Testing
testing/21-TESTING-STRATEGY.md → Test strategy
testing/22-TEST-DATA-BUILDERS.md → Test data

# 6. Code standards check
best-practices/29-CODE-STANDARDS.md → Conventions
best-practices/30-ERROR-HANDLING.md → Exceptions
```

---

## 📊 Complexity Indicators

### Context Complexity Levels

```
Identity Context:        ⭐⭐ (Medium)
Social Context:          ⭐⭐ (Medium)
Messaging Context:       ⭐⭐⭐ (High) - WebSocket
Notification Context:    ⭐⭐⭐ (High) - Multi-channel
Verification Context:    ⭐⭐⭐⭐ (Very High) - AI Pipeline
Moderation Context:      ⭐⭐⭐ (High) - Auto-moderation
```

### Implementation Priority

```
Sprint 1-2:  Identity + Foundation (40-42 SP)
Sprint 3-4:  Verification + AI (45-48 SP)
Sprint 5-6:  Social Feed (38-40 SP)
Sprint 7-8:  Messaging (42-45 SP)
Sprint 9-10: Notifications + Moderation (40-42 SP)
Sprint 11-12: Performance + Production (35-38 SP)
```

---

## 🔍 Önemli Notlar

### ⚠️ KVKK Compliance

Verification context'te **kritik**:

- Verification approved → Immediate document deletion
- Verification rejected → Immediate document deletion
- Manual review → 7-day retention, then auto-delete
- User request → Immediate data anonymization

Detaylar: **[03-VERIFICATION-CONTEXT.md](./contexts/03-VERIFICATION-CONTEXT.md)**

### 🎯 AI Integration

AWS Rekognition 6-stage pipeline:

- OCR Text Detection (25% weight)
- Face Comparison (30% weight)
- Liveness Detection (25% weight)
- Document Authenticity (15% weight)
- Data Validation (5% weight)

Detaylar: **[03-VERIFICATION-CONTEXT.md](./contexts/03-VERIFICATION-CONTEXT.md)** + **[17-AWS-INTEGRATION.md](./infrastructure/17-AWS-INTEGRATION.md)**

### 📨 Real-time Requirements

WebSocket için:

- Message delivery: < 500ms
- Typing indicators: < 200ms
- Read receipts: < 300ms
- Online status: < 1s

Detaylar: **[05-MESSAGING-CONTEXT.md](./contexts/05-MESSAGING-CONTEXT.md)** + **[18-WEBSOCKET-SETUP.md](./infrastructure/18-WEBSOCKET-SETUP.md)**

---

## 🚀 Deployment

Production deployment guide:

- **[14-DEPLOYMENT-GUIDE.md](../docs/14-DEPLOYMENT-GUIDE.md)** (Ana proje dökümanı)
- **[20-SECURITY-IMPLEMENTATION.md](./infrastructure/20-SECURITY-IMPLEMENTATION.md)** (Security setup)
- **[31-LOGGING-MONITORING.md](./best-practices/31-LOGGING-MONITORING.md)** (Observability)

---

## 📞 Yardım

Her dosya bağımsız ve eksiksiz. Takıldığınız noktada:

1. İlgili context dosyasını okuyun
2. Pattern dosyalarına bakın
3. Best practices kontrol edin
4. Sprint planning'de örnek implementasyon bulun

**Her şey production-ready olacak şekilde tasarlandı. Hiçbir detay atlanmadı.** 🎯

---

**Son Güncelleme:** 30 Kasım 2025  
**Versiyon:** 1.0  
**Hazırlayan:** Senior Backend Architect
