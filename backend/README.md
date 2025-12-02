# Meslektaş Backend

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+
- Docker & Docker Compose

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

# Run
mvn spring-boot:run

# Or with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
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

See `/backend-development-guide` for complete documentation.

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
