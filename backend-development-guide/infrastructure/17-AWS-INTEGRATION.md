# AWS Integration Kılavuzu

## 1. Genel Bakış

### 1.1 AWS Services

Meslektaş projesi 3 temel AWS servisi kullanır:

**AWS S3 (Simple Storage Service):**

- Profile image storage
- Verification document storage (ID card, selfie)
- Post image storage
- Presigned URLs for secure upload/download

**AWS Rekognition:**

- Face detection in selfie
- Face comparison (ID photo ↔ selfie)
- Text extraction from ID documents
- Document authenticity verification

**AWS SES (Simple Email Service):**

- User registration email
- Verification status emails
- Password reset emails
- Notification emails

**Architecture:**

```
Client → Backend API
    ↓
S3: Upload images via presigned URL
    ↓
Backend: Store S3 keys in database
    ↓
Rekognition: Analyze verification documents (async)
    ↓
SES: Send notification emails
```

### 1.2 AWS SDK Setup

**Dependencies (pom.xml):**

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>bom</artifactId>
            <version>2.21.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- S3 -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
    </dependency>

    <!-- Rekognition -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>rekognition</artifactId>
    </dependency>

    <!-- SES -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>ses</artifactId>
    </dependency>
</dependencies>
```

**Configuration (application.yml):**

```yaml
aws:
  region: eu-west-1
  credentials:
    access-key: ${AWS_ACCESS_KEY_ID}
    secret-key: ${AWS_SECRET_ACCESS_KEY}

  s3:
    bucket-name: meslektas-storage
    profile-images-prefix: profile-images/
    verification-docs-prefix: verification-docs/
    post-images-prefix: post-images/
    presigned-url-expiration-minutes: 15

  rekognition:
    face-match-threshold: 90
    confidence-threshold: 80

  ses:
    from-email: noreply@meslektas.com
    from-name: Meslektaş
```

---

## 2. AWS S3 Integration

### 2.1 S3 Client Configuration

**S3ClientConfig:**

```java
package com.meslektas.infrastructure.aws.config;

@Configuration
public class S3ClientConfig {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            accessKey,
            secretKey
        );

        return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            accessKey,
            secretKey
        );

        return S3Presigner.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();
    }
}
```

### 2.2 S3 Storage Service

**S3StorageService:**

```java
package com.meslektas.infrastructure.aws.s3;

@Service
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.presigned-url-expiration-minutes}")
    private int presignedUrlExpirationMinutes;

    /**
     * Generate presigned URL for direct upload from client
     */
    public PresignedUploadUrl generatePresignedUploadUrl(
        String key,
        String contentType,
        long maxFileSizeBytes
    ) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(presignedUrlExpirationMinutes))
            .putObjectRequest(putObjectRequest)
            .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        return new PresignedUploadUrl(
            presignedRequest.url().toString(),
            key,
            presignedRequest.expiration()
        );
    }

    /**
     * Generate presigned URL for download
     */
    public String generatePresignedDownloadUrl(String key, Duration expiration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(expiration)
            .getObjectRequest(getObjectRequest)
            .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }

    /**
     * Upload file directly (server-side)
     */
    public String uploadFile(
        String key,
        InputStream inputStream,
        String contentType,
        long contentLength
    ) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .contentLength(contentLength)
                .build();

            RequestBody requestBody = RequestBody.fromInputStream(inputStream, contentLength);

            s3Client.putObject(putObjectRequest, requestBody);

            return getPublicUrl(key);

        } catch (S3Exception e) {
            throw new FileUploadException("Failed to upload file to S3: " + key, e);
        }
    }

    /**
     * Delete file
     */
    public void deleteFile(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

            s3Client.deleteObject(deleteObjectRequest);

        } catch (S3Exception e) {
            throw new FileDeleteException("Failed to delete file from S3: " + key, e);
        }
    }

    /**
     * Get public URL (if bucket is public)
     */
    public String getPublicUrl(String key) {
        return String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

            s3Client.headObject(headObjectRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    /**
     * Get file metadata
     */
    public S3FileMetadata getFileMetadata(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

            HeadObjectResponse response = s3Client.headObject(headObjectRequest);

            return new S3FileMetadata(
                key,
                response.contentType(),
                response.contentLength(),
                response.lastModified()
            );

        } catch (NoSuchKeyException e) {
            throw new FileNotFoundException("File not found in S3: " + key);
        }
    }
}
```

**DTOs:**

```java
public record PresignedUploadUrl(
    String uploadUrl,
    String s3Key,
    Instant expiresAt
) {}

public record S3FileMetadata(
    String key,
    String contentType,
    long sizeBytes,
    Instant lastModified
) {}
```

### 2.3 Image Upload Flow

**ProfileImageUploadService:**

```java
@Service
public class ProfileImageUploadService {

    private final S3StorageService s3StorageService;

    @Value("${aws.s3.profile-images-prefix}")
    private String profileImagesPrefix;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp"
    );

    /**
     * Use Case: Generate upload URL for profile image
     */
    public PresignedUploadUrl generateProfileImageUploadUrl(
        UserId userId,
        String contentType
    ) {
        // Validate content type
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidContentTypeException("Invalid image type: " + contentType);
        }

        // Generate unique S3 key
        String fileName = UUID.randomUUID().toString() + getFileExtension(contentType);
        String s3Key = profileImagesPrefix + userId.getValue() + "/" + fileName;

        // Generate presigned URL
        return s3StorageService.generatePresignedUploadUrl(
            s3Key,
            contentType,
            MAX_FILE_SIZE
        );
    }

    /**
     * Use Case: Confirm upload and update user profile
     */
    @Transactional
    public void confirmProfileImageUpload(UserId userId, String s3Key) {
        // Verify file exists in S3
        if (!s3StorageService.fileExists(s3Key)) {
            throw new FileNotFoundException("Uploaded file not found: " + s3Key);
        }

        // Get public URL
        String publicUrl = s3StorageService.getPublicUrl(s3Key);

        // Update user profile
        User user = userRepository.findById(userId).orElseThrow();

        // Delete old profile image if exists
        String oldImageUrl = user.getProfileImageUrl();
        if (oldImageUrl != null) {
            String oldKey = extractS3KeyFromUrl(oldImageUrl);
            s3StorageService.deleteFile(oldKey);
        }

        user.updateProfileImage(publicUrl);
        userRepository.save(user);
    }

    private String getFileExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
    }

    private String extractS3KeyFromUrl(String url) {
        // Extract key from https://bucket.s3.amazonaws.com/key
        String[] parts = url.split(".s3.amazonaws.com/");
        return parts.length > 1 ? parts[1] : null;
    }
}
```

---

## 3. AWS Rekognition Integration

### 3.1 Rekognition Client Configuration

**RekognitionClientConfig:**

```java
@Configuration
public class RekognitionClientConfig {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    @Bean
    public RekognitionClient rekognitionClient() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            accessKey,
            secretKey
        );

        return RekognitionClient.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();
    }
}
```

### 3.2 Face Verification Service

**FaceVerificationService:**

```java
package com.meslektas.infrastructure.aws.rekognition;

@Service
public class FaceVerificationService {

    private final RekognitionClient rekognitionClient;
    private final S3StorageService s3StorageService;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.rekognition.face-match-threshold}")
    private float faceMatchThreshold;

    @Value("${aws.rekognition.confidence-threshold}")
    private float confidenceThreshold;

    /**
     * Verify face in selfie matches face in ID document
     */
    public FaceMatchResult compareFaces(String idDocumentS3Key, String selfieS3Key) {
        try {
            // Source image (ID document)
            S3Object sourceS3Object = S3Object.builder()
                .bucket(bucketName)
                .name(idDocumentS3Key)
                .build();

            Image sourceImage = Image.builder()
                .s3Object(sourceS3Object)
                .build();

            // Target image (selfie)
            S3Object targetS3Object = S3Object.builder()
                .bucket(bucketName)
                .name(selfieS3Key)
                .build();

            Image targetImage = Image.builder()
                .s3Object(targetS3Object)
                .build();

            // Compare faces
            CompareFacesRequest request = CompareFacesRequest.builder()
                .sourceImage(sourceImage)
                .targetImage(targetImage)
                .similarityThreshold(faceMatchThreshold)
                .build();

            CompareFacesResponse response = rekognitionClient.compareFaces(request);

            // Analyze result
            List<CompareFacesMatch> faceMatches = response.faceMatches();

            if (faceMatches.isEmpty()) {
                return new FaceMatchResult(
                    false,
                    0f,
                    "No matching faces found"
                );
            }

            // Get best match
            CompareFacesMatch bestMatch = faceMatches.get(0);
            float similarity = bestMatch.similarity();

            boolean isMatch = similarity >= faceMatchThreshold;

            return new FaceMatchResult(
                isMatch,
                similarity,
                isMatch ? "Face match successful" : "Face match below threshold"
            );

        } catch (RekognitionException e) {
            throw new FaceVerificationException("Face comparison failed", e);
        }
    }

    /**
     * Detect face in image
     */
    public FaceDetectionResult detectFace(String s3Key) {
        try {
            S3Object s3Object = S3Object.builder()
                .bucket(bucketName)
                .name(s3Key)
                .build();

            Image image = Image.builder()
                .s3Object(s3Object)
                .build();

            DetectFacesRequest request = DetectFacesRequest.builder()
                .image(image)
                .attributes(Attribute.ALL)
                .build();

            DetectFacesResponse response = rekognitionClient.detectFaces(request);

            List<FaceDetail> faceDetails = response.faceDetails();

            if (faceDetails.isEmpty()) {
                return new FaceDetectionResult(
                    false,
                    0,
                    0f,
                    "No face detected"
                );
            }

            // Check quality
            FaceDetail face = faceDetails.get(0);
            float confidence = face.confidence();

            return new FaceDetectionResult(
                true,
                faceDetails.size(),
                confidence,
                confidence >= confidenceThreshold
                    ? "Face detected successfully"
                    : "Face quality below threshold"
            );

        } catch (RekognitionException e) {
            throw new FaceVerificationException("Face detection failed", e);
        }
    }

    /**
     * Extract text from ID document
     */
    public TextExtractionResult extractText(String s3Key) {
        try {
            S3Object s3Object = S3Object.builder()
                .bucket(bucketName)
                .name(s3Key)
                .build();

            Image image = Image.builder()
                .s3Object(s3Object)
                .build();

            DetectTextRequest request = DetectTextRequest.builder()
                .image(image)
                .build();

            DetectTextResponse response = rekognitionClient.detectText(request);

            List<TextDetection> textDetections = response.textDetections();

            // Extract lines only (ignore words)
            List<String> lines = textDetections.stream()
                .filter(detection -> detection.type() == TextTypes.LINE)
                .map(TextDetection::detectedText)
                .toList();

            return new TextExtractionResult(
                true,
                lines,
                "Text extracted successfully"
            );

        } catch (RekognitionException e) {
            throw new TextExtractionException("Text extraction failed", e);
        }
    }
}
```

**DTOs:**

```java
public record FaceMatchResult(
    boolean isMatch,
    float similarityScore,
    String message
) {}

public record FaceDetectionResult(
    boolean faceDetected,
    int faceCount,
    float confidence,
    String message
) {}

public record TextExtractionResult(
    boolean success,
    List<String> extractedLines,
    String message
) {}
```

### 3.3 AI Verification Orchestrator

**AIVerificationOrchestrator:**

```java
@Service
public class AIVerificationOrchestrator {

    private final FaceVerificationService faceVerificationService;
    private final DomainEventPublisher eventPublisher;

    /**
     * Process verification request with AI
     * Triggered by VerificationRequestSubmittedEvent
     */
    @Async
    @TransactionalEventListener
    public void processVerification(VerificationRequestSubmittedEvent event) {
        try {
            // 1. Detect face in selfie
            FaceDetectionResult selfieDetection = faceVerificationService.detectFace(
                event.selfieS3Key()
            );

            if (!selfieDetection.faceDetected()) {
                publishRejection(event.verificationRequestId(), "No face detected in selfie");
                return;
            }

            // 2. Detect face in ID document
            FaceDetectionResult idDetection = faceVerificationService.detectFace(
                event.idDocumentS3Key()
            );

            if (!idDetection.faceDetected()) {
                publishRejection(event.verificationRequestId(), "No face detected in ID document");
                return;
            }

            // 3. Compare faces
            FaceMatchResult faceMatch = faceVerificationService.compareFaces(
                event.idDocumentS3Key(),
                event.selfieS3Key()
            );

            if (!faceMatch.isMatch()) {
                publishRejection(
                    event.verificationRequestId(),
                    "Face mismatch: " + faceMatch.similarityScore() + "%"
                );
                return;
            }

            // 4. Extract text from ID
            TextExtractionResult textExtraction = faceVerificationService.extractText(
                event.idDocumentS3Key()
            );

            // 5. Calculate confidence score
            int confidenceScore = calculateConfidenceScore(
                selfieDetection,
                idDetection,
                faceMatch,
                textExtraction
            );

            // 6. Publish result
            eventPublisher.publish(new AIVerificationCompletedEvent(
                event.verificationRequestId(),
                confidenceScore,
                (int) faceMatch.similarityScore(),
                (int) idDetection.confidence(),
                textExtraction.extractedLines()
            ));

        } catch (Exception e) {
            publishError(event.verificationRequestId(), e.getMessage());
        }
    }

    private int calculateConfidenceScore(
        FaceDetectionResult selfieDetection,
        FaceDetectionResult idDetection,
        FaceMatchResult faceMatch,
        TextExtractionResult textExtraction
    ) {
        // Weighted average
        float selfieWeight = 0.2f;
        float idWeight = 0.2f;
        float matchWeight = 0.5f;
        float textWeight = 0.1f;

        float score = (selfieDetection.confidence() * selfieWeight)
            + (idDetection.confidence() * idWeight)
            + (faceMatch.similarityScore() * matchWeight)
            + (textExtraction.success() ? 100 : 0) * textWeight;

        return Math.round(score);
    }

    private void publishRejection(VerificationRequestId requestId, String reason) {
        eventPublisher.publish(new AIVerificationRejectedEvent(requestId, reason));
    }

    private void publishError(VerificationRequestId requestId, String error) {
        eventPublisher.publish(new AIVerificationErrorEvent(requestId, error));
    }
}
```

---

## 4. AWS SES Integration

### 4.1 SES Client Configuration

**SesClientConfig:**

```java
@Configuration
public class SesClientConfig {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    @Bean
    public SesClient sesClient() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            accessKey,
            secretKey
        );

        return SesClient.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();
    }
}
```

### 4.2 Email Service

**EmailService:**

```java
package com.meslektas.infrastructure.aws.ses;

@Service
public class EmailService {

    private final SesClient sesClient;

    @Value("${aws.ses.from-email}")
    private String fromEmail;

    @Value("${aws.ses.from-name}")
    private String fromName;

    /**
     * Send email
     */
    public void sendEmail(
        String toEmail,
        String subject,
        String htmlBody,
        String textBody
    ) {
        try {
            Destination destination = Destination.builder()
                .toAddresses(toEmail)
                .build();

            Content subjectContent = Content.builder()
                .data(subject)
                .charset("UTF-8")
                .build();

            Content htmlContent = Content.builder()
                .data(htmlBody)
                .charset("UTF-8")
                .build();

            Content textContent = Content.builder()
                .data(textBody)
                .charset("UTF-8")
                .build();

            Body body = Body.builder()
                .html(htmlContent)
                .text(textContent)
                .build();

            Message message = Message.builder()
                .subject(subjectContent)
                .body(body)
                .build();

            SendEmailRequest emailRequest = SendEmailRequest.builder()
                .source(fromName + " <" + fromEmail + ">")
                .destination(destination)
                .message(message)
                .build();

            sesClient.sendEmail(emailRequest);

        } catch (SesException e) {
            throw new EmailSendException("Failed to send email to: " + toEmail, e);
        }
    }

    /**
     * Send templated email
     */
    public void sendTemplatedEmail(
        String toEmail,
        String templateName,
        Map<String, String> templateData
    ) {
        try {
            Destination destination = Destination.builder()
                .toAddresses(toEmail)
                .build();

            SendTemplatedEmailRequest emailRequest = SendTemplatedEmailRequest.builder()
                .source(fromName + " <" + fromEmail + ">")
                .destination(destination)
                .template(templateName)
                .templateData(new ObjectMapper().writeValueAsString(templateData))
                .build();

            sesClient.sendTemplatedEmail(emailRequest);

        } catch (Exception e) {
            throw new EmailSendException("Failed to send templated email", e);
        }
    }
}
```

### 4.3 Email Templates

**WelcomeEmailService:**

```java
@Service
public class WelcomeEmailService {

    private final EmailService emailService;

    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        String subject = "Meslektaş'a Hoş Geldiniz!";

        String htmlBody = """
            <html>
            <body>
                <h1>Hoş Geldiniz %s!</h1>
                <p>Meslektaş ailesine katıldığınız için teşekkür ederiz.</p>
                <p>Hesabınızı doğrulamak için lütfen kimlik belgelerinizi yükleyin.</p>
                <a href="https://app.meslektas.com/verification">Doğrulama Yap</a>
            </body>
            </html>
            """.formatted(event.fullName());

        String textBody = """
            Hoş Geldiniz %s!

            Meslektaş ailesine katıldığınız için teşekkür ederiz.
            Hesabınızı doğrulamak için lütfen kimlik belgelerinizi yükleyin.

            https://app.meslektas.com/verification
            """.formatted(event.fullName());

        emailService.sendEmail(
            event.email(),
            subject,
            htmlBody,
            textBody
        );
    }
}
```

---

## 5. Best Practices

### 5.1 Error Handling

```java
@Service
public class S3StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);

    public String uploadFile(String key, InputStream inputStream) {
        try {
            // Upload logic
            return getPublicUrl(key);

        } catch (S3Exception e) {
            log.error("S3 upload failed: key={}, error={}", key, e.getMessage(), e);
            throw new FileUploadException("Failed to upload file", e);
        }
    }
}
```

### 5.2 Async Processing

```java
@Service
public class AIVerificationOrchestrator {

    @Async("verificationExecutor")
    @TransactionalEventListener
    public void processVerification(VerificationRequestSubmittedEvent event) {
        // Long-running AI processing (async)
    }
}

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "verificationExecutor")
    public Executor verificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("verification-");
        executor.initialize();
        return executor;
    }
}
```

### 5.3 Retry Logic

```java
@Service
public class EmailService {

    @Retryable(
        value = {SesException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000)
    )
    public void sendEmail(String toEmail, String subject, String body) {
        // Send email with auto-retry on failure
    }
}
```

---

## 6. Özet

### AWS Integration:

- **S3:** Image storage, presigned URLs
- **Rekognition:** Face verification, text extraction
- **SES:** Email notifications

### Services:

- S3StorageService, FaceVerificationService, EmailService
- AIVerificationOrchestrator (async event handler)

### Best Practices:

- ✅ Presigned URLs for client uploads
- ✅ Async processing for AI verification
- ✅ Retry logic for emails
- ✅ Error handling and logging

### Next:

- **WebSocket Setup:** 18-WEBSOCKET-SETUP.md (Real-time messaging)
