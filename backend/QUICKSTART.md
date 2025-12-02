# 🚀 Meslektaş Backend - Quick Start Guide

## Geliştirme Ortamını Başlatma

### 1. Docker Container'ları Başlat

```powershell
cd backend
docker-compose up -d
```

Container'ların durumunu kontrol et:

```powershell
docker-compose ps
```

Beklenen çıktı:

- ✅ meslektas-postgres (port 5432)
- ✅ meslektas-redis (port 6379)
- ✅ meslektas-pgadmin (port 5050)
- ✅ meslektas-localstack (port 4566)

### 2. Maven Build

```powershell
# Clean ve compile
mvn clean compile

# Testler ile birlikte package
mvn clean package

# Testleri atla (hızlı build)
mvn clean package -DskipTests
```

### 3. Uygulamayı Başlat

```powershell
# Development profile ile
mvn spring-boot:run

# Ya da JAR ile
java -jar target/meslektas-backend-1.0.0-SNAPSHOT.jar
```

Uygulama başarıyla başladığında:

```
  __  __           _        _    _
 |  \/  | ___  ___| | ___  | | _| |_ __ _ ___
 | |\/| |/ _ \/ __| |/ _ \ | |/ / __/ _` / __|
 | |  | |  __/\__ \ |  __/ |   <| || (_| \__ \
 |_|  |_|\___||___/_|\___| |_|\_\\__\__,_|___/

:: Meslektaş Backend :: (v1.0.0)
```

### 4. Test Et

```powershell
# Health check
curl http://localhost:8080/actuator/health

# Swagger UI
# Tarayıcıda aç: http://localhost:8080/swagger-ui.html
```

## 🧪 API Test

### Register

```powershell
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Ahmet",
    "surname": "Yılmaz"
  }'
```

### Login

```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Protected Endpoint (JWT ile)

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
curl http://localhost:8080/api/users/me `
  -H "Authorization: Bearer $token"
```

## 📦 Proje Yapısı

```
src/main/java/com/meslektas/
├── common/                    # Shared Kernel (DDD)
│   ├── domain/                # Base classes, events
│   ├── exception/             # Common exceptions
│   └── api/                   # API response wrappers
│
├── identity/                  # Identity Context (DDD Bounded Context)
│   ├── domain/
│   │   ├── model/             # Aggregates, Entities, Value Objects
│   │   ├── event/             # Domain Events
│   │   └── repository/        # Repository interfaces
│   ├── application/
│   │   ├── service/           # Application Services (orchestration)
│   │   ├── dto/               # DTOs (request/response)
│   │   └── mapper/            # MapStruct mappers
│   ├── infrastructure/
│   │   ├── persistence/       # JPA implementations
│   │   └── security/          # JWT, UserDetails
│   └── api/                   # REST Controllers
│
└── config/                    # Spring configurations
    ├── SecurityConfig.java
    ├── OpenApiConfig.java
    └── CorsConfig.java
```

## 🗄️ Database

pgAdmin'e erişim:

- URL: http://localhost:5050
- Email: admin@meslektas.com
- Password: admin

PostgreSQL bağlantı bilgileri:

- Host: postgres (container) veya localhost
- Port: 5432
- Database: meslektas_dev
- Username: postgres
- Password: postgres

## 📝 Sonraki Adımlar

✅ Spring Boot setup tamamlandı
✅ JWT Authentication çalışıyor
✅ Swagger documentation hazır
✅ Identity Context (DDD) tamamlandı

Devam edecek:

- [ ] User Management endpoints
- [ ] OAuth2 Integration (Google/Instagram)
- [ ] Profession Management
- [ ] Verification Context
- [ ] Social Context
- [ ] Unit & Integration tests

## 🐛 Sorun Giderme

### Port çakışması

```powershell
# PostgreSQL portu kullanılıyor
docker-compose down
netstat -ano | findstr :5432
# İlgili process'i kapat veya docker-compose.yml'de portu değiştir
```

### Maven build hatası

```powershell
# Cache'i temizle
mvn clean
# Dependency'leri yeniden indir
mvn dependency:purge-local-repository
```

### JWT Secret uyarısı

Production'da JWT secret'ı environment variable olarak ayarla:

```powershell
$env:JWT_SECRET="your-super-secret-key-min-512-bits"
```

---

**Hazır! Artık production-ready DDD backend geliştirmeye hazırsınız! 🎉**
