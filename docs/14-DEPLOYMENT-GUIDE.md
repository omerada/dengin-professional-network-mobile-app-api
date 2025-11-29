# 🚀 Deployment ve DevOps Rehberi

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Ortam Yapılandırması](#ortam-yapılandırması)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Backend Deployment](#backend-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Database Migration](#database-migration)
6. [Monitoring ve Logging](#monitoring-ve-logging)
7. [Backup ve Recovery](#backup-ve-recovery)
8. [Scaling Strategy](#scaling-strategy)

---

## 🌍 Ortam Yapılandırması

### Ortam Tipleri

| Ortam           | Amaç                | URL                   | Database         | AWS Account  |
| --------------- | ------------------- | --------------------- | ---------------- | ------------ |
| **Development** | Local geliştirme    | localhost             | Local PostgreSQL | -            |
| **Staging**     | Pre-production test | staging.meslektas.com | RDS Staging      | Dev Account  |
| **Production**  | Canlı ortam         | api.meslektas.com     | RDS Production   | Prod Account |

### Environment Variables

**Backend (.env):**

```bash
# Development
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://localhost:5432/meslektas_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRATION=86400000
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your_dev_key
AWS_SECRET_ACCESS_KEY=your_dev_secret
S3_BUCKET_NAME=meslektas-dev-uploads
REKOGNITION_MIN_CONFIDENCE=85

# Staging
NODE_ENV=staging
PORT=8080
DATABASE_URL=postgresql://staging-db.amazonaws.com:5432/meslektas
REDIS_URL=redis://staging-redis.amazonaws.com:6379
JWT_SECRET=${STAGING_JWT_SECRET}
S3_BUCKET_NAME=meslektas-staging-uploads

# Production
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://prod-db.amazonaws.com:5432/meslektas
REDIS_URL=redis://prod-redis.amazonaws.com:6379
JWT_SECRET=${PRODUCTION_JWT_SECRET}
S3_BUCKET_NAME=meslektas-prod-uploads
```

**Frontend (.env):**

```bash
# Development
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
EXPO_PUBLIC_ENV=development

# Staging
EXPO_PUBLIC_API_URL=https://staging-api.meslektas.com/api/v1
EXPO_PUBLIC_WS_URL=wss://staging-api.meslektas.com/ws
EXPO_PUBLIC_ENV=staging

# Production
EXPO_PUBLIC_API_URL=https://api.meslektas.com/api/v1
EXPO_PUBLIC_WS_URL=wss://api.meslektas.com/ws
EXPO_PUBLIC_ENV=production
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**Backend CI/CD (.github/workflows/backend.yml):**

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "backend/**"
  pull_request:
    branches: [main, develop]
    paths:
      - "backend/**"

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: meslektas_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"
          cache: maven

      - name: Run tests
        run: |
          cd backend
          mvn clean test
        env:
          DATABASE_URL: postgresql://localhost:5432/meslektas_test
          REDIS_URL: redis://localhost:6379

      - name: Generate coverage report
        run: |
          cd backend
          mvn jacoco:report

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: backend/target/site/jacoco/jacoco.xml

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"
          cache: maven

      - name: Build JAR
        run: |
          cd backend
          mvn clean package -DskipTests

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: meslektas-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster meslektas-cluster \
            --service meslektas-backend-service \
            --force-new-deployment \
            --region eu-central-1
```

**Frontend CI/CD (.github/workflows/mobile.yml):**

```yaml
name: Mobile App CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "mobile/**"
  pull_request:
    branches: [main, develop]
    paths:
      - "mobile/**"

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Run linter
        run: |
          cd mobile
          npm run lint

      - name: Run tests
        run: |
          cd mobile
          npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: mobile/coverage/lcov.info

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Build iOS
        run: |
          cd mobile
          eas build --platform ios --non-interactive --no-wait

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Build Android
        run: |
          cd mobile
          eas build --platform android --non-interactive --no-wait
```

---

## 🖥️ Backend Deployment

### Docker Configuration

**Dockerfile:**

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/meslektas-backend-*.jar app.jar

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml (Development):**

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: meslektas-postgres
    environment:
      POSTGRES_DB: meslektas_dev
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - meslektas-network

  redis:
    image: redis:7-alpine
    container_name: meslektas-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - meslektas-network

  backend:
    build: ./backend
    container_name: meslektas-backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://postgres:5432/meslektas_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_secret_key
    depends_on:
      - postgres
      - redis
    networks:
      - meslektas-network

volumes:
  postgres_data:
  redis_data:

networks:
  meslektas-network:
    driver: bridge
```

### AWS ECS Deployment

**Task Definition (task-definition.json):**

```json
{
  "family": "meslektas-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "meslektas-backend",
      "image": "ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/meslektas-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:ACCOUNT_ID:secret:database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:ACCOUNT_ID:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/meslektas-backend",
          "awslogs-region": "eu-central-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:8080/actuator/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**Service Configuration:**

```bash
aws ecs create-service \
  --cluster meslektas-cluster \
  --service-name meslektas-backend-service \
  --task-definition meslektas-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=meslektas-backend,containerPort=8080
```

---

## 📱 Mobile App Deployment

### EAS Build Configuration

**eas.json:**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.meslektas.com/api/v1",
        "EXPO_PUBLIC_WS_URL": "wss://api.meslektas.com/ws"
      },
      "ios": {
        "bundleIdentifier": "com.meslektas.app"
      },
      "android": {
        "buildType": "apk",
        "package": "com.meslektas.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Build ve Deploy Commands

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build (Internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### App Store Connect / Google Play

**iOS - App Store Connect:**

1. Build oluştur: `eas build --profile production --platform ios`
2. TestFlight'a yükle: `eas submit --platform ios`
3. App Store Connect'te:
   - Screenshots ekle
   - Description yaz
   - Privacy policy URL ekle
   - Review için submit et

**Android - Google Play Console:**

1. Build oluştur: `eas build --profile production --platform android`
2. Google Play'e yükle: `eas submit --platform android`
3. Play Console'da:
   - Store listing bilgilerini gir
   - Screenshots ekle
   - Content rating al
   - Pricing ayarla
   - Review için submit et

---

## 🗄️ Database Migration

### Flyway Configuration

**application.yml:**

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
    baseline-version: 0
    sql-migration-prefix: V
    sql-migration-separator: __
    sql-migration-suffixes: .sql
```

### Migration Files

**V1\_\_initial_schema.sql:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);
```

**V2\_\_add_verification.sql:**

```sql
CREATE TABLE profession_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    profession_id BIGINT NOT NULL REFERENCES professions(id),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verifications_user ON profession_verifications(user_id);
CREATE INDEX idx_verifications_status ON profession_verifications(status);
```

### Migration Commands

```bash
# Migrate to latest version
mvn flyway:migrate

# Get migration status
mvn flyway:info

# Validate migrations
mvn flyway:validate

# Repair checksums
mvn flyway:repair

# Clean database (DANGER - Production'da kullanma!)
mvn flyway:clean
```

---

## 📊 Monitoring ve Logging

### Application Monitoring (AWS CloudWatch)

**Spring Boot Actuator:**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      cloudwatch:
        namespace: Meslektas
        batch-size: 20
```

**Custom Metrics:**

```java
@Component
@RequiredArgsConstructor
public class CustomMetrics {

    private final MeterRegistry meterRegistry;

    public void recordUserRegistration() {
        meterRegistry.counter("user.registrations").increment();
    }

    public void recordVerificationDuration(long durationMs) {
        meterRegistry.timer("verification.duration")
            .record(durationMs, TimeUnit.MILLISECONDS);
    }

    public void recordApiCall(String endpoint, String method) {
        meterRegistry.counter("api.calls",
            "endpoint", endpoint,
            "method", method
        ).increment();
    }
}
```

### Logging (CloudWatch Logs)

**logback-spring.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/base.xml"/>

    <springProfile name="production">
        <appender name="CLOUDWATCH" class="io.github.dibog.AwsLogAppender">
            <logGroupName>/aws/ecs/meslektas-backend</logGroupName>
            <logStreamName>app-${HOSTNAME}</logStreamName>
            <logRegion>eu-central-1</logRegion>
            <encoder>
                <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>

        <root level="INFO">
            <appender-ref ref="CLOUDWATCH"/>
        </root>
    </springProfile>
</configuration>
```

### Alerting (CloudWatch Alarms)

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name meslektas-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:eu-central-1:ACCOUNT_ID:meslektas-alerts

# High CPU usage alarm
aws cloudwatch put-metric-alarm \
  --alarm-name meslektas-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:eu-central-1:ACCOUNT_ID:meslektas-alerts
```

---

## 💾 Backup ve Recovery

### Database Backup

**Automated Backups (RDS):**

```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier meslektas-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier meslektas-prod \
  --db-snapshot-identifier meslektas-manual-snapshot-$(date +%Y%m%d)
```

**Point-in-Time Recovery:**

```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier meslektas-prod \
  --target-db-instance-identifier meslektas-restored \
  --restore-time 2025-11-29T10:00:00Z
```

### S3 Backup

**Lifecycle Policy:**

```json
{
  "Rules": [
    {
      "Id": "TransitionOldUploads",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 365,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### Disaster Recovery Plan

**Recovery Time Objective (RTO):** 1 saat  
**Recovery Point Objective (RPO):** 15 dakika

**Recovery Steps:**

1. CloudWatch alarm tetiklenir
2. On-call engineer bilgilendirilir
3. Backup'tan restore edilir
4. Health check'ler yapılır
5. Traffic yeni instance'a yönlendirilir

---

## 📈 Scaling Strategy

### Auto Scaling (ECS)

**Target Tracking Policy:**

```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleInCooldown": 300,
  "ScaleOutCooldown": 60
}
```

**Auto Scaling Configuration:**

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/meslektas-cluster/meslektas-backend-service \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/meslektas-cluster/meslektas-backend-service \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### Database Scaling

**Read Replicas:**

```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier meslektas-read-replica-1 \
  --source-db-instance-identifier meslektas-prod \
  --db-instance-class db.t3.medium \
  --availability-zone eu-central-1b
```

**Connection Pooling (HikariCP):**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### CDN (CloudFront)

```bash
aws cloudfront create-distribution \
  --origin-domain-name meslektas-prod-uploads.s3.eu-central-1.amazonaws.com \
  --default-cache-behavior "TargetOriginId=S3-meslektas,ViewerProtocolPolicy=redirect-to-https,AllowedMethods=GET,HEAD,CachedMethods=GET,HEAD"
```

---

## 🔍 Health Checks

**Spring Boot Actuator:**

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        // Check database
        boolean databaseUp = checkDatabase();

        // Check Redis
        boolean redisUp = checkRedis();

        // Check S3
        boolean s3Up = checkS3();

        if (databaseUp && redisUp && s3Up) {
            return Health.up()
                .withDetail("database", "OK")
                .withDetail("redis", "OK")
                .withDetail("s3", "OK")
                .build();
        } else {
            return Health.down()
                .withDetail("database", databaseUp ? "OK" : "DOWN")
                .withDetail("redis", redisUp ? "OK" : "DOWN")
                .withDetail("s3", s3Up ? "OK" : "DOWN")
                .build();
        }
    }
}
```

---

**Hazırlayan:** DevOps Team  
**Onaylayan:** Tech Lead  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Kasım 2025
