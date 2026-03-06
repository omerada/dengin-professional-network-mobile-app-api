# Dengin Backend

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen?logo=spring-boot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk" alt="Java" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-red?logo=redis" alt="Redis" />
</p>

Dengin platformunun backend servisi — Spring Boot 3.2 ve Strategic Domain-Driven Design (DDD) mimarisi ile geliştirilmiş RESTful API.

## İçindekiler

- [Mimari](#mimari)
- [Ön Gereksinimler](#ön-gereksinimler)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Veritabanı](#veritabanı)
- [Testler](#testler)
- [Yapılandırma](#yapılandırma)
- [Deployment](#deployment)
- [Proje Yapısı](#proje-yapısı)

## Mimari

Backend, **Strategic Domain-Driven Design** prensiplerine uygun olarak 6 bağımsız bounded context şeklinde yapılandırılmıştır:

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (REST)                       │
├──────────┬──────────┬─────────┬──────────┬──────────┬──────────┤
│ Identity │ Verific. │ Social  │ Messag.  │ Notific. │ Moder.   │
│          │          │         │          │          │          │
│ • Auth   │ • AI     │ • Posts │ • Chat   │ • Push   │ • Report │
│ • Users  │ • Face   │ • Likes │ • STOMP  │ • Email  │ • Review │
│ • OAuth2 │ • Docs   │ • Feed  │ • Files  │ • FCM    │ • Filter │
│ • Profile│ • Badge  │ • Share │ • Groups │ • Prefs  │ • Block  │
├──────────┴──────────┴─────────┴──────────┴──────────┴──────────┤
│                     Shared Kernel (Common)                      │
│    Base Entities • Exceptions • API Wrappers • Health Checks    │
├─────────────────────────────────────────────────────────────────┤
│              Infrastructure Layer                                │
│  PostgreSQL 15 │ Redis 7 │ AWS S3 │ Rekognition │ Firebase     │
└─────────────────────────────────────────────────────────────────┘
```

Her bounded context kendi içinde katmanlı mimariyi takip eder:

```
context/
├── api/              # REST Controller'lar, DTO'lar
├── application/      # Uygulama servisleri, use-case'ler
├── domain/           # Entity'ler, Value Object'ler, Repository interface'leri
│   ├── model/
│   ├── event/
│   └── repository/
└── infrastructure/   # JPA, AWS, harici servis implementasyonları
```

## Ön Gereksinimler

| Araç               | Minimum Versiyon | Açıklama                             |
| ------------------ | ---------------- | ------------------------------------ |
| **Java**           | 17+              | OpenJDK veya Oracle JDK              |
| **Maven**          | 3.8+             | Build aracı                          |
| **Docker**         | 20+              | Container runtime                    |
| **Docker Compose** | 2.0+             | Çoklu container yönetimi             |
| **Node.js**        | 18+              | IP algılama scripti için (opsiyonel) |

## Kurulum

### 1. Ortam Değişkenlerini Yapılandırın

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyerek aşağıdaki değerleri yapılandırın:

| Değişken                    | Açıklama                             | Zorunlu              |
| --------------------------- | ------------------------------------ | -------------------- |
| `JWT_SECRET`                | JWT imzalama anahtarı (min. 256-bit) | ✅                   |
| `DATABASE_URL`              | PostgreSQL bağlantı URL'i            | ✅                   |
| `DATABASE_USERNAME`         | Veritabanı kullanıcı adı             | ✅                   |
| `DATABASE_PASSWORD`         | Veritabanı şifresi                   | ✅                   |
| `FIREBASE_CREDENTIALS_JSON` | Firebase service account JSON        | Push bildirim için   |
| `MAILGUN_API_KEY`           | Mailgun API anahtarı                 | Email gönderimi için |
| `AWS_ACCESS_KEY_ID`         | AWS erişim anahtarı (dev: `test`)    | Dosya depolama için  |
| `AWS_SECRET_ACCESS_KEY`     | AWS gizli anahtar (dev: `test`)      | Dosya depolama için  |

> **Not:** Geliştirme ortamında LocalStack kullanılır, gerçek AWS anahtarlarına gerek yoktur.

### 2. Altyapıyı Başlatın

```bash
# PostgreSQL, Redis, LocalStack ve pgAdmin'i başlatın
docker-compose up -d

# Servislerin durumunu kontrol edin
docker-compose ps

# Logları izleyin (opsiyonel)
docker-compose logs -f
```

**Servisler:**

| Servis     | Port   | Açıklama                              |
| ---------- | ------ | ------------------------------------- |
| PostgreSQL | `5433` | Veritabanı (dengin_dev)               |
| Redis      | `6380` | Önbellek & oturum                     |
| LocalStack | `4566` | AWS emülasyonu (S3, Rekognition, SES) |
| pgAdmin    | `5051` | Veritabanı yönetim arayüzü            |

### 3. Yerel IP Yapılandırması (Mobil Erişim İçin)

Eğer mobil cihazdan LocalStack'e erişim gerekiyorsa:

```bash
node scripts/get-local-ip.js
```

Bu script, makinenizin yerel ağ IP adresini algılayarak `docker-compose.yml` ve `.env` dosyalarını otomatik günceller.

### 4. Derleme

```bash
# Derleme
mvn clean compile

# Derleme + testler + paketleme
mvn clean package

# Testleri atla (hızlı derleme)
mvn clean package -DskipTests
```

## Çalıştırma

### Geliştirme Modu

```bash
mvn spring-boot:run
```

### Üretim Profili

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### JAR ile Çalıştırma

```bash
# Paketleme
mvn clean package -DskipTests

# Çalıştırma
java -jar target/dengin-backend-1.0.0-SNAPSHOT.jar

# Üretim profili ile
java -jar target/dengin-backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=prod
```

## API Dokümantasyonu

Uygulama çalıştırıldıktan sonra:

| Kaynak           | URL                                   |
| ---------------- | ------------------------------------- |
| **Swagger UI**   | http://localhost:8080/swagger-ui.html |
| **OpenAPI Spec** | http://localhost:8080/v3/api-docs     |
| **Health Check** | http://localhost:8080/actuator/health |

### Temel Endpoint'ler

#### Kimlik Doğrulama

```
POST /api/v1/auth/register          # Yeni kullanıcı kaydı
POST /api/v1/auth/login             # Giriş (JWT token döner)
POST /api/v1/auth/refresh           # Access token yenileme
POST /api/v1/auth/logout            # Çıkış
POST /api/v1/auth/forgot-password   # Şifre sıfırlama
```

#### Kullanıcı Profili

```
GET    /api/v1/users/me              # Mevcut kullanıcı profili
PUT    /api/v1/users/me              # Profil güncelleme
GET    /api/v1/users/{id}            # Kullanıcı profili görüntüleme
POST   /api/v1/users/me/avatar       # Profil fotoğrafı yükleme
```

#### Sosyal Akış

```
GET    /api/v1/feed                  # Ana akış
POST   /api/v1/posts                 # Gönderi oluşturma
GET    /api/v1/posts/{id}            # Gönderi detayı
POST   /api/v1/posts/{id}/like       # Beğenme
POST   /api/v1/posts/{id}/comments   # Yorum yapma
```

#### Mesajlaşma

```
GET    /api/v1/conversations                  # Sohbet listesi
POST   /api/v1/conversations                  # Yeni sohbet
GET    /api/v1/conversations/{id}/messages     # Mesaj geçmişi
WS     /ws                                     # WebSocket (STOMP)
```

#### Doğrulama

```
POST   /api/v1/verification/request   # Doğrulama başvurusu
GET    /api/v1/verification/status     # Doğrulama durumu
POST   /api/v1/verification/document   # Belge yükleme
POST   /api/v1/verification/selfie     # Biyometrik selfie
```

### Kimlik Doğrulama

API, Bearer Token (JWT) kimlik doğrulama kullanır:

```bash
# 1. Giriş yapın
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 2. Dönen token'ı kullanın
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

## Veritabanı

### Migration

Veritabanı şeması **Flyway** ile yönetilir. Uygulama başlatıldığında migration'lar otomatik uygulanır.

```
src/main/resources/db/migration/
├── V1__initial_schema.sql               # Temel şema (users, professions)
├── V2__seed_professions.sql             # Meslek verileri
├── V3__create_verification_requests.sql # Doğrulama tabloları
├── V4__create_social_tables.sql         # Sosyal etkileşim tabloları
├── V5__create_messaging_tables.sql      # Mesajlaşma tabloları
├── V6__message_search_optimization.sql  # Arama optimizasyonu
├── V7__notification_context.sql         # Bildirim tabloları
├── V8__moderation_context.sql           # Moderasyon tabloları
└── ... (18 migration dosyası)
```

### pgAdmin Erişim

pgAdmin arayüzüne `http://localhost:5051` adresinden erişebilirsiniz.

Veritabanı bağlantısı eklerken:

- **Host:** `postgres` (Docker network)
- **Port:** `5432`
- **Database:** `dengin_dev`
- **Username:** `postgres`
- **Password:** `postgres`

## Testler

```bash
# Tüm testleri çalıştır
mvn test

# Belirli bir context'in testlerini çalıştır
mvn test -Dtest="com.dengin.identity.**"
mvn test -Dtest="com.dengin.verification.**"

# Kapsam raporu ile çalıştır
mvn clean verify

# Testleri atla
mvn clean package -DskipTests
```

### Test Mimarisi

- **Birim Testleri:** Domain modelleri, servisler, validasyon
- **Entegrasyon Testleri:** Repository, API endpoint, WebSocket
- **Testcontainers:** Gerçek PostgreSQL ve Redis container'ları ile test

## Yapılandırma

### Profiller

| Profil             | Açıklama                                    | Kullanım                          |
| ------------------ | ------------------------------------------- | --------------------------------- |
| `dev` (varsayılan) | Yerel geliştirme, LocalStack, debug logging | `mvn spring-boot:run`             |
| `prod`             | Üretim, gerçek AWS, optimize ayarlar        | `-Dspring-boot.run.profiles=prod` |
| `test`             | Test ortamı, Testcontainers                 | Otomatik (test çalıştırma)        |

### Geliştirme vs Üretim Farkları

| Özellik               | Geliştirme                  | Üretim                 |
| --------------------- | --------------------------- | ---------------------- |
| AWS                   | LocalStack (localhost:4566) | Gerçek AWS servisleri  |
| Veritabanı bağlantısı | 10 bağlantı                 | 30 bağlantı (HikariCP) |
| SQL logging           | Açık (DEBUG)                | Kapalı (WARN)          |
| JPA batch boyutu      | 20                          | 50                     |
| Redis                 | Tek instance                | Cluster, SSL           |
| CORS                  | Wildcard (\*)               | Domain bazlı           |
| Hata detayları        | Tam mesaj                   | Minimal                |
| Log seviyesi          | DEBUG                       | WARN                   |
| Sentry                | Kapalı                      | Açık (%20 trace)       |

## Deployment

### Docker ile Derleme

```bash
# JAR oluşturma
mvn clean package -DskipTests

# Docker image oluşturma (Dockerfile gerekli)
docker build -t dengin-backend:latest .
```

### Üretim Ortam Değişkenleri

Üretim deployment'ı için `.env.production.example` dosyasını referans alın. Kritik değişkenler:

- `DATABASE_URL` — RDS/managed PostgreSQL endpoint
- `REDIS_HOST` — ElastiCache/managed Redis endpoint
- `JWT_SECRET` — Güçlü, benzersiz gizli anahtar
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — IAM Role tercih edilir
- `FIREBASE_CREDENTIALS_JSON` — Firebase service account
- `SENTRY_DSN` — Hata izleme

## Proje Yapısı

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/dengin/
│   │   │   ├── DenginApplication.java    # Uygulama giriş noktası
│   │   │   ├── common/                   # Paylaşılan çekirdek
│   │   │   │   ├── api/                  # Ortak API response wrapper'lar
│   │   │   │   ├── config/               # Genel yapılandırmalar
│   │   │   │   ├── domain/               # Base entity, audit
│   │   │   │   ├── exception/            # Global exception handler
│   │   │   │   ├── health/               # Sağlık kontrolü endpoint'leri
│   │   │   │   └── storage/              # Dosya depolama soyutlaması
│   │   │   │
│   │   │   ├── identity/                 # Kimlik & Kullanıcı Context'i
│   │   │   │   ├── api/                  # Auth, User, Profile controller'lar
│   │   │   │   ├── application/          # AuthService, UserService
│   │   │   │   ├── domain/model/         # User, Profession, UserProfile
│   │   │   │   └── infrastructure/       # JPA, OAuth2, S3, Security
│   │   │   │
│   │   │   ├── verification/             # AI Doğrulama Context'i
│   │   │   │   ├── api/                  # Doğrulama endpoint'leri
│   │   │   │   ├── application/          # OrchestratorService
│   │   │   │   ├── domain/              # VerificationRequest, Decision
│   │   │   │   └── infrastructure/aws/   # Rekognition, Liveness, Document
│   │   │   │
│   │   │   ├── social/                   # Sosyal Etkileşim Context'i
│   │   │   ├── messaging/                # Mesajlaşma Context'i
│   │   │   ├── notification/             # Bildirim Context'i
│   │   │   └── moderation/               # Moderasyon Context'i
│   │   │
│   │   └── resources/
│   │       ├── application.yml           # Geliştirme yapılandırması
│   │       ├── application-prod.yml      # Üretim yapılandırması
│   │       └── db/migration/             # Flyway SQL migration'ları
│   │
│   └── test/                             # 59 test dosyası
│       ├── java/                         # Birim & entegrasyon testleri
│       └── resources/
│           └── application-test.yml      # Test yapılandırması
│
├── docker/
│   └── localstack/
│       ├── init-aws.sh                   # LocalStack başlatma scripti
│       └── cors.json                     # S3 CORS yapılandırması
│
├── scripts/
│   └── get-local-ip.js                   # Otomatik IP algılama
│
├── docker-compose.yml                    # Geliştirme altyapısı
├── pom.xml                               # Maven bağımlılıkları
├── .env.example                          # Ortam değişkenleri şablonu
└── README.md                             # Bu dosya
```

## Teknoloji Detayları

### Temel Bağımlılıklar

| Kütüphane         | Versiyon | Amaç                    |
| ----------------- | -------- | ----------------------- |
| Spring Boot       | 3.2.0    | Web framework           |
| Spring Security   | 6.x      | Kimlik doğrulama        |
| Spring Data JPA   | 3.x      | Veritabanı erişimi      |
| Spring WebSocket  | 6.x      | Gerçek zamanlı iletişim |
| PostgreSQL Driver | 42.x     | JDBC sürücüsü           |
| Redis (Lettuce)   | 6.x      | Önbellekleme istemcisi  |
| jjwt              | 0.12.x   | JWT token işleme        |
| AWS SDK v2        | 2.x      | S3, Rekognition, SES    |
| Firebase Admin    | 9.x      | Push bildirimler        |
| MapStruct         | 1.5.x    | Nesne dönüşümleri       |
| Flyway            | 10.x     | Veritabanı migration    |
| Bucket4j          | 8.x      | Rate limiting           |
| Sentry            | 7.x      | Hata izleme             |

### Tasarım Desenleri

- **Domain-Driven Design** — Bounded context'ler ile bağımsız domain modelleri
- **Repository Pattern** — Veri erişim soyutlaması
- **Application Service** — Use-case odaklı iş mantığı
- **Event-Driven** — Domain event'leri ile context'ler arası iletişim
- **DTO Pattern** — MapStruct ile API/domain ayrımı
- **Strategy Pattern** — Dosya depolama (Local/S3)
