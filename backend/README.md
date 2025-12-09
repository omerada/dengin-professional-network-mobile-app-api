# Meslektaş Backend

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+
- Docker & Docker Compose

### Environment Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env file and configure your values
# Required variables:
# - JWT_SECRET
# - DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD
# - FIREBASE_PROJECT_ID, FIREBASE_CREDENTIALS_JSON
# - MAILGUN_API_KEY, MAILGUN_DOMAIN

# See ENV-CONFIGURATION.md for detailed instructions
```

### Start Infrastructure

```bash
# Start PostgreSQL, Redis, LocalStack
docker-compose up -d

# Check status
docker-compose ps
```

### Run Application

```bash
# Build
mvn clean install

# Run (development)
mvn spring-boot:run

# Run (production)
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Access

- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Docs:** http://localhost:8080/v3/api-docs
- **Health Check:** http://localhost:8080/actuator/health
- **pgAdmin:** http://localhost:5050 (admin@meslektas.com / admin)

### Database

- **Host:** localhost:5432
- **Database:** meslektas_dev
- **Username:** postgres
- **Password:** postgres

### Testing

```bash
# Run all tests
mvn test

# Run with coverage
mvn clean verify
```

## Architecture

Strategic Domain-Driven Design (DDD)

### Bounded Contexts

1. **Identity** - Users, Auth, Professions
2. **Verification** - AI Verification Pipeline
3. **Social** - Posts, Comments, Likes
4. **Messaging** - Real-time Chat
5. **Notification** - Multi-channel Notifications
6. **Moderation** - Content Moderation

### 📖 Documentation

**AI Agent Development Guide:** [`.ai/README.md`](.ai/README.md)

Comprehensive guide optimized for AI agents with:

- Architecture overview & bounded contexts
- Development principles & patterns
- API reference & common pitfalls
- Context-specific guides (Identity, Verification, Social, etc.)
- [Quick Start Guide](.ai/QUICK-START.md) - Fast implementation patterns

## Configuration

### Environment Variables

All sensitive configuration is managed through environment variables:

- **Security:** JWT secrets, API keys
- **Database:** Connection strings, credentials
- **AWS:** Access keys, region, S3 buckets
- **Firebase:** Service account credentials
- **Email:** Mailgun configuration
- **OAuth:** Google, Instagram client IDs/secrets

**📖 Documentation:**

- Quick reference: See `.env.example`
- Detailed guide: See `ENV-CONFIGURATION.md`
- Deployment summary: See `ENVIRONMENT-DEPLOYMENT-SUMMARY.md`

### Profiles

- **dev** (default): Local development with LocalStack
- **prod**: Production configuration with real AWS services

```bash
# Development
mvn spring-boot:run

# Production
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## Tech Stack

- Spring Boot 3.2
- PostgreSQL 15
- Redis 7
- AWS SDK (S3, Rekognition, SES)
- JWT Authentication
- WebSocket (STOMP)
- Flyway Migration
- MapStruct
- Testcontainers

## License

Private - Meslektaş Platform
